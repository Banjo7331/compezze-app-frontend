import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Typography, Alert } from '@mui/material';
import { Button } from '@/shared/ui/Button';
import { loginSchema } from '../model/validation';
import type { ILoginRequest } from '../model/types';
import { useLogin } from '../hooks/useLogin';

export const LoginForm = () => {
  // 1. Hook do logowania (z react-query)
  const loginMutation = useLogin();

  // 2. Hook do formularza (z react-hook-form)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginRequest>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // 3. Funkcja wywoływana po poprawnej walidacji
  const onSubmit = (data: ILoginRequest) => {
    loginMutation.mutate(data); // Wywołujemy logikę logowania
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 300 }}
    >
      <Typography variant="h5">Zaloguj się</Typography>

      {/* Wyświetlanie ogólnego błędu logowania (np. złe hasło) */}
      {loginMutation.isError && (
        <Alert severity="error">Niepoprawny email lub hasło.</Alert>
      )}

      {/* Pole Email */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            variant="outlined"
            error={!!errors.email}
            helperText={errors.email?.message}
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
        disabled={loginMutation.isPending} // Blokujemy guzik podczas ładowania
      >
        {loginMutation.isPending ? 'Logowanie...' : 'Zaloguj'}
      </Button>
    </Box>
  );
};