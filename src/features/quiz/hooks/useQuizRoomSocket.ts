import { useState, useEffect, useCallback, useRef } from 'react';
import { quizSocket } from '../api/quizSocket';
import { quizService } from '../api/quizService';
import { 
    type QuizSocketMessage, 
    type QuizUserJoinedMessage,
    type QuizNewQuestionMessage,
    type QuizQuestionFinishedMessage,
    type QuizLeaderboardMessage,
    type QuizRoomClosedMessage,
    type FinalRoomResultDto,
    type LeaderboardEntryDto
} from '../model/socket.types';
import { QuizRoomStatus, type WSMessage } from '../model/types';

// FIX 1: Definiujemy typ opcji z ID (zgodnie z backendem)
export interface SocketOptionDto {
    id: number;
    text: string;
}

interface QuizRoomState {
    status: QuizRoomStatus;
    currentQuestion: {
        index: number;
        title: string;
        options: SocketOptionDto[]; // <--- FIX 2: Zmiana z string[] na obiektową
        timeLimit: number;
        endTime: number;
    } | null;
    correctOptionId: number | null;
    leaderboard: LeaderboardEntryDto[];
    finalResults: FinalRoomResultDto | null;
    
    participantsCount: number;
    error: string | null;
    isLoading: boolean;
}

export const useQuizRoomSocket = (roomId: string) => {
    const [state, setState] = useState<QuizRoomState>({
        status: QuizRoomStatus.LOBBY,
        currentQuestion: null,
        correctOptionId: null,
        leaderboard: [],
        finalResults: null,
        participantsCount: 0,
        error: null,
        isLoading: true,
    });

    const isMounted = useRef(false);

    // 1. REST Snapshot
    useEffect(() => {
        isMounted.current = true;
        if (!roomId) return;

        const fetchState = async () => {
            try {
                const details = await quizService.getRoomDetails(roomId);
                
                if (isMounted.current) {
                    // FIX 3: Mapowanie stanu początkowego pytania (jeśli gra trwa po odświeżeniu)
                    let initialQuestion = null;
                    if (details.currentQuestion) {
                         const q = details.currentQuestion;
                         // Konwersja daty ISO na timestamp
                         const endTime = new Date(q.startTime).getTime() + (q.timeLimitSeconds * 1000);
                         
                         initialQuestion = {
                             index: q.questionIndex,
                             title: q.title,
                             options: q.options, // To musi być {id, text}[]
                             timeLimit: q.timeLimitSeconds,
                             endTime: endTime
                         };
                    }

                    setState(prev => ({
                        ...prev,
                        status: details.status,
                        participantsCount: details.currentParticipants,
                        leaderboard: details.currentResults?.leaderboard || [], 
                        currentQuestion: initialQuestion, // <--- Ustawiamy pytanie
                        isLoading: false 
                    }));
                }
            } catch (e) {
                if (isMounted.current) {
                    setState(prev => ({ ...prev, error: "Błąd pobierania pokoju", isLoading: false }));
                }
            }
        };
        fetchState();
        
        return () => { isMounted.current = false; };
    }, [roomId]);

    // 2. WebSocket Handler
    const handleMessage = useCallback((message: WSMessage) => {
        const payload = message as QuizSocketMessage;
        console.log("🎮 Quiz Event:", payload.event, payload);

        switch (payload.event) {
            case 'USER_JOINED':
                setState(prev => {
                    const pMsg = payload as QuizUserJoinedMessage;
                    // Idempotentność: unikamy duplikatów na liście
                    const exists = prev.leaderboard.some(u => u.userId === pMsg.userId);
                    
                    if (exists) {
                        return { ...prev, participantsCount: pMsg.newParticipantCount };
                    }

                    return {
                        ...prev,
                        participantsCount: pMsg.newParticipantCount,
                        leaderboard: [
                            ...prev.leaderboard, 
                            { 
                                userId: pMsg.userId, 
                                nickname: pMsg.username, 
                                score: 0, 
                                rank: 0 
                            }
                        ]
                    };
                });
                break;

            case 'QUIZ_STARTED':
                setState(prev => ({ ...prev, status: QuizRoomStatus.QUESTION_ACTIVE }));
                break;

            case 'NEW_QUESTION':
                const qMsg = payload as QuizNewQuestionMessage;
                const startTime = new Date(qMsg.startTime).getTime();
                const endTime = startTime + (qMsg.timeLimitSeconds * 1000);

                setState(prev => ({
                    ...prev,
                    status: QuizRoomStatus.QUESTION_ACTIVE,
                    correctOptionId: null,
                    currentQuestion: {
                        index: qMsg.questionIndex,
                        title: qMsg.title,
                        // FIX 4: Rzutowanie opcji, zakładając że backend wysyła obiekty {id, text}
                        // Jeśli w DTO TS masz string[], zmień DTO w socket.types.ts!
                        options: qMsg.options as unknown as SocketOptionDto[], 
                        timeLimit: qMsg.timeLimitSeconds,
                        endTime: endTime
                    }
                }));
                break;

            case 'QUESTION_FINISHED':
                const fMsg = payload as QuizQuestionFinishedMessage;
                setState(prev => ({
                    ...prev,
                    status: QuizRoomStatus.QUESTION_FINISHED,
                    correctOptionId: fMsg.correctOptionId
                }));
                break;

            case 'LEADERBOARD_UPDATE':
                const lMsg = payload as QuizLeaderboardMessage;
                setState(prev => ({
                    ...prev,
                    leaderboard: lMsg.topPlayers
                }));
                break;

            case 'ROOM_CLOSED':
                const cMsg = payload as QuizRoomClosedMessage;
                setState(prev => ({
                    ...prev,
                    status: QuizRoomStatus.FINISHED,
                    finalResults: cMsg.finalResults
                }));
                break;
        }
    }, []);

    // 3. Connection Loop
    useEffect(() => {
        if (!roomId) return;
        
        // Layout zarządza activate(), ale check nie zaszkodzi
        // if (!quizSocket.isActive()) quizSocket.activate();

        let subscriptionId: string | null = null;
        let timeoutId: any;

        const connectLoop = () => {
            if (!isMounted.current) return;

            if (quizSocket.isConnected()) {
                subscriptionId = quizSocket.subscribeToRoomUpdates(roomId, handleMessage);
            } else {
                timeoutId = setTimeout(connectLoop, 500);
            }
        };
        
        connectLoop();

        return () => {
            clearTimeout(timeoutId);
            if (subscriptionId) {
                quizSocket.unsubscribe(subscriptionId);
            }
        };
    }, [roomId, handleMessage]);

    return state;
};