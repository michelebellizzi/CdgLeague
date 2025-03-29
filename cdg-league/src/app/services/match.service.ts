import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc, deleteDoc, query, where, orderBy, limit, getDoc, updateDoc, Timestamp, writeBatch, increment } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Match } from '../models/match.model';
import { TeamService } from './team.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private firestore = inject(Firestore);
  private teamService = inject(TeamService);

  getMatches(): Observable<Match[]> {
    return collectionData(collection(this.firestore, 'matches')).pipe(
      map(matches => matches.map(match => ({
        ...match,
        date: match['date'] instanceof Timestamp ? match['date'].toDate() : match['date'],
        homeScore: match['homeScore'] || 0,
        awayScore: match['awayScore'] || 0,
        completed: match['completed'] || false,
        matchday: match['matchday'] || 1
      })) as Match[])
    );
  }

  getMatchesByMatchday(): Observable<{ [key: number]: Match[] }> {
    return this.getMatches().pipe(
      map(matches => {
        const grouped: { [key: number]: Match[] } = {};
        matches.forEach(match => {
          if (!grouped[match.matchday]) {
            grouped[match.matchday] = [];
          }
          grouped[match.matchday].push(match);
        });
        return grouped;
      })
    );
  }

  getMatch(id: string): Observable<Match | null> {
    return docData(doc(this.firestore, `matches/${id}`)).pipe(
      map(match => {
        if (!match) return null;
        return {
          ...match,
          date: match['date'] instanceof Timestamp ? match['date'].toDate() : match['date'],
          homeScore: match['homeScore'] || 0,
          awayScore: match['awayScore'] || 0,
          completed: match['completed'] || false
        } as Match;
      })
    );
  }

  getNextMatches(): Observable<Match[]> {
    const now = new Date();
    const matchesRef = collection(this.firestore, 'matches');
    const q = query(
      matchesRef,
      where('date', '>', now),
      where('completed', '==', false),
      orderBy('date'),
      limit(5)
    );
    return collectionData(q).pipe(
      map(matches => matches.map(match => ({
        ...match,
        date: match['date'] instanceof Timestamp ? match['date'].toDate() : match['date'],
        homeScore: match['homeScore'] || 0,
        awayScore: match['awayScore'] || 0,
        completed: match['completed'] || false,
        matchday: match['matchday'] || 1
      })) as Match[])
    );
  }

  getLastMatch(): Observable<Match | null> {
    const matchesRef = collection(this.firestore, 'matches');
    const q = query(
      matchesRef,
      where('completed', '==', true),
      orderBy('date', 'desc'),
      limit(1)
    );
    return collectionData(q).pipe(
      map(matches => {
        if (matches.length === 0) return null;
        const match = matches[0];
        return {
          ...match,
          date: match['date'] instanceof Timestamp ? match['date'].toDate() : match['date'],
          homeScore: match['homeScore'] || 0,
          awayScore: match['awayScore'] || 0,
          completed: match['completed'] || false
        } as Match;
      })
    );
  }

  getCurrentUserMatches(): Observable<Match[]> {
    // TODO: Implementare la logica per ottenere le partite dell'utente corrente
    return collectionData(collection(this.firestore, 'matches')) as Observable<Match[]>;
  }

  createMatch(match: Omit<Match, 'id'>): Promise<void> {
    const id = crypto.randomUUID();
    return setDoc(doc(this.firestore, `matches/${id}`), {
      ...match,
      id,
      completed: false,
      homeScore: 0,
      awayScore: 0,
      scorers: {}
    });
  }

  async deleteMatch(id: string): Promise<void> {
    const matchRef = doc(this.firestore, `matches/${id}`);
    
    // Ottieni i dati della partita prima di eliminarla
    const matchDoc = await getDoc(matchRef);
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }
    
    const match = matchDoc.data() as Match;
    if (!match) {
      throw new Error('Match data not found');
    }

    // Se la partita è stata completata, aggiorna i punti delle squadre e i gol dei giocatori
    if (match.completed) {
      const batch = writeBatch(this.firestore);
      
      // Rimuovi i gol dai giocatori
      if (match.scorers) {
        for (const [playerId, goals] of Object.entries(match.scorers)) {
          const playerRef = doc(this.firestore, `users/${playerId}`);
          const playerDoc = await getDoc(playerRef);
          
          if (playerDoc.exists()) {
            const playerData = playerDoc.data();
            const currentGoals = playerData['goals'] || 0;
            
            batch.update(playerRef, {
              goals: currentGoals - goals
            });
          }
        }
      }

      // Rimuovi i punti dalle squadre
      const homePoints = match.homeScore > match.awayScore ? -3 : 
                        match.homeScore < match.awayScore ? 0 : -1;
      const awayPoints = match.homeScore < match.awayScore ? -3 : 
                        match.homeScore > match.awayScore ? 0 : -1;

      const homeTeamRef = doc(this.firestore, `teams/${match.homeTeamId}`);
      const awayTeamRef = doc(this.firestore, `teams/${match.awayTeamId}`);

      batch.update(homeTeamRef, {
        points: increment(homePoints),
        played: increment(-1),
        goalsFor: increment(-match.homeScore),
        goalsAgainst: increment(-match.awayScore),
        won: increment(homePoints === -3 ? -1 : 0),
        draws: increment(homePoints === -1 ? -1 : 0),
        lost: increment(homePoints === 0 ? -1 : 0)
      });

      batch.update(awayTeamRef, {
        points: increment(awayPoints),
        played: increment(-1),
        goalsFor: increment(-match.awayScore),
        goalsAgainst: increment(-match.homeScore),
        won: increment(awayPoints === -3 ? -1 : 0),
        draws: increment(awayPoints === -1 ? -1 : 0),
        lost: increment(awayPoints === 0 ? -1 : 0)
      });

      // Esegui il batch per aggiornare i gol dei giocatori e le statistiche delle squadre
      await batch.commit();
    }

    // Elimina la partita
    await deleteDoc(matchRef);
  }

  getMatchesByTeam(teamId: string): Observable<Match[]> {
    const matchesRef = collection(this.firestore, 'matches');
    const q = query(
      matchesRef,
      where('homeTeamId', '==', teamId),
      orderBy('date', 'asc')
    );
    return collectionData(q) as Observable<Match[]>;
  }

  async completeMatch(id: string, homeScore: number, awayScore: number, scorers: Match['scorers'], motm: string): Promise<void> {
    const matchRef = doc(this.firestore, `matches/${id}`);
    
    const matchDoc = await getDoc(matchRef);
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }
    
    const match = matchDoc.data() as Match;
    if (!match) {
      throw new Error('Match data not found');
    }
    
    let homePoints = 0;
    let awayPoints = 0;
    
    // Calcola i punti in base al risultato (anche 0-0)
    if (homeScore > awayScore) {
      homePoints = 3;
      awayPoints = 0;
    } else if (homeScore < awayScore) {
      homePoints = 0;
      awayPoints = 3;
    } else {
      // Pareggio (incluso 0-0)
      homePoints = 1;
      awayPoints = 1;
    }

    // Aggiorna i gol dei giocatori
    if (scorers && Object.keys(scorers).length > 0) {
      const batch = writeBatch(this.firestore);
      
      for (const [playerId, goals] of Object.entries(scorers)) {
        const playerRef = doc(this.firestore, `users/${playerId}`);
        const playerDoc = await getDoc(playerRef);
        
        if (playerDoc.exists()) {
          const playerData = playerDoc.data();
          const currentGoals = playerData['goals'] || 0;
          
          batch.update(playerRef, {
            goals: currentGoals + goals
          });
        }
      }
      
      await batch.commit();
    }

    // Aggiorna le statistiche delle squadre e il risultato della partita
    await Promise.all([
      this.teamService.updateTeamStats(match.homeTeamId, homeScore, awayScore, homePoints),
      this.teamService.updateTeamStats(match.awayTeamId, awayScore, homeScore, awayPoints),
      updateDoc(matchRef, {
        completed: true,
        homeScore,
        awayScore,
        scorers: scorers || {},
        motm: motm || ''
      })
    ]);
  }

  async updateMatch(id: string, homeScore: number, awayScore: number, scorers: Match['scorers'], motm: string): Promise<void> {
    const matchRef = doc(this.firestore, `matches/${id}`);
    
    const matchDoc = await getDoc(matchRef);
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }
    
    const match = matchDoc.data() as Match;
    if (!match) {
      throw new Error('Match data not found');
    }
    
    let homePoints = 0;
    let awayPoints = 0;
    
    // Calcola i punti in base al risultato
    if (homeScore > awayScore) {
      homePoints = 3;
      awayPoints = 0;
    } else if (homeScore < awayScore) {
      homePoints = 0;
      awayPoints = 3;
    } else {
      homePoints = 1;
      awayPoints = 1;
    }

    // Aggiorna i gol dei giocatori
    if (scorers && Object.keys(scorers).length > 0) {
      const batch = writeBatch(this.firestore);
      
      // Prima rimuoviamo i gol precedenti
      if (match.scorers) {
        for (const [playerId, goals] of Object.entries(match.scorers)) {
          const playerRef = doc(this.firestore, `users/${playerId}`);
          const playerDoc = await getDoc(playerRef);
          
          if (playerDoc.exists()) {
            const playerData = playerDoc.data();
            const currentGoals = playerData['goals'] || 0;
            
            batch.update(playerRef, {
              goals: currentGoals - goals
            });
          }
        }
      }

      // Poi aggiungiamo i nuovi gol
      for (const [playerId, goals] of Object.entries(scorers)) {
        const playerRef = doc(this.firestore, `users/${playerId}`);
        const playerDoc = await getDoc(playerRef);
        
        if (playerDoc.exists()) {
          const playerData = playerDoc.data();
          const currentGoals = playerData['goals'] || 0;
          
          batch.update(playerRef, {
            goals: currentGoals + goals
          });
        }
      }
      
      await batch.commit();
    }

    // Aggiorna le statistiche delle squadre e il risultato della partita
    await Promise.all([
      this.teamService.updateTeamStats(match.homeTeamId, homeScore, awayScore, homePoints),
      this.teamService.updateTeamStats(match.awayTeamId, awayScore, homeScore, awayPoints),
      updateDoc(matchRef, {
        completed: true,
        homeScore,
        awayScore,
        scorers: scorers || {},
        motm: motm || ''
      })
    ]);
  }
} 