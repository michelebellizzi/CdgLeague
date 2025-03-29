import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, map, switchMap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ScorerService {
  private firestore = inject(Firestore);

  getScorers(): Observable<User[]> {
    return collectionData(collection(this.firestore, 'matches')).pipe(
      switchMap(matches => {
        const goalsByPlayer: { [key: string]: number } = {};
        
        // Conta i gol per ogni giocatore dalle partite completate
        matches.forEach(match => {
          if (match['completed'] && match['scorers']) {
            Object.entries(match['scorers']).forEach(([playerId, goals]) => {
              goalsByPlayer[playerId] = (goalsByPlayer[playerId] || 0) + (goals as number);
            });
          }
        });

        // Ottieni i dati dei giocatori
        return collectionData(collection(this.firestore, 'users')).pipe(
          map(users => {
            return (users as User[])
              .filter(user => goalsByPlayer[user.uid] > 0)
              .map(user => ({
                ...user,
                goals: goalsByPlayer[user.uid]
              }))
              .sort((a, b) => b.goals - a.goals);
          })
        );
      })
    );
  }

  getScorer(id: string): Observable<User | null> {
    return collectionData(collection(this.firestore, 'users')).pipe(
      map(users => {
        if (!users) return null;
        const user = users.find(u => u['uid'] === id);
        if (!user) return null;
        return {
          ...user,
          goals: user['goals'] || 0
        } as User;
      })
    );
  }
} 