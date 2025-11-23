import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveySocket } from '@/features/survey/api/surveySocket';
import { useAuth } from '@/features/auth/AuthContext';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

interface InviteMessage {
    roomId: string;
    surveyTitle: string;
    invitationToken: string;
}

export const useSurveyInviteListener = (config: { autoRedirect?: boolean } = {}) => {
    const { currentUserId } = useAuth();
    const { showSuccess } = useSnackbar(); // Używamy globalnego Snackbara
    const navigate = useNavigate();
    const { autoRedirect = false } = config;

    useEffect(() => {
        // Jeśli użytkownik nie jest zalogowany, nie nasłuchujemy
        if (!currentUserId) return;

        // 1. Aktywacja połączenia (jeśli jeszcze nie działa)
        if (!surveySocket.isActive()) {
            surveySocket.activate();
        }

        // 2. Subskrypcja prywatnego kanału
        // Spring wysyła na: /user/{userId}/queue/invitations
        // Klient STOMP automatycznie mapuje to na /user/queue/invitations dla bieżącej sesji
        const subId = surveySocket.subscribeToTopic('/user/queue/invitations', (msg: any) => {
            const invite = msg as InviteMessage;
            const joinUrl = `/survey/join/${invite.roomId}?ticket=${invite.invitationToken}`;

            console.log(`[Survey] Otrzymano zaproszenie do: ${invite.surveyTitle}`);

            if (autoRedirect) {
                // Scenariusz: Jesteś w trakcie lekcji i nauczyciel przenosi wszystkich
                navigate(joinUrl);
            } else {
                // Scenariusz: Siedzisz w menu i dostajesz powiadomienie
                // Niestety standardowy Snackbar MUI nie obsługuje przycisków akcji w prosty sposób,
                // więc wyświetlamy informację, a kliknięcie zostawiamy w gestii użytkownika (np. w historii powiadomień)
                // LUB (Dla lepszego UX) używamy window.confirm lub customowego toasta.
                
                // Prosta wersja na teraz:
                showSuccess(`Zaproszenie do ankiety: "${invite.surveyTitle}". Sprawdź listę pokoi lub link.`);
                
                // Opcjonalnie: Przekieruj po kliknięciu w dymek (jeśli Twój Snackbar to wspiera)
                // W tym momencie po prostu informujemy. Użytkownik może wejść przez link (jeśli dostał go też na czacie) 
                // lub jeśli zaimplementujemy listę "Moje Zaproszenia".
                
                // Hack UX: Automatyczne przekierowanie po potwierdzeniu przeglądarki (proste i skuteczne)
                /*
                if (window.confirm(`Zaproszenie do "${invite.surveyTitle}". Dołączyć?`)) {
                    navigate(joinUrl);
                }
                */
            }
        });

        return () => {
            surveySocket.unsubscribe(subId);
        };
    }, [currentUserId, autoRedirect, navigate, showSuccess]);
};