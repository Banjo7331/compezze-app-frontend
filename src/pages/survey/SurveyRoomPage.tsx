import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert, Button as MuiButton, Grid, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Importujemy nasze gotowe komponenty z warstwy Features
import { RoomControlPanel } from '@/features/survey/components/RoomControlPanel';
import { LiveResultSurveyDashboard } from '@/features/survey/components/LiveResultSurveyDashboard';

const SurveyRoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const [isHost] = useState(true); 

    const handleRoomClosed = () => {
        console.log("Room closed via panel.");
    };

    if (!roomId) {
        return (
            <Container maxWidth="md">
                <Alert severity="error" sx={{ mt: 4 }}>
                    Error: Room ID is missing.
                </Alert>
                <MuiButton onClick={() => navigate('/survey')} sx={{ mt: 2 }}>Back</MuiButton>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                {/* HEADER */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        📊 Survey Room Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Room ID: <strong>{roomId}</strong>
                    </Typography>
                </Box>

                {/* CONTAINER JEST OK */}
                <Grid container spacing={4}> 
                    {/* LEWA KOLUMNA: Panel Sterowania (Tylko dla Hosta) */}
                    {isHost && (
                        // FIX: Używamy size={{ ... }}
                        <Grid size={{ xs: 12, md: 4 }}> 
                            <RoomControlPanel 
                                roomId={roomId} 
                                onCloseSuccess={handleRoomClosed} 
                            />

                            {/* Przycisk powrotu */}
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <MuiButton 
                                    variant="text" 
                                    color="inherit"
                                    onClick={() => navigate('/survey')}
                                    startIcon={<ArrowBackIcon />}
                                >
                                    Back to My Surveys
                                </MuiButton>
                            </Box>
                        </Grid>
                    )}

                    {/* PRAWA KOLUMNA: Wyniki na Żywo */}
                    {/* FIX: Używamy size={{ ... }} */}
                    <Grid size={{ xs: 12, md: isHost ? 8 : 12 }}> 
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <LiveResultSurveyDashboard 
                                roomId={roomId} 
                                isHost={isHost} 
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default SurveyRoomPage;