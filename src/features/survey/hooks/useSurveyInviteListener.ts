import { useEffect, useRef } from 'react'; // <--- TU BYŁ BRAK (dodałem useRef)
import { useNavigate } from 'react-router-dom';
import { surveySocket } from '@/features/survey/api/surveySocket';
import { useAuth } from '@/features/auth/AuthContext';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useNotificationCenter } from '@/app/providers/NotificationProvider';

interface InviteMessage {
    roomId: string;
    surveyTitle: string;
    invitationToken: string;
}

export const useSurveyInviteListener = (config: { autoRedirect?: boolean } = {}) => {
    const { currentUserId } = useAuth();
    const { showSuccess } = useSnackbar();
    const { addNotification } = useNotificationCenter();
    const navigate = useNavigate();
    const { autoRedirect = false } = config;

    // Ref śledzący, czy komponent jest zamontowany (dla React Strict Mode)
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        // Jeśli brak usera, nie robimy nic
        if (!currentUserId) return;

        // UWAGA: Usunęliśmy stąd surveySocket.activate()!
        // Teraz to Layout.tsx odpowiada za włączenie "głównego zaworu" WebSocket.

        let subscriptionId: string | null = null;
        let retryTimeout: ReturnType<typeof setTimeout>;

        const tryToSubscribe = () => {
            // Jeśli komponent został odmontowany w międzyczasie, przerywamy
            if (!isMounted.current) return;

            if (surveySocket.isConnected()) {
                // Jeśli socket jest połączony, subskrybujemy
                subscriptionId = surveySocket.subscribeToTopic('/user/queue/invitations', (msg: any) => {
                    const invite = msg as InviteMessage;
                    const joinUrl = `/survey/join/${invite.roomId}?ticket=${invite.invitationToken}`;

                    console.log(`[Survey] Otrzymano zaproszenie do: ${invite.surveyTitle}`);

                    addNotification({
                        type: 'SURVEY',
                        title: 'Zaproszenie do Ankiety',
                        message: `Zostałeś zaproszony do: "${invite.surveyTitle}"`,
                        actionUrl: joinUrl
                    });

                    if (autoRedirect) {
                        navigate(joinUrl);
                    } else {
                        showSuccess(`Nowe zaproszenie: "${invite.surveyTitle}"`);
                    }
                });
            } else {
                // Jeśli socket jeszcze nie wstał (np. Layout go dopiero łączy),
                // próbujemy ponownie za 1s.
                retryTimeout = setTimeout(tryToSubscribe, 1000);
            }
        };

        tryToSubscribe();

        // CLEANUP
        return () => {
            isMounted.current = false;
            clearTimeout(retryTimeout); // Ważne: Anulujemy retry, jeśli użytkownik uciekł ze strony
            
            if (subscriptionId) {
                surveySocket.unsubscribe(subscriptionId);
            }
            // WAŻNE: Nie robimy deactivate(), bo socket ma działać globalnie!
        };
    }, [currentUserId, autoRedirect, navigate, showSuccess, addNotification]);
};