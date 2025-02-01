import { initializeApp, getApps, type FirebaseOptions } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, type User } from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
let app
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig)
    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Error initializing Firebase:", error)
    throw new Error("Failed to initialize Firebase. Check your configuration.")
  }
} else {
  app = getApps()[0]
}

const auth = getAuth(app)
const db = getFirestore(app)

export interface UserData {
  uid: string
  email: string
  name: string
  userType: "agency" | "client"
  createdAt: any
  activeClients?: number
  activeCampaigns?: number
  averageROI?: number
  associatedAgency?: any
  activeServices?: any[]
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
      createdAt: serverTimestamp(),
      ...(userType === "agency"
        ? { activeClients: 0, activeCampaigns: 0, averageROI: 0 }
        : { associatedAgency: null, activeServices: [] }),
    })
    console.log("User registered successfully:", user.uid)
    return user
  } catch (error: any) {
    console.error("Error registering user:", error)
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
      console.log("User logged in successfully:", user.uid)
      return {
        uid: user.uid,
        email: user.email!,
        name: userData.name,
        userType: userData.userType,
        createdAt: userData.createdAt,
        activeClients: userData.activeClients,
        activeCampaigns: userData.activeCampaigns,
        averageROI: userData.averageROI,
        associatedAgency: userData.associatedAgency,
        activeServices: userData.activeServices,
      }
    } else {
      console.error("User data not found for:", user.uid)
      throw new Error("User data not found")
    }
  } catch (error: any) {
    console.error("Error logging in:", error)
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
      console.log("User data fetched successfully for:", userId)
      return userDoc.data() as UserData
    } else {
      console.error("User data not found for:", userId)
      return null
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

export { auth, db }

