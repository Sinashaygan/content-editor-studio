export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  initials: string;
}
