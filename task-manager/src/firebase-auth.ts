import {getAuth
  , signInWithEmailAndPassword
  , createUserWithEmailAndPassword
  , signInWithPopup
  , GoogleAuthProvider
  , signOut} from 'firebase/auth'
import app from './firebase-config';

const auth = getAuth(app);

export const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error(error);
      throw new Error('Login failed');
    }
};

export const signUpWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email is already in use');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else {
        throw new Error('Sign Up failed');
      }
    }
};

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try{
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error(error);
        throw new Error('Google sign-up failed');
    }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};