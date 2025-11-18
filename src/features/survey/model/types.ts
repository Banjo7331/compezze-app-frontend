// --- ENUMS/TYPES ---

// 1. Zdefiniuj wszystkie możliwe wartości jako Union Type
export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT';

// 2. Opcjonalnie: Utwórz obiekt mapujący, jeśli potrzebujesz tych wartości w kodzie JS (runtime).
// W Twoim formularzu używaliśmy wartości bezpośrednio, więc to powinno wystarczyć.
export const QuestionTypeValues: Record<QuestionType, QuestionType> = {
    SINGLE_CHOICE: 'SINGLE_CHOICE',
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    TEXT: 'TEXT',
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
    maxParticipants: number;
}

// --- RESPONSE DTOs ---

// Typy Odpowiedzi REST
export interface SurveyFormResponse {
    // Uwaga: id jest Long w Javie, co odpowiada number w TS. Zmieniam na string, jeśli URL używa stringa.
    // Zostawiam number dla zgodności z Long.
    id: number; 
    title: string;
    questions: GetQuestionResponse[];
    // Usunięto: isPrivate, status, ponieważ nie ma ich w GetSurveyFormResponse
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