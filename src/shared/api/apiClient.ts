import axios from 'axios';

// Wczytanie adresu z env (lub domyślny localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ważne: Pozwala przesyłać ciasteczka (Refresh Token)
  withCredentials: true, 
});

// --- ZMIENNE DO KOLEJKOWANIA (MUTEX) ---
// Flaga: czy właśnie trwa odświeżanie?
let isRefreshing = false;
// Kolejka: zapytania, które czekają na nowy token
let failedQueue: any[] = [];

// Funkcja przetwarzająca kolejkę po sukcesie lub błędzie refreshu
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- 1. INTERCEPTOR ŻĄDANIA (REQUEST) ---
// Dodaje Access Token do każdego wychodzącego zapytania
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 2. INTERCEPTOR ODPOWIEDZI (RESPONSE) ---
// To tutaj dzieje się magia "Silent Refresh"
apiClient.interceptors.response.use(
  (response) => {
    return response; // Sukces? Nic nie robimy, zwracamy wynik.
  },
  async (error) => {
    const originalRequest = error.config;

    // Sprawdzamy, czy to błąd 401 (Token wygasł) i czy to nie jest już ponowiona próba
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // PRZYPADEK A: Odświeżanie już trwa (zainicjowane przez inne zapytanie)
      if (isRefreshing) {
        // Dodajemy to zapytanie do kolejki i czekamy na rozwiązanie Promise
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Gdy dostaniemy nowy token z kolejki:
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest); // Ponawiamy zapytanie
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // PRZYPADEK B: Jesteśmy pierwsi - startujemy procedurę Refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 1. Wysyłamy żądanie o nowy token (ciasteczko leci automatycznie dzięki withCredentials)
        // Używamy czystego axios.post, żeby ominąć nasze interceptory
        const rs = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

        const { accessToken } = rs.data;

        // 2. Zapisujemy nowy token
        localStorage.setItem('accessToken', accessToken);
        
        // Aktualizujemy domyślne nagłówki instancji
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        
        // 3. Przetwarzamy kolejkę oczekujących (resolve)
        processQueue(null, accessToken);

        // 4. Ponawiamy WŁASNE (pierwsze) zapytanie
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        return apiClient(originalRequest); // <--- Zwraca sukces do Reacta!

      } catch (refreshError) {
        // 5. Jeśli refresh się nie udał (np. refresh token też wygasł)
        processQueue(refreshError, null); // Odrzucamy kolejkę
        localStorage.removeItem('accessToken');
        
        // Opcjonalnie: Przekierowanie do logowania
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // Zwalniamy blokadę
      }
    }

    // Każdy inny błąd zwracamy do komponentu
    return Promise.reject(error);
  }
);