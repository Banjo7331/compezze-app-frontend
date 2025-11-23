import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Paper,
    CircularProgress, 
    Alert,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Button } from '@/shared/ui/Button';
import { surveyService } from '../api/surveyService'; // Używamy serwisu REST
import { useNavigate } from 'react-router-dom';
import { useSurveyRoomSocket } from '../hooks/useSurveyRoomSocket';

// --- PROPSY ---
interface RoomControlPanelProps {
    roomId: string;
    // Opcjonalnie: funkcja do odświeżenia strony po zamknięciu
    onCloseSuccess: () => void; 
}

export const RoomControlPanel: React.FC<RoomControlPanelProps> = ({ roomId, onCloseSuccess }) => {
    const navigate = useNavigate();
    const [isClosing, setIsClosing] = useState(false);
    
    // Pobieramy status na żywo z hooka socketowego
    const { isRoomOpen, liveResults } = useSurveyRoomSocket(roomId); 

    // --- HANDLER ZAMYKANIA POKOJU ---
    const handleCloseRoom = async () => {
        if (!window.confirm("Are you sure you want to close this room? No more submissions will be accepted.")) {
            return;
        }

        setIsClosing(true);
        try {
            // Wywołanie endpointu POST /survey/room/{roomId}/close
            await surveyService.closeRoom(roomId);
            
            // Backend powinien wysłać ROOM_CLOSED przez socket, ale dla pewności
            // możemy też wywołać zewnętrzny callback:
            onCloseSuccess(); 
            
        } catch (error) {
            console.error("Error closing room:", error);
            alert("Failed to close the room. Check if you are the host.");
        } finally {
            setIsClosing(false);
        }
    };

    
    return (
        <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <VerifiedUserIcon color="action" sx={{ mr: 1 }} /> Room Controls
            </Typography>
            <Box sx={{ my: 2 }}>
                 <Alert severity={isRoomOpen ? "success" : "warning"}>
                    Current Status: 
                    {isRoomOpen ? (
                        <Typography component="span" fontWeight="bold"> OPEN</Typography>
                    ) : (
                        <Typography component="span" fontWeight="bold"> CLOSED</Typography>
                    )}
                </Alert>
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={isClosing ? <CircularProgress size={20} color="inherit" /> : <CloseIcon />}
                    onClick={handleCloseRoom}
                    disabled={!isRoomOpen || isClosing}
                    sx={{ flex: 1 }} // Opcjonalnie: Rozciągnij przycisk
                >
                    {isClosing ? 'Closing...' : 'Close Room'}
                </Button>
                
                <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/survey')}
                    disabled={isClosing}
                    sx={{ flex: 1 }} // Opcjonalnie: Rozciągnij przycisk
                >
                    Back to Forms
                </Button>
            </Stack>
            
            {!isRoomOpen && (
                 <Alert severity="info" sx={{ mt: 2 }}>
                    Room is closed. Final results are displayed below.
                 </Alert>
            )}
        </Paper>
    );
};