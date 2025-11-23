import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, Typography, Box, Alert, CircularProgress, 
    Button as MuiButton, Paper, Stack, Divider, Grid 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

// Importy z Features
import { surveyService } from '@/features/survey/api/surveyService';
import { SurveySubmissionForm } from '@/features/survey/components/SurveySubmissionForm';
import { LiveResultSurveyDashboard } from '@/features/survey/components/LiveResultSurveyDashboard';
import { RoomControlPanel } from '@/features/survey/components/RoomControlPanel'; // Importujemy Panel Hosta
import { InviteUsersPanel } from '@/features/survey/components/InviteUserPanel';

import type { SurveyFormStructure } from '@/features/survey/model/types';

const SurveyRoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    // --- STAN ---
    const [loadingState, setLoadingState] = useState<'LOADING' | 'READY' | 'ERROR'>('LOADING');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    // Dane sesji
    const [isHost, setIsHost] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [surveyForm, setSurveyForm] = useState<SurveyFormStructure | null>(null);

    // --- INICJALIZACJA (JOIN) ---
    useEffect(() => {
        if (!roomId) return;

        const enterRoom = async () => {
            setLoadingState('LOADING');
            try {
                // Wywołujemy idempotentny JOIN
                const response = await surveyService.joinRoom(roomId);
                
                setSurveyForm(response.survey);
                setIsHost(response.host); // Backend mówi: "To Ty jesteś szefem"
                setIsSubmitted(response.hasSubmitted);
                
                setLoadingState('READY');

            } catch (error: any) {
                console.error("Failed to enter room:", error);
                setErrorMsg(error.message || "Could not access the room.");
                setLoadingState('ERROR');
            }
        };

        enterRoom();
    }, [roomId]);


    // --- HANDLERY ---
    const handleSubmissionSuccess = () => setIsSubmitted(true);
    const handleSubmissionFailure = () => alert("Submission failed. Try again.");
    
    // Handler zamknięcia pokoju (dla Hosta)
    const handleRoomClosed = () => {
        console.log("Room closed.");
        // Możemy tu wymusić odświeżenie lub pokazać komunikat
    };


    // --- RENDEROWANIE: LOADER / BŁĄD ---
    
    if (!roomId) return <Container><Alert severity="error">Missing Room ID</Alert></Container>;

    if (loadingState === 'LOADING') {
        return (
            <Container sx={{ mt: 10, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Entering Room...</Typography>
            </Container>
        );
    }

    if (loadingState === 'ERROR') {
        return (
            <Container sx={{ mt: 10 }}>
                <Alert severity="error">{errorMsg}</Alert>
                <MuiButton onClick={() => navigate('/survey')} sx={{ mt: 2 }}>Back</MuiButton>
            </Container>
        );
    }

    // --- RENDEROWANIE: GŁÓWNY WIDOK (SMART SWITCH) ---

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                
                {/* 1. WIDOK HOSTA (Pełny Dashboard) */}
                {isHost && (
                    <Grid container spacing={4}>
                        {/* Lewa Kolumna: Sterowanie */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <RoomControlPanel roomId={roomId} onCloseSuccess={handleRoomClosed} />
                            <InviteUsersPanel roomId={roomId} /> {/* Panel generowania zaproszeń */}
                            
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <MuiButton onClick={() => navigate('/survey')} startIcon={<ArrowBackIcon />}>
                                    Back to My Surveys
                                </MuiButton>
                            </Box>
                        </Grid>

                        {/* Prawa Kolumna: Wyniki */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Typography variant="h5" color="primary" gutterBottom>Host Dashboard</Typography>
                                <LiveResultSurveyDashboard roomId={roomId} isHost={true} />
                            </Paper>
                        </Grid>
                    </Grid>
                )}


                {/* 2. WIDOK UCZESTNIKA (Formularz LUB Wyniki) */}
                {!isHost && (
                    <Container maxWidth="md">
                        {isSubmitted ? (
                            // Uczestnik: Już wysłał -> Pokaż Wyniki
                            <Paper elevation={4} sx={{ p: 4 }}>
                                <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                    <SendIcon color="success" sx={{ fontSize: 60 }} />
                                    <Typography variant="h5" color="success.main">Survey Completed</Typography>
                                    <Typography variant="body2">Thank you! Watch the live results below.</Typography>
                                </Stack>
                                <Divider sx={{ mb: 3 }} />
                                
                                <LiveResultSurveyDashboard 
                                    roomId={roomId} 
                                    isHost={false} 
                                    isParticipantSubmitted={true} 
                                />
                            </Paper>
                        ) : (
                            // Uczestnik: Jeszcze nie wysłał -> Pokaż Formularz
                            surveyForm ? (
                                <SurveySubmissionForm
                                    roomId={roomId}
                                    surveyForm={surveyForm}
                                    onSubmissionSuccess={handleSubmissionSuccess}
                                    onSubmissionFailure={handleSubmissionFailure}
                                />
                            ) : (
                                <Alert severity="warning">Loading form data failed.</Alert>
                            )
                        )}
                    </Container>
                )}

            </Box>
        </Container>
    );
};

export default SurveyRoomPage;