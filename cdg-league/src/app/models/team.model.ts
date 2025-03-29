export interface Team {
  id: string;
  name: string;
  colors: string | string[];
  logo?: string;
  played?: number;
  won?: number;
  draws?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  points?: number;
} 