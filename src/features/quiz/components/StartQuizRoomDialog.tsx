import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, Stack, Typography, Box
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface StartQuizRoomDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (config: { maxParticipants: number }) => void; // Bez duration
    isLoading?: boolean;
}

export const StartQuizRoomDialog: React.FC<StartQuizRoomDialogProps> = ({ open, onClose, onConfirm, isLoading }) => {
    // Wartości
    const [maxParticipants, setMaxParticipants] = useState<string>('100');

    // Stany błędów
    const [participantsError, setParticipantsError] = useState<string | null>(null);

    // Reset
    useEffect(() => {
        if (open) {
            setMaxParticipants('100');
            setParticipantsError(null);
        }
    }, [open]);

    // --- WALIDACJA UCZESTNIKÓW ---
    const handleParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMaxParticipants(val);

        const num = Number(val);
        if (!val) {
            setParticipantsError("Pole wymagane");
        } else if (isNaN(num) || num < 2) {
            setParticipantsError("Minimum 2 uczestników");
        } else if (num > 1000) {
            setParticipantsError("Maksymalnie 1000 uczestników");
        } else {
            setParticipantsError(null);
        }
    };

    const handleSubmit = () => {
        if (participantsError || !maxParticipants) return;
        
        // W Quizach czas sesji jest stały (np. 3h), więc nie pytamy o duration
        onConfirm({ 
            maxParticipants: Number(maxParticipants) 
        });
    };

    const isValid = !participantsError && maxParticipants !== '';

    return (
        <Dialog open={open} onClose={!isLoading ? onClose : undefined} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlayArrowIcon color="success" />
                Uruchom Grę (Lobby)
            </DialogTitle>
            
            <DialogContent dividers>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Utwórz poczekalnię dla graczy. Gra będzie aktywna przez 3 godziny lub do momentu zakończenia przez Ciebie.
                    </Typography>

                    {/* UCZESTNICY */}
                    <TextField
                        label="Limit graczy"
                        type="number"
                        fullWidth
                        value={maxParticipants}
                        onChange={handleParticipantsChange}
                        error={!!participantsError} 
                        helperText={participantsError || "Ile osób może dołączyć?"}
                        InputProps={{ inputProps: { min: 2, max: 1000 } }}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} color="inherit">
                    Anuluj
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="success"
                    disabled={isLoading || !isValid}
                >
                    {isLoading ? "Tworzenie Lobby..." : "Utwórz Lobby"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};