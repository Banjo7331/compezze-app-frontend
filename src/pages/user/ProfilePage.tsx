import React, { useState } from 'react';
import { 
    Container, Box, Typography, Tabs, Tab, Paper, Divider 
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PollIcon from '@mui/icons-material/Poll';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';

// Importujemy komponenty, które za chwilę utworzymy/zaktualizujemy
import { MyTemplatesList } from '@/features/survey/components/MyTemplatesList';
import { MySurveyRoomHistory } from '@/features/survey/components/MySurveyRoomHistory';

import { MyQuizTemplatesList } from '@/features/quiz/components/MyQuizTemplatesList'; // <--- DODAJ
import { MyQuizHistory } from '@/features/quiz/components/MyQuizHistory';

// Placeholder dla ustawień konta (na przyszłość)
const AccountSettings = () => (
    <Box>
        <Typography variant="h6">Ustawienia Konta</Typography>
        <Typography variant="body2" color="text.secondary">
            Tu w przyszłości będzie zmiana hasła, avatara itp.
        </Typography>
    </Box>
);

export const ProfilePage: React.FC = () => {
    const [tabValue, setTabValue] = useState(1); // Domyślnie otwórz zakładkę "Ankiety" (index 1)

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* NAGŁÓWEK */}
                <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h4" fontWeight="bold">Mój Profil</Typography>
                    <Typography variant="subtitle1">Centrum zarządzania Twoimi aktywnościami</Typography>
                </Box>

                {/* ZAKŁADKI */}
                <Tabs 
                    value={tabValue} 
                    onChange={handleChange} 
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
                >
                    <Tab icon={<AccountCircleIcon />} label="Konto" iconPosition="start" />
                    <Tab icon={<PollIcon />} label="Ankiety" iconPosition="start" />
                    <Tab icon={<QuizIcon />} label="Quizy" iconPosition="start" />
                    <Tab icon={<EmojiEventsIcon />} label="Konkursy" iconPosition="start" disabled />
                </Tabs>

                {/* TREŚĆ */}
                <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fafafa' }}>
                    
                    {/* ZAKŁADKA 0: KONTO */}
                    {tabValue === 0 && <AccountSettings />}

                    {/* ZAKŁADKA 1: SURVEY (ANKIETY) */}
                    {tabValue === 1 && (
                        <Box>
                            {/* Sekcja 1: Szablony */}
                            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
                                Moje Szablony
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Zarządzaj definicjami ankiet. Możesz stąd tworzyć nowe pokoje lub usuwać stare szablony.
                            </Typography>
                            
                            <MyTemplatesList />
                            
                            <Divider sx={{ my: 4 }} />
                            
                            {/* Sekcja 2: Pokoje (Sesje) */}
                            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
                                Historia Sesji
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Przeglądaj uruchomione przez Ciebie pokoje (aktywne i zakończone) oraz ich wyniki.
                            </Typography>
                            
                            <MySurveyRoomHistory />
                        </Box>
                    )}

                    {tabValue === 2 && (
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
                                Moje Quizy
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Zarządzaj swoimi grami i uruchamiaj nowe sesje.
                            </Typography>
                            
                            <MyQuizTemplatesList />

                            <Divider sx={{ my: 4 }} />
                            
                            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
                                Historia Gier
                            </Typography>
                            
                            <MyQuizHistory />
                        </Box>
                    )}

                    {/* ZAKŁADKI 2 i 3: Placeholder */}
                    {tabValue > 2 && (
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography variant="h6" color="text.disabled">Moduł w trakcie budowy...</Typography>
                        </Box>
                    )}

                </Box>
            </Paper>
        </Container>
    );
};

export default ProfilePage;