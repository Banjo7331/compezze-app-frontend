import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizSocket } from '@/features/quiz/api/quizSocket'; // <--- QUIZ SOCKET
import { useAuth } from '@/features/auth/AuthContext';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useNotificationCenter } from '@/app/providers/NotificationProvider';

interface InviteMessage {
    roomId: string;
    title: string; // W DTO Quizu nazwaliśmy to 'title'
    invitationToken: string;
}

export const useQuizInviteListener = (config: { autoRedirect?: boolean } = {}) => {
    const { currentUserId } = useAuth();
    const { showSuccess } = useSnackbar();
    const { addNotification } = useNotificationCenter();
    const navigate = useNavigate();
    const { autoRedirect = false } = config;

    // Ref do śledzenia montowania (dla React Strict Mode)
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        // Jeśli brak usera, nie robimy nic
        if (!currentUserId) return;

        // WAŻNE: Nie robimy quizSocket.activate(), bo Layout.tsx zarządza "rurą".
        
        let subscriptionId: string | null = null;
        let retryTimeout: any; // 'any' dla timeoutu w przeglądarce

        const tryToSubscribe = () => {
            // Jeśli komponent został odmontowany w międzyczasie, przerywamy
            if (!isMounted.current) return;

            if (quizSocket.isConnected()) {
                // Jeśli socket jest połączony, subskrybujemy kanał zaproszeń
                // (Ścieżka /user/queue/invitations jest standardowa w Springu, 
                // ale dzięki quizSocket trafia do brokera Quizów)
                subscriptionId = quizSocket.subscribeToTopic('/user/queue/invitations', (msg: any) => {
                    const invite = msg as InviteMessage;
                    
                    // Generujemy link do Quizu
                    const joinUrl = `/quiz/join/${invite.roomId}?ticket=${invite.invitationToken}`;

                    console.log(`[Quiz] Otrzymano zaproszenie do: ${invite.title}`);

                    // Dodajemy do Centrum Powiadomień
                    addNotification({
                        type: 'QUIZ', // <--- WAŻNE: Trafi do zakładki Quiz
                        title: 'Zaproszenie do Quizu',
                        message: `Zostałeś zaproszony do gry: "${invite.title}"`,
                        actionUrl: joinUrl
                    });

                    // Obsługa akcji
                    if (autoRedirect) {
                        navigate(joinUrl);
                    } else {
                        showSuccess(`Nowe zaproszenie do Quizu: "${invite.title}"`);
                    }
                });
            } else {
                // Jeśli socket jeszcze nie wstał, próbujemy ponownie za 1s
                retryTimeout = setTimeout(tryToSubscribe, 1000);
            }
        };

        tryToSubscribe();

        // CLEANUP
        return () => {
            isMounted.current = false;
            clearTimeout(retryTimeout);
            
            if (subscriptionId) {
                quizSocket.unsubscribe(subscriptionId);
            }
        };
    }, [currentUserId, autoRedirect, navigate, showSuccess, addNotification]);
};