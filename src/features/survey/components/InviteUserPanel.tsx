import React, { useState } from 'react';
import { 
    Box, Paper, Typography, TextField, Stack, Divider, IconButton, Tooltip, Chip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import { Button } from '@/shared/ui/Button';
import { surveyService } from '../api/surveyService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

interface InviteUsersPanelProps {
    roomId: string;
}

export const InviteUsersPanel: React.FC<InviteUsersPanelProps> = ({ roomId }) => {
    const [userIdsInput, setUserIdsInput] = useState(''); 
    const [generatedLinks, setGeneratedLinks] = useState<Record<string, string> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccess, showError } = useSnackbar();

    const handleGenerate = async () => {
        // 1. Parsowanie inputu (rozdzielamy po przecinku, usuwamy białe znaki)
        const ids = userIdsInput
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        if (ids.length === 0) {
            showError("Wpisz przynajmniej jedno ID użytkownika.");
            return;
        }

        setIsLoading(true);
        try {
            // 2. Strzał do API
            const tokensMap = await surveyService.generateInvites(roomId, ids);
            
            setGeneratedLinks(tokensMap);
            showSuccess(`Wysłano zaproszenia do ${Object.keys(tokensMap).length} użytkowników!`);
            setUserIdsInput(''); // Czyścimy input
        } catch (error) {
            console.error(error);
            showError("Nie udało się wygenerować zaproszeń.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showSuccess("Link skopiowany!");
    };

    // Budujemy pełny URL zaproszenia
    const joinBaseUrl = `${window.location.origin}/survey/join/${roomId}`;

    return (
        <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                📨 Zaproś Użytkowników
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Wpisz UUID użytkowników oddzielone przecinkami. System wyśle im powiadomienie oraz wygeneruje unikalne linki (Soulbound).
            </Typography>

            {/* INPUT */}
            <Stack spacing={2}>
                <TextField 
                    label="Lista UUID (np. uuid-1, uuid-2)"
                    placeholder="e.g. 123e4567-e89b..., 987c6543-e21b..."
                    fullWidth
                    multiline
                    rows={2}
                    value={userIdsInput}
                    onChange={(e) => setUserIdsInput(e.target.value)}
                    disabled={isLoading}
                />
                <Button 
                    variant="contained" 
                    onClick={handleGenerate} 
                    disabled={isLoading || !userIdsInput}
                    startIcon={isLoading ? undefined : <SendIcon />}
                >
                    {isLoading ? 'Wysyłanie...' : 'Wyślij Zaproszenia'}
                </Button>
            </Stack>

            {/* WYNIKI (Opcjonalnie, jeśli Host chce ręcznie wysłać link) */}
            {generatedLinks && (
                <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>Wygenerowane Linki (Kopia):</Typography>
                    
                    <Stack spacing={1}>
                        {Object.entries(generatedLinks).map(([userId, token]) => {
                            const fullLink = `${joinBaseUrl}?ticket=${token}`;
                            return (
                                <Box 
                                    key={userId} 
                                    sx={{ 
                                        p: 1, border: '1px solid #eee', borderRadius: 1, 
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        bgcolor: '#f9f9f9'
                                    }}
                                >
                                    <Box sx={{ overflow: 'hidden', mr: 1 }}>
                                        <Chip label={userId.substring(0, 8) + "..."} size="small" sx={{ mr: 1 }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                            {fullLink.substring(0, 40)}...
                                        </Typography>
                                    </Box>
                                    <Tooltip title="Kopiuj link">
                                        <IconButton size="small" onClick={() => copyToClipboard(fullLink)}>
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            )}
        </Paper>
    );
};