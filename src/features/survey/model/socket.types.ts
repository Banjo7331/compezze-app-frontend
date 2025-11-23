import type { QuestionType } from './types';

export interface QuestionResultDto {
    questionId: number; // Long w Javie, number w TS
    title: string;
    type: QuestionType;
    answerCounts: Record<string, number>; // Map<String, Long> w Javie
    openAnswers: string[];
}

export interface FinalRoomResultDto {
    totalParticipants: number; // long w Javie
    totalSubmissions: number;  // long w Javie
    results: QuestionResultDto[];
}


// --- SOCKET MESSAGES (Payloads) ---

export interface UserJoinedSocketMessage {
    event: 'USER_JOINED'; // <--- To jest kluczowe dla TypeScripta
    participantId: number; 
    userId: string;
    newParticipantCount: number;
}

// 2. LIVE UPDATE
export interface LiveResultUpdateSocketMessage {
    event: 'LIVE_RESULTS_UPDATE'; // <--- Kluczowe
    currentResults: FinalRoomResultDto; // To już poprawiłeś, jest OK (zgodne z Javą)
}

// 3. ROOM CLOSED
export interface RoomClosedSocketMessage {
    event: 'ROOM_CLOSED'; // <--- Kluczowe
    finalResults: FinalRoomResultDto;
}


// --- GŁÓWNY TYP WIADOMOŚCI WEBSOCKET (Dla ujednolicenia) ---
export type SurveySocketMessage = 
    | UserJoinedSocketMessage 
    | LiveResultUpdateSocketMessage 
    | RoomClosedSocketMessage;