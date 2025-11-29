import { useState, useEffect, useCallback, useRef } from 'react';
import { surveySocket } from '../api/surveySocket'; 
import { surveyService } from '../api/surveyService';
import type { 
    FinalRoomResultDto, 
    UserJoinedSocketMessage, 
    LiveResultUpdateSocketMessage,
    RoomClosedSocketMessage,
    SurveySocketMessage
} from '../model/socket.types'; 
import type { WSMessage } from '../model/types'; 

interface RoomSocketState {
    liveResults: FinalRoomResultDto | null;
    participantCount: number;
    isRoomOpen: boolean;
    error: string | null;
    isLoading: boolean;
}

export const useSurveyRoomSocket = (roomId: string) => {
    const [state, setState] = useState<RoomSocketState>({
        liveResults: null,
        participantCount: 0,
        isRoomOpen: true,
        error: null,
        isLoading: true, 
    });
    
    // Ref do śledzenia montowania (dla Strict Mode)
    const isMounted = useRef(false);

    // 1. POBIERANIE STANU POCZĄTKOWEGO (REST)
    useEffect(() => {
        isMounted.current = true;
        if (!roomId) return;

        const fetchInitialState = async () => {
            try {
                const details = await surveyService.getRoomDetails(roomId);
                if (isMounted.current) {
                    setState(prev => ({
                        ...prev,
                        participantCount: details.currentParticipants,
                        isRoomOpen: details.open,
                        liveResults: details.currentResults, 
                        isLoading: false 
                    }));
                }
            } catch (err: any) {
                console.error("Failed to fetch initial room state", err);
                if (isMounted.current) {
                    setState(prev => ({ ...prev, error: "Failed to load room state", isLoading: false }));
                }
            }
        };
        fetchInitialState();
        
        return () => { isMounted.current = false; };
    }, [roomId]);


    // 2. OBSŁUGA SOCKETÓW
    const handleMessage = useCallback((message: WSMessage) => {
        const payload = message as SurveySocketMessage;
        
        switch (payload.event) {
            case 'USER_JOINED':
                setState(prevState => ({
                    ...prevState,
                    participantCount: payload.newParticipantCount,
                }));
                break;

            case 'LIVE_RESULTS_UPDATE':
                if (payload.currentResults) {
                    setState(prevState => ({
                        ...prevState,
                        liveResults: payload.currentResults,
                        // Nullish coalescing dla bezpieczeństwa
                        participantCount: payload.currentResults.totalParticipants ?? prevState.participantCount,
                    }));
                }
                break;
                
            case 'ROOM_CLOSED':
                setState(prevState => ({
                    ...prevState,
                    isRoomOpen: false,
                    liveResults: payload.finalResults,
                }));
                break;
        }
    }, []);

    useEffect(() => {
        if (!roomId) return;
        
        // NIE robimy tutaj surveySocket.activate(), bo Layout.tsx to robi.
        // Ale dla bezpieczeństwa (jeśli komponent użyty poza layoutem) można dodać check:
        if (!surveySocket.isActive()) surveySocket.activate();

        let subscriptionId: string | null = null;
        let timeoutId: any;
        
        const connectLoop = () => {
            // Jeśli komponent odmontowany, przerywamy pętlę retry
            if (!isMounted.current) return;

            if (surveySocket.isConnected()) {
                subscriptionId = surveySocket.subscribeToRoomUpdates(roomId, handleMessage);
            } else {
                timeoutId = setTimeout(connectLoop, 1000);
            }
        };

        connectLoop();

        return () => {
            clearTimeout(timeoutId); // Ważne: czyścimy timeout
            if (subscriptionId) {
                surveySocket.unsubscribe(subscriptionId);
            }
            // NIE robimy deactivate()
        };
    }, [roomId, handleMessage]);

    return { ...state };
};