import { initializeApp, getApps } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, type User } from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)

export interface UserData {
  uid: string
  email: string
  name: string
  userType: "agency" | "client"
}

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  userType: "agency" | "client",
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    await setDoc(doc(db, "users", user.uid), {
      email,
      name,
      userType,
    })
    return user
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      throw new Error("E-mail já cadastrado")
    }
    throw error
  }
}

export const loginUser = async (email: string, password: string): Promise<UserData> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData
      return {
        uid: user.uid,
        email: user.email!,
        name: userData.name,
        userType: userData.userType,
      }
    } else {
      throw new Error("User data not found")
    }
  } catch (error: any) {
    if (error.code === "auth/wrong-password") {
      throw new Error("Senha incorreta")
    } else if (error.code === "auth/user-not-found") {
      throw new Error("Usuário não encontrado")
    }
    throw error
  }
}

export const fetchUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    } else {
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export { auth, db }

