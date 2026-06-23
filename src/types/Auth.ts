export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresIn: number;
}

export interface UserInfo {
  username: string;
  role: string;
}
