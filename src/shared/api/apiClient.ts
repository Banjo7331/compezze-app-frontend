import axios from 'axios';

// Wczytanie adresu bramki API ze zmiennych środowiskowych
const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // KLUCZOWA ZMIANA: Pozwala na przesyłanie ciasteczek (HttpOnly Refresh Token)
  // jest to niezbędne przy komunikacji z Gatewayem na innej domenie/porcie
  withCredentials: true, 
});

// Interceptor, który dodaje Access Token (krótko żyjący) do nagłówka
apiClient.interceptors.request.use((config) => {
  // Zmieniliśmy nazwę klucza w AuthContext na 'accessToken'
  const token = localStorage.getItem('accessToken'); 
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});