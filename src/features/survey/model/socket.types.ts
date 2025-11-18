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
    // Zawierać będzie: participantId, userId, newParticipantCount
    participantId: number; 
    userId: string;
    newParticipantCount: number;
    // Oraz klucz "event" zdefiniowany na poziomie Springa
}

export interface LiveResultUpdateSocketMessage {
    liveResults: FinalRoomResultDto;
}

export interface RoomClosedSocketMessage {
    finalResults: FinalRoomResultDto;
}


// --- GŁÓWNY TYP WIADOMOŚCI WEBSOCKET (Dla ujednolicenia) ---
export type SurveySocketMessage = {
    event: 'USER_JOINED' | 'LIVE_RESULTS_UPDATE' | 'ROOM_CLOSED';
    payload: UserJoinedSocketMessage | LiveResultUpdateSocketMessage | RoomClosedSocketMessage;
}