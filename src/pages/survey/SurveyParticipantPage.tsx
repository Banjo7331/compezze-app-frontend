import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, Typography, Box, Alert, CircularProgress, 
    Button as MuiButton, Paper, Stack, Divider 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

import { surveyService } from '@/features/survey/api/surveyService';
import { SurveySubmissionForm } from '@/features/survey/components/SurveySubmissionForm';
import { LiveResultSurveyDashboard } from '@/features/survey/components/LiveResultSurveyDashboard';

import type { SurveyFormStructure } from '@/features/survey/model/types';

const SurveyParticipantPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const [joinStatus, setJoinStatus] = useState<'IDLE' | 'JOINING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [joinError, setJoinError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [surveyForm, setSurveyForm] = useState<SurveyFormStructure | null>(null);

    useEffect(() => {
        if (!roomId || joinStatus !== 'IDLE') return;

        const joinRoom = async () => {
            setJoinStatus('JOINING');
            try {
                // 1. Backend zawsze zwraca 200 OK (nawet jak wracasz do pokoju)
                const response = await surveyService.joinRoom(roomId); 
                
                // 2. Zapisujemy dane formularza
                setSurveyForm(response.survey);
                setIsHost(response.host);
                
                // 3. Sprawdzamy flagę z backendu: Czy użytkownik już głosował?
                if (response.hasSubmitted) {
                    console.log("User has already submitted. Showing results.");
                    setIsSubmitted(true);
                } else {
                    setIsSubmitted(false);
                }

                setJoinStatus('SUCCESS');

            } catch (error: any) {
                console.error("Join failed:", error);
                
                // Teraz wpadamy tu TYLKO przy prawdziwych błędach (403, 404, 500)
                // Nie musimy już obsługiwać 409!
                setJoinError(error.message || "Could not join the room.");
                setJoinStatus('ERROR');
            }
        };

        joinRoom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]); // Usunąłem joinStatus z zależności, żeby nie pętliło, jeśli zmienisz logikę


    const handleSubmissionSuccess = () => {
        setIsSubmitted(true);
    };

    const handleSubmissionFailure = () => {
        alert("Your submission failed. Please try again.");
    };

    // --- RENDEROWANIE (Bez zmian) ---

    if (!roomId) return <Container maxWidth="md"><Alert severity="error" sx={{ mt: 4 }}>Room ID is missing.</Alert></Container>;

    if (joinStatus === 'JOINING' || joinStatus === 'IDLE') {
        return (
            <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h5">Joining the Survey Room...</Typography>
            </Container>
        );
    }

    if (joinStatus === 'ERROR') {
        return (
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Alert severity="error">Failed to join Room {roomId}: {joinError}</Alert>
                <MuiButton onClick={() => navigate('/survey')} sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>Back to Survey List</MuiButton>
            </Container>
        );
    }
    
    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    {isHost ? 'Survey Dashboard (Host)' : 'Participate in Survey'}
                </Typography>
                
                {/* KLUCZOWA ZMIANA: Pokaż wyniki jeśli WYSŁANO lub JESTEŚ HOSTEM */}
                {isSubmitted || isHost ? ( 
                    <Paper elevation={4} sx={{ p: 4 }}>
                        {/* Jeśli to Host, pokaż inny nagłówek */}
                        {isHost ? (
                            <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                <Typography variant="h5" color="primary">Host View</Typography>
                                <Typography variant="body2">Monitor live results below.</Typography>
                            </Stack>
                        ) : (
                            <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                <SendIcon color="success" sx={{ fontSize: 60 }} />
                                <Typography variant="h5" color="success.main">Survey Completed</Typography>
                                <Typography variant="body2">Thank you! You can view live results below.</Typography>
                            </Stack>
                        )}

                        <Divider sx={{ mb: 3 }} />
                        
                        <Typography variant="h6" gutterBottom>Live Aggregate Results</Typography>
                        
                        <LiveResultSurveyDashboard
                            roomId={roomId}
                            isHost={isHost} // Przekazujemy flagę
                            isParticipantSubmitted={isSubmitted} 
                        />
                        
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <MuiButton onClick={() => navigate('/survey')} variant="outlined" startIcon={<ArrowBackIcon />}>
                                {isHost ? 'Back to Surveys' : 'Finish and Return'}
                            </MuiButton>
                        </Box>
                    </Paper>
                ) : (
                    // Formularz dla uczestnika, który NIE GŁOSOWAŁ
                    surveyForm ? (
                        <SurveySubmissionForm
                            roomId={roomId}
                            surveyForm={surveyForm}
                            onSubmissionSuccess={handleSubmissionSuccess}
                            onSubmissionFailure={handleSubmissionFailure}
                        />
                    ) : (
                        <Alert severity="warning">Could not load survey form data.</Alert>
                    )
                )}
            </Box>
        </Container>
    );
};

export default SurveyParticipantPage;