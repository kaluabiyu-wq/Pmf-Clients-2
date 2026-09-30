import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { LoginResponse } from '../model/session.model';


type SessionState = {
  userId: number | null;
  fullName: string | null;
  role: string | null;
  token: string | null;
  expiresAt: Date | null;
};

const initialState: SessionState = {
  userId: null,
  fullName: null,
  role: null,
  token: null,
  expiresAt: null,
};

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    
    isAuthenticated: computed(() => {
      const token = store.token();
      const expiresAt = store.expiresAt();
      return token !== null && expiresAt !== null && expiresAt.getTime() > Date.now();
    }),
  })),

  withMethods((store) => ({
   
    setSession(response: LoginResponse): void {
      patchState(store, {
        userId: response.userId,
        fullName: response.fullName,
        role: response.role,
        token: response.token,
        expiresAt: new Date(response.expiresAt),
      });
    },

    
    clearSession(): void {
      patchState(store, initialState);
    },

   
    hasAnyRole(...roles: string[]): boolean {
      const currentRole = store.role();
      return currentRole !== null && roles.includes(currentRole);
    },
  })),
);