import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'

// Firebase configuration
// These values should be moved to environment variables in production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "taskforge-addb3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "taskforge-addb3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "taskforge-addb3.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication
export const auth = getAuth(app)

// Auth providers
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()

// Auth functions
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider)
export const loginWithGithub = () => signInWithPopup(auth, githubProvider)
export const loginWithEmail = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password)
export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password)
export const logout = () => signOut(auth)

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback)

// Sync user with backend database
export const syncUserWithBackend = async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    const token = await user.getIdToken()
    const response = await fetch('http://localhost:5000/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('Failed to sync user with backend:', response.statusText)
    }
  } catch (error) {
    console.error('Error syncing user with backend:', error)
  }
}

export type { User }
