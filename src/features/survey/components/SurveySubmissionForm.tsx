import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Stack, Radio, RadioGroup, 
    FormControlLabel, FormControl, FormLabel, Checkbox, 
    TextField, CircularProgress, Alert, Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Button } from '@/shared/ui/Button';
import { surveyService } from '../api/surveyService';

// Importujemy typy formularza (pytania, typy pytań) i requestu
import type { QuestionType, SurveyFormResponse, SubmitSurveyAttemptRequest, SubmitParticipantAnswerRequest, GetQuestionResponse } from '../model/types'; 
import { QuestionTypeValues } from '../model/types';


// --- TYPY LOKALNE DLA STANU ODPOWIEDZI ---

// Stan odpowiedzi dla pojedynczego pytania
interface AnswerState {
    questionId: number;
    // Lista wybranych odpowiedzi (dla tekstu otwartego: [text], dla wyboru: [option text])
    answers: string[]; 
}

// --- KOMPONENT ---

interface SurveySubmissionFormProps {
    roomId: string;
    // Prawdopodobnie trzeba przekazać ID Ankiety, które jest wymagane w DTO, 
    // ale zakładamy, że pobierzemy je wraz z pytaniami.
    onSubmissionSuccess: () => void;
    onSubmissionFailure: () => void;
}

export const SurveySubmissionForm: React.FC<SurveySubmissionFormProps> = ({ 
    roomId, 
    onSubmissionSuccess, 
    onSubmissionFailure 
}) => {
    const [surveyForm, setSurveyForm] = useState<SurveyFormResponse | null>(null);
    const [answers, setAnswers] = useState<AnswerState[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Ładowanie Formularza Ankiety ---
    useEffect(() => {
        const fetchForm = async () => {
            try {
                // HIPOTETYCZNE POBRANIE STRUKTURY ANKIETY
                const data = await surveyService.getSurveyFormByRoomId(roomId);
                setSurveyForm(data);
                
                // Inicjalizacja stanu odpowiedzi
                const initialAnswers: AnswerState[] = data.questions.map(q => ({
                    questionId: q.id,
                    answers: [],
                }));
                setAnswers(initialAnswers);
            } catch (error) {
                console.error("Error loading survey form:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchForm();
    }, [roomId]);

    // --- Handler Zmiany Odpowiedzi ---
    const handleAnswerChange = (questionId: number, newValues: string | string[]) => {
        setAnswers(prevAnswers => {
            const index = prevAnswers.findIndex(a => a.questionId === questionId);
            
            // Konwersja na listę stringów dla DTO
            const newAnswerList = Array.isArray(newValues) ? newValues : [newValues];

            if (index !== -1) {
                // Aktualizacja istniejącego stanu
                const newAnswers = [...prevAnswers];
                newAnswers[index] = { questionId, answers: newAnswerList };
                return newAnswers;
            } else {
                // Dodanie nowego stanu (powinno się zdarzyć tylko raz)
                return [...prevAnswers, { questionId, answers: newAnswerList }];
            }
        });
    };

    // --- Walidacja ---
    const isFormValid = answers.every(answer => {
        // Zakładamy, że każde pytanie wymaga odpowiedzi (co najmniej jedna wartość)
        return answer.answers.length > 0 && answer.answers.some(val => val.trim().length > 0);
    });

    // --- Handler Wysyłania Formularza ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || !surveyForm) return;

        setIsSubmitting(true);

        // Mapowanie stanu na DTO SubmitSurveyAttemptRequest
        const submissionData: SubmitSurveyAttemptRequest = {
            // surveyId (Long) jest ID DEFINICJI ANKIETY (np. z SurveyFormResponse)
            surveyId: surveyForm.id, 
            participantAnswers: answers.map(a => ({
                questionId: a.questionId,
                answers: a.answers.filter(val => val.trim().length > 0), // Usuń puste
            })),
        };

        try {
            await surveyService.submitAnswers(roomId, submissionData);
            onSubmissionSuccess();
        } catch (error) {
            console.error("Submission failed:", error);
            onSubmissionFailure();
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER STANU ŁADOWANIA / BŁĘDU ---
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!surveyForm) {
        return <Alert severity="error">Could not load the survey form. It might be invalid or closed.</Alert>;
    }


    // --- RENDER FORMULARZA ---
    return (
        <Paper elevation={4} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
                {surveyForm.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                Room ID: {roomId}
            </Typography>

            <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                    {surveyForm.questions.map((question, index) => (
                        <Box key={question.id}>
                            <FormControl component="fieldset" fullWidth>
                                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>
                                    {index + 1}. {question.title}
                                </FormLabel>
                                
                                {/* Dynamiczne renderowanie pól odpowiedzi */}
                                {renderQuestionInput(question, handleAnswerChange, answers)}

                            </FormControl>
                            <Divider sx={{ mt: 3 }} />
                        </Box>
                    ))}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
};


// --- FUNKCJA POMOCNICZA DYNAMICZNEGO RENDEROWANIA PÓL ---
const renderQuestionInput = (
    question: GetQuestionResponse, 
    handleChange: (id: number, values: string | string[]) => void,
    currentAnswers: AnswerState[]
) => {
    const currentAnswer = currentAnswers.find(a => a.questionId === question.id)?.answers[0] || '';
    const currentAnswerList = currentAnswers.find(a => a.questionId === question.id)?.answers || [];

    const handleSingleChoice = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(question.id, event.target.value);
    };

    const handleMultiChoice = (value: string) => {
        const list = currentAnswerList.includes(value)
            ? currentAnswerList.filter(v => v !== value)
            : [...currentAnswerList, value];
        handleChange(question.id, list);
    };

    switch (question.type) {
        case QuestionTypeValues.SINGLE_CHOICE:
            return (
                <RadioGroup name={`q-${question.id}`} value={currentAnswer} onChange={handleSingleChoice}>
                    {question.possibleChoices.map((choice, i) => (
                        <FormControlLabel key={i} value={choice} control={<Radio />} label={choice} />
                    ))}
                </RadioGroup>
            );

        case QuestionTypeValues.MULTIPLE_CHOICE:
            return (
                <Stack>
                    {question.possibleChoices.map((choice, i) => (
                        <FormControlLabel
                            key={i}
                            control={
                                <Checkbox 
                                    checked={currentAnswerList.includes(choice)} 
                                    onChange={() => handleMultiChoice(choice)}
                                />
                            }
                            label={choice}
                        />
                    ))}
                </Stack>
            );
            
        case QuestionTypeValues.TEXT:
            return (
                <TextField 
                    fullWidth 
                    multiline 
                    rows={3} 
                    variant="outlined"
                    value={currentAnswer}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                    placeholder="Wpisz swoją odpowiedź..."
                />
            );

        default:
            return <Alert severity="warning">Unsupported question type.</Alert>;
    }
};