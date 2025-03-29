import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, collectionData, docData, increment } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Team } from '../app/models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private teamsCollection;

  constructor(private firestore: Firestore) {
    this.teamsCollection = collection(this.firestore, 'teams');
  }

  getTeams(): Observable<Team[]> {
    return collectionData(this.teamsCollection, { idField: 'id' }) as Observable<Team[]>;
  }

  getTeam(id: string): Observable<Team> {
    const teamDoc = doc(this.firestore, `teams/${id}`);
    return docData(teamDoc, { idField: 'id' }) as Observable<Team>;
  }

  createTeam(team: Omit<Team, 'id'>): Promise<string> {
    return addDoc(this.teamsCollection, {
      ...team,
      matchesPlayed: 0,
      points: 0,
      goalsScored: 0,
      goalsConceded: 0
    }).then(docRef => docRef.id);
  }

  updateTeam(id: string, team: Partial<Team>): Promise<void> {
    const teamDoc = doc(this.firestore, `teams/${id}`);
    return updateDoc(teamDoc, team);
  }

  deleteTeam(id: string): Promise<void> {
    const teamDoc = doc(this.firestore, `teams/${id}`);
    return deleteDoc(teamDoc);
  }

  updateTeamStats(id: string, goalsScored: number, goalsConceded: number, points: number): Promise<void> {
    const teamDoc = doc(this.firestore, `teams/${id}`);
    return updateDoc(teamDoc, {
      matchesPlayed: increment(1),
      goalsScored: increment(goalsScored),
      goalsConceded: increment(goalsConceded),
      points: increment(points)
    });
  }
} 