import React from 'react';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext'; // <-- 1. Import Contextu

const NavBar: React.FC = () => {
  // 2. Pobieramy stan i funkcje z Contextu
  const { isAuthenticated, logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Contest', path: '/contest' },
    { label: 'Survey', path: '/survey' },
    { label: 'Quiz', path: '/quiz' },
  ];

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* 1. LOGO */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ textDecoration: 'none', color: 'inherit', mr: 4 }}
        >
          Compezze Platform
        </Typography>

        {/* 2. NAWIGACJA GŁÓWNA (ŚRODEK) */}
        {/* flexGrow: 1 sprawi, że ten Box zajmie dostępne miejsce i pchnie Auth na prawo */}
        <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              component={Link}
              to={item.path}
              sx={{ 
                color: '#fff', 
                textTransform: 'uppercase',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* 3. SEKCJA AUTORYZACJI (PRAWA STRONA) */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {isAuthenticated ? (
            // WIDOK ZALOGOWANEGO UŻYTKOWNIKA
            <>
              <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>
                 {currentUser?.username}
              </Typography>
              <Button 
                color="inherit" 
                variant="outlined" 
                onClick={handleLogout}
                sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Wyloguj
              </Button>
            </>
          ) : (
            // WIDOK NIEZALOGOWANEGO (GOŚCIA)
            <>
              <Button color="inherit" component={Link} to="/login">
                Zaloguj
              </Button>
              <Button 
                color="secondary" 
                variant="contained" 
                component={Link} 
                to="/register"
              >
                Rejestracja
              </Button>
            </>
          )}
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default NavBar;