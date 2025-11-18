export interface ILoginRequest {
  usernameOrEmail: string; 
  password: string;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface IRefreshRequest {
  refreshToken: string;
}