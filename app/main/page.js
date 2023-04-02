"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import { auth, useAuth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

const inter = Inter({ subsets: ["latin"] });

function Main() {
  const { user, loading: authLoading } = useAuth(); //i changed it for conflicts with useCollection.
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [label, setLabel] = useState("");

  //! to test if it works orginally it was const [notes, loading, error] i changed it for conflicts with useAuth.
  const [notes, notesLoading, notesError] = useCollectionData(
    collection(db, `users/${user?.uid}/notes`),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("user signed out");
    } catch (error) {
      console.error(error);
    }
  };

  if (authLoading) {
    // Show loading spinner or something similar
    return <div>Loading...</div>;
  }
  if (!user) {
    // User is not authenticated yet
    router.push("/login");
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Title:", title);
    console.log("Content:", content);
    console.log("Label:", label);
    // TODO: Save note to database
    setTitle("");
    setContent("");
    setLabel("");
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setTitle("");
    setContent("");
    setLabel("");
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-gray-700 font-bold mb-2"
          >
            Content
          </label>
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows="3"
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="label" className="block text-gray-700 font-bold mb-2">
            Label
          </label>
          <select
            name="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select a label</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="study">Study</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </form>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}

export default Main;
