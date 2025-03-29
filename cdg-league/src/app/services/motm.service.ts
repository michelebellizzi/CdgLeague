import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, map, switchMap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MotmService {
  private firestore = inject(Firestore);

  getMotmStandings(): Observable<{ user: User; motmCount: number }[]> {
    return collectionData(collection(this.firestore, 'matches')).pipe(
      switchMap(matches => {
        const motmCounts: { [key: string]: number } = {};
        
        // Conta i MOTM per ogni giocatore
        matches.forEach(match => {
          if (match['completed'] && match['motm']) {
            motmCounts[match['motm']] = (motmCounts[match['motm']] || 0) + 1;
          }
        });

        // Ottieni i dati dei giocatori
        return collectionData(collection(this.firestore, 'users')).pipe(
          map(users => {
            return (users as User[])
              .filter(user => motmCounts[user.uid] > 0)
              .map(user => ({
                user,
                motmCount: motmCounts[user.uid]
              }))
              .sort((a, b) => b.motmCount - a.motmCount);
          })
        );
      })
    );
  }
} 