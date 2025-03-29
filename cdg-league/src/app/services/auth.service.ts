import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, deleteUser, authState, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, docData, collection, collectionData, deleteDoc } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { User as UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  register(email: string, password: string, displayName: string): Promise<void> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return setDoc(doc(this.firestore, `users/${user.uid}`), {
          email: user.email,
          displayName,
          uid: user.uid,
          role: 'user',
          createdAt: new Date()
        });
      });
  }

  login(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // Aggiorna solo l'ultimo login
        return setDoc(doc(this.firestore, `users/${user.uid}`), {
          lastLogin: new Date()
        }, { merge: true });
      })
      .catch(error => {
        console.error('Errore di login:', error);
        throw error;
      });
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  isAuthenticated(): Observable<boolean> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, (user) => {
        observer.next(!!user);
      });
    });
  }

  getCurrentUser(): Observable<User | null> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      });
    });
  }

  isAdmin(): Observable<boolean> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          docData(doc(this.firestore, `users/${user.uid}`)).subscribe(userData => {
            observer.next(userData?.['role'] === 'admin');
          });
        } else {
          observer.next(false);
        }
      });
    });
  }

  createAdmin(email: string, password: string, displayName: string): Promise<void> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(async credential => {
        if (!credential.user) {
          throw new Error('Failed to create admin user');
        }
        try {
          await setDoc(doc(this.firestore, `users/${credential.user.uid}`), {
            uid: credential.user.uid,
            email,
            displayName,
            role: 'admin',
            teamId: null,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error creating admin document:', error);
          await credential.user.delete();
          throw new Error('Failed to create admin document');
        }
      });
  }

  getUsers(): Observable<UserModel[]> {
    return collectionData(collection(this.firestore, 'users')).pipe(
      map(users => users as UserModel[])
    );
  }

  deleteUser(uid: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `users/${uid}`));
  }
} 