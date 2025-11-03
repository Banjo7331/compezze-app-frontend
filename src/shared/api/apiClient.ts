import axios from 'axios';

// Wczytanie adresu bramki API ze zmiennych środowiskowych
const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor, który będzie dodawał token JWT do każdego zapytania
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // Na razie szukamy tokena w localStorage
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});