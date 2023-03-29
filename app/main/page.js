"use client";

import { Inter } from "next/font/google";
import { auth, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function Main() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push("/");
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("user signed out");
    } catch (error) {
      console.error(error);
    }
  };

  // return (
  //   <main>
  //     <h2 className="text-2xl font-bold underline">{user.displayName}</h2>
  //     <button onClick={handleSignOut}>Sign Out</button>
  //   </main>
  // );
  return (
    <main>
      {user ? (
        <>
          <h2 className="text-2xl font-bold underline">{user.displayName}</h2>
          <button onClick={handleSignOut}>Sign Out</button>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </main>
  );
}
