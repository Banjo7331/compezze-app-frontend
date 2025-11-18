import { useState, useEffect, useCallback } from 'react';
// Importujemy singleton klienta, który właśnie poprawiliśmy w warstwie API
import { surveySocket } from '../api/surveySocket'; 
// Importujemy typy z rozdzielonego pliku socket.types.ts
import type { 
    FinalRoomResultDto, 
    UserJoinedSocketMessage, 
    LiveResultUpdateSocketMessage,
    RoomClosedSocketMessage
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
}

const initialResults: FinalRoomResultDto = {
    totalParticipants: 0,
    totalSubmissions: 0,
    results: [],
};

// --- HOOK ---
export const useSurveyRoomSocket = (roomId: string) => {
    const [state, setState] = useState<RoomSocketState>({
        liveResults: initialResults,
        participantCount: 0,
        isRoomOpen: true,
        error: null,
    });
    
    // Funkcja do obsługi wiadomości z gniazda. Callback musi przyjmować typ z BaseSocketClient (WSMessage)
    const handleMessage = useCallback((message: WSMessage) => {
        // Zakładamy, że message.body zawiera payload i pole 'event'.
        // Zrzutowujemy go na typ, którego oczekujemy, co jest bezpieczniejsze.
        const payload = message as SocketPayload & { event: string };
        
        switch (payload.event) {
            case 'USER_JOINED':
                const joinPayload = payload as UserJoinedSocketMessage & { event: string };
                setState(prevState => ({
                    ...prevState,
                    participantCount: joinPayload.newParticipantCount || prevState.participantCount,
                }));
                break;

            case 'LIVE_RESULTS_UPDATE':
                const updatePayload = payload as LiveResultUpdateSocketMessage & { event: string };
                setState(prevState => ({
                    ...prevState,
                    liveResults: updatePayload.liveResults,
                    participantCount: updatePayload.liveResults.totalParticipants || prevState.participantCount,
                }));
                break;
                
            case 'ROOM_CLOSED':
                const closedPayload = payload as RoomClosedSocketMessage & { event: string };
                setState(prevState => ({
                    ...prevState,
                    isRoomOpen: false,
                    liveResults: closedPayload.finalResults,
                }));
                break;
                
            default:
                console.warn(`Unknown socket event: ${payload.event}`);
        }
    }, []);

    useEffect(() => {
        if (!roomId) return;
        
        // 1. Aktywacja klienta i subskrypcja
        // Aktywujemy klienta, jeśli nie jest aktywny. Logika automatycznego 
        // łączenia jest w BaseSocketClient.activate().
        if (!surveySocket.isActive()) {
            surveySocket.activate();
        }
        
        let subscriptionId: string | null = null;
        
        // Używamy setTimeout, aby dać czas na połączenie STOMP, jeśli nie jest jeszcze aktywne
        const connectAndSubscribeLoop = () => {
            if (surveySocket.isConnected()) {
                console.log(`Socket connected. Subscribing to room ${roomId}`);
                
                // 2. Subskrybuj aktualizacje pokoju i zapisz ID
                // Używamy metody z BaseSocketClient, która zwraca ID subskrypcji
                subscriptionId = surveySocket.subscribeToRoomUpdates(roomId, handleMessage);
                
            } else {
                // Spróbuj ponownie za chwilę
                setTimeout(connectAndSubscribeLoop, 1000);
            }
        };

        connectAndSubscribeLoop();

        // 3. Zwróć funkcję czyszczącą, która usunie subskrypcję i ewentualnie odłączy klienta
        return () => {
            if (subscriptionId) {
                surveySocket.unsubscribe(subscriptionId);
            }
            // Nie deaktywujemy klienta bazowego, bo może być używany przez inne komponenty.
        };

    }, [roomId, handleMessage]);

    return { ...state };
};