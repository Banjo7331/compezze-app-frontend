import { apiClient } from '@/shared/api/apiClient';
// Uzupełnienie typów: CreateRoomRequest nie jest używany w tym serwisie, 
// ale zakładam, że jest potrzebny. Musimy dodać typ dla paginowanej odpowiedzi.
import type { CreateSurveyFormRequest, CreateRoomRequest, SurveyFormResponse, RoomResponse, SubmitParticipantAnswerRequest, SubmitSurveyAttemptRequest } from '../model/types';


// Dodatkowe, generyczne typy dla paginacji (założenia na podstawie Spring Pageable)
// Możesz to przenieść do `shared/api/types.ts`
export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    // ... inne pola Pageable (sort, first, last, itp.)
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

  // Tworzenie pokoju (bez zmian, endpoint /survey/room jest poprawny)
  createRoom: async (data: CreateRoomRequest) => {
    const response = await apiClient.post<RoomResponse>('/survey/room', data);
    return response.data;
  },

  // Dołączanie do pokoju (bez zmian, endpoint /survey/room/{roomId}/join jest poprawny)
  joinRoom: async (roomId: string) => {
    const response = await apiClient.post<RoomResponse>(`/survey/room/${roomId}/join`);
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
};