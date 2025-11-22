import React, { useState } from 'react';
import { 
    Box, Typography, Paper, Button, Divider, Stack, CircularProgress, Alert 
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GridViewIcon from '@mui/icons-material/GridView';
import { useNavigate } from 'react-router-dom';

import { useUserSurveyForms } from '../hooks/useUserSurveyForms';
import { surveyService } from '../api/surveyService';
import type { CreateRoomRequest } from '../model/types';

import { AllFormsDialog } from './AllFormsDialog';

export const FeaturedTemplatesWidget: React.FC = () => {
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Pobieramy TYLKO 3 sztuki
    const { data, isLoading, error } = useUserSurveyForms({ 
        size: 3, 
        sort: 'id,desc' // Najnowsze
    });

    // Logika Launch Room (skopiowana z SurveyItem, można by wydzielić do hooka, ale tu jest prosto)
    const handleQuickLaunch = async (id: number) => {
        try {
            const request: CreateRoomRequest = {
                surveyFormId: id as any,
                maxParticipants: 50
            };
            const result = await surveyService.createRoom(request);
            navigate(`/survey/room/${result.roomId}`);
        } catch (e) {
            alert("Failed to launch room");
        }
    };

    return (
        <>
            <Paper elevation={3} sx={{ p: 4, height: '100%', backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ListAltIcon sx={{ mr: 1, fontSize: 30, color: 'text.primary' }} />
                    <Typography variant="h5" component="h2">
                        Szybki Start
                    </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Twoje ostatnie szablony:
                </Typography>

                <Stack spacing={2}>
                    {isLoading && <CircularProgress size={20} />}
                    {error && <Alert severity="error">Błąd</Alert>}
                    
                    {data?.map((survey) => (
                        <Paper 
                            // FIX: Używamy surveyFormId
                            key={survey.surveyFormId}
                            elevation={1} 
                            sx={{ 
                                p: 2, 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                borderLeft: `5px solid ${survey.isPrivate ? 'gray' : '#1976d2'}` 
                            }}
                        >
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                    {survey.title}
                                </Typography>
                                
                                {/* FIX: USUNIĘTO LICZNIK PYTAŃ (bo backend go nie zwraca) */}
                                <Typography variant="caption" color="text.secondary">
                                    {survey.isPrivate ? 'Prywatna' : 'Publiczna'}
                                </Typography>
                            </Box>
                            <Button 
                                size="small" 
                                startIcon={<PlayArrowIcon />}
                                // FIX: Przekazujemy surveyFormId
                                onClick={() => handleQuickLaunch(survey.surveyFormId!)}
                                sx={{ minWidth: 'auto' }}
                            >
                                Start
                            </Button>
                        </Paper>
                    ))}
                    
                    {data?.length === 0 && <Typography variant="caption">Brak szablonów. Utwórz pierwszy!</Typography>}
                </Stack>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<GridViewIcon />}
                        onClick={() => setIsDialogOpen(true)}
                    >
                        Wszystkie Szablony
                    </Button>
                </Box>
            </Paper>

            {/* MODAL Z PEŁNĄ LISTĄ */}
            <AllFormsDialog 
                open={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)} 
            />
        </>
    );
};