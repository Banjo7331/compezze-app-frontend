import { Outlet } from 'react-router-dom';
import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';

export const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Pasek nawigacji */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Moja Aplikacja
          </Typography>
          {/* Tutaj w przyszłości można dodać np. <UserMenu> z features */}
        </Toolbar>
      </AppBar>

      {/* Kontener na treść strony */}
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {/* Outlet renderuje tutaj komponent dziecka (np. HomePage) */}
        <Outlet />
      </Container>

      {/* Stopka */}
      <Box component="footer" sx={{ p: 2, bgcolor: 'lightgray', textAlign: 'center' }}>
        <Typography variant="body2">© 2025 Moja Firma</Typography>
      </Box>
    </Box>
  );
};