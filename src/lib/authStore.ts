import { writable } from 'svelte/store';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// Store awal: loading true biar gak 'flicker' pas baru load halaman
export const authStore = writable<AuthState>({
  user: null,
  loading: true,
});

// Listener Firebase Auth
onAuthStateChanged(auth, (currentUser) => {
  authStore.set({
    user: currentUser,
    loading: false,
  });
});

// Helper Functions
export async function loginWithGoogle(): Promise<void> {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Gagal Login:", error);
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Gagal Logout:", error);
  }
}