import React, { useState } from 'react'; 
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Alert, 
    Pagination, 
    Paper, 
    Grid,
    Stack
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom'; // Potrzebne do przekierowania
import { Button } from '@/shared/ui/Button'; 
import { useUserSurveyForms } from '../hooks/useUserSurveyForms'; 
// Importujemy typy, które będą już pasować do Twojego GetSurveyFormResponse
import type { SurveyFormResponse, CreateRoomRequest } from '../model/types'; 
import { surveyService } from '../api/surveyService'; 

// --- KOMPONENT POJEDYNCZEGO ELEMENTU (KAFLA) ---
interface SurveyItemProps {
    survey: SurveyFormResponse;
    onRoomCreateSuccess: (roomId: string) => void; // Callback po udanym utworzeniu pokoju
}

const SurveyItem: React.FC<SurveyItemProps> = ({ survey, onRoomCreateSuccess }) => {
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    
    // Status jest teraz zależny od tego, czy formularz ma pytania (min 1)
    const canLaunch = survey.questions && survey.questions.length > 0;
    
    // Obsługa kliknięcia "Uruchom Pokój"
    const handleLaunchRoom = async () => {
        if (!canLaunch || isCreatingRoom) return;

        // UWAGA: Musisz zdecydować, czy survey.id (Long) jest traktowany jako number czy string w DTO.
        // Jeśli backend oczekuje UUID (string), potrzebne będzie mapowanie. Zakładamy, że typ ID w CreateRoomRequest został zmieniony.
        const request: CreateRoomRequest = {
            surveyFormId: survey.id as any, // Rzutowanie na typ oczekiwany przez CreateRoomRequest
            maxParticipants: 100, 
        };

        setIsCreatingRoom(true);
        try {
            const result = await surveyService.createRoom(request);
            
            // W przypadku sukcesu, wywołujemy callback, aby odświeżyć listę i przenieść użytkownika
            onRoomCreateSuccess(result.roomId); 
            
        } catch (error) {
            console.error("Error launching room:", error);
            alert("Failed to launch the survey room.");
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
                // Wizualny wskaźnik, że formularz jest gotowy do uruchomienia
                borderLeft: `5px solid ${canLaunch ? '#1976d2' : 'gray'}`,
            }}
        >
            <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {survey.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Questions: {survey.questions.length}
                    {/* Usunięto: {survey.isPrivate ? 'Private' : 'Public'} | Status: {statusText} */}
                </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
                {/* 1. Przycisk Uruchom / Zarządzaj */}
                <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    disabled={!canLaunch || isCreatingRoom}
                    onClick={handleLaunchRoom}
                >
                    {isCreatingRoom ? <CircularProgress size={20} color="inherit" /> : 'Launch Room'}
                </Button>

                {/* 2. Przycisk Edytuj Formularz */}
                <Button 
                    size="small" 
                    variant="outlined" 
                    color="secondary"
                    // TODO: Nawigacja do /survey/edit/:id
                    onClick={() => console.log(`Editing form ${survey.id}`)}
                >
                    Edit Form
                </Button>
            </Stack>
        </Paper>
    );
};


// --- KOMPONENT LISTY GŁÓWNEJ ---
export const SurveyFormList: React.FC = () => {
    const navigate = useNavigate(); // Używamy useNavigate w komponencie głównym
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    
    // Używamy hooka z kluczem odświeżania
    const { data, isLoading, error, page, totalPages, setPage } = useUserSurveyForms({ refreshTrigger }); 
    
    // Po udanym stworzeniu pokoju, przekieruj użytkownika do zarządzania pokojem
    const handleRoomCreateSuccess = (roomId: string) => {
        alert(`Room created with ID: ${roomId}. Redirecting to management page.`);
        setRefreshTrigger(prev => prev + 1); 
        navigate(`/survey/room/${roomId}`);
    };
    
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1); 
    };

    // Stany ładowania, błędu, pustej listy (bez zmian)
    if (isLoading) { /* ... */ }
    if (error) { /* ... */ }

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                Error loading surveys: {error.message}.
            </Alert>
        );
    }
    
    if (!data || data.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <ListAltIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">You haven't created any survey forms yet.</Typography>
            </Box>
        );
    }


    // 4. Stan Wyświetlania Danych
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

            {/* Kontrola Paginacji */}
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