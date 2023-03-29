"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider, microsoftProvider, useAuth } from "@/firebase";
import { signInWithPopup } from "firebase/auth";

export default function Login() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    router.push("/main");
  }

  const handleGoogleSignIn = async () => {
    console.log("google sign in button clicked");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userInfo = result.user;
      // const idToken = await userInfo.getIdToken();
      console.log("userInfo", userInfo);
      const response = await fetch("/api/customtoken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: userInfo.uid }),
      });
      const customToken = await response.json();
      console.log("customToken", customToken);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMicrosoftSignIn = async () => {
    console.log("microsoft sign in button clicked");
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const userInfo = result.user;
      const idToken = await userInfo.getIdToken();
      console.log(userInfo);
      console.log("ID token:", idToken);
    } catch (error) {
      alert(error.message);
      console.log(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="py-2 px-4 flex justify-center items-center bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
          >
            <svg
              width="20"
              height="20"
              fill="currentColor"
              className="mr-2"
              viewBox="0 0 1792 1792"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M896 786h725q12 67 12 128 0 217-91 387.5t-259.5 266.5-386.5 96q-157 0-299-60.5t-245-163.5-163.5-245-60.5-299 60.5-299 163.5-245 245-163.5 299-60.5q300 0 515 201l-209 201q-123-119-306-119-129 0-238.5 65t-173.5 176.5-64 243.5 64 243.5 173.5 176.5 238.5 65q87 0 160-24t120-60 82-82 51.5-87 22.5-78h-436v-264z"></path>
            </svg>
            Continue with Google
          </button>
        </div>
        <div>
          <button
            onClick={handleMicrosoftSignIn}
            type="button"
            className="py-2 px-4 flex justify-center items-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
          >
            <svg
              fill="currentColor"
              className="mr-2"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path d="M2 3h9v9H2V3m9 19H2v-9h9v9M21 3v9h-9V3h9m0 19h-9v-9h9v9Z" />
            </svg>
            Continue with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}
