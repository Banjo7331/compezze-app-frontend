import React from 'react';
import { Paper, Typography, Stack, Alert, Box } from '@mui/material';
import { Button } from '@/shared/ui/Button';
import AddTaskIcon from '@mui/icons-material/AddTask'; // Ikona zapisu
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RateReviewIcon from '@mui/icons-material/RateReview';
import type { ContestDetailsDto } from '../model/types'

interface Props {
    contest: ContestDetailsDto;
    onJoin: () => void;
    onManage: () => void; // Przejście do dashboardu hosta
    onReview: () => void; // Przejście do oceniania
    isProcessing: boolean;
}

export const ContestActionPanel: React.FC<Props> = ({ contest, onJoin, onManage, onReview, isProcessing }) => {
    
    // Sprawdzamy uprawnienia (Staff)
    const isStaff = contest.isOrganizer || contest.myRoles?.includes('MODERATOR');
    
    // --- 1. WIDOK STAFFU (Organizator / Moderator) ---
    if (isStaff) {
        return (
            <Paper elevation={4} sx={{ p: 3, mb: 3, borderLeft: '6px solid #9c27b0', bgcolor: '#fdfbff' }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <AdminPanelSettingsIcon color="secondary" fontSize="large" />
                    <Typography variant="h6" fontWeight="bold">Panel Zarządzania</Typography>
                </Stack>
                
                <Typography variant="body2" paragraph>
                    Masz uprawnienia do zarządzania tym konkursem.
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="secondary" onClick={onManage}>
                        Zarządzaj Konkursem
                    </Button>
                    
                    {/* Przycisk Weryfikacji (Dla Moderatora/Hosta) */}
                    <Button variant="outlined" startIcon={<RateReviewIcon />} onClick={onReview}>
                        Weryfikuj Zgłoszenia
                    </Button>
                </Stack>
            </Paper>
        );
    }

    // --- 2. WIDOK UCZESTNIKA ---
    if (contest.isParticipant) {
        return (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="h6" color="success.main" gutterBottom>
                    ✅ Jesteś zapisany na ten konkurs!
                </Typography>
                <Typography variant="body2">
                    Czekaj na rozpoczęcie kolejnego etapu lub sprawdź harmonogram powyżej.
                </Typography>
                {/* Tu w przyszłości: Przycisk "Wyślij zgłoszenie" jeśli trwa etap Submissions */}
            </Paper>
        );
    }

    // --- 3. WIDOK GOŚCIA (Możliwość zapisu) ---
    // Blokujemy zapisy jeśli status to FINISHED
    const canJoin = contest.status !== 'FINISHED'; 

    return (
        <Paper elevation={6} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>Chcesz wziąć udział?</Typography>
            
            {canJoin ? (
                <>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Kliknij poniżej, aby dołączyć do listy uczestników.
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="large" 
                        onClick={onJoin} 
                        disabled={isProcessing}
                        startIcon={<AddTaskIcon />}
                        sx={{ px: 6, py: 1.5 }}
                    >
                        {isProcessing ? "Zapisywanie..." : "DOŁĄCZ DO KONKURSU"}
                    </Button>
                </>
            ) : (
                <Alert severity="warning" sx={{ justifyContent: 'center' }}>
                    Rejestracja zakończona. Konkurs został zamknięty.
                </Alert>
            )}
        </Paper>
    );
};