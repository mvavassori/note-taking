"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { auth, useAuth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import CreateNote from "@/components/CreateNote";
import Sidebar from "@/components/Sidebar";
import NoteModal from "@/components/NoteModal";

//used to get document ids of the labels
const myConverter = {
  toFirestore(label) {
    return {
      name: label.name,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
    };
  },
};

function Main() {
  const { user, loading: authLoading } = useAuth();

  const labelsRef = collection(db, `users/${user?.uid}/labels`).withConverter(
    myConverter
  );
  const [labelsData] = useCollectionData(labelsRef);

  // Fetch notes with label IDs
  const notesRef = query(
    collection(db, `users/${user?.uid}/notes`),
    orderBy("updated_at", "desc")
  );
  const [notesData] = useCollectionData(notesRef);

  const router = useRouter();
  const [labels, setLabels] = useState([]);
  const [notes, setNotes] = useState([]);
  const [notesWithLabelNames, setNotesWithLabelNames] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState({});

  const getNoteWithLabelNames = useCallback(
    (note) => {
      const labelNames = note.labels
        .map(
          (labelId) => labelsData.find((label) => label.id === labelId)?.name
        )
        .filter((labelName) => labelName !== undefined);

      return {
        ...note,
        labels: labelNames,
      };
    },
    [labelsData]
  );

  useEffect(() => {
    if (labelsData) {
      setLabels(
        labelsData.map((labelData) => ({
          id: labelData.id,
          name: labelData.name,
        }))
      );
    }
  }, [labelsData]);

  useEffect(() => {
    if (notesData) {
      setNotes(notesData);
    }
  }, [notesData]);

  useEffect(() => {
    if (notesData && labelsData) {
      const updatedNotesWithLabelNames = notesData.map(getNoteWithLabelNames);
      setNotesWithLabelNames(updatedNotesWithLabelNames);
    }
  }, [notesData, labelsData, getNoteWithLabelNames]);

  const getNotes = () => {
    console.log(notes);
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("user signed out");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex bg-zinc-900 px-2">
      <Sidebar labelsData={labelsData} />
      <div className="w-4/5 ml-1-5-vw">
        <CreateNote labelsData={labelsData} />
        <div className="my-12">
          {notesWithLabelNames?.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                setCurrentNote(note);
                setShowNoteModal(true);
              }}
              className="bg-white p-4 rounded shadow mb-4"
            >
              {/* Note title */}
              {note.title && (
                <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
              )}
              {/* Note content */}
              <p className="text-gray-700 mb-2 overflow-hidden whitespace-nowrap overflow-ellipsis">
                {note.content}
              </p>
              {/* Note labels */}
              <div className="flex flex-wrap">
                {note.labels.map((labelName) => (
                  <div
                    key={labelName}
                    className="relative flex items-center bg-gray-200 rounded px-2 py-1 mr-2 mb-2 group"
                  >
                    <span className="px-2 py-0.5 text-sm text-gray-700 bg-gray-200 rounded-full truncate transition-all duration-200 group-hover:mr-4">
                      {labelName}
                    </span>
                    <button
                      className="absolute right-0 mr-1 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLabelFromNote(note.id, labelName);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6L6.4 19Z"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="my-24">
          <button className="bg-red-400" onClick={handleSignOut}>
            Sign Out
          </button>
          <button className="bg-green-400" onClick={getNotes}>
            getNotes
          </button>
        </div>
      </div>
      <NoteModal
        showNoteModal={showNoteModal}
        setShowNoteModal={setShowNoteModal}
        currentNote={currentNote}
        labelsData={labelsData}
      />
    </div>
  );
}

export default Main;
