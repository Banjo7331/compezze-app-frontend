import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Typography, Alert, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

// Importy wspólne i z feature'a
import { Button } from '@/shared/ui/Button'; 
import { registerSchema } from '../model/validation';
import type { RegisterRequest } from '../model/types';
import { useRegister } from '../hooks/useRegister';

// FIX: Usunięto '?' przy confirmPassword. 
// To pole jest wymagane w formularzu (walidacja), mimo że nie idzie do API.
type RegisterFormInput = RegisterRequest & { confirmPassword: string };

export const RegisterForm = () => {
    // Używamy hooka rejestracji
    const { register, isLoading, isSuccess, error } = useRegister();
    const navigate = useNavigate();

    // Konfiguracja formularza
    const { 
        control, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<RegisterFormInput>({ 
        resolver: yupResolver(registerSchema),
        defaultValues: { 
            username: '', 
            email: '', 
            password: '', 
            confirmPassword: '' 
        }, 
    });

    // Handler wysyłania
    const onSubmit = (data: RegisterFormInput) => {
        // Wyciągamy confirmPassword, resztę (req) wysyłamy do API
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...req } = data;
        register(req); 
    };

    // Reakcja na sukces
    useEffect(() => {
        if (isSuccess) {
            alert('Konto utworzone pomyślnie! Możesz się teraz zalogować.');
            navigate('/login');
        }
    }, [isSuccess, navigate]);

    return (
        <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)} 
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 320 }}
        >
            <Typography variant="h5" align="center" gutterBottom>
                Utwórz Konto
            </Typography>

            {/* Wyświetlanie błędu z API (np. "Email zajęty") */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Pole: Nazwa Użytkownika */}
            <Controller 
                name="username" 
                control={control} 
                render={({ field }) => (
                    <TextField 
                        {...field} 
                        label="Nazwa użytkownika" 
                        variant="outlined"
                        error={!!errors.username} 
                        helperText={errors.username?.message} 
                    />
                )} 
            />

            {/* Pole: Email */}
            <Controller 
                name="email" 
                control={control} 
                render={({ field }) => (
                    <TextField 
                        {...field} 
                        label="Email" 
                        type="email"
                        variant="outlined"
                        error={!!errors.email} 
                        helperText={errors.email?.message} 
                    />
                )} 
            />

            {/* Pole: Hasło */}
            <Controller 
                name="password" 
                control={control} 
                render={({ field }) => (
                    <TextField 
                        {...field} 
                        label="Hasło" 
                        type="password" 
                        variant="outlined"
                        error={!!errors.password} 
                        helperText={errors.password?.message} 
                    />
                )} 
            />

            {/* Pole: Potwierdź Hasło */}
            <Controller 
                name="confirmPassword" 
                control={control} 
                render={({ field }) => (
                    <TextField 
                        {...field} 
                        label="Potwierdź hasło" 
                        type="password" 
                        variant="outlined"
                        error={!!errors.confirmPassword} 
                        helperText={errors.confirmPassword?.message} 
                    />
                )} 
            />

            {/* Przycisk Submit */}
            <Button type="submit" disabled={isLoading} size="large">
                {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
            </Button>
            
            {/* Link do logowania */}
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                Masz już konto?{' '}
                <MuiLink component={Link} to="/login" underline="hover">
                    Zaloguj się
                </MuiLink>
            </Typography>
        </Box>
    );
};