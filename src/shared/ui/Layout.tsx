import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import NavBar from './Navbar'; 

// --- 1. IMPORTY SURVEY ---
import { surveySocket } from '@/features/survey/api/surveySocket';
import { useSurveyInviteListener } from '@/features/survey/hooks/useSurveyInviteListener';

// --- 2. IMPORTY QUIZ (NOWE) ---
import { quizSocket } from '@/features/quiz/api/quizSocket';
import { useQuizInviteListener } from '@/features/quiz/hooks/useQuizInviteListener';

// --- SHARED ---
import { NotificationCenter } from '@/shared/ui/NotificationCenter';
import { useAuth } from '@/features/auth/AuthContext';

export const Layout = () => {
  const { currentUserId } = useAuth();

  // --- GLOBALNE ZARZĄDZANIE POŁĄCZENIAMI (RURY) ---
  useEffect(() => {
    if (currentUserId) {
      // Zalogowany -> Odkręcamy kurki z danymi
      
      // 1. Survey Service WebSocket
      if (!surveySocket.isActive()) {
          console.log("[Layout] Activating Survey Socket...");
          surveySocket.activate();
      }

      // 2. Quiz Service WebSocket (NOWE)
      if (!quizSocket.isActive()) {
          console.log("[Layout] Activating Quiz Socket...");
          quizSocket.activate();
      }

    } else {
      // Wylogowany -> Zakręcamy
      if (surveySocket.isActive()) surveySocket.deactivate();
      if (quizSocket.isActive()) quizSocket.deactivate();
    }
    
  }, [currentUserId]);


  // --- LISTENERY POWIADOMIEŃ (RADARY) ---
  // Te hooki "siedzą cicho" i czekają na zaproszenia w tle.
  // Dzięki temu, że są w Layout, działają na każdej podstronie.
  
  useSurveyInviteListener({ autoRedirect: false });
  useQuizInviteListener({ autoRedirect: false }); // <--- NOWE

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <NavBar /> 

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center', mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
            © 2025 Compezze App
        </Typography>
      </Box>

      {/* CENTRUM POWIADOMIEŃ (DZWONECZEK) */}
      <NotificationCenter />
      
    </Box>
  );
};