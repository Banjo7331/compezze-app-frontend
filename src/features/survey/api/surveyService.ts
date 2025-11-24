import { apiClient } from '@/shared/api/apiClient';
// Uzupełnienie typów: CreateRoomRequest nie jest używany w tym serwisie, 
// ale zakładam, że jest potrzebny. Musimy dodać typ dla paginowanej odpowiedzi.
import type { CreateSurveyFormRequest, CreateRoomRequest, SurveyFormResponse, RoomResponse, JoinSurveyRoomResponse, SubmitParticipantAnswerRequest, SubmitSurveyAttemptRequest, SurveyRoomDetailsResponse, ActiveRoomResponse, MySurveyFormDto, MySurveyRoomDto } from '../model/types';


// Dodatkowe, generyczne typy dla paginacji (założenia na podstawie Spring Pageable)
// Możesz to przenieść do `shared/api/types.ts`
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


export const surveyService = {
  // 1. ZMIANA NAZWY: createForm -> createSurveyForm
  createSurveyForm: async (data: CreateSurveyFormRequest) => {
    const response = await apiClient.post<SurveyFormResponse>('/survey/form', data);
    return response.data;
  },

  getSurveyFormByRoomId: async (roomId: string) => {
    // Zakładamy, że backend udostępnia endpoint, który zwraca strukturę formularza
    const response = await apiClient.get<SurveyFormResponse>(`/survey/room/${roomId}/form`);
    return response.data;
  },

  // 2. ULEPSZENIE: Dodanie opcjonalnych parametrów paginacji i typowanie zwrotu Page<SurveyFormResponse>
  getAllForms: async (params?: PageableParams) => {
    // Backend: @GetMapping w @RequestMapping("survey/form")
    const response = await apiClient.get<Page<SurveyFormResponse>>('/survey/form', { params });
    return response.data;
  },

  getMyForms: async (params: PageableParams) => {
    const response = await apiClient.get<Page<MySurveyFormDto>>('/survey/form/my', { params });
    return response.data;
  },

  getMyRoomsHistory: async (params: PageableParams) => {
    const response = await apiClient.get<Page<MySurveyRoomDto>>('/survey/room/my', { params });
    return response.data;
  },

  deleteForm: async (formId: number) => {
    // DELETE /api/v1/survey/form/{id}
    const response = await apiClient.delete(`/survey/form/${formId}`);
    return response.data;
  },

  // Tworzenie pokoju (bez zmian, endpoint /survey/room jest poprawny)
  createRoom: async (data: CreateRoomRequest) => {
    const response = await apiClient.post<RoomResponse>('/survey/room', data);
    return response.data;
  },

  getActiveRooms: async (params?: PageableParams) => {
    const response = await apiClient.get<Page<ActiveRoomResponse>>('/survey/room/active', { params });
    return response.data;
  },

  getRoomDetails: async (roomId: string) => {
    const response = await apiClient.get<SurveyRoomDetailsResponse>(`/survey/room/${roomId}`);
    return response.data;
  },

  // Dołączanie do pokoju (bez zmian, endpoint /survey/room/{roomId}/join jest poprawny)
  joinRoom: async (roomId: string, invitationToken?: string | null) => {
    const payload = { invitationToken: invitationToken || null };
    
    const response = await apiClient.post<JoinSurveyRoomResponse>(
        `/survey/room/${roomId}/join`, 
        payload
    );
    return response.data;
  },
  
  // Przesyłanie odpowiedzi (bez zmian, endpoint /survey/room/{roomId}/submit jest poprawny)
  // UWAGA: Typ `answers` powinien być ściśle zdefiniowany zgodnie z backendowym `SubmitSurveyAttemptRequest`
  submitAnswers: async (roomId: string, request: SubmitSurveyAttemptRequest) => {
    const response = await apiClient.post(`/survey/room/${roomId}/submit`, request);
    return response.data;
  },

  closeRoom: async (roomId: string) => {
    // Backend: @PostMapping("/{roomId}/close") w @RequestMapping("survey/room")
    // Zwykle zwraca puste 200 OK lub prostą odpowiedź statusową.
    const response = await apiClient.post(`/survey/room/${roomId}/close`);
    return response.data;
  },

  generateInvites: async (roomId: string, userIds: string[]) => {
    // Zakładamy, że GenerateRoomInvitesRequest ma pole 'userIds'
    const payload = { userIds }; 
    
    const response = await apiClient.post<Record<string, string>>(
        `/survey/room/${roomId}/invites`, 
        payload
    );
    return response.data;
  },
};