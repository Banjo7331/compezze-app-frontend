import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SurveyFormList } from './SurveyFormList'; 

interface AllTemplatesDialogProps {
    open: boolean;
    onClose: () => void;
}

export const AllFormsDialog: React.FC<AllTemplatesDialogProps> = ({ open, onClose }) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            // KLUCZOWE: Ustawia scrollowanie wewnątrz papieru (kontentu), a nie całego body
            scroll="paper"
            PaperProps={{
                sx: {
                    // Opcjonalnie: Ustawienie sztywnej maksymalnej wysokości
                    // (domyślnie MUI dba o to, by nie wyjść poza ekran, ale możesz wymusić np. 80vh)
                    maxHeight: '80vh', 
                    minHeight: '50vh' // Żeby nie był za mały
                }
            }}
        >
            <DialogTitle component="div" sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="h2">
                    Wszystkie Szablony
                </Typography>
                <IconButton aria-label="close" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            {/* dividers dodaje linie oddzielające nagłówek/stopkę, co wygląda ładnie przy scrollu */}
            <DialogContent dividers>
                <SurveyFormList />
            </DialogContent>
        </Dialog>
    );
};