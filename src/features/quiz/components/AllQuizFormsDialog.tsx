import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AllQuizTemplatesList } from './AllQuizTemplatesList';

interface AllQuizFormsDialogProps {
    open: boolean;
    onClose: () => void;
}

export const AllQuizFormsDialog: React.FC<AllQuizFormsDialogProps> = ({ open, onClose }) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            // 'scroll="paper"' sprawia, że scrolluje się tylko środek okna, a nagłówek zostaje w miejscu
            scroll="paper" 
            PaperProps={{
                sx: {
                    maxHeight: '85vh', 
                    minHeight: '50vh'
                }
            }}
        >
            {/* Nagłówek Dialogu */}
            <DialogTitle component="div" sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" component="h2" fontWeight="bold">
                    Wszystkie Dostępne Quizy
                </Typography>
                <IconButton aria-label="close" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            {/* Treść (Lista) */}
            <DialogContent dividers sx={{ p: 0 }}>
                {/* Box z paddingiem wewnątrz, żeby scrollbar był ładnie dosunięty do krawędzi */}
                <AllQuizTemplatesList />
            </DialogContent>
        </Dialog>
    );
};