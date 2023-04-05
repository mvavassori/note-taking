"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import { auth, useAuth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import {
  useCollection,
  useCollectionData,
} from "react-firebase-hooks/firestore";

const inter = Inter({ subsets: ["latin"] });

function Main() {
  const { user, loading: authLoading } = useAuth(); //i changed it for conflicts with useCollection.
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const [notes, notesLoading, notesError] = useCollectionData(
    collection(db, `users/${user?.uid}/notes`),
    { idField: "id", snapshotListenOptions: { includeMetadataChanges: true } }
  );

  // fetch labels
  const [labels] = useCollectionData(
    collection(db, `users/${user?.uid}/labels`),
    { idField: "id" }
  );

  if (authLoading) {
    // Show loading spinner or something similar
    return <div>Loading...</div>;
  }
  if (!user) {
    // User is not authenticated yet
    router.push("/login");
    return null;
  }

  if (notesError) {
    console.error(notesError);
  }
  if (!notesLoading && notes) {
    notes.map((doc) => console.log(doc));
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("user signed out");
    } catch (error) {
      console.error(error);
    }
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   if (!title || !content || !label) return;
  //   try {
  //     const note = {
  //       title,
  //       content,
  //       label,
  //       created_at: serverTimestamp(),
  //       updated_at: serverTimestamp(),
  //     };
  //     await addDoc(collection(db, `users/${user?.uid}/notes`), note);
  //     setTitle("");
  //     setContent("");
  //     setLabel("");
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleSaveNote = async (event) => {
    event.preventDefault();
    try {
      const noteRef = await addDoc(collection(db, `users/${user?.uid}/notes`), {
        title,
        content,
        label: selectedLabel || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      console.log("Note added with ID: ", noteRef.id);
      setTitle("");
      setContent("");
      setSelectedLabel("");
    } catch (error) {
      console.error("Error adding note: ", error);
    }
  };

  const handleCreateLabel = async (event) => {
    event.preventDefault();
    try {
      await addDoc(collection(db, `users/${user?.uid}/labels`), {
        name: newLabel,
      });
      console.log("Label created: ", newLabel);
      setNewLabel("");
    } catch (error) {
      console.error("Error creating label: ", error);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setTitle("");
    setContent("");
    setLabel("");
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSaveNote}>
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
        {/* <div className="mb-4">
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
        </div> */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Label:</label>
          {labels && (
            <select
              className="w-full px-3 py-2 border rounded"
              value={selectedLabel}
              onChange={(event) => setSelectedLabel(event.target.value)}
            >
              <option value="">-- Select label --</option>
              {labels.map((label) => (
                <option key={label.id} value={label.name}>
                  {label.name}
                </option>
              ))}
            </select>
          )}
          <button onClick={() => setSelectedLabel("")}>Clear</button>
        </div>
        <div>
          <label>Create label:</label>
          <input
            type="text"
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
          />
          <button onClick={handleCreateLabel}>Create</button>
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
