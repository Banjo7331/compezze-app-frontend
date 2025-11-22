import React, { useEffect } from 'react';
import { Container, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Importujemy Formularz i Hook Autentykacji
import { LoginForm } from '@/features/auth/components/LoginForm'; 
import { useAuth } from '@/features/auth/AuthContext'; // <-- Używamy Contextu

const LoginPage = () => {
    // 1. Pobieranie stanu sesji z Contextu Auth
    const { isAuthenticated, isInitializing } = useAuth();
    const navigate = useNavigate();

    // 2. Efekt do obsługi przekierowania po zalogowaniu
    useEffect(() => {
        // Sprawdzamy, czy inicjalizacja dobiegła końca (skończono sprawdzanie tokenów)
        // I czy użytkownik jest uwierzytelniony.
        if (!isInitializing && isAuthenticated) {
            // Przekierowujemy na stronę główną, zastępując historię (replace: true)
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, isInitializing, navigate]);

    // 3. Renderowanie stanów

    // Stan A: Inicjalizacja (np. sprawdzanie Refresh Token)
    if (isInitializing) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Checking session...</Typography>
            </Container>
        );
    }
    
    // Stan B: Wyświetlanie Formularza (gdy nie jesteśmy zalogowani)
    return (
        <Container
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}
        >
            {/* Formularz jest renderowany tylko, jeśli isInitializing = false i isAuthenticated = false */}
            <LoginForm />
        </Container>
    );
};

export default LoginPage;