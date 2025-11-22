import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// IMPORTUJEMY OBIEKT authApi
import { authApi } from './api/authApi';
import type { UserDto } from './model/types'; 

// Czas wygaśnięcia Access Tokena (15 min = 900 000 ms)
const ACCESS_TOKEN_EXPIRY_MS = 900000; 

interface AuthContextState {
    isAuthenticated: boolean;
    currentUserId: string | null;
    currentUser: UserDto | null;
    isInitializing: boolean;
    logout: () => void;
    authenticate: (accessToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<Omit<AuthContextState, 'logout' | 'authenticate'>>({
        isAuthenticated: false,
        currentUserId: null,
        currentUser: null,
        isInitializing: true,
    });

    // --- WYLOGOWANIE ---
    const logout = useCallback(async () => {
        try {
            await authApi.logout(); // Wywołanie z obiektu
        } catch (e) {
            console.error("Logout error (ignoring):", e);
        }
        
        localStorage.removeItem('accessToken');
        setState({
            isAuthenticated: false,
            currentUserId: null,
            currentUser: null,
            isInitializing: false,
        });
    }, []);

    // --- POBIERANIE DANYCH UŻYTKOWNIKA ---
    const fetchUserData = async () => {
        try {
            const user = await authApi.getMe(); // Wywołanie z obiektu
            setState(prev => ({
                ...prev,
                isAuthenticated: true,
                currentUserId: user.id,
                currentUser: user,
            }));
        } catch (error) {
            console.error("Failed to fetch user data, attempting silent refresh...", error);
            await trySilentRefresh();
        }
    };
    
    // --- CICHE ODŚWIEŻANIE (Silent Refresh) ---
    const trySilentRefresh = async (): Promise<string | null> => {
        try {
            // Wywołanie z obiektu (bez argumentów, bo cookie)
            const response = await authApi.refresh(); 
            const newAccessToken = response.accessToken;
            localStorage.setItem('accessToken', newAccessToken);
            
            // Jeśli odzyskaliśmy sesję, a stan mówi że nie jesteśmy zalogowani:
            if (!state.isAuthenticated) {
                 const user = await authApi.getMe();
                 setState({
                    isAuthenticated: true,
                    currentUserId: user.id,
                    currentUser: user,
                    isInitializing: false
                 });
            }
            return newAccessToken;
        } catch (error) {
            // Jeśli refresh się nie udał (np. ciasteczko wygasło)
            if (state.isAuthenticated) {
                logout();
            } else {
                setState(s => ({ ...s, isInitializing: false }));
            }
            return null;
        }
    };

    // --- FUNKCJA PO LOGOWANIU ---
    const authenticate = async (accessToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        await fetchUserData();
    };

    // --- INICJALIZACJA ---
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                await fetchUserData();
            } else {
                await trySilentRefresh();
            }
            // Upewniamy się, że flaga ładowania zostanie zdjęta
            setState(prev => ({ ...prev, isInitializing: false }));
        };
        
        initializeAuth();
        
        // Timer odświeżania
        const intervalId = setInterval(() => {
            if (state.isAuthenticated) {
                trySilentRefresh();
            }
        }, ACCESS_TOKEN_EXPIRY_MS - 30000);

        return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    return (
        <AuthContext.Provider value={{ ...state, logout, authenticate }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};