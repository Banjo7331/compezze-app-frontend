import type { FinalRoomResultDto } from './socket.types';

// --- ENUMS ---
// Używamy obiektu 'as const' zamiast enum, żeby uniknąć błędów 'erasableSyntaxOnly'
export const QuestionType = {
    SINGLE_CHOICE: 'SINGLE_CHOICE',
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    TRUE_FALSE: 'TRUE_FALSE'
} as const;
export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

export const QuizRoomStatus = {
    LOBBY: 'LOBBY',
    QUESTION_ACTIVE: 'QUESTION_ACTIVE',
    QUESTION_FINISHED: 'QUESTION_FINISHED', // Czas minął, przerwa
    LEADERBOARD: 'LEADERBOARD', // Opcjonalnie, jeśli masz taki stan
    FINISHED: 'FINISHED'
} as const;
export type QuizRoomStatus = typeof QuizRoomStatus[keyof typeof QuizRoomStatus];

// --- FORMULARZE (Tworzenie i Wyświetlanie) ---

export interface QuizOption {
    text: string;
    isCorrect: boolean; // Ważne przy tworzeniu (ukryte przy graniu)
}

export interface QuizQuestion {
    title: string;
    type: QuestionType;
    timeLimitSeconds: number;
    points: number;
    options: QuizOption[];
}

// Request do tworzenia Quizu
export interface CreateQuizFormRequest {
    title: string;
    isPrivate: boolean;
    questions: QuizQuestion[];
}

// Lista "Moje Szablony"
export interface MyQuizFormDto {
    id: number;
    title: string;
    isPrivate: boolean;
    createdAt: string;
    questionsCount: number;
}

// Lista Publiczna (Feed)
export interface GetQuizFormSummaryResponse {
    id: number;
    title: string;
    isPrivate: boolean;
    creatorId: string;
}

// --- POKOJE (ROOMS) ---

export interface CreateQuizRoomRequest {
    quizFormId: number;
    maxParticipants?: number;
    isPrivate: boolean;
    // durationMinutes - brak, bo quiz ma sztywny TTL
}

export interface CreateQuizRoomResponse {
    roomId: string;
    quizFormId: number;
    quizTitle: string;
}

// Odpowiedź przy JOIN (Bezpieczna - bez pytań)
export interface JoinQuizRoomResponse {
    participantId: number;
    host: boolean;
    status: QuizRoomStatus;
    quizInfo: {
        id: number;
        title: string;
        totalQuestions: number;
    };
}

export interface GetQuestionOptionResponse {
    id: number;
    text: string;
}

export interface GetCurrentQuestionResponse {
    questionId: number;
    questionIndex: number;
    title: string;
    timeLimitSeconds: number;
    startTime: string; 
    options: GetQuestionOptionResponse[];
}

export interface GetQuizRoomDetailsResponse {
    roomId: string;
    quizTitle: string;
    hostId: string;
    isOpen: boolean;
    status: QuizRoomStatus;
    isPrivate: boolean;
    currentParticipants: number;
    currentResults: FinalRoomResultDto;
    currentQuestion?: GetCurrentQuestionResponse;
}

export interface MyQuizRoomDto {
    roomId: string;
    quizTitle: string;
    isOpen: boolean;
    status: QuizRoomStatus;
    isPrivate: boolean;
    createdAt: string;
    validUntil?: string;
    totalParticipants: number;
    totalSubmissions: number;
}

// Lista "Active Rooms"
export interface GetActiveQuizRoomResponse {
    roomId: string;
    quizTitle: string;
    hostId: string;
    participantsCount: number;
    maxParticipants: number;
    status: QuizRoomStatus;
}

// --- GAMEPLAY ---

// Odpowiedź po wysłaniu strzału (wynik natychmiastowy)
export interface SubmitAnswerResponse {
    correct: boolean;
    pointsAwarded: number;
    currentTotalScore: number;
    comboStreak: number;
}

export interface WSMessage {
    event: string;
    [key: string]: any;
}