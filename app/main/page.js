"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { auth, useAuth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import CreateNote from "@/components/CreateNote";
import Sidebar from "@/components/Sidebar";
import NoteModal from "@/components/NoteModal";

//used to get document ids of the labels
const labelsConverter = {
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

//used to get document ids of the labels
const notesConverter = {
  toFirestore(note) {
    return {
      title: note.title,
      content: note.content,
      labels: note.labels,
      links: note.links,
      created_at: note.created_at,
      updated_at: note.updated_at,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: data.title,
      content: data.content,
      labels: data.labels,
      links: data.links,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },
};

function Main() {
  const { user, loading: authLoading } = useAuth();

  const labelsRef = collection(db, `users/${user?.uid}/labels`).withConverter(
    labelsConverter
  );
  const [labelsData] = useCollectionData(labelsRef);

  // Fetch notes with label IDs
  const notesRef = query(
    collection(db, `users/${user?.uid}/notes`).withConverter(notesConverter),
    orderBy("updated_at", "desc")
  );
  const [notesData] = useCollectionData(notesRef);

  const router = useRouter();
  const [notesWithLabelNames, setNotesWithLabelNames] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState({});
  const [currentNoteLabelObjects, setCurrentNoteLabelObjects] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState("");

  const getNoteWithLabelNames = useCallback(
    (note) => {
      const labelNames = note.labels
        .map(
          (labelId) => labelsData.find((label) => label.id === labelId)?.name
        )
        .filter((labelName) => labelName !== undefined);

      return {
        id: note.id,
        ...note,
        labels: labelNames,
      };
    },
    [labelsData]
  );

  const filteredNotes = useMemo(() => {
    if (!selectedLabel) {
      return notesWithLabelNames;
    }

    // Find the label name corresponding to the selected label id
    const selectedLabelName = labelsData?.find(
      (label) => label.id === selectedLabel
    )?.name;

    // Filter the notes based on the selected label name
    return notesWithLabelNames.filter((note) =>
      note.labels.includes(selectedLabelName)
    );
  }, [notesWithLabelNames, selectedLabel, labelsData]);

  useEffect(() => {
    if (notesData && labelsData) {
      const updatedNotesWithLabelNames = notesData.map(getNoteWithLabelNames);
      setNotesWithLabelNames(updatedNotesWithLabelNames);
    }
  }, [notesData, labelsData, getNoteWithLabelNames]);

  useEffect(() => {
    if (currentNote && currentNote.labels && labelsData) {
      const newCurrentNoteLabelObjects = getLabelObjects(
        currentNote.labels,
        labelsData
      );
      setCurrentNoteLabelObjects(newCurrentNoteLabelObjects);
    }
  }, [currentNote, labelsData]);

  useEffect(() => {
    if (notesWithLabelNames && filteredNotes) {
      console.log("notesWithLabelNames", notesWithLabelNames);
      console.log("filteredNotes", filteredNotes);
    }
  }, [filteredNotes, notesWithLabelNames]);

  const getLabelObjects = (currentNoteLabels, allLabelsData) => {
    return currentNoteLabels
      .map((labelName) => {
        const foundLabel = allLabelsData.find(
          (label) => label.name === labelName
        );
        if (foundLabel) {
          return {
            id: foundLabel.id,
            name: foundLabel.name,
          };
        } else {
          // If the label is not found in labelsData, return null or an empty object
          return null;
        }
      })
      .filter((label) => label !== null); // Filter out null values if any
  };

  // Function to set the currently selected label
  const handleLabelClick = (labelId) => {
    setSelectedLabel(labelId);
    console.log(selectedLabel);
  };

  const removeLabelFromNote = async (noteId, labelId) => {
    try {
      const noteRef = doc(db, `users/${user?.uid}/notes`, noteId);
      await updateDoc(noteRef, {
        labels: arrayRemove(labelId),
      });
    } catch (error) {
      console.error("Error removing the label from the note: ", error);
    }
  };

  const updateNote = async (updatedNote) => {
    const noteRef = doc(db, `users/${user?.uid}/notes`, updatedNote.id);
    const updatedData = {
      title: updatedNote.title,
      content: updatedNote.content,
      labels: updatedNote.labels,
      updated_at: serverTimestamp(),
    };
    await updateDoc(noteRef, updatedData);
  };

  const deleteNote = async (noteId) => {
    try {
      const noteRef = doc(db, `users/${user?.uid}/notes`, noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error("Error deleting the note: ", error);
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
      <Sidebar labelsData={labelsData} onLabelClick={handleLabelClick} />
      <div className="w-4/5 ml-1-5-vw">
        <CreateNote labelsData={labelsData} />
        <div className="group relative m-12 flex justify-center">
          <button className="rounded bg-amber-500 px-4 py-2 text-sm text-white shadow-sm">
            Hover me!
          </button>
          <span className="absolute top-10 opacity-0 transition ease-in-out duration-200 rounded bg-gray-800 p-2 text-xs text-white group-hover:opacity-100">
            ✨ You hover me!
          </span>
        </div>

        <div className="my-12 px-10">
          {filteredNotes?.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                console.log(note.id);
                setCurrentNote(note);
                setShowNoteModal(true);
              }}
              className="relative bg-white p-4 rounded shadow mb-6 cursor-pointer note-hover"
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
                <div className="flex flex-wrap">
                  {note.labels.map((labelName) => {
                    const labelId = labelsData?.find(
                      (label) => label.name === labelName
                    )?.id;
                    return (
                      <div
                        key={labelName}
                        className="relative flex items-center bg-gray-200 rounded px-2 py-1 mr-2 mb-2 label-hover"
                      >
                        <span className="px-1 py-0.5 text-xs text-gray-700 bg-gray-200 rounded-full truncate transition-all duration-200">
                          {labelName}
                        </span>
                        <button
                          className="absolute right-0 mr-1 focus:outline-none opacity-0 label-hover-child transition-opacity duration-200 bg-zinc-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLabelFromNote(note.id, labelId);
                          }}
                          onMouseEnter={() =>
                            setActiveTooltip(
                              `removeLabel-${note.id}-${labelId}`
                            )
                          }
                          onMouseLeave={() => setActiveTooltip("")}
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
                        <span
                          className={`absolute top-auto mt-3 right-0 bg-zinc-700 text-white text-xs px-2 py-1 rounded ${
                            activeTooltip ===
                            `removeLabel-${note.id}-${labelId}`
                              ? "opacity-100"
                              : "opacity-0"
                          } transition-opacity duration-200`}
                        >
                          Remove Label
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Delete note button */}
              <div>
                <button
                  className="absolute bottom-0 right-0 m-1 focus:outline-none opacity-0 note-hover-child transition-opacity duration-200 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  onMouseEnter={() => setActiveTooltip(`deleteNote-${note.id}`)}
                  onMouseLeave={() => setActiveTooltip("")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"
                    />
                  </svg>
                </button>
                {/* Tooltip for Delete Note button */}
                <span
                  className={`absolute top-auto mt-3 right-0 bg-zinc-700 text-white text-xs px-2 py-1 rounded ${
                    activeTooltip === `deleteNote-${note.id}`
                      ? "opacity-100"
                      : "opacity-0"
                  } transition-opacity duration-200`}
                >
                  Delete Note
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-24">
          <button className="bg-red-400" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
      <NoteModal
        showNoteModal={showNoteModal}
        setShowNoteModal={setShowNoteModal}
        currentNote={currentNote}
        labelsData={labelsData}
        onUpdateNote={updateNote}
        currentNoteLabelObjects={currentNoteLabelObjects}
      />
    </div>
  );
}

export default Main;
