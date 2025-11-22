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
    
    // FIX: W widoku listy nie mamy pytań, więc nie możemy sprawdzić ich liczby.
    // Zakładamy, że formularz jest poprawny.
    const canLaunch = true;
    
    const handleLaunchRoom = async () => {
        if (isCreatingRoom) return;

        const request: CreateRoomRequest = {
            // FIX: Używamy surveyFormId zamiast id
            surveyFormId: survey.surveyFormId as any, 
            // maxParticipants usunięte (opcjonalne)
        };

        setIsCreatingRoom(true);
        try {
            const result = await surveyService.createRoom(request);
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
                borderLeft: `5px solid ${survey.isPrivate ? 'gray' : '#1976d2'}`,
            }}
        >
            <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {survey.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {/* FIX: Zamiast licznika pytań (którego nie ma), pokazujemy status */}
                    {survey.isPrivate ? 'Prywatna' : 'Publiczna'}
                </Typography>
            </Box>
            
            <Box>
                <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    disabled={!canLaunch || isCreatingRoom}
                    onClick={handleLaunchRoom}
                >
                    {isCreatingRoom ? <CircularProgress size={20} color="inherit" /> : 'Launch Room'}
                </Button>
            </Box>
        </Paper>
    );
};


// --- KOMPONENT LISTY GŁÓWNEJ ---
export const SurveyFormList: React.FC = () => {
    const navigate = useNavigate(); 
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    
    const { data, isLoading, error, page, totalPages, setPage } = useUserSurveyForms({ refreshTrigger }); 
    
    const handleRoomCreateSuccess = (roomId: string) => {
        setRefreshTrigger(prev => prev + 1); 
        navigate(`/survey/room/${roomId}`);
    };
    
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1); 
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Error loading surveys: {error.message}.</Alert>;
    
    if (!data || data.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <ListAltIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">Nie utworzyłeś jeszcze żadnych ankiet.</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Twoje Szablony
            </Typography>
            
            <Stack spacing={1}>
                {data.map((survey) => (
                    <SurveyItem 
                        // FIX: Używamy surveyFormId jako klucza
                        key={survey.surveyFormId} 
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