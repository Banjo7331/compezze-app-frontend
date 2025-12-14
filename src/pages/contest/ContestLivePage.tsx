import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Alert, Box, Stack, Paper, Typography, Grid } from '@mui/material'; // ✅ Dodano Grid
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NextPlanIcon from '@mui/icons-material/NextPlan';
import FlagIcon from '@mui/icons-material/Flag';

import { Button } from '@/shared/ui/Button';
import { contestService } from '@/features/contest/api/contestService';
import { useContestSocket } from '@/features/contest/hooks/useContestSocket';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import type { GetContestRoomDetailsResponse, ContestDetailsDto } from '@/features/contest/model/types';

import { ContestLobbyView } from '@/features/contest/components/ContestLobbyView';
import { ContestStageRenderer } from '@/features/contest/components/ContestStageRenderer';
import { ContestLiveChat } from '@/features/contest/components/ContestLiveChat'; // ✅ Import Czatu

const ContestLivePage: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();

    const [roomState, setRoomState] = useState<GetContestRoomDetailsResponse | null>(null);
    const [contestInfo, setContestInfo] = useState<ContestDetailsDto | null>(null); 
    const [stageTicket, setStageTicket] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);

    const fetchState = useCallback(async () => {
        try {
            const roomData = await contestService.getRoomDetails(contestId!);
            setRoomState(roomData);
            
            if (!contestInfo) {
                const infoData = await contestService.getContestDetails(contestId!);
                setContestInfo(infoData);
            }

            const settings = roomData.currentStageSettings;
            if (settings && (settings.type === 'QUIZ' || settings.type === 'SURVEY') && settings.activeRoomId) {
                try {
                    const token = await contestService.getStageAccessToken(contestId!, roomData.roomId);
                    setStageTicket(token);
                } catch (e) {
                    setStageTicket(null);
                }
            } else {
                setStageTicket(null);
            }
        } catch (e) {
            console.error(e);
            showError("Błąd pobierania stanu sesji.");
        } finally {
            setIsLoading(false);
        }
    }, [contestId, contestInfo, showError]);

    useEffect(() => {
        if (contestId) fetchState();
    }, [contestId, fetchState]);

    useContestSocket({ 
        contestId, 
        onRefresh: fetchState 
    });

    // --- HANDLERY ---
    const handleStartContest = async () => {
        if (!roomState?.roomId) return;
        try {
            await contestService.startContest(contestId!, roomState.roomId);
            showSuccess("Konkurs wystartował!");
            fetchState(); 
        } catch (e) { showError("Błąd startu."); }
    };

    const handleNextStage = async () => {
        if (!roomState?.roomId) return;
        if(!window.confirm("Przejść do następnego etapu?")) return;
        try {
            await contestService.nextStage(contestId!, roomState.roomId);
            showSuccess("Zmieniono etap.");
            fetchState(); 
        } catch (e) { showError("Błąd zmiany etapu."); }
    };

    const handleCloseContest = async () => {
        if (!roomState?.roomId) return;
        if (!window.confirm("Czy na pewno chcesz zakończyć CAŁY konkurs? To zamknie sesję dla wszystkich.")) return;
        
        try {
            await contestService.closeContest(contestId!, roomState.roomId);
            showSuccess("Konkurs został zamknięty.");
            navigate(`/contest/${contestId}`);
        } catch (e) { 
            showError("Błąd zamykania konkursu."); 
        }
    };

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;
    if (!roomState) return <Container sx={{ mt: 4 }}><Alert severity="error">Błąd sesji.</Alert></Container>;

    const isOrganizer = contestInfo?.organizer || false;
    const isJury = contestInfo?.myRoles?.includes('JURY') || false;
    const isLobby = roomState.currentStagePosition === 0;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box mb={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/contest/${contestId}`)}>
                    Wyjdź z Live
                </Button>
            </Box>

            {/* ✅ KROK 1: alignItems="stretch" sprawia, że obie kolumny mają równą wysokość */}
            <Grid container spacing={3} alignItems="stretch">
                
                {/* --- KOLUMNA LEWA (Lobby/Scena) --- */}
                <Grid size={{ xs: 12, md: 9 }}>
                    {isLobby ? (
                        /* To ma minHeight: 60vh (ustawione w ContestLobbyView), więc Grid przyjmie tę wysokość */
                        <ContestLobbyView isOrganizer={isOrganizer} onStart={handleStartContest} />
                    ) : (
                        <Box sx={{ height: '100%' }}> {/* Też dajemy 100%, żeby scena wypełniała */}
                            <Box textAlign="center" mb={2}>
                                 <Typography variant="overline" fontSize="1rem" letterSpacing={3} color="text.secondary">
                                     ETAP {roomState.currentStagePosition}
                                 </Typography>
                            </Box>

                            <Box sx={{ minHeight: '60vh' }}>
                                {roomState.currentStageSettings ? (
                                    <ContestStageRenderer 
                                        settings={roomState.currentStageSettings}
                                        isOrganizer={isOrganizer}
                                        ticket={stageTicket}
                                        contestId={contestId!}
                                        isJury={isJury}
                                    />
                                ) : (
                                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                                        <Typography variant="h4" gutterBottom>Przerwa / Wyniki</Typography>
                                    </Paper>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* Panel Organizatora */}
                    {isOrganizer && !isLobby && (
                        <Paper elevation={3} sx={{ mt: 3, p: 2, bgcolor: '#212121', color: 'white', borderRadius: 2 }}>
                             <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold">PANEL STEROWANIA</Typography>
                                <Stack direction="row" spacing={2}>
                                    <Button variant="contained" color="secondary" endIcon={<NextPlanIcon />} onClick={handleNextStage}>
                                        Następny Etap
                                    </Button>
                                    <Button variant="outlined" color="error" startIcon={<FlagIcon />} onClick={handleCloseContest}>
                                        Koniec
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    )}
                </Grid>

                {/* --- KOLUMNA PRAWA (Czat) --- */}
                <Grid size={{ xs: 12, md: 3 }}>
                    {/* ✅ KROK 2: Usuwamy calc(). Dajemy 100% wysokości rodzica (Grid item) */}
                    {/* Dzięki temu czat rozciągnie się idealnie do wysokości LobbyView obok */}
                    <Box sx={{ height: '100%', minHeight: '500px' }}>
                         {contestId && <ContestLiveChat contestId={contestId} />}
                    </Box>
                </Grid>

            </Grid>
        </Container>
    );
};

export default ContestLivePage;