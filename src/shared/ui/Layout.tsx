import React from 'react'; // Dodano React
import { Outlet } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import NavBar from './Navbar'; 

// Importujemy nasz listener domenowy
import { useSurveyInviteListener } from '@/features/survey/hooks/useSurveyInviteListener';

export const Layout = () => {
  
  // --- GLOBALNE LISTENERY ---
  // Tutaj "włączamy" nasłuchiwanie na zaproszenia z ankiet.
  // Działa to w tle, niezależnie od tego, na jakiej podstronie jest użytkownik.
  useSurveyInviteListener({ autoRedirect: false });

  // W przyszłości dodasz tutaj:
  // useContestInviteListener();
  // useQuizInviteListener();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* 1. Pasek nawigacji */}
      <NavBar /> 

      {/* 2. Kontener na treść strony */}
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>

      {/* 3. Stopka */}
      <Box component="footer" sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center', mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
            © 2025 Compezze App
        </Typography>
      </Box>
    </Box>
  );
};