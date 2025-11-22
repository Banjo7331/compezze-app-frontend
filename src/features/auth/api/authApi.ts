import { apiClient } from '@/shared/api/apiClient';
import type { 
    LoginRequest, 
    AuthResponse, 
    RegisterRequest,
    UserDto
} from '../model/types'; 

export const authApi = {
    // POST /auth/login
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    // POST /auth/register
    register: async (data: RegisterRequest): Promise<string> => {
        // Zwraca string (np. komunikat sukcesu)
        const response = await apiClient.post<string>('/auth/register', data);
        return response.data;
    },

    // POST /auth/refresh
    // ZMIANA LOGIKI: Usuwamy argument `data`. 
    // Refresh Token jest teraz w ciasteczku HttpOnly i zostanie wysłany automatycznie 
    // dzięki ustawieniu `withCredentials: true` w apiClient.
    refresh: async (): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/refresh', {});
        return response.data;
    },
    
    // GET /users/me
    getMe: async (): Promise<UserDto> => {
        const response = await apiClient.get<UserDto>('/users/me');
        return response.data;
    },

    // POST /auth/logout
    logout: async (): Promise<string> => {
        const response = await apiClient.post<string>('/auth/logout', {});
        return response.data;
    },
};