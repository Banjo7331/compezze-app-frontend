import React, { useState, useMemo, useEffect } from 'react';
import { 
    Box, Paper, Typography, Stack, Divider, IconButton, Tooltip, Chip, 
    Autocomplete, TextField, CircularProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { debounce } from '@mui/material/utils'; // Helper z MUI

import { Button } from '@/shared/ui/Button';
import { surveyService } from '../api/surveyService';
import { userService } from '@/features/user/api/userService';
import type { UserSummary } from '@/features/user/model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

interface InviteUsersPanelProps {
    roomId: string;
}

export const InviteUsersPanel: React.FC<InviteUsersPanelProps> = ({ roomId }) => {
    // --- STAN AUTOCOMPLETE ---
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<UserSummary[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    
    // Wybrani użytkownicy (całe obiekty)
    const [selectedUsers, setSelectedUsers] = useState<UserSummary[]>([]);

    // --- STAN WYSYŁANIA ---
    const [generatedLinks, setGeneratedLinks] = useState<Record<string, string> | null>(null);
    const [isSending, setIsSending] = useState(false);
    
    const { showSuccess, showError } = useSnackbar();

    // --- 1. LOGIKA WYSZUKIWANIA (DEBOUNCE) ---
    const fetchUsers = useMemo(
        () =>
            debounce(async (input: string, callback: (results: UserSummary[]) => void) => {
                try {
                    const results = await userService.searchUsers(input);
                    callback(results);
                } catch (e) {
                    callback([]);
                }
            }, 400), // Czekaj 400ms po przestaniu pisania
        [],
    );

    useEffect(() => {
        let active = true;

        if (!open) {
            setOptions([]);
            return undefined;
        }

        return () => {
            active = false;
        };
    }, [open]);

    // Handler wpisywania tekstu
    const handleInputChange = (event: any, newInputValue: string) => {
        if (newInputValue === '') {
            setOptions([]);
            return;
        }

        setLoadingSearch(true);
        fetchUsers(newInputValue, (results) => {
            setLoadingSearch(false);
            setOptions(results);
        });
    };

    // --- 2. LOGIKA WYSYŁANIA ---
    const handleSendInvites = async () => {
        if (selectedUsers.length === 0) return;

        // Mapujemy obiekty na same ID
        const ids = selectedUsers.map(u => u.id);

        setIsSending(true);
        try {
            const tokensMap = await surveyService.generateInvites(roomId, ids);
            
            setGeneratedLinks(tokensMap);
            showSuccess(`Wysłano zaproszenia do ${ids.length} użytkowników!`);
            setSelectedUsers([]); // Czyścimy wybór
        } catch (error) {
            console.error(error);
            showError("Nie udało się wysłać zaproszeń.");
        } finally {
            setIsSending(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showSuccess("Link skopiowany!");
    };

    const joinBaseUrl = `${window.location.origin}/survey/join/${roomId}`;

    return (
        <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonAddIcon sx={{ mr: 1 }} color="action"/> Zaproś Użytkowników
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Wyszukaj użytkowników po nazwie, aby wysłać im zaproszenie i wygenerować bilety wstępu.
            </Typography>

            <Stack spacing={2}>
                {/* --- AUTOCOMPLETE (Wyszukiwarka) --- */}
                <Autocomplete
                    multiple
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    
                    // Opcje to wyniki wyszukiwania
                    options={options}
                    // Jak wyświetlać opcję na liście
                    getOptionLabel={(option) => option.username}
                    // Unikalność
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    
                    // Obsługa wpisywania (szukanie w API)
                    onInputChange={handleInputChange}
                    
                    // Obsługa wyboru (zapisywanie do stanu)
                    value={selectedUsers}
                    onChange={(event, newValue) => {
                        setSelectedUsers(newValue);
                    }}

                    loading={loadingSearch}
                    noOptionsText="Brak użytkowników o takiej nazwie"
                    
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Wyszukaj użytkowników..."
                            placeholder="Wpisz nazwę (np. 'user')"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {loadingSearch ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            }}
                        />
                    )}
                />

                <Button 
                    variant="contained" 
                    onClick={handleSendInvites} 
                    disabled={isSending || selectedUsers.length === 0}
                    startIcon={isSending ? undefined : <SendIcon />}
                >
                    {isSending ? 'Wysyłanie...' : `Zaproś ${selectedUsers.length} osób`}
                </Button>
            </Stack>

            {/* --- WYNIKI (LINKI) --- */}
            {generatedLinks && (
                <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>Kopie linków:</Typography>
                    
                    <Stack spacing={1}>
                        {Object.entries(generatedLinks).map(([userId, token]) => {
                            const fullLink = `${joinBaseUrl}?ticket=${token}`;
                            // Próbujemy znaleźć nazwę usera w opcjach (dla ładniejszego wyświetlania)
                            // Uwaga: To zadziała tylko dla tych, co byli w 'options' w momencie wysłania.
                            // Można by mapować userId na username, ale ID też wystarczy dla Hosta.
                            
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
                                        <Chip label={`ID: ${userId.substring(0, 5)}...`} size="small" sx={{ mr: 1 }} />
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