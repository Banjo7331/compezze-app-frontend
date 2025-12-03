import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Alert, Box } from '@mui/material';

import { contestService } from '@/features/contest/api/contestService';
import type { ContestDetailsDto } from '@/features/contest/model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

import { ContestHeader } from '@/features/contest/components/ContestHeader';
import { ContestActionPanel } from '@/features/contest/components/ContestActionPanel';

const ContestDetailsPage: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();

    const [contest, setContest] = useState<ContestDetailsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- FETCH DATA ---
    const fetchDetails = async () => {
        try {
            const data = await contestService.getContestDetails(contestId!);
            // Sortowanie etapów (dla pewności)
            data.stages.sort((a, b) => a.position - b.position);
            setContest(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (contestId) fetchDetails();
    }, [contestId]);

    // --- ACTIONS ---

    const handleJoin = async () => {
        setIsProcessing(true);
        try {
            await contestService.joinContest(contestId!);
            showSuccess("Pomyślnie dołączyłeś do konkursu!");
            fetchDetails(); // Odświeżamy, żeby zaktualizować widok (isParticipant -> true)
        } catch (e) {
            showError("Nie udało się dołączyć. Sprawdź limity lub status konkursu.");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- RENDER ---

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;
    if (!contest) return <Container sx={{ mt: 4 }}><Alert severity="error">Konkurs nie istnieje.</Alert></Container>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            
            {/* 1. HEADER */}
            <ContestHeader contest={contest} />

            {/* 2. ACTION PANEL (Smart) */}
            <Box sx={{ mb: 4 }}>
                <ContestActionPanel 
                    contest={contest}
                    isProcessing={isProcessing}
                    onJoin={handleJoin}
                    onManage={() => navigate(`/contest/${contestId}/manage`)} // TODO: Strona Dashboardu Hosta
                    onReview={() => navigate(`/contest/${contestId}/review`)} // TODO: Strona Weryfikacji
                />
            </Box>

            {/* 3. INNE (np. Galeria prac - w przyszłości) */}

        </Container>
    );
};

export default ContestDetailsPage;