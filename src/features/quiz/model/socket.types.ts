import type { QuizRoomStatus } from './types';

// --- DTO WYNIKÓW (Ranking) ---

export interface LeaderboardEntryDto {
    userId: string; // Klucz do identyfikacji "To ja"
    nickname: string;
    score: number;
    rank: number;
}

export interface FinalRoomResultDto {
    totalParticipants: number;
    leaderboard: LeaderboardEntryDto[];
}

// --- WIADOMOŚCI SOCKETOWE (Events) ---

// 1. Dołączenie gracza (Lobby)
export interface QuizUserJoinedMessage {
    event: 'USER_JOINED';
    participantId: number;
    userId: string;
    username: string; // Ksywka
    newParticipantCount: number;
}

// 2. Start Gry
export interface QuizStartedMessage {
    event: 'QUIZ_STARTED';
}

// 3. Nowe Pytanie (Start rundy)
export interface QuizNewQuestionMessage {
    event: 'NEW_QUESTION';
    questionIndex: number;
    title: string;
    options: string[]; // Lista tekstów (kolejność musi być zgodna z ID na backendzie)
    timeLimitSeconds: number;
    startTime: string; // Data ISO
}

// 4. Koniec Pytania (Wyniki rundy)
export interface QuizQuestionFinishedMessage {
    event: 'QUESTION_FINISHED';
    correctOptionId: number | null; // Żeby podświetlić poprawną (null jeśli nikt nie zgadł/błąd)
    // Opcjonalnie: answerStats (rozkład głosów) jeśli backend to wysyła
}

// 5. Aktualizacja Rankingu (np. po każdym pytaniu)
export interface QuizLeaderboardMessage {
    event: 'LEADERBOARD_UPDATE';
    topPlayers: LeaderboardEntryDto[];
}

// 6. Koniec całej gry
export interface QuizRoomClosedMessage {
    event: 'ROOM_CLOSED';
    finalResults: FinalRoomResultDto; // Ostateczny ranking
}

// --- GŁÓWNY TYP (UNIA) ---
// Tego używamy w hooku useQuizRoomSocket
export type QuizSocketMessage = 
    | QuizUserJoinedMessage
    | QuizStartedMessage
    | QuizNewQuestionMessage
    | QuizQuestionFinishedMessage
    | QuizLeaderboardMessage
    | QuizRoomClosedMessage;

// (Opcjonalnie) Typ ogólny dla klienta
export interface WSMessage {
    event: string;
    [key: string]: any;
}