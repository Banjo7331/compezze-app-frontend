import { useState, useEffect, useCallback } from 'react';
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

// Stan lokalny gry
interface QuizRoomState {
    status: QuizRoomStatus;
    currentQuestion: {
        index: number;
        title: string;
        options: string[];
        timeLimit: number;
        endTime: number; // Timestamp kiedy koniec
    } | null;
    correctOptionId: number | null; // Do wyświetlenia po czasie
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
        leaderboard: [], // Tu trzymamy listę graczy (w Lobby i w Grze)
        finalResults: null,
        participantsCount: 0,
        error: null,
        isLoading: true,
    });

    // 1. REST Snapshot (Stan początkowy)
    useEffect(() => {
        if (!roomId) return;
        const fetchState = async () => {
            try {
                const details = await quizService.getRoomDetails(roomId);
                
                setState(prev => ({
                    ...prev,
                    status: details.status,
                    participantsCount: details.currentParticipants,
                    // Backend w 'currentResults.leaderboard' zwraca listę graczy (nawet jak mają 0 pkt)
                    leaderboard: details.currentResults?.leaderboard || [], 
                    isLoading: false 
                }));
            } catch (e) {
                setState(prev => ({ ...prev, error: "Błąd pobierania pokoju", isLoading: false }));
            }
        };
        fetchState();
    }, [roomId]);

    // 2. WebSocket Handler
    const handleMessage = useCallback((message: WSMessage) => {
        const payload = message as QuizSocketMessage;

        switch (payload.event) {
            case 'USER_JOINED':
                // FIX: Dodajemy nowego gracza do listy lokalnie!
                setState(prev => ({
                    ...prev,
                    participantsCount: payload.newParticipantCount,
                    leaderboard: [
                        ...prev.leaderboard, 
                        { 
                            userId: payload.userId, 
                            nickname: payload.username, 
                            score: 0, 
                            rank: 0 
                        }
                    ]
                }));
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
                    correctOptionId: null, // Resetujemy widok poprawnej
                    currentQuestion: {
                        index: qMsg.questionIndex,
                        title: qMsg.title,
                        options: qMsg.options,
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

    // 3. Connect Loop
    useEffect(() => {
        if (!roomId) return;
        if (!quizSocket.isActive()) quizSocket.activate();

        let subId: string | null = null;
        const connectLoop = () => {
            if (quizSocket.isConnected()) {
                subId = quizSocket.subscribeToRoomUpdates(roomId, handleMessage);
            } else {
                setTimeout(connectLoop, 500);
            }
        };
        connectLoop();

        return () => {
            if (subId) quizSocket.unsubscribe(subId);
        };
    }, [roomId, handleMessage]);

    return state;
};