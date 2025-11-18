import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, Typography, Box, Alert, CircularProgress, 
    Button as MuiButton, Paper, Stack, Divider // Dodano Divider do użycia po wysłaniu
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

// Importujemy serwis
import { surveyService } from '@/features/survey/api/surveyService';
// FIX: Importujemy każdy komponent z jego poprawnej ścieżki
import { SurveySubmissionForm } from '@/features/survey/components/SurveySubmissionForm';
import { LiveResultSurveyDashboard } from '@/features/survey/components/LiveResultSurveyDashboard';


const SurveyParticipantPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    // Stan procesu dołączania
    const [joinStatus, setJoinStatus] = useState<'IDLE' | 'JOINING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [joinError, setJoinError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false); // Czy uczestnik już przesłał ankietę

    // --- Efekt Dołączania do Pokoju ---
    useEffect(() => {
        if (!roomId || joinStatus !== 'IDLE') return;

        const joinRoom = async () => {
            setJoinStatus('JOINING');
            try {
                // Wywołanie endpointu: POST /survey/room/{roomId}/join
                await surveyService.joinRoom(roomId); 
                setJoinStatus('SUCCESS');
            } catch (error: any) {
                console.error("Join failed:", error);
                setJoinError(error.message || "Could not join the room. It might be full or closed.");
                setJoinStatus('ERROR');
            }
        };

        joinRoom();
    }, [roomId, joinStatus]);


    // --- Handlery Po Przesłaniu ---
    const handleSubmissionSuccess = () => {
        setIsSubmitted(true);
    };

    const handleSubmissionFailure = () => {
        alert("Your submission failed. Please try again.");
    };

    // --- Render Stanów ---

    if (!roomId) {
        return (
            <Container maxWidth="md"><Alert severity="error" sx={{ mt: 4 }}>Room ID is missing.</Alert></Container>
        );
    }

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
                <Alert severity="error">
                    Failed to join Room {roomId}: {joinError}.
                </Alert>
                <MuiButton onClick={() => navigate('/survey')} sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
                    Back to Survey List
                </MuiButton>
            </Container>
        );
    }
    
    // --- Render Po Udanym Dołączeniu / Po Wysłaniu ---
    
    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Participate in Survey
                </Typography>
                
                {isSubmitted ? (
                    <Paper elevation={4} sx={{ p: 4 }}>
                        <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
                            <SendIcon color="success" sx={{ fontSize: 60 }} />
                            <Typography variant="h5" color="success.main">
                                Thank you! Your answers have been submitted.
                            </Typography>
                        </Stack>
                        <Divider sx={{ mb: 3 }} />
                        
                        <Typography variant="h6" gutterBottom>
                            Live Aggregate Results
                        </Typography>
                        
                        {/* WIDOK WYNIKÓW PO WYSŁANIU (Uczestnik) */}
                        <LiveResultSurveyDashboard 
                            roomId={roomId}
                            isHost={false} // Uczestnik
                            isParticipantSubmitted={true} // Wysłano!
                        />
                        
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <MuiButton onClick={() => navigate('/survey')} variant="outlined" startIcon={<ArrowBackIcon />}>
                                Finish and Return
                            </MuiButton>
                        </Box>
                    </Paper>
                ) : (
                    // Formularz przed wysłaniem
                    <SurveySubmissionForm
                        roomId={roomId}
                        onSubmissionSuccess={handleSubmissionSuccess}
                        onSubmissionFailure={handleSubmissionFailure}
                    />
                )}
            </Box>
        </Container>
    );
};

export default SurveyParticipantPage;