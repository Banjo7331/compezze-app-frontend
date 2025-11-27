import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Divider, Stack, CircularProgress, Alert, Button
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GridViewIcon from '@mui/icons-material/GridView';
import { useNavigate } from 'react-router-dom';

import { quizService } from '../api/quizService';
import type { MyQuizFormDto, CreateQuizRoomRequest } from '../model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

// Jeśli chcesz modal z listą wszystkich, musisz go stworzyć (AllQuizFormsDialog)
// import { AllQuizFormsDialog } from './AllQuizFormsDialog'; 

export const QuizFeaturedTemplatesWidget: React.FC = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();
    
    const [forms, setForms] = useState<MyQuizFormDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);

    // Pobieramy 3 ostatnie quizy
    useEffect(() => {
        const fetchForms = async () => {
            try {
                const data = await quizService.getMyForms({ page: 0, size: 3, sort: 'createdAt,desc' });
                setForms(data.content);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchForms();
    }, []);

    // Szybki Start (Bez pytania o czas, bo w Quizie jest on w pytaniach/TTL)
    const handleQuickLaunch = async (id: number) => {
        if (isStarting) return;
        
        if (!window.confirm("Czy chcesz uruchomić nową grę (Lobby)?")) return;

        setIsStarting(true);
        try {
            const request: CreateQuizRoomRequest = {
                quizFormId: id,
                maxParticipants: 100, // Domyślny limit na szybki start
                isPrivate: false      // Domyślnie publiczny przy szybkim starcie
            };
            
            const result = await quizService.createRoom(request);
            showSuccess("Lobby utworzone!");
            // Przekierowanie do pokoju (gdzie user zostanie hostem)
            navigate(`/quiz/room/${result.roomId}`);
            
        } catch (e) {
            showError("Nie udało się utworzyć gry.");
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <>
            <Paper elevation={3} sx={{ p: 4, height: '100%', backgroundColor: '#fff3e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ListAltIcon sx={{ mr: 1, fontSize: 30, color: 'warning.dark' }} />
                    <Typography variant="h5" component="h2" color="text.primary">
                        Szybka Gra
                    </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Twoje ostatnie quizy:
                </Typography>

                <Stack spacing={2}>
                    {isLoading && <CircularProgress size={20} sx={{alignSelf:'center'}} />}
                    
                    {forms.map((quiz) => (
                        <Paper 
                            key={quiz.id}
                            elevation={1} 
                            sx={{ 
                                p: 2, 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                borderLeft: `5px solid ${quiz.isPrivate ? 'gray' : '#ed6c02'}` 
                            }}
                        >
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                    {quiz.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {quiz.questionsCount} pytań • {quiz.isPrivate ? 'Prywatny' : 'Publiczny'}
                                </Typography>
                            </Box>
                            
                            <Button 
                                size="small" 
                                variant="contained"
                                color="warning"
                                startIcon={<PlayArrowIcon />}
                                onClick={() => handleQuickLaunch(quiz.id)}
                                disabled={isStarting}
                                sx={{ minWidth: 'auto', px: 2 }}
                            >
                                GRAJ
                            </Button>
                        </Paper>
                    ))}
                    
                    {!isLoading && forms.length === 0 && (
                        <Typography variant="caption" align="center" display="block">
                            Brak quizów. Stwórz pierwszy!
                        </Typography>
                    )}
                </Stack>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button 
                        variant="outlined" 
                        color="warning"
                        fullWidth 
                        startIcon={<GridViewIcon />}
                        onClick={() => navigate('/profile')} // Przekierowanie do profilu zamiast dialogu
                    >
                        Wszystkie Quizy
                    </Button>
                </Box>
            </Paper>
        </>
    );
};