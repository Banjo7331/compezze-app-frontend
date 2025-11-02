import { Typography, Container } from '@mui/material';
import React from 'react';

// W przyszłości ten komponent zaimportuje <LoginForm> z 'features/auth'
const LoginPage = () => {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h4">Strona Logowania</Typography>
      <Typography>
        Tutaj w przyszłości pojawi się formularz logowania.
      </Typography>
    </Container>
  );
};

export default LoginPage;