export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'viewer'
}

export interface AuthResponse {
  status: string;
  token: string;
  data: User;
}