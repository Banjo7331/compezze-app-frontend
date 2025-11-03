import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Nie łączymy się automatycznie przy starcie apki
});

export const connectSocket = () => {
  // Pobieramy token PRZED połączeniem
  const token = localStorage.getItem('authToken');

  if (socket.disconnected) {
    // Przekazujemy token do autoryzacji gniazda
    socket.auth = { token: token || undefined };
    socket.connect();
    console.log('Socket connecting...');
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log('Socket disconnected');
  }
};

// Przykładowe nasłuchiwanie na eventy (do debugowania)
socket.on('connect', () => console.log('Socket connected with id:', socket.id));
socket.on('disconnect', () => console.log('Socket disconnected'));
socket.on('connect_error', (err) => console.error('Socket connect_error:', err.message));