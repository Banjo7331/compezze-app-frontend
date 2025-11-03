import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import type { ILoginRequest, IAuthResponse } from '../model/types';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation<IAuthResponse, Error, ILoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      // Sukces! Zapisujemy token
      localStorage.setItem('authToken', data.accessToken);
      
      // USUNIĘTO: connectSocket();
      // (Połączymy się ręcznie, gdy będzie to potrzebne)
      
      // Przekierowujemy na stronę główną
      navigate('/');
    },
    onError: (error) => {
      console.error('Błąd logowania:', error.message);
    },
  });
};