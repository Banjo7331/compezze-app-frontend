import { apiClient } from '@/shared/api/apiClient';
// Importujemy Twój typ Page z shared
import type { UserSummary } from '../model/types';

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface PageableParams {
    page?: number;
    size?: number;
    sort?: string; // np. "title,asc"
}

export const userService = {
    searchUsers: async (query: string): Promise<UserSummary[]> => {
        if (!query || query.length < 2) return [];
        
        // Oczekujemy Page<UserSummary>
        const response = await apiClient.get<Page<UserSummary>>('/users/search', {
            params: { 
                query,
                size: 5 
            }
        });
        
        return response.data.content;
    }
};