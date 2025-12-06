export const ContestCategory = {
    Art: 'Art',
    Music: 'Music',
    Food: 'Food',
    Sport: 'Sport',
    Science: 'Science',
    Other: 'Other',
} as const;
export type ContestCategory = typeof ContestCategory[keyof typeof ContestCategory];

export const SubmissionMediaPolicy = {
    IMAGES_ONLY: 'IMAGES_ONLY',
    VIDEOS_ONLY: 'VIDEOS_ONLY',
    BOTH: 'BOTH'
} as const;
export type SubmissionMediaPolicy = typeof SubmissionMediaPolicy[keyof typeof SubmissionMediaPolicy];

export const StageType = {
    QUIZ: 'QUIZ',
    SURVEY: 'SURVEY',
    JURY_VOTE: 'JURY_VOTE', // Pamiętaj: W Javie w @JsonSubTypes name="JURY_VOTE"
    PUBLIC_VOTE: 'PUBLIC_VOTE',
    GENERIC: 'GENERIC',
    CUSTOM: 'CUSTOM'
} as const;
export type StageType = typeof StageType[keyof typeof StageType];

export const JuryRevealMode = {
    IMMEDIATE: 'IMMEDIATE',
    ON_ENTRY_ADVANCE: 'ON_ENTRY_ADVANCE'
} as const;
export type JuryRevealMode = typeof JuryRevealMode[keyof typeof JuryRevealMode];


// --- STAGE REQUESTS (Polimorfizm) ---

interface BaseStageRequest {
    name: string;
    durationMinutes: number;
    order?: number; // Backend może ignorować, jeśli bierze z listy
    type: StageType;
}

// 1. Quiz
export interface QuizStageRequest extends BaseStageRequest {
    type: 'QUIZ';
    quizFormId: number;
    weight: number;
    maxParticipants: number;
    timePerQuestion: number;
}

// 2. Survey
export interface SurveyStageRequest extends BaseStageRequest {
    type: 'SURVEY';
    surveyFormId: number;
    maxParticipants: number;
    // durationMinutes jest już w base, ale w Javie masz to pole też w podklasie. 
    // TS: base.durationMinutes wystarczy.
}

// 3. Jury
export interface JuryStageRequest extends BaseStageRequest {
    type: 'JURY_VOTE';
    weight: number;
    maxScore: number;
    juryRevealMode: JuryRevealMode;
    showJudgeNames: boolean;
}

// 4. Public Vote
export interface PublicStageRequest extends BaseStageRequest {
    type: 'PUBLIC_VOTE';
    weight: number;
    maxScore: number;
}

// 5. Generic
export interface GenericStageRequest extends BaseStageRequest {
    type: 'GENERIC' | 'CUSTOM';
}

// UNIA
export type StageRequest = 
    | QuizStageRequest 
    | SurveyStageRequest 
    | JuryStageRequest 
    | PublicStageRequest 
    | GenericStageRequest;


// --- CREATE CONTEST REQUEST ---

export interface CreateContestRequest {
    name: string;
    description: string;
    location?: string;
    
    contestCategory: ContestCategory;
    participantLimit?: number;
    
    startDate: string; // ISO
    endDate: string;   // ISO
    
    isPrivate: boolean;
    hasPreliminaryStage: boolean;
    
    templateId: string; // Wymagane przez Twój backend
    submissionMediaPolicy?: SubmissionMediaPolicy;

    stages: StageRequest[];
}

export interface CreateContestResponse {
    id: string;
}

export interface UpcomingContestDto {
    id: string;
    name: string;
    category: ContestCategory;
    startDate: string;
    status: 'CREATED' | 'DRAFT' | 'ACTIVE' | 'FINISHED';
    isOrganizer: boolean;
}

export type ContestRole = 'ORGANIZER' | 'MODERATOR' | 'JURY' | 'COMPETITOR' | 'VIP';

export interface StageDto {
    id: number;
    name: string;
    type: StageType;
    durationMinutes: number;
    position: number;
}

export interface ContestDetailsDto {
    id: string;
    name: string;
    description: string;
    location?: string;
    category: ContestCategory;
    
    startDate: string;
    endDate: string;
    
    status: 'CREATED' | 'DRAFT' | 'ACTIVE' | 'FINISHED';

    participantLimit: number;
    currentParticipantsCount: number;
    private: boolean;

    organizer: boolean;
    participant: boolean;
    myRoles: ContestRole[];

    stages: StageDto[];
}

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ContestParticipantDto {
    id: number;
    userId: string;
    displayName: string;
    roles: ContestRole[];
    submissionId?: string; 
    submissionStatus?: string; 
}

// --- WERYFIKACJA ZGŁOSZEŃ ---
export interface SubmissionDto {
    id: string;
    participantName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    contentUrl?: string; // URL do obrazka/pliku
    comment?: string;
    createdAt: string;
}

export type ReviewAction = 'APPROVED' | 'REJECTED';