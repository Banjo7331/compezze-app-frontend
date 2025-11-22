import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi'; // Importujemy obiekt
import type { LoginRequest, AuthResponse } from '../model/types';
import { useAuth } from '../AuthContext';

export const useLogin = () => {
    const { authenticate } = useAuth(); 

    const { mutate, isPending, isError, error } = useMutation<AuthResponse, Error, LoginRequest>({
        // Używamy funkcji strzałkowej, aby wywołać metodę z obiektu
        mutationFn: (credentials) => authApi.login(credentials), 
        
        onSuccess: async (data) => {
            // Przekazujemy tylko AccessToken (Refresh jest w cookie)
            await authenticate(data.accessToken);
        },
        onError: (err) => {
            console.error('Login failed:', err);
        },
    });

    return {
        login: (creds: LoginRequest) => mutate(creds),
        isLoading: isPending,
        error: error ? error.message : null,
    };
};