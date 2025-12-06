import React, { useState } from 'react';
import { Paper, Typography, Stack, Alert, Box, Divider, Chip, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Button } from '@/shared/ui/Button';

// Ikony
import AddTaskIcon from '@mui/icons-material/AddTask';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete'; // <--- IKONA KOSZA

import type { ContestDetailsDto } from '../model/types';
import { ContestSubmissionForm } from './ContestSubmissionForm';
import { contestService } from '../api/contestService'; 
import { useSnackbar } from '@/app/providers/SnackbarProvider';

interface Props {
    contest: ContestDetailsDto;
    
    // Akcje
    onJoin: () => void;
    onManage: () => void;
    onReview: () => void;
    onRefresh: () => void; 
    
    isProcessing: boolean;
}

export const ContestActionPanel: React.FC<Props> = ({ 
    contest, onJoin, onManage, onReview, onRefresh, isProcessing 
}) => {
    
    const { showSuccess, showError } = useSnackbar();
    const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // Stan lokalny usuwania

    // --- 1. ANALIZA RÓL ---
    const myRoles = contest.myRoles || [];
    const isOrganizer = contest.organizer;
    const isModerator = myRoles.includes('MODERATOR');
    const isStaff = isOrganizer || isModerator;
    
    // Czy użytkownik wysłał już pracę? (Ma rolę COMPETITOR)
    const isCompetitor = myRoles.includes('COMPETITOR');
    const isParticipant = contest.participant;

    // --- 2. ANALIZA STANU ---
    const isContestActive = contest.status === 'CREATED';

    // --- HANDLER USUWANIA ---
    const handleWithdraw = async () => {
        if (!window.confirm("Czy na pewno chcesz wycofać swoje zgłoszenie? Ta operacja jest nieodwracalna.")) return;
        
        setIsDeleting(true);
        try {
            await contestService.withdrawMySubmission(contest.id);
            showSuccess("Zgłoszenie zostało wycofane.");
            onRefresh(); // Odświeżamy widok (powinien stracić rolę COMPETITOR)
        } catch (e) {
            showError("Nie udało się wycofać zgłoszenia (być może etap zgłoszeń już minął).");
        } finally {
            setIsDeleting(false);
        }
    };


    // =========================================================
    // WIDOK 1: STAFF (ORGANIZATOR / MODERATOR)
    // =========================================================
    if (isStaff) {
        return (
            <Paper elevation={6} sx={{ p: 3, borderLeft: '6px solid #9c27b0', bgcolor: '#fdfbff' }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <AdminPanelSettingsIcon color="secondary" fontSize="large" />
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {isOrganizer ? "Panel Organizatora" : "Panel Moderatora"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Zarządzanie przebiegiem konkursu.
                        </Typography>
                    </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" color="secondary" onClick={onManage} disabled={isProcessing}>
                        Ustawienia i Uczestnicy
                    </Button>
                    <Button variant="outlined" startIcon={<RateReviewIcon />} onClick={onReview}>
                        Weryfikacja Zgłoszeń
                    </Button>
                </Stack>
            </Paper>
        );
    }

    // =========================================================
    // WIDOK 3: UCZESTNIK (ZAPISANY)
    // =========================================================
    if (isParticipant) {
        return (
            <Paper elevation={3} sx={{ p: 4, bgcolor: '#e8f5e9', border: '1px solid #c8e6c9', textAlign: 'center' }}>
                
                {/* SCENARIUSZ A: Już wysłał pracę (COMPETITOR) */}
                {isCompetitor ? (
                    <Box>
                        <CheckCircleIcon color="success" sx={{ fontSize: 50, mb: 1 }} />
                        <Typography variant="h6" color="success.main" fontWeight="bold" gutterBottom>
                            Zgłoszenie Przesłane
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Twoja praca bierze udział w konkursie. Powodzenia!
                        </Typography>
                        
                        {/* Możliwość wycofania (tylko jeśli konkurs wciąż trwa) */}
                        {isContestActive && (
                            <Button 
                                variant="text" 
                                color="error" 
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={handleWithdraw}
                                disabled={isDeleting}
                                sx={{ mt: 1 }}
                            >
                                {isDeleting ? "Usuwanie..." : "Wycofaj Zgłoszenie"}
                            </Button>
                        )}
                    </Box>
                ) : (
                    /* SCENARIUSZ B: Jeszcze nie wysłał pracy */
                    <>
                        <Typography variant="h6" gutterBottom>Jesteś uczestnikiem</Typography>
                        <Typography variant="body2" paragraph>
                            Aby wziąć udział w rywalizacji, prześlij swoją pracę.
                        </Typography>

                        {isContestActive ? (
                            <Button 
                                variant="contained" 
                                color="success" 
                                size="large"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => setIsSubmissionDialogOpen(true)}
                                sx={{ px: 4 }}
                            >
                                Prześlij Pracę Konkursową
                            </Button>
                        ) : (
                            <Alert severity="info" icon={<HourglassEmptyIcon />}>
                                Konkurs jeszcze się nie rozpoczął lub został zakończony.
                            </Alert>
                        )}
                        
                        {/* DIALOG WYSYŁANIA */}
                        <Dialog 
                            open={isSubmissionDialogOpen} 
                            onClose={() => setIsSubmissionDialogOpen(false)}
                            maxWidth="sm"
                            fullWidth
                        >
                            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Wyślij Zgłoszenie
                                <IconButton onClick={() => setIsSubmissionDialogOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent dividers>
                                <ContestSubmissionForm 
                                    contestId={contest.id} 
                                    onSuccess={() => {
                                        setIsSubmissionDialogOpen(false);
                                        onRefresh(); // Odśwież po sukcesie -> user stanie się COMPETITOR
                                    }} 
                                />
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </Paper>
        );
    }

    // =========================================================
    // WIDOK 4: GOŚĆ
    // =========================================================
    const isFull = contest.participantLimit > 0 && contest.currentParticipantsCount >= contest.participantLimit;
    const isClosed = contest.status === 'FINISHED';

    if (isClosed) return <Alert severity="warning">Konkurs zakończony.</Alert>;
    if (isFull) return <Alert severity="error">Brak miejsc.</Alert>;

    return (
        <Paper elevation={6} sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">Dołącz do rywalizacji!</Typography>
            <Button 
                variant="contained" 
                size="large" 
                onClick={onJoin} 
                disabled={isProcessing}
                startIcon={<AddTaskIcon />}
                sx={{ px: 8, py: 2, fontSize: '1.2rem', borderRadius: 50 }}
            >
                {isProcessing ? "Zapisywanie..." : "ZAPISZ SIĘ TERAZ"}
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                (Wymagane zalogowanie)
            </Typography>
        </Paper>
    );
};