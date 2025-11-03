export interface ILoginRequest {
  email: string;
  password: string;
}

// Co otrzymujemy od API
export interface IAuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}