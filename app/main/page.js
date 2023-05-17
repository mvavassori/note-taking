"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth, db } from "@/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  arrayRemove,
  addDoc,
  limit,
  getDocs,
  startAfter,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Linkify from "react-linkify";
import CreateNote from "@/components/CreateNote";
import Sidebar from "@/components/Sidebar";
import NoteModal from "@/components/NoteModal";
import InfiniteScroll from "react-infinite-scroll-component";

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

export const CustomLink = (props) => {
  const handleClick = (event) => {
    event.stopPropagation();
  };

  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "underline" }}
      onClick={handleClick}
    >
      {props.children}
    </a>
  );
};

function Main() {
  const { user, loading: authLoading } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  // const labelQuery = searchParams.get("label");

  // const [notesWithLabelNames, setNotesWithLabelNames] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState({});
  const [currentNoteLabelObjects, setCurrentNoteLabelObjects] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState("");

  const [notes, setNotes] = useState([]);
  const [hasMoreNotes, setHasMoreNotes] = useState(true);
  const [lastVisibleNote, setLastVisibleNote] = useState(null);
  const [lastScrollVisibleNote, setLastScrollVisibleNote] = useState(null);
  const [lastFetchedNote, setLastFetchedNote] = useState(null);

  const labelsRef = query(
    collection(db, `users/${user?.uid}/labels`).withConverter(labelsConverter),
    orderBy("name", "asc")
  );
  const [labelsData] = useCollectionData(labelsRef);

  // Fetch notes with label IDs
  // const notesRef = query(
  //   collection(db, `users/${user?.uid}/notes`).withConverter(notesConverter),
  //   orderBy("updated_at", "desc"),
  //   limit(5)
  // );
  // const [notesData] = useCollectionData(notesRef);

  // const getNoteWithLabelNames = useCallback(
  //   (note) => {
  //     console.log("note.labels", note.labels);
  //     const labelNames = note.labels
  //       .map(
  //         (labelId) => labelsData.find((label) => label.id === labelId)?.name
  //       )
  //       .filter((labelName) => labelName !== undefined);

  //     return {
  //       id: note.id,
  //       ...note,
  //       labels: labelNames,
  //     };
  //   },
  //   [labelsData]
  // );

  // const filteredNotes = useMemo(() => {
  //   if (!labelQuery) {
  //     return notesWithLabelNames;
  //   }
  //   // Find the label name corresponding to the selected label id
  //   const selectedLabelName = labelsData?.find(
  //     (label) => label.id === labelQuery
  //   )?.name;
  //   // Filter the notes based on the selected label name
  //   return notesWithLabelNames.filter((note) =>
  //     note.labels.includes(selectedLabelName)
  //   );
  // }, [notesWithLabelNames, labelQuery, labelsData]);

  // useEffect(() => {
  //   if (notes && labelsData) {
  //     const updatedNotesWithLabelNames = notesWithLabelNames.map(getNoteWithLabelNames);
  //     setNotesWithLabelNames(updatedNotesWithLabelNames);
  //   }
  // }, [notes, labelsData, getNoteWithLabelNames]);

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
    const fetchNotes = async () => {
      if (user?.uid) {
        const labels = await fetchLabels(); // Fetch labels here

        const notesRef = query(
          collection(db, `users/${user?.uid}/notes`).withConverter(
            notesConverter
          ),
          orderBy("updated_at", "desc"),
          limit(5)
        );

        const snapshot = await getDocs(notesRef);

        if (!snapshot.empty) {
          const lastVisible = snapshot.docs[snapshot.docs.length - 1];
          const newNotes = snapshot.docs.map((doc) => {
            const note = doc.data();
            note.labels = getLabelNames(note.labels, labels); // Pass labels here
            return note;
          });

          setLastVisibleNote(lastVisible);
          setLastScrollVisibleNote(lastVisible);
          setNotes(newNotes);
        } else {
          setHasMoreNotes(false);
        }
      }
    };

    setNotes([]);

    if (user?.uid) {
      fetchNotes();
    }
  }, [user?.uid]);

  // useEffect(() => {
  //   const fetchNotes = async () => {
  //     if (user?.uid && labelsData) {
  //       const notesRef = query(
  //         collection(db, `users/${user?.uid}/notes`).withConverter(
  //           notesConverter
  //         ),
  //         orderBy("updated_at", "desc"),
  //         limit(5)
  //       );

  //       const snapshot = await getDocs(notesRef);

  //       if (!snapshot.empty) {
  //         const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  //         const newNotes = snapshot.docs.map((doc) => {
  //           const note = doc.data();
  //           note.labels = getLabelNames(note.labels);
  //           return note;
  //         });

  //         setLastVisibleNote(lastVisible);
  //         setLastScrollVisibleNote(lastVisible);
  //         setNotes(newNotes);
  //       } else {
  //         setHasMoreNotes(false);
  //       }
  //     }
  //   };

  //   setNotes([]);

  //   if (user?.uid && labelsData) {
  //     fetchNotes();
  //   }
  // }, [user?.uid, labelsData]);

  const fetchMoreNotes = async () => {
    const labels = await fetchLabels(); // Fetch labels here
    const nextNotesRef = query(
      collection(db, `users/${user?.uid}/notes`).withConverter(notesConverter),
      orderBy("updated_at", "desc"),
      startAfter(lastFetchedNote || lastVisibleNote),
      limit(5)
    );

    const snapshot = await getDocs(nextNotesRef);

    if (!snapshot.empty) {
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const newNotes = snapshot.docs.map((doc) => {
        const note = doc.data();
        note.labels = getLabelNames(note.labels, labels);
        return note;
      });

      setLastFetchedNote(lastVisible);
      setNotes((prevNotes) => [...prevNotes, ...newNotes]);
    } else {
      setHasMoreNotes(false);
    }
  };

  // const getLabelNames = (labelIds) => {
  //   return labelIds
  //     .map((id) => {
  //       const label = labelsData?.find((label) => label.id === id);
  //       return label ? label.name : null;
  //     })
  //     .filter((name) => name); // This will remove any null values
  // };

  const getLabelNames = (labelIds, labels) => {
    return labelIds.map((id) => labels?.find((label) => label.id === id)?.name);
  };

  const fetchLabels = async () => {
    const labelsRef = query(
      collection(db, `users/${user?.uid}/labels`).withConverter(
        labelsConverter
      ),
      orderBy("name", "asc")
    );

    const labelsSnapshot = await getDocs(labelsRef);
    const labels = labelsSnapshot.docs.map((doc) => doc.data());
    return labels;
  };

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

  const createNote = async (newNote) => {
    // Add the new note to the notes collection
    try {
      const newNoteData = {
        title: newNote.title,
        content: newNote.content,
        labels: getLabelNames(newNote.labels),
        links: newNote.links,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, `users/${user?.uid}/notes`), {
        title: newNote.title,
        content: newNote.content,
        labels: newNote.labels,
        links: newNote.links,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      // Include the new note at the beginning of the notes list
      setNotes((prevNotes) => [
        { id: docRef.id, ...newNoteData },
        ...prevNotes,
      ]);
    } catch (error) {
      console.error("Error adding note: ", error);
    }
  };

  const updateNote = async (updatedNote) => {
    try {
      const noteRef = doc(db, `users/${user?.uid}/notes`, updatedNote.id);
      const updatedData = {
        title: updatedNote.title,
        content: updatedNote.content,
        labels: getLabelNames(updatedNote.labels),
        updated_at: serverTimestamp(),
      };
      await updateDoc(noteRef, {
        title: updatedNote.title,
        content: updatedNote.content,
        labels: updatedNote.labels,
        updated_at: serverTimestamp(),
      });

      // Create a new note object that merges the old note with the updated fields
      const newNote = { ...updatedNote, ...updatedData };

      // Manually update the notes state
      setNotes((prevNotes) => {
        // Remove the updated note from its current position in the array
        const newNotes = prevNotes.filter((note) => note.id !== updatedNote.id);

        // Add the updated note to the beginning of the array
        newNotes.unshift(newNote);

        return newNotes;
      });
    } catch (error) {
      console.error("Error updating the note: ", error);
    }
  };

  const deleteNote = async (noteId) => {
    console.log("deleteNote clicked");
    try {
      const noteRef = doc(db, `users/${user?.uid}/notes`, noteId);
      await deleteDoc(noteRef);
      console.log("Note deleted successfully.", noteId);
      // Remove the deleted note from the notes state
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error deleting the note: ", error);
    }
  };

  const updateLabel = async (labelId, newLabelName) => {
    try {
      const labelRef = doc(db, `users/${user?.uid}/labels`, labelId);
      await updateDoc(labelRef, { name: newLabelName });
      // Update labelsData in the parent component's state after updating Firestore.
    } catch (error) {
      console.error("Error updating the label: ", error);
    }
  };

  const deleteLabel = async (labelId) => {
    try {
      const labelRef = doc(db, `users/${user?.uid}/labels`, labelId);
      await deleteDoc(labelRef);
    } catch (error) {
      console.error("Error deleting the label: ", error);
    }
  };

  const createLabel = async (newLabelName) => {
    const isDuplicate = labelsData.some((label) => label.name === newLabelName);

    if (isDuplicate) {
      alert(
        "A label with this name already exists. Please choose a different name."
      );
      return;
    }

    // Create a new label
    try {
      await addDoc(collection(db, `users/${user?.uid}/labels`), {
        name: newLabelName,
      });
    } catch (error) {
      console.error("Error creating the label: ", error);
    }
  };

  if (authLoading) {
    // Loading spinner
    return (
      <div className="flex justify-center items-center w-full h-[calc(100vh-4rem)]">
        <div className="my-spinner w-5 h-5 border-t-2 border-zinc-50 border-solid rounded-full"></div>
      </div>
    );
  }
  if (!user) {
    // User is not authenticated yet
    router.push("/login");
    return null;
  }

  return (
    <div className="flex bg-zinc-800 px-2">
      <Sidebar
        labelsData={labelsData}
        updateLabel={updateLabel}
        deleteLabel={deleteLabel}
        onCreateLabel={createLabel}
      />
      <div className="w-full pl-64">
        <CreateNote
          labelsData={labelsData}
          onCreateLabel={createLabel}
          onCreateNote={createNote}
        />
        <div className="my-12 px-10">
          <InfiniteScroll
            dataLength={notes.length} //This is important field to render the next data
            next={fetchMoreNotes}
            hasMore={hasMoreNotes}
            loader={<h4>Loading...</h4>}
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>End of notes</b>
              </p>
            }
          >
            {notes?.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  console.log(note);
                  setCurrentNote(note);
                  setShowNoteModal(true);
                }}
                className="relative bg-zinc-900 p-4 rounded shadow mb-6 note-hover border-2 border-transparent hover:border-zinc-200 text-white"
              >
                {/* Note title */}
                {note.title && (
                  <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                )}
                {/* Note content */}
                <p className="text-zinc-200 mb-2 overflow-hidden whitespace-nowrap overflow-ellipsis">
                  <Linkify
                    componentDecorator={(decoratedHref, decoratedText, key) => (
                      <CustomLink key={key} href={decoratedHref}>
                        {decoratedText}
                      </CustomLink>
                    )}
                  >
                    {note.content}
                  </Linkify>
                </p>
                {/* Note labels */}
                <div className="flex flex-wrap">
                  <div className="flex flex-wrap">
                    {note.labels.map((labelName) => {
                      // const labelId = labelsData?.find(
                      //   (label) => label.name === labelName
                      // )?.id;
                      return (
                        <div
                          key={labelName}
                          className="relative flex items-center bg-gray-200 rounded px-2 py-1 mr-2 mb-2 label-hover"
                        >
                          <span className="px-1 py-0.5 text-xs text-gray-700 bg-gray-200 rounded-full truncate transition-all duration-200">
                            {labelName}
                          </span>
                          <button
                            className="absolute right-0 mr-1 focus:outline-none opacity-0 label-hover-child transition-opacity duration-200 bg-zinc-900 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("note.id", note.id);
                              console.log("labelId", labelId);
                              console.log("labelsData", labelsData);
                              // removeLabelFromNote(note.id, labelId);
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
                    onMouseEnter={() =>
                      setActiveTooltip(`deleteNote-${note.id}`)
                    }
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
          </InfiniteScroll>
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
