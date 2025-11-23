// --- ENUMS/TYPES ---
import type { FinalRoomResultDto } from 'src/features/survey/model/socket.types';

// 1. Zdefiniuj wszystkie możliwe wartości jako Union Type
export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'OPEN_TEXT';

// 2. Opcjonalnie: Utwórz obiekt mapujący, jeśli potrzebujesz tych wartości w kodzie JS (runtime).
// W Twoim formularzu używaliśmy wartości bezpośrednio, więc to powinno wystarczyć.
export const QuestionTypeValues: Record<QuestionType, QuestionType> = {
    SINGLE_CHOICE: 'SINGLE_CHOICE',
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    OPEN_TEXT: 'OPEN_TEXT',
};

// --- REQUEST DTOs ---

// Wydzielenie typu dla pojedynczego pytania
export interface CreateQuestionRequest {
    title: string;
    type: QuestionType; // Używa typu QuestionType
    possibleChoices: string[];
}

// DTO do tworzenia nowej Ankiety
export interface CreateSurveyFormRequest {
    title: string;
    isPrivate: boolean;
    questions: CreateQuestionRequest[];
}

export interface CreateRoomRequest {
    surveyFormId: number; 
    maxParticipants?: number;
}

// --- RESPONSE DTOs ---

// Typy Odpowiedzi REST
export interface SurveyFormResponse {
    surveyFormId: number;
    title: string;
    isPrivate: boolean; 
    creatorId: string; 
}

export interface JoinSurveyRoomResponse {
    participantId: number;
    survey: SurveyFormStructure;
    hasSubmitted: boolean;
    host: boolean;
}

export interface SurveyFormStructure {
    id: number;
    title: string;
    questions: GetQuestionResponse[];
}

// Typ pytania w odpowiedzi
export interface GetQuestionResponse {
    id: number;
    title: string;
    type: QuestionType;
    possibleChoices: string[];
}

export interface RoomResponse {
    roomId: string;
}

export interface ActiveRoomResponse {
    roomId: string;
    surveyTitle: string;
    hostId: string;
    currentParticipants: number;
    maxParticipants: number;
}

export interface SurveyRoomDetailsResponse {
    roomId: string;
    surveyTitle: string;
    hostId: string;
    isOpen: boolean;
    isPrivate: boolean;
    currentParticipants: number;
    currentResults: FinalRoomResultDto;
}

export interface SubmitParticipantAnswerRequest {
    questionId: number; // Long -> number
    answers: string[];  // List<String> -> string[]
}

export interface SubmitSurveyAttemptRequest {
    surveyId: number;   // Long -> number (ID definicji ankiety, nie pokoju!)
    participantAnswers: SubmitParticipantAnswerRequest[];
}

// --- WebSocket Types ---
export interface WSMessage {
    event?: string;
    newParticipantCount?: number;
    participantUserId?: string;
    currentResults?: {
        totalSubmissions: number;
        // ... inne pola wyników
    };
}