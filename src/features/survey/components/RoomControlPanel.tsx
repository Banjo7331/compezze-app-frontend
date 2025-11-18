import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Stack, 
    CircularProgress, 
    Alert, 
    Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockOpenIcon from '@mui/icons-material/LockOpen';
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

    // --- RENDER ---
    const totalSubmissions = liveResults?.totalSubmissions || 0;
    const totalParticipants = liveResults?.totalParticipants || 0;
    
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
            
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                <Tooltip title="Total number of participants who joined the room." arrow>
                    <Typography>Participants: **{totalParticipants}**</Typography>
                </Tooltip>
                <Tooltip title="Total number of successfully submitted surveys." arrow>
                    <Typography>Submissions: **{totalSubmissions}**</Typography>
                </Tooltip>
            </Stack>

            <Box sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={isClosing ? <CircularProgress size={20} color="inherit" /> : <CloseIcon />}
                    onClick={handleCloseRoom}
                    disabled={!isRoomOpen || isClosing} // Można zamknąć tylko otwarty pokój
                >
                    {isClosing ? 'Closing Room...' : 'Close Room'}
                </Button>
                
                {/* Opcjonalny przycisk powrotu do listy formularzy */}
                <Button
                    variant="outlined"
                    sx={{ ml: 2 }}
                    onClick={() => navigate('/survey')}
                    disabled={isClosing}
                >
                    Back to Forms
                </Button>
            </Box>
            
            {!isRoomOpen && (
                 <Alert severity="info" sx={{ mt: 2 }}>
                    Room is closed. Final results are displayed below.
                 </Alert>
            )}
        </Paper>
    );
};