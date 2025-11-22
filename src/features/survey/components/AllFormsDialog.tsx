import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SurveyFormList } from './SurveyFormList'; // Reuse istniejącej listy

interface AllFormsDialogProps {
    open: boolean;
    onClose: () => void;
}

export const AllFormsDialog: React.FC<AllFormsDialogProps> = ({ open, onClose }) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            scroll="paper"
        >
            {/* FIX: Dodano component="div". 
                Dzięki temu DialogTitle jest zwykłym kontenerem, 
                wewnątrz którego możemy legalnie użyć Typography (h6). 
            */}
            <DialogTitle 
                component="div" 
                sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                {/* Teraz h6 wewnątrz diva jest poprawne semantycznie */}
                <Typography variant="h6" component="h2">
                    Wybierz szablon ankiety
                </Typography>
                
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ color: (theme) => theme.palette.grey[500] }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
                <SurveyFormList />
            </DialogContent>
        </Dialog>
    );
};