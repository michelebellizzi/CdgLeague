export interface Match {
  id: string;
  date: Date;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  completed: boolean;
  motm?: string;
  scorers: Record<string, number>;
  matchday: number; // Giornata del campionato
} 