import { User } from './user.model';

export interface Player extends User {
  id: string;
  displayName: string;
  photoURL?: string;
  teamId: string;
  goals: number;
  motm: number;
} 