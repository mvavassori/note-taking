"use client";

import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const handleTestRoute = async () => {
    try {
      const response = await fetch("/api/testroute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg: "ciao" }),
      });
      const testRouteResponse = await response.json();
      console.log("testRouteResponse", testRouteResponse);
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <main>
      <h1 className="text-2xl font-bold underline">
        Home page of the application, i will render this page when the user is
        not signed in.
      </h1>
      <button onClick={handleTestRoute}>handleTestRoute</button>
    </main>
  );
}
