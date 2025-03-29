import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, map, switchMap, of } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  constructor() {}

  getPlayers(): Observable<User[]> {
    return collectionData(collection(this.firestore, 'users')).pipe(
      map(users => users as User[])
    );
  }

  getPlayer(id: string): Observable<Player | null> {
    return this.getPlayers().pipe(
      map(users => {
        const user = users.find(u => u.uid === id);
        if (!user) return null;
        return { ...user, id: user.uid } as Player;
      })
    );
  }

  getTeamPlayers(teamId: string): Observable<Player[]> {
    return this.getPlayers().pipe(
      map(users => users
        .filter(u => u.teamId === teamId)
        .map(u => ({ ...u, id: u.uid } as Player))
      )
    );
  }

  getCurrentUser(): Observable<User | null> {
    return this.authService.getCurrentUser().pipe(
      switchMap(firebaseUser => {
        if (!firebaseUser) return of(null);
        return docData(doc(this.firestore, `users/${firebaseUser.uid}`)).pipe(
          map(userData => {
            if (!userData) return null;
            return {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: userData['photoURL'] || undefined,
              teamId: userData['teamId'] || undefined,
              goals: userData['goals'] || 0,
              isAdmin: userData['role'] === 'admin'
            } as User;
          })
        );
      })
    );
  }

  createPlayer(player: Omit<User, 'uid'>): Promise<void> {
    const id = crypto.randomUUID();
    return setDoc(doc(this.firestore, `users/${id}`), {
      ...player,
      uid: id
    });
  }

  deletePlayer(uid: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `users/${uid}`));
  }

  assignTeam(uid: string, teamId: string): Promise<void> {
    return updateDoc(doc(this.firestore, `users/${uid}`), {
      teamId
    });
  }

  removeFromTeam(uid: string): Promise<void> {
    return updateDoc(doc(this.firestore, `users/${uid}`), {
      teamId: null
    });
  }

  getScorersForMatch(matchId: string): Observable<User[]> {
    return collectionData(collection(this.firestore, 'users')).pipe(
      map(users => (users as User[]).filter(user => user.goals && user.goals > 0))
    );
  }

  getPlayersByTeam(teamId: string): Observable<User[]> {
    return collectionData(collection(this.firestore, 'users')).pipe(
      map(users => (users as User[]).filter(user => user.teamId === teamId))
    );
  }

  updatePlayer(uid: string, data: Partial<User>): Promise<void> {
    return updateDoc(doc(this.firestore, `users/${uid}`), data);
  }
} 