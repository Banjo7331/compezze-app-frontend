import { apiClient } from '@/shared/api/apiClient';
import type { Page, PageableParams } from '@/shared/api/types';
import type { 
    CreateContestRequest, 
    CreateContestResponse,
    StageRequest,
    UpcomingContestDto,
    ContestDetailsDto,
    SubmissionStatus
} from '../model/types';

const BASE_URL = '/contest'; // Gateway -> contest-service

// DTO do zmiany kolejności (lokalne lub w types.ts)
interface ReorderStagesRequest {
    stageIds: number[];
}

export const contestService = {

    // ================= ZARZĄDZANIE KONKURSEM =================

    // 1. Tworzenie Konkursu (z etapami)
    // POST /api/v1/contest
    createContest: async (data: CreateContestRequest) => {
        const response = await apiClient.post<CreateContestResponse>(BASE_URL, data);
        return response.data;
    },

    // 2. Aktualizacja konkretnego Etapu
    // PUT /api/v1/contest/{contestId}/stage/{stageId}
    updateStage: async (contestId: string, stageId: number, data: any) => { // 'data' to UpdateStageRequest (polimorficzny)
        await apiClient.put(`${BASE_URL}/${contestId}/stage/${stageId}`, data);
    },

    // 3. Zmiana kolejności Etapów
    // PATCH /api/v1/contest/{contestId}/stages/reorder
    reorderStages: async (contestId: string, stageIds: number[]) => {
        const payload: ReorderStagesRequest = { stageIds };
        await apiClient.patch(`${BASE_URL}/${contestId}/stages/reorder`, payload);
    },

    getUpcomingContest: async () => {
        const response = await apiClient.get<UpcomingContestDto | null>(`${BASE_URL}/upcoming`);
        return response.data; // Może być null, jeśli brak konkursów
    },

    // ================= GRYWALIZACJA / UCZESTNICTWO =================

    // 4. Pobranie linku do etapu (Bilet wstępu do Quizu/Ankiety)
    // GET /api/v1/contest/stage/{stageId}/access-url
    getStageAccessUrl: async (stageId: number) => {
        const response = await apiClient.get<{ url: string }>(`${BASE_URL}/stage/${stageId}/access-url`);
        return response.data.url; // Zwraca np. "/quiz/join/abc-123?ticket=xyz"
    },

    reviewSubmission: async (
        contestId: string, 
        submissionId: string, 
        status: SubmissionStatus, 
        comment?: string 
    ) => {
        await apiClient.put(`${BASE_URL}/${contestId}/submission/${submissionId}/review`, {
            status,  
            comment  
        });
    },

    getContestDetails: async (id: string) => {
        const response = await apiClient.get<ContestDetailsDto>(`${BASE_URL}/${id}`);
        return response.data;
    },

    // POST /api/v1/contest/{id}/join
    joinContest: async (id: string) => {
        // Pusty POST (token idzie w nagłówku, ID konkursu w URL)
        await apiClient.post(`${BASE_URL}/${id}/join`);
    }

    // ================= LISTY I SZCZEGÓŁY (TODO: Jeśli masz endpointy GET) =================
    
    // Przykładowe (jeśli będziesz implementował GETy w backendzie):
    /*
    getContestDetails: async (contestId: string) => {
        const response = await apiClient.get<ContestDetailsDto>(`${BASE_URL}/${contestId}`);
        return response.data;
    },

    getMyContests: async (params: PageableParams) => {
        const response = await apiClient.get<Page<MyContestDto>>(`${BASE_URL}/my`, { params });
        return response.data;
    }
    */
};