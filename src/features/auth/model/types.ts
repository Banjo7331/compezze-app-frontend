// src/features/auth/model/types.ts

// Zmieniamy nazewnictwo z "ILoginRequest" na "LoginRequest" dla czytelności
export interface LoginRequest {
  usernameOrEmail: string; 
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Odpowiedź z tokenami
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

// Refresh request jest pusty, bo token leci w nagłówku Cookie
export interface RefreshRequest {}

// Dane użytkownika zwracane przez /users/me
export interface UserDto {
    id: string; // UUID w Javie
    username: string;
    email: string;
    roles: string[];
}