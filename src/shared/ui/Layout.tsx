import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import NavBar from './Navbar'; 

// Importujemy nasz listener domenowy
import { useSurveyInviteListener } from '@/features/survey/hooks/useSurveyInviteListener';

// 2. Importujemy nasz komponent wizualny (Dzwoneczek)
import { NotificationCenter } from '@/shared/ui/NotificationCenter';
import { useAuth } from '@/features/auth/AuthContext';
import { surveySocket } from '@/features/survey/api/surveySocket';

export const Layout = () => {
  const { currentUserId } = useAuth();

  // --- 1. GLOBALNE ZARZĄDZANIE POŁĄCZENIEM ---
  useEffect(() => {
    if (currentUserId) {
      // Jeśli user jest zalogowany -> włączamy "rurę"
      if (!surveySocket.isActive()) {
          surveySocket.activate();
      }
    } else {
      // Jeśli user wylogowany -> zakręcamy
      // (Opcjonalne, zależy czy chcesz obsługiwać gości. Jeśli tak, usuń else)
      if (surveySocket.isActive()) {
          surveySocket.deactivate();
      }
    }
    
    // Cleanup przy zamknięciu całej aplikacji (unmount Layoutu)
    return () => {
       // Zazwyczaj Layout nie jest odmontowywany, ale dla porządku:
       // surveySocket.deactivate(); 
    };
  }, [currentUserId]);


  // --- 2. LISTENERY (TYLKO SUBSKRYBUJĄ) ---
  useSurveyInviteListener({ autoRedirect: false });

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
      <NotificationCenter />
    </Box>
  );
};