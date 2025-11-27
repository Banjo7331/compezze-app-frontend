import { apiClient } from '@/shared/api/apiClient';
import type { Page, PageableParams } from '@/shared/api/types';
import type { 
    CreateQuizFormRequest, 
    MyQuizFormDto, 
    GetQuizFormSummaryResponse,
    CreateQuizRoomRequest, 
    JoinQuizRoomResponse,
    MyQuizRoomDto,
    GetActiveQuizRoomResponse,
    GetQuizRoomDetailsResponse,
    SubmitAnswerResponse // To musisz dodać do types.ts (z backendu SubmitAnswerResponse)
} from '../model/types';

// Prefix w Gateway kierujący do quiz-service
const BASE_URL = '/quiz'; 

export const quizService = {
    
    // ================= FORMULARZE (DEFINICJE) =================

    createForm: async (data: CreateQuizFormRequest) => {
        // POST /api/v1/quiz/form
        const response = await apiClient.post(`${BASE_URL}/form`, data);
        return response.data;
    },

    getMyForms: async (params: PageableParams) => {
        // GET /api/v1/quiz/form/my
        const response = await apiClient.get<Page<MyQuizFormDto>>(`${BASE_URL}/form/my`, { params });
        return response.data;
    },
    
    getAllForms: async (params: PageableParams) => {
        // GET /api/v1/quiz/form (Feed publiczny)
        const response = await apiClient.get<Page<GetQuizFormSummaryResponse>>(`${BASE_URL}/form`, { params });
        return response.data;
    },

    deleteForm: async (id: number) => {
        // DELETE /api/v1/quiz/form/{id}
        await apiClient.delete(`${BASE_URL}/form/${id}`);
    },

    // ================= POKOJE (ROOMS) =================

    createRoom: async (data: CreateQuizRoomRequest) => {
        // POST /api/v1/quiz/room
        const response = await apiClient.post<{ roomId: string }>(`${BASE_URL}/room`, data);
        return response.data;
    },

    joinRoom: async (roomId: string, nickname: string, invitationToken?: string | null) => {
        const payload = { 
            invitationToken: invitationToken || null,
            nickname: nickname // Wymagane w Quizach
        };
        const response = await apiClient.post<JoinQuizRoomResponse>(`${BASE_URL}/room/${roomId}/join`, payload);
        return response.data;
    },

    getRoomDetails: async (roomId: string) => {
        const response = await apiClient.get<GetQuizRoomDetailsResponse>(`${BASE_URL}/room/${roomId}`);
        return response.data;
    },

    getActiveRooms: async (params: PageableParams) => {
        const response = await apiClient.get<Page<GetActiveQuizRoomResponse>>(`${BASE_URL}/room/active`, { params });
        return response.data;
    },
    
    getMyRoomsHistory: async (params: PageableParams) => {
        const response = await apiClient.get<Page<MyQuizRoomDto>>(`${BASE_URL}/room/my`, { params });
        return response.data;
    },

    // ================= GAME LOOP (HOST CONTROLS) =================

    startQuiz: async (roomId: string) => {
        await apiClient.post(`${BASE_URL}/room/${roomId}/start`);
    },

    nextQuestion: async (roomId: string) => {
        await apiClient.post(`${BASE_URL}/room/${roomId}/question/next`);
    },
    
    finishQuestionManually: async (roomId: string) => {
        await apiClient.post(`${BASE_URL}/room/${roomId}/question/finish`);
    },

    closeRoom: async (roomId: string) => {
        await apiClient.post(`${BASE_URL}/room/${roomId}/close`);
    },
    
    // ================= GAMEPLAY (PLAYER) =================

    submitAnswer: async (roomId: string, questionId: number, selectedOptionId: number) => {
        // Zwraca SubmitAnswerResponse (z informacją czy poprawnie i ile punktów)
        const response = await apiClient.post<SubmitAnswerResponse>(`${BASE_URL}/room/${roomId}/submit`, {
            questionId,
            selectedOptionId
        });
        return response.data; 
    },
    
    // ================= INNE =================
    
    generateInvites: async (roomId: string, userIds: string[]) => {
        const payload = { userIds };
        const response = await apiClient.post<Record<string, string>>(`${BASE_URL}/room/${roomId}/invites`, payload);
        return response.data;
    }
};