"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth, db } from "@/firebase";
import {
  serverTimestamp,
  addDoc,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import TextareaAutosize from "react-textarea-autosize";

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
export default function CreateNote() {
  const { user } = useAuth();

  const labelsRef = collection(db, `users/${user?.uid}/labels`).withConverter(
    myConverter
  );
  const [labelsData] = useCollectionData(labelsRef);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [labels, setLabels] = useState([]);

  const [showTitleAndButtons, setShowTitleAndButtons] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [labelExists, setLabelExists] = useState(false);
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

  //   useEffect(() => {
  //     if (notesData) {
  //       setNotes(notesData);
  //     }
  //   }, [notesData]);

  //   useEffect(() => {
  //     if (notesData && labelsData) {
  //       const updatedNotesWithLabelNames = notesData.map(getNoteWithLabelNames);
  //       setNotesWithLabelNames(updatedNotesWithLabelNames);
  //     }
  //   }, [notesData, labelsData, getNoteWithLabelNames]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setLabelExists(
      labels.some(
        (label) => label.name.toLowerCase() === e.target.value.toLowerCase()
      )
    );
  };

  const addLabel = async () => {
    const newLabel = { name: searchTerm };

    // Optimistically update the UI
    setLabels([...labels, newLabel]);
    setSelectedLabels([...selectedLabels, searchTerm]);
    setSearchTerm("");

    try {
      await addDoc(collection(db, `users/${user?.uid}/labels`), {
        name: searchTerm,
      });
    } catch (error) {
      console.error(error);

      // If an error occurs, revert the UI to its previous state
      setLabels(labels);
      setSelectedLabels(selectedLabels);
    }
  };

  const filteredLabels = labelsData?.filter((label) =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLabel = (labelName) => {
    const isSelected = selectedLabels.includes(labelName);

    if (isSelected) {
      setSelectedLabels(selectedLabels.filter((l) => l !== labelName));
    } else {
      setSelectedLabels([...selectedLabels, labelName]);
    }
  };

  const saveNote = async () => {
    // Fetch the label document IDs for the selected labels

    console.log(labelsData);
    const selectedLabelIds = labels
      .filter((label) => selectedLabels.includes(label.name))
      .map((label) => label.id);

    const newNote = {
      title,
      content,
      labels: selectedLabelIds,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    console.log("New note data: ", newNote);

    // Add the new note to the notes collection
    try {
      await addDoc(collection(db, `users/${user?.uid}/notes`), {
        title,
        content,
        labels: selectedLabelIds,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      setTitle("");
      setContent("");
      setSelectedLabels([]);
      setShowTitleAndButtons(false);
    } catch (error) {
      console.error("Error adding note: ", error);
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

  return (
    <div
      ref={containerRef}
      className="relative p-2 max-w-lg mx-auto border-2 border-zinc-500 rounded-lg mt-8 shadow-xl bg-zinc-50"
    >
      {showTitleAndButtons && (
        <input
          ref={titleInputRef}
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-0 focus:border-none focus:ring-0 textarea-title font-semibold bg-zinc-50"
          placeholder="Add title"
          autoComplete="no-autocomplete-please"
          maxLength={100}
        />
      )}
      <TextareaAutosize
        ref={textAreaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 focus:border-none focus:ring-0 textarea-content resize-none font-semibold bg-zinc-50"
        placeholder="Take a note..."
        minRows={3}
        autoComplete="no-autocomplete-please"
      ></TextareaAutosize>
      {showTitleAndButtons && (
        <div className="flex flex-wrap items-center gap-1 p-1">
          {selectedLabels.map((labelName) => (
            <div
              key={labelName}
              className="relative flex items-center bg-zinc-200 rounded px-2 py-1 group"
              style={{ minWidth: "max-content" }}
            >
              <span className="px-2 py-0.5 text-sm text-zinc-800 bg-zinc-200 rounded-full truncate transition-all duration-200 group-hover:mr-4">
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
              className={`px-2 rounded-full hover:bg-zinc-100 ${
                showModal ? "bg-zinc-100" : ""
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
              className={`absolute py-1 px-2 text-xs text-white bg-zinc-700 rounded ${
                showTooltip ? "opacity-100" : "opacity-0"
              } transition ease-in-out duration-200`}
            >
              Add Label
            </div>
          </div>

          <div>
            <button
              className="py-1 px-2 mr-2 bg-zinc-50 rounded hover:bg-zinc-200 font-semibold text-zinc-800"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className={`py-1 px-2 bg-white rounded font-semibold  ${
                saveButtonDisabled
                  ? "opacity-50 cursor-not-allowed bg-zinc-50 hover:bg-zinc-50 text-zinc-800"
                  : "bg-zinc-50 hover:bg-blue-100 hover:text-blue-700"
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
          className="absolute z-10 w-64 p-2 bg-zinc-50 border border-zinc-300 rounded shadow-xl overflow-y-auto max-h-64"
        >
          <p className="text-xs pb-2">Assign a label to the note</p>
          <input
            type="text"
            className="w-full p-1 mb-2 border border-zinc-300 rounded text-sm"
            placeholder="Search or create labels"
            value={searchTerm}
            onChange={handleSearchChange}
            autoComplete="off"
          />
          <div>
            {filteredLabels.map(({ name: labelName, checked }) => (
              <div
                key={labelName}
                className="flex items-center mb-1 p-0.5 hover:bg-zinc-100 cursor-pointer text-sm"
                onClick={() => toggleLabel(labelName)}
              >
                <input
                  type="checkbox"
                  id={labelName}
                  className="mr-2"
                  checked={selectedLabels.includes(labelName)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleLabel(labelName);
                  }}
                />

                <label
                  htmlFor={labelName}
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-pointer"
                >
                  {labelName}
                </label>
              </div>
            ))}
          </div>
          {!labelExists && searchTerm !== "" && (
            <button
              className="w-full p-2 mt-2 text-sm bg-zinc-200 hover:bg-zinc-300 rounded text-left flex items-center justify-start"
              onClick={addLabel}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M11 19v-6H5v-2h6V5h2v6h6v2h-6v6h-2Z"
                />
              </svg>
              <span className="ml-2 text-xs">
                Create &quot;{searchTerm}&quot;
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
