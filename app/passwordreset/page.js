"use client";

import React, { useState } from "react";
import { auth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  //   const [message, setMessage] = useState(null);

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      //   setMessage("Password reset email sent. Check your inbox.");
      alert("Password reset email sent, check your inbox.");
    } catch (error) {
      console.error(error);
      //   setMessage(error.message);
      alert(error.message);
    }
  };

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-xl lg:max-w-xl">
        <h1 className="text-2xl font-semibold text-center text-blue-700">
          Reset Password
        </h1>
        <form onSubmit={handlePasswordReset}>
          <div className="mb-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-800"
            >
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              className="block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
            />
          </div>
          <div className="mt-6">
            <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-700 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
