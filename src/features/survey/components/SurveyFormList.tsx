import React, { useState } from 'react'; 
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Alert, 
    Pagination, 
    Paper, 
    Stack
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button'; 
import { useUserSurveyForms } from '../hooks/useUserSurveyForms'; 
import type { SurveyFormResponse, CreateRoomRequest } from '../model/types'; 
import { surveyService } from '../api/surveyService'; 

// --- KOMPONENT POJEDYNCZEGO ELEMENTU (KAFLA) ---
interface SurveyItemProps {
    survey: SurveyFormResponse;
    onRoomCreateSuccess: (roomId: string) => void; 
}

const SurveyItem: React.FC<SurveyItemProps> = ({ survey, onRoomCreateSuccess }) => {
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    
    // Status jest teraz zależny od tego, czy formularz ma pytania (min 1)
    const canLaunch = survey.questions && survey.questions.length > 0;
    
    // Obsługa kliknięcia "Uruchom Pokój"
    const handleLaunchRoom = async () => {
        if (!canLaunch || isCreatingRoom) return;

        // UWAGA: survey.id jest Long (number) na frontendzie, a backend oczekuje UUID (string) 
        // lub Long (numer), zależnie od konfiguracji. Załóżmy, że typ jest obsługiwany przez TS/Axios.
        const request: CreateRoomRequest = {
            surveyFormId: survey.id as any, // ID Formularza Ankiety
            maxParticipants: 100, // Przykładowa stała wartość
        };

        setIsCreatingRoom(true);
        try {
            // KROK: Tworzenie Pokoju (POST /survey/room)
            const result = await surveyService.createRoom(request); // Wzbogacona odpowiedź z roomId
            
            // Backend automatycznie dodał hosta jako uczestnika. Przekierowujemy.
            onRoomCreateSuccess(result.roomId); 
            
        } catch (error) {
            console.error("Error launching room:", error);
            alert("Failed to launch the survey room. Check server logs.");
        } finally {
            setIsCreatingRoom(false);
        }
    };
    
    return (
        <Paper 
            elevation={1} 
            sx={{ 
                p: 2, 
                mb: 1.5, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderLeft: `5px solid ${canLaunch ? '#1976d2' : 'gray'}`,
            }}
        >
            <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {survey.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Questions: {survey.questions.length}
                </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
                {/* Przycisk Uruchom / Zarządzaj */}
                <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    disabled={!canLaunch || isCreatingRoom}
                    onClick={handleLaunchRoom}
                >
                    {isCreatingRoom ? <CircularProgress size={20} color="inherit" /> : 'Launch Room'}
                </Button>
            </Stack>
        </Paper>
    );
};


// --- KOMPONENT LISTY GŁÓWNEJ ---
export const SurveyFormList: React.FC = () => {
    const navigate = useNavigate(); 
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    
    const { data, isLoading, error, page, totalPages, setPage } = useUserSurveyForms({ refreshTrigger }); 
    
    const handleRoomCreateSuccess = (roomId: string) => {
        // Po udanym utworzeniu pokoju na backendzie, przekieruj hosta do zarządzania
        setRefreshTrigger(prev => prev + 1); // Odśwież listę
        navigate(`/survey/room/${roomId}`);
    };
    
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1); 
    };

    if (isLoading) { /* ... */ }
    if (error) { /* ... */ }
    if (!data || data.length === 0) { /* ... */ }
    
    // (Wstawiam uproszczone renderowanie stanu dla czytelności)
    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Error loading surveys: {error.message}.</Alert>;
    if (!data || data.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography color="text.secondary">You haven't created any survey forms yet.</Typography>
            </Box>
        );
    }
    
    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Your Survey Forms (Templates)
            </Typography>
            
            <Stack spacing={1}>
                {data.map((survey) => (
                    <SurveyItem 
                        key={survey.id} 
                        survey={survey} 
                        onRoomCreateSuccess={handleRoomCreateSuccess}
                    />
                ))}
            </Stack>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                        count={totalPages} 
                        page={page + 1}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};