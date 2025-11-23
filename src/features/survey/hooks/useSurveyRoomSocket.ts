import { useState, useEffect, useCallback } from 'react';
// Importujemy singleton klienta, który właśnie poprawiliśmy w warstwie API
import { surveySocket } from '../api/surveySocket'; 
import { surveyService } from '../api/surveyService';
// Importujemy typy z rozdzielonego pliku socket.types.ts
import type { 
    FinalRoomResultDto, 
    UserJoinedSocketMessage, 
    LiveResultUpdateSocketMessage,
    RoomClosedSocketMessage,
    SurveySocketMessage
} from '../model/socket.types'; 

// Importujemy ogólny typ WSMessage (lub Unię Payloadów), który został zdefiniowany w surveySocket.ts
import type { WSMessage } from '../model/types'; 

// Ustalenie, jaki typ wiadomości jest wysyłany z backendu (Payload + pole 'event')
// W Javie wysyłany jest payload z dodanym polem, dlatego musimy to uwzględnić w TS.
type SocketPayload = UserJoinedSocketMessage | LiveResultUpdateSocketMessage | RoomClosedSocketMessage;

// --- TYPY STANOWE ---
interface RoomSocketState {
    liveResults: FinalRoomResultDto | null;
    participantCount: number;
    isRoomOpen: boolean;
    error: string | null;
    isLoading: boolean;
}

const initialResults: FinalRoomResultDto = {
    totalParticipants: 0,
    totalSubmissions: 0,
    results: [],
};

// --- HOOK ---
export const useSurveyRoomSocket = (roomId: string) => {
    const [state, setState] = useState<RoomSocketState>({
        liveResults: null,
        participantCount: 0,
        isRoomOpen: true,
        error: null,
        isLoading: true, 
    });
    
    // 1. POBIERANIE STANU POCZĄTKOWEGO (REST)
    useEffect(() => {
        if (!roomId) return;

        const fetchInitialState = async () => {
            try {
                const details = await surveyService.getRoomDetails(roomId);
                setState(prev => ({
                    ...prev,
                    participantCount: details.currentParticipants,
                    isRoomOpen: details.open,
                    liveResults: details.currentResults, 
                    isLoading: false 
                }));
            } catch (err: any) {
                console.error("Failed to fetch initial room state", err);
                setState(prev => ({ ...prev, error: "Failed to load room state", isLoading: false }));
            }
        };
        fetchInitialState();
    }, [roomId]);


    // 2. OBSŁUGA SOCKETÓW
    const handleMessage = useCallback((message: WSMessage) => {
        const payload = message as SurveySocketMessage; // Używamy unii typów
        
        switch (payload.event) {
            case 'USER_JOINED':
                setState(prevState => ({
                    ...prevState,
                    participantCount: payload.newParticipantCount,
                }));
                break;

            case 'LIVE_RESULTS_UPDATE':
                // FIX: Sprawdzamy, czy payload.currentResults istnieje!
                if (payload.currentResults) {
                    setState(prevState => ({
                        ...prevState,
                        liveResults: payload.currentResults,
                        // Używamy nullish coalescing (??) dla bezpieczeństwa
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
                
            default:
                 // Ignorujemy nieznane eventy
                 // console.warn(`Unknown socket event: ${(payload as any).event}`);
        }
    }, []);

    // 3. POŁĄCZENIE SOCKETOWE
    useEffect(() => {
        if (!roomId) return;
        
        if (!surveySocket.isActive()) {
            surveySocket.activate();
        }
        
        let subscriptionId: string | null = null;
        
        const connectAndSubscribeLoop = () => {
            if (surveySocket.isConnected()) {
                subscriptionId = surveySocket.subscribeToRoomUpdates(roomId, handleMessage);
            } else {
                setTimeout(connectAndSubscribeLoop, 1000);
            }
        };

        connectAndSubscribeLoop();

        return () => {
            if (subscriptionId) {
                surveySocket.unsubscribe(subscriptionId);
            }
        };
    }, [roomId, handleMessage]);

    return { ...state };
};