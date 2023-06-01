"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/firebase";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      // If user is already signed in, redirect to the protected page
      router.replace("/main");
    }
  }, [router, user]);

  if (loading) {
    // Show loading spinner or something similar
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Note Taking App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-white">
          Welcome to <span className="text-blue-600">Note Taking App!</span>
        </h1>
        <p className="mt-3 text-2xl text-zinc-400">
          The best place to take and organize your notes.
        </p>
        <div className="flex items-center mt-6">
          <Link
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            href="/signup"
          >
            Get Started
          </Link>
        </div>
      </main>
      <footer className="w-full h-20 flex justify-center items-center border-t">
        <Link
          className="flex items-center justify-center text-zinc-400"
          href="https://github.com/mvavassori"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Marco Vavassori
        </Link>
      </footer>
    </div>
  );
}
