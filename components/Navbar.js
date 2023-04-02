"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/firebase";

export default function Navbar() {
  const { user, loading } = useAuth();

  if (user) {
    return (
      <div className="flex justify-between p-2 bg-blue-400">
        <Link href="/">Logo</Link>
        <Link href="/main">Main</Link>
        <span>{user.email}</span>
      </div>
    );
  }
  return (
    <div className="flex justify-between p-2 bg-blue-400">
      <Link href="/">Logo</Link>
      <Link href="/main">Main</Link>
      <Link href="/login">Log in</Link>
    </div>
  );
}
