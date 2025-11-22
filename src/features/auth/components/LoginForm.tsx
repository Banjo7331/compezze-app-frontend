import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Typography, Alert } from '@mui/material';
import { Button } from '@/shared/ui/Button';
import { loginSchema } from '../model/validation';
import type { LoginRequest } from '../model/types'; 
import { useLogin } from '../hooks/useLogin';

export const LoginForm = () => {
    // 1. Hook do logowania. Destrukturyzujemy login, isLoading, i error (już jako string)
    const { 
        login, 
        isLoading, 
        error // Ten error jest już czystym stringiem lub nullem, dzięki useLogin.ts
    } = useLogin(); 

    // 2. Hook do formularza
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>({ 
        resolver: yupResolver(loginSchema),
        // Używamy nazwy pola zgodnej z DTO
        defaultValues: { usernameOrEmail: '', password: '' }, 
    });

    // 3. Funkcja wywoływana po poprawnej walidacji
    const onSubmit = (data: LoginRequest) => {
        // Wywołujemy funkcję login. Cała logika uwierzytelniania i zarządzania tokenami jest w useLogin.ts.
        login(data); 
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 300 }}
        >
            <Typography variant="h5">Zaloguj się</Typography>

            {/* Wyświetlanie ogólnego błędu logowania (np. złe hasło) */}
            {/* FIX: Błąd jest przekazywany jako string przez hook. */}
            {error && (
                // Zastąp "Niepoprawny email lub hasło." komunikatem z hooka/backendu
                <Alert severity="error">{error}</Alert> 
            )}

            {/* Pole Nazwa użytkownika/Email */}
            <Controller
                name="usernameOrEmail"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Nazwa użytkownika / Email"
                        variant="outlined"
                        error={!!errors.usernameOrEmail}
                        helperText={errors.usernameOrEmail?.message}
                    />
                )}
            />

            {/* Pole Hasło */}
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

            {/* Przycisk Logowania */}
            <Button
                type="submit"
                disabled={isLoading} 
            >
                {isLoading ? 'Logowanie...' : 'Zaloguj'}
            </Button>
        </Box>
    );
};