"use client";

import { useState, useEffect, useRef } from "react";
import { Inter } from "next/font/google";
import { auth, useAuth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { serverTimestamp, addDoc, doc, collection } from "firebase/firestore";
import {
  // useCollection,
  useCollectionData,
} from "react-firebase-hooks/firestore";
import TextareaAutosize from "react-textarea-autosize";

function Main() {
  const { user, loading: authLoading } = useAuth(); //i changed it for conflicts with useCollection.
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [showTitleAndButtons, setShowTitleAndButtons] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [labels, setLabels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [labelExists, setLabelExists] = useState(false);
  // const [currentLabel, setCurrentLabel] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [selectedLabels, setSelectedLabels] = useState([]);

  const modalRef = useRef();
  const titleInputRef = useRef();
  const textAreaRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
        setSearchTerm("");
        // setCurrentLabel("");
      }

      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        (!titleInputRef.current ||
          !titleInputRef.current.contains(event.target)) &&
        (!textAreaRef.current || !textAreaRef.current.contains(event.target))
      ) {
        setShowTitleAndButtons(false);
      } else {
        setShowTitleAndButtons(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef, containerRef]);

  useEffect(() => {
    if (title.trim() === "" && content.trim() === "") {
      setSaveButtonDisabled(true);
    } else {
      setSaveButtonDisabled(false);
    }
  }, [title, content]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // setCurrentLabel(e.target.value);
    setLabelExists(
      labels.some(
        (label) => label.name.toLowerCase() === e.target.value.toLowerCase()
      )
    );
  };

  const addLabel = async () => {
    // try {
    //   await addDoc(collection(db, `users/${user?.uid}/labels`), {
    //     name: currentLabel,
    //   });
    // } catch (error) {
    //   console.error(error)
    // }

    const newLabel = { name: searchTerm, checked: true };
    setLabels([...labels, newLabel]);
    setSelectedLabels([...selectedLabels, searchTerm]);
    setSearchTerm("");
    setSearchTerm("");
  };

  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLabel = (labelName) => {
    const updatedLabels = labels.map((l) =>
      l.name === labelName ? { ...l, checked: !l.checked } : l
    );
    setLabels(updatedLabels);

    const selectedLabel = labels.find((l) => l.name === labelName);
    if (selectedLabel && selectedLabel.checked) {
      setSelectedLabels(selectedLabels.filter((l) => l !== labelName));
    } else {
      setSelectedLabels([...selectedLabels, labelName]);
    }
  };

  const handleCancel = () => {
    // Unselect all labels
    const unselectedLabels = labels.map((label) => ({
      ...label,
      checked: false,
    }));
    setLabels(unselectedLabels);
    setSelectedLabels([]);

    // Clear title and content
    setTitle("");
    setContent("");
    setShowTitleAndButtons(false);
  };

  const saveNote = async () => {
    const noteData = {
      title,
      content,
      labels: selectedLabels,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };
    // Add the new note to the notes collection
    try {
      // await db
      //   .collection("users")
      //   .doc(user?.uid)
      //   .collection("notes")
      //   .add(noteData);
      const noteRef = await addDoc(collection(db, `users/${user?.uid}/notes`), {
        noteData,
      });
      setTitle("");
      setContent("");
      setSelectedLabels([]);
      setShowTitleAndButtons(false);
    } catch (error) {
      console.error("Error adding note: ", error);
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

  // const [title, setTitle] = useState("");
  // const [content, setContent] = useState("");
  // const [selectedLabel, setSelectedLabel] = useState("");
  // const [newLabel, setNewLabel] = useState("");

  // const [notes, notesLoading, notesError] = useCollectionData(
  //   collection(db, `users/${user?.uid}/notes`),
  //   { idField: "id", snapshotListenOptions: { includeMetadataChanges: true } }
  // );

  // // fetch labels
  // const [labels] = useCollectionData(
  //   collection(db, `users/${user?.uid}/labels`),
  //   { idField: "id" }
  // );

  // if (authLoading) {
  //   // Show loading spinner or something similar
  //   return <div>Loading...</div>;
  // }
  // if (!user) {
  //   // User is not authenticated yet
  //   router.push("/login");
  //   return null;
  // }

  // if (notesError) {
  //   console.error(notesError);
  // }
  // if (!notesLoading && notes) {
  //   notes.map((doc) => console.log(doc));
  // }

  // const handleSignOut = async () => {
  //   try {
  //     await signOut(auth);
  //     console.log("user signed out");
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // // const handleSubmit = async (event) => {
  // //   event.preventDefault();
  // //   if (!title || !content || !label) return;
  // //   try {
  // //     const note = {
  // //       title,
  // //       content,
  // //       label,
  // //       created_at: serverTimestamp(),
  // //       updated_at: serverTimestamp(),
  // //     };
  // //     await addDoc(collection(db, `users/${user?.uid}/notes`), note);
  // //     setTitle("");
  // //     setContent("");
  // //     setLabel("");
  // //   } catch (error) {
  // //     console.error(error);
  // //   }
  // // };

  // const handleSaveNote = async (event) => {
  //   event.preventDefault();
  //   try {
  //     const noteRef = await addDoc(collection(db, `users/${user?.uid}/notes`), {
  //       title,
  //       content,
  //       label: selectedLabel || null,
  //       created_at: serverTimestamp(),
  //       updated_at: serverTimestamp(),
  //     });
  //     console.log("Note added with ID: ", noteRef.id);
  //     setTitle("");
  //     setContent("");
  //     setSelectedLabel("");
  //   } catch (error) {
  //     console.error("Error adding note: ", error);
  //   }
  // };

  // const handleCreateLabel = async (event) => {
  //   event.preventDefault();
  //   try {
  //     await addDoc(collection(db, `users/${user?.uid}/labels`), {
  //       name: newLabel,
  //     });
  //     console.log("Label created: ", newLabel);
  //     setNewLabel("");
  //   } catch (error) {
  //     console.error("Error creating label: ", error);
  //   }
  // };

  // const handleCancel = (e) => {
  //   e.preventDefault();
  //   setTitle("");
  //   setContent("");
  //   setLabel("");
  // };

  return (
    <div>
      <div
        ref={containerRef}
        className="relative p-2 max-w-lg mx-auto border border-gray-300 rounded-lg mt-8 shadow-lg"
      >
        {showTitleAndButtons && (
          <input
            ref={titleInputRef}
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-0 focus:border-none focus:ring-0 textarea-title"
            placeholder="Add title"
            autoComplete="no-autocomplete-please"
            maxLength={100}
          />
        )}
        <TextareaAutosize
          ref={textAreaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 focus:border-none focus:ring-0 textarea-content resize-none"
          placeholder="Take a note..."
          minRows={3}
        ></TextareaAutosize>
        {showTitleAndButtons && (
          <div className="flex flex-wrap items-center gap-1 p-1">
            {selectedLabels.map((labelName) => (
              <div
                key={labelName}
                className="relative flex items-center bg-gray-200 rounded px-2 py-1 group"
                style={{ minWidth: "max-content" }}
              >
                <span className="px-2 py-0.5 text-sm text-gray-700 bg-gray-200 rounded-full truncate transition-all duration-200 group-hover:mr-4">
                  {labelName}
                </span>
                <button
                  className="absolute right-0 mr-1 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLabel(labelName);
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
        )}
        {showTitleAndButtons && (
          <div className="flex justify-between w-full">
            <div>
              <button
                className={`px-2 rounded-full hover:bg-gray-100 ${
                  showModal ? "bg-gray-100" : ""
                }`}
                onClick={() => setShowModal(!showModal)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 19v-2h3l3.55-5L15 7H5v3H3V7q0-.825.588-1.413T5 5h10q.5 0 .938.225t.712.625L21 12l-4.35 6.15q-.275.4-.713.625T15 19h-3Zm-.225-7ZM5 20v-3H2v-2h3v-3h2v3h3v2H7v3H5Z"
                  />
                </svg>
              </button>
              <div
                className={`absolute py-1 px-2 text-xs text-white bg-gray-700 rounded ${
                  showTooltip ? "opacity-100" : "opacity-0"
                } transition ease-in-out duration-200`}
              >
                Add Label
              </div>
            </div>

            <div>
              <button
                className="py-1 px-2 mr-2 bg-white rounded hover:bg-gray-100 font-medium"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className={`py-1 px-2 bg-white rounded font-medium  ${
                  saveButtonDisabled
                    ? "opacity-50 cursor-not-allowed hover:bg-white hover:text-gray-black"
                    : "hover:bg-blue-100 hover:text-blue-700"
                }`}
                onClick={saveNote}
                disabled={saveButtonDisabled}
              >
                Save
              </button>
            </div>
          </div>
        )}
        {showModal && (
          <div
            ref={modalRef}
            className="absolute z-10 w-64 p-2 bg-white border border-gray-300 rounded shadow-xl overflow-y-auto max-h-64"
          >
            <input
              type="text"
              className="w-full p-1 mb-2 border border-gray-300 rounded"
              placeholder="Search or create labels"
              value={searchTerm}
              onChange={handleSearchChange}
              autoComplete="off"
            />
            <div>
              {filteredLabels.map((label) => (
                <div
                  key={label.name}
                  className="flex items-center mb-1 p-0.5 hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleLabel(label.name)}
                >
                  <input
                    type="checkbox"
                    id={label.name}
                    className="mr-2"
                    checked={label.checked}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleLabel(label.name);
                    }}
                  />
                  <label
                    htmlFor={label.name}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer"
                  >
                    {label.name}
                  </label>
                </div>
              ))}
            </div>
            {!labelExists && searchTerm !== "" && (
              <button
                className="w-full p-2 mt-2 text-sm bg-gray-200 hover:bg-gray-300 rounded text-left flex items-center justify-start"
                onClick={addLabel}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M11 19v-6H5v-2h6V5h2v6h6v2h-6v6h-2Z"
                  />
                </svg>
                <span className="ml-2">Create &quot;{searchTerm}&quot;</span>
              </button>
            )}
          </div>
        )}
      </div>
      <div className="mt-24">
        <button className="bg-red-400" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );

  // return (
  //   <div className="p-4">
  //     <form onSubmit={handleSaveNote}>
  //       <div className="mb-4">
  //         <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
  //           Title
  //         </label>
  //         <input
  //           type="text"
  //           name="title"
  //           value={title}
  //           onChange={(e) => setTitle(e.target.value)}
  //           className="w-full px-3 py-2 border rounded"
  //         />
  //       </div>
  //       <div className="mb-4">
  //         <label
  //           htmlFor="content"
  //           className="block text-gray-700 font-bold mb-2"
  //         >
  //           Content
  //         </label>
  //         <textarea
  //           name="content"
  //           value={content}
  //           onChange={(e) => setContent(e.target.value)}
  //           className="w-full px-3 py-2 border rounded"
  //           rows="3"
  //         ></textarea>
  //       </div>
  //       <div className="mb-4">
  //         <label className="block text-gray-700 font-bold mb-2">Label:</label>
  //         {labels && (
  //           <select
  //             className="w-full px-3 py-2 border rounded"
  //             value={selectedLabel}
  //             onChange={(event) => setSelectedLabel(event.target.value)}
  //           >
  //             <option value="">-- Select label --</option>
  //             {labels.map((label) => (
  //               <option key={label.id} value={label.name}>
  //                 {label.name}
  //               </option>
  //             ))}
  //           </select>
  //         )}
  //         <button onClick={() => setSelectedLabel("")}>Clear</button>
  //       </div>
  //       <div>
  //         <label>Create label:</label>
  //         <input
  //           type="text"
  //           value={newLabel}
  //           onChange={(event) => setNewLabel(event.target.value)}
  //         />
  //         <button onClick={handleCreateLabel}>Create</button>
  //       </div>
  //       <div className="flex justify-end">
  //         <button
  //           type="submit"
  //           className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
  //         >
  //           Save
  //         </button>
  //         <button
  //           type="button"
  //           onClick={handleCancel}
  //           className="px-4 py-2 bg-gray-500 text-white rounded"
  //         >
  //           Cancel
  //         </button>
  //       </div>
  //     </form>
  //     <button onClick={handleSignOut}>Sign Out</button>
  //   </div>
  // );
}

export default Main;
