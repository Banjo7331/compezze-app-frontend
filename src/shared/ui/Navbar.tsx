import React from 'react';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
  // Lista zakładek
  const navItems = [
    { label: 'Contest', path: '/contest' },
    { label: 'Survey', path: '/survey' },
    { label: 'Quiz', path: '/quiz' },
  ];

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Logo/Nazwa Aplikacji - Link do strony głównej */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          CompExze App
        </Typography>

        {/* Przyciski Nawigacyjne (Contest, Survey, Quiz) */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              // Używamy Link z react-router-dom jako komponentu bazowego dla Button
              component={Link} 
              to={item.path}
              sx={{ 
                color: '#fff', 
                textTransform: 'uppercase', 
                // Dodatkowe style, aby przycisk był bardziej wyraźny na pasku
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;