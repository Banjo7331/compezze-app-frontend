import { apiClient } from '@/shared/api/apiClient';
import type { Page, PageableParams } from '@/shared/api/types';
import type { 
    CreateContestRequest, 
    CreateContestResponse,
    StageRequest,
    UpcomingContestDto,
    ContestDetailsDto,
    SubmissionStatus,
    ContestParticipantDto,
    SubmissionDto,
    ReviewAction
} from '../model/types';

const BASE_URL = '/contest'; 

interface ReorderStagesRequest {
    stageIds: number[];
}

export const contestService = {

    createContest: async (data: CreateContestRequest) => {
        const response = await apiClient.post<CreateContestResponse>(BASE_URL, data);
        return response.data;
    },
    updateStage: async (contestId: string, stageId: number, data: any) => {
        await apiClient.put(`${BASE_URL}/${contestId}/stage/${stageId}`, data);
    },
    reorderStages: async (contestId: string, stageIds: number[]) => {
        const payload: ReorderStagesRequest = { stageIds };
        await apiClient.patch(`${BASE_URL}/${contestId}/stage/reorder`, payload);
    },
    getUpcomingContest: async () => {
        const response = await apiClient.get<UpcomingContestDto | null>(`${BASE_URL}/upcoming`);
        return response.data;
    },
    getMyContests: async (params: PageableParams) => {
        const response = await apiClient.get<Page<UpcomingContestDto>>(`${BASE_URL}/my`, { params });
        return response.data;
    },
    getStageAccessUrl: async (stageId: number) => {
        const response = await apiClient.get<{ url: string }>(`${BASE_URL}/stage/${stageId}/access-url`);
        return response.data.url;
    },

    reviewSubmission: async (contestId: string, submissionId: string, status: ReviewAction, comment?: string) => {
        await apiClient.put(`${BASE_URL}/${contestId}/submission/${submissionId}/review`, {
            status,
            comment
        });
    },
    getContestDetails: async (id: string) => {
        const response = await apiClient.get<ContestDetailsDto>(`${BASE_URL}/${id}`);
        return response.data;
    },
    joinContest: async (id: string) => {
        await apiClient.post(`${BASE_URL}/${id}/join`);
    },
    getParticipants: async (contestId: string, query?: string) => {
        const response = await apiClient.get<ContestParticipantDto[]>(`${BASE_URL}/${contestId}/participant`, {
            params: { search: query }
        });
        return response.data;
    },
    submitEntry: async (contestId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        await apiClient.post(`${BASE_URL}/${contestId}/submission`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    withdrawMySubmission: async (contestId: string) => {
        await apiClient.delete(`${BASE_URL}/${contestId}/submission/my`);
    },
    manageRole: async (contestId: string, targetUserId: string, role: string, assign: boolean) => {
        await apiClient.put(`${BASE_URL}/${contestId}/roles`, {
            targetUserId,
            role,
            assign
        });
    },
    getSubmissionsForReview: async (contestId: string, status: string = 'PENDING') => {
        const response = await apiClient.get<SubmissionDto[]>(`${BASE_URL}/${contestId}/submission`, {
            params: { status }
        });
        return response.data;
    },
    getSubmissionMediaUrl: async (contestId: string, submissionId: string) => {
        const response = await apiClient.get<{ url: string }>(`${BASE_URL}/${contestId}/submission/${submissionId}/url`);
        return response.data.url;
    },
    deleteSubmission: async (contestId: string, submissionId: string) => {
        await apiClient.delete(`${BASE_URL}/${contestId}/submission/${submissionId}`);
    }
};