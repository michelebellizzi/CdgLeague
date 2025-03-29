export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  teamId?: string;
  goals?: number;
  motm?: number;
  isAdmin?: boolean;
} 