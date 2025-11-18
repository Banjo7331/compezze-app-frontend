import { Outlet } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import NavBar from './Navbar'; // <--- Poprawiony import (default export)

export const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* 1. Pasek nawigacji - umieszczamy NavBar */}
      <NavBar /> 

      {/* 2. Kontener na treść strony */}
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {/* Outlet renderuje tutaj komponent dziecka (np. HomePage, SurveyPage) */}
        <Outlet />
      </Container>

      {/* 3. Stopka */}
      <Box component="footer" sx={{ p: 2, bgcolor: 'lightgray', textAlign: 'center' }}>
        <Typography variant="body2">© 2025 Moja Firma</Typography>
      </Box>
    </Box>
  );
};