import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function useAuth() {
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (error) {
      console.log("An error occurred while authenticating the user:", error);
    }
  }, [error]);

  return { user, loading };
}

export { auth, useAuth, db };

// const googleProvider = new GoogleAuthProvider();
// const microsoftProvider = new OAuthProvider("microsoft.com");
// .setCustomParameters({
//   prompt: "consent",
//   tenant: process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID,
// });
