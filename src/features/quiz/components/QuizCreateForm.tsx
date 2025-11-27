import React, { useState } from 'react';
import { 
    Typography, TextField, Box, Stack, Card, CardContent, 
    IconButton, MenuItem, Select, FormControl, InputLabel, 
    FormControlLabel, Switch, Grid, Paper, CircularProgress, 
    Radio, Checkbox, Divider, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';

import { Button } from '@/shared/ui/Button'; 
import { quizService } from '../api/quizService'; 
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { QuestionType } from '../model/types';

// --- TYPY LOKALNE ---
interface OptionDraft {
    text: string;
    isCorrect: boolean;
}

interface QuestionDraft {
    id: number;
    title: string;
    type: QuestionType;
    timeLimitSeconds: number;
    points: number;
    options: OptionDraft[];
}

interface QuizCreateFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

const DEFAULT_OPTIONS_SINGLE: OptionDraft[] = [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false }
];

const DEFAULT_OPTIONS_TF: OptionDraft[] = [
    { text: 'Prawda', isCorrect: true },
    { text: 'Fałsz', isCorrect: false }
];

export const QuizCreateForm: React.FC<QuizCreateFormProps> = ({ onCancel, onSuccess }) => {
    const { showSuccess, showError } = useSnackbar();

    const [title, setTitle] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [questions, setQuestions] = useState<QuestionDraft[]>([
        { 
            id: Date.now(), 
            title: '', 
            type: 'SINGLE_CHOICE', 
            timeLimitSeconds: 30, 
            points: 1000,
            options: [...DEFAULT_OPTIONS_SINGLE] 
        }
    ]);

    // --- HANDLERY PYTAŃ ---

    const addQuestion = () => {
        if (questions.length >= 50) return;
        setQuestions([
            ...questions,
            { 
                id: Date.now(), 
                title: '', 
                type: 'SINGLE_CHOICE', 
                timeLimitSeconds: 30, 
                points: 1000,
                options: [...DEFAULT_OPTIONS_SINGLE] 
            }
        ]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length <= 1) return;
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const updateQuestion = (index: number, field: keyof QuestionDraft, value: any) => {
        const newQ = [...questions];
        const q = newQ[index];

        // Logika resetowania opcji przy zmianie typu
        if (field === 'type') {
            const newType = value as QuestionType;

            // A. Jeśli przełączamy na TRUE_FALSE -> resetujemy opcje na sztywno
            if (newType === 'TRUE_FALSE') {
                q.options = [
                    { text: 'Prawda', isCorrect: true },
                    { text: 'Fałsz', isCorrect: false }
                ];
            }
            // B. Jeśli przełączamy na SINGLE_CHOICE (np. z Multiple) -> musimy zostawić tylko 1 poprawną
            else if (newType === 'SINGLE_CHOICE') {
                // Znajdź indeks pierwszej poprawnej odpowiedzi
                const firstCorrectIndex = q.options.findIndex(o => o.isCorrect);
                // Jeśli żadna nie była, zaznaczamy pierwszą (0). Jeśli była, zostawiamy ją.
                const targetIndex = firstCorrectIndex !== -1 ? firstCorrectIndex : 0;
                
                // Resetujemy flagi: tylko targetIndex jest true
                q.options.forEach((o, i) => {
                    o.isCorrect = (i === targetIndex);
                });
            }
            // C. Jeśli przełączamy z TRUE_FALSE na inne -> przywracamy domyślne puste
            else if (q.type === 'TRUE_FALSE') {
                q.options = [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false }
                ];
            }
        }

        (q as any)[field] = value;
        setQuestions(newQ);
    };

    // --- HANDLERY OPCJI ---

    const handleOptionTextChange = (qIndex: number, oIndex: number, text: string) => {
        const newQ = [...questions];
        newQ[qIndex].options[oIndex].text = text;
        setQuestions(newQ);
    };

    const handleCorrectChange = (qIndex: number, oIndex: number) => {
        const newQ = [...questions];
        const q = newQ[qIndex];

        if (q.type === 'SINGLE_CHOICE' || q.type === 'TRUE_FALSE') {
            // Tylko jedna może być poprawna -> resetujemy inne
            q.options.forEach((o, i) => o.isCorrect = (i === oIndex));
        } else {
            // MULTIPLE_CHOICE -> toggle
            q.options[oIndex].isCorrect = !q.options[oIndex].isCorrect;
        }
        setQuestions(newQ);
    };

    const addOption = (qIndex: number) => {
        const newQ = [...questions];
        if (newQ[qIndex].options.length >= 6) return;
        newQ[qIndex].options.push({ text: '', isCorrect: false });
        setQuestions(newQ);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQ = [...questions];
        if (newQ[qIndex].options.length <= 2) return;
        newQ[qIndex].options.splice(oIndex, 1);
        setQuestions(newQ);
    };

    // --- WALIDACJA I SUBMIT ---

    const validate = (): boolean => {
        if (title.length < 3) { showError("Tytuł jest za krótki"); return false; }
        
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            
            // Walidacja treści
            if (!q.title.trim()) { showError(`Pytanie ${i+1} nie ma treści`); return false; }
            if (q.options.some(o => !o.text.trim())) { showError(`Pytanie ${i+1} ma puste opcje`); return false; }
            
            // Zliczamy poprawne odpowiedzi
            const correctCount = q.options.filter(o => o.isCorrect).length;

            // Walidacja logiki gry
            if (q.type === 'SINGLE_CHOICE' || q.type === 'TRUE_FALSE') {
                if (correctCount !== 1) {
                    showError(`Pytanie ${i+1} (${q.type}) musi mieć DOKŁADNIE jedną poprawną odpowiedź.`);
                    return false;
                }
            } else if (q.type === 'MULTIPLE_CHOICE') {
                if (correctCount < 1) {
                    showError(`Pytanie ${i+1} (Wielokrotny wybór) musi mieć PRZYNAJMNIEJ jedną poprawną odpowiedź.`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await quizService.createForm({
                title,
                isPrivate,
                questions: questions.map(q => ({
                    title: q.title,
                    type: q.type,
                    timeLimitSeconds: q.timeLimitSeconds,
                    points: q.points,
                    options: q.options
                }))
            });
            showSuccess("Quiz utworzony pomyślnie!");
            onSuccess();
        } catch (e) {
            showError("Błąd podczas tworzenia quizu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card component={Paper} elevation={3} sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">Kreator Quizu</Typography>
                
                <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                    
                    {/* Ustawienia Główne */}
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, md: 8 }}>
                                <TextField 
                                    label="Tytuł Quizu" 
                                    fullWidth 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)}
                                    required 
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControlLabel 
                                    control={<Switch checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />}
                                    label="Quiz Prywatny"
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    {/* Lista Pytań */}
                    {questions.map((q, qIndex) => (
                        <Box key={q.id} sx={{ position: 'relative', p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
                            
                            {/* Header Pytania */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <TextField 
                                        label={`Pytanie #${qIndex + 1}`}
                                        fullWidth
                                        value={q.title}
                                        onChange={e => updateQuestion(qIndex, 'title', e.target.value)}
                                        placeholder="Wpisz treść pytania..."
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Typ Pytania</InputLabel>
                                        <Select
                                            value={q.type}
                                            label="Typ Pytania"
                                            onChange={e => updateQuestion(qIndex, 'type', e.target.value)}
                                        >
                                            <MenuItem value="SINGLE_CHOICE">Jednokrotny wybór</MenuItem>
                                            <MenuItem value="MULTIPLE_CHOICE">Wielokrotny wybór</MenuItem>
                                            <MenuItem value="TRUE_FALSE">Prawda / Fałsz</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            {/* Parametry (Czas, Punkty) */}
                            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                <TextField 
                                    label="Czas"
                                    type="number"
                                    size="small"
                                    value={q.timeLimitSeconds}
                                    onChange={e => updateQuestion(qIndex, 'timeLimitSeconds', Number(e.target.value))}
                                    InputProps={{ 
                                        startAdornment: <InputAdornment position="start"><TimerIcon fontSize="small"/></InputAdornment>,
                                        endAdornment: <InputAdornment position="end">s</InputAdornment>
                                    }}
                                    sx={{ width: 130 }}
                                />
                                <TextField 
                                    label="Punkty"
                                    type="number"
                                    size="small"
                                    value={q.points}
                                    onChange={e => updateQuestion(qIndex, 'points', Number(e.target.value))}
                                    InputProps={{ 
                                        startAdornment: <InputAdornment position="start"><StarIcon fontSize="small"/></InputAdornment> 
                                    }}
                                    sx={{ width: 130 }}
                                />
                            </Stack>

                            {/* Opcje Odpowiedzi */}
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                Odpowiedzi (Zaznacz poprawne):
                            </Typography>

                            <Stack spacing={1}>
                                {q.options.map((opt, oIndex) => (
                                    <Stack key={oIndex} direction="row" spacing={1} alignItems="center">
                                        {/* Checkbox/Radio dla poprawnej odpowiedzi */}
                                        {q.type === 'MULTIPLE_CHOICE' ? (
                                            <Checkbox 
                                                checked={opt.isCorrect} 
                                                onChange={() => handleCorrectChange(qIndex, oIndex)} 
                                                color="success"
                                            />
                                        ) : (
                                            <Radio 
                                                checked={opt.isCorrect} 
                                                onChange={() => handleCorrectChange(qIndex, oIndex)}
                                                color="success"
                                            />
                                        )}
                                        
                                        <TextField 
                                            fullWidth 
                                            size="small"
                                            value={opt.text}
                                            onChange={e => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                                            placeholder={`Opcja ${oIndex + 1}`}
                                            // Dla True/False tekst jest stały (opcjonalnie można zablokować)
                                        />
                                        
                                        {q.type !== 'TRUE_FALSE' && (
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                disabled={q.options.length <= 2}
                                                onClick={() => removeOption(qIndex, oIndex)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Stack>
                                ))}
                            </Stack>

                            {/* Przycisk dodawania opcji (tylko dla choice) */}
                            {q.type !== 'TRUE_FALSE' && q.options.length < 6 && (
                                <Button 
                                    size="small" 
                                    startIcon={<AddCircleOutlineIcon />} 
                                    onClick={() => addOption(qIndex)} 
                                    sx={{ mt: 1, ml: 5 }}
                                >
                                    Dodaj Opcję
                                </Button>
                            )}

                            {/* Usuwanie pytania */}
                            {questions.length > 1 && (
                                <IconButton 
                                    onClick={() => removeQuestion(qIndex)} 
                                    color="error" 
                                    sx={{ position: 'absolute', top: 10, right: 10 }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Box>
                    ))}

                    {/* Akcje Końcowe */}
                    <Button 
                        variant="outlined" 
                        startIcon={<AddCircleOutlineIcon />} 
                        onClick={addQuestion} 
                        fullWidth 
                        sx={{ py: 1.5, borderStyle: 'dashed' }}
                    >
                        Dodaj Nowe Pytanie
                    </Button>

                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                        <Button onClick={onCancel} color="inherit">Anuluj</Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            size="large"
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                        >
                            Zapisz Quiz
                        </Button>
                    </Stack>

                </Stack>
            </CardContent>
        </Card>
    );
};