import React from 'react';
import { Container, Paper, Box } from '@mui/material';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <Container 
      maxWidth="xs" // Wąski kontener dla formularza
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', // Wycentrowanie w pionie
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
        {/* Renderujemy gotowy formularz */}
        <RegisterForm />
      </Paper>
    </Container>
  );
};

export default RegisterPage;