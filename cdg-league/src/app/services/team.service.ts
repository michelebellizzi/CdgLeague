import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc, deleteDoc, updateDoc, writeBatch, increment } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private firestore = inject(Firestore);

  getTeams(): Observable<Team[]> {
    return collectionData(collection(this.firestore, 'teams')).pipe(
      map(teams => teams as Team[])
    );
  }

  getTeam(id: string): Observable<Team | null> {
    return docData(doc(this.firestore, `teams/${id}`)).pipe(
      map(team => team as Team || null)
    );
  }

  getCurrentUserTeam(): Observable<Team | null> {
    // TODO: Implementare la logica per ottenere la squadra dell'utente corrente
    return docData(doc(this.firestore, 'teams/current-user-team-id')).pipe(
      map(team => team as Team || null)
    );
  }

  createTeam(team: Omit<Team, 'id'>): Promise<void> {
    const id = crypto.randomUUID();
    return setDoc(doc(this.firestore, `teams/${id}`), {
      ...team,
      id,
      points: 0,
      played: 0,
      won: 0,
      draws: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0
    });
  }

  deleteTeam(id: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `teams/${id}`));
  }

  updateTeam(id: string, team: Partial<Team>): Promise<void> {
    return updateDoc(doc(this.firestore, `teams/${id}`), team);
  }

  updateTeamStats(teamId: string, goalsFor: number, goalsAgainst: number, points: number): Promise<void> {
    const teamRef = doc(this.firestore, `teams/${teamId}`);
    return updateDoc(teamRef, {
      points: increment(points),
      played: increment(1),
      goalsFor: increment(goalsFor),
      goalsAgainst: increment(goalsAgainst),
      won: increment(points === 3 ? 1 : 0),
      draws: increment(points === 1 ? 1 : 0),
      lost: increment(points === 0 ? 1 : 0)
    });
  }
} 