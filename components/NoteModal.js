"use client";

import { useAuth, db } from "@/firebase";
import { useRef, useState, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { addDoc, collection } from "firebase/firestore";

const NoteModal = ({
  showNoteModal,
  setShowNoteModal,
  currentNote,
  onUpdateNote,
  labelsData,
  currentNoteLabelObjects,
}) => {
  const { user } = useAuth();

  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [labelExists, setLabelExists] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState(currentNoteLabelObjects);
  const [showLabelsModal, setShowLabelsModal] = useState(false);
  const [showLabelTooltip, setShowLabelTooltip] = useState(false);
  const [initialLabels, setInitialLabels] = useState([]);

  const modalContainerRef = useRef();
  const modalLabelsRef = useRef();

  useEffect(() => {
    if (currentNote) {
      setEditedTitle(currentNote.title || "");
      setEditedContent(currentNote.content || "");
    }
    console.log(currentNote.labels);
  }, [currentNote]);

  useEffect(() => {
    console.log("currentNote:", currentNote);
    console.log("labelsData:", labelsData);

    if (currentNote && currentNote.labels && labelsData) {
      const noteLabels = currentNote.labels.map((labelName) => {
        const label = labelsData.find((label) => label.name === labelName);
        return label || { id: "", name: labelName };
      });

      setSelectedLabels(noteLabels);
      setInitialLabels(noteLabels);
    }
  }, [currentNote, labelsData]);

  useEffect(() => {
    const handleClickOutsideLabelsModal = (event) => {
      if (
        modalLabelsRef.current &&
        !modalLabelsRef.current.contains(event.target)
      ) {
        setShowLabelsModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideLabelsModal);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideLabelsModal);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setLabelExists(
      labelsData.some(
        (label) => label.name.toLowerCase() === e.target.value.toLowerCase()
      )
    );
  };

  const addLabel = async () => {
    try {
      // Create the new label in Firestore
      const labelRef = await addDoc(
        collection(db, `users/${user?.uid}/labels`),
        {
          name: searchTerm,
        }
      );

      // Get the id of the newly created label
      const newLabelId = labelRef.id;

      // Update the labels state with the new label's id and name
      setSelectedLabels([
        ...selectedLabels,
        { id: newLabelId, name: searchTerm },
      ]);

      setSearchTerm("");
    } catch (error) {
      console.error(error);
    }
  };

  const filteredLabels = labelsData?.filter((label) =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLabel = (labelId) => {
    const isSelected = selectedLabels.some((label) => label.id === labelId);

    if (isSelected) {
      setSelectedLabels(selectedLabels.filter((label) => label.id !== labelId));
    } else {
      const labelName = labelsData.find((label) => label.id === labelId).name;
      setSelectedLabels([...selectedLabels, { id: labelId, name: labelName }]);
    }
  };

  const handleSaveChanges = () => {
    const selectedLabelIds = selectedLabels.map((label) => label.id);

    const updatedNote = {
      id: currentNote.id,
      title: editedTitle,
      content: editedContent,
      labels: selectedLabelIds,
    };
    console.log("Updated Note:", updatedNote);
    onUpdateNote(updatedNote);
    setShowNoteModal(false);
  };

  const handleClickOutside = (e) => {
    if (!modalContainerRef.current.contains(e.target)) {
      setEditedTitle(currentNote.title);
      setEditedContent(currentNote.content);
      setSelectedLabels(initialLabels);
      setShowNoteModal(false);
    }
  };

  const handleCloseModal = () => {
    setEditedTitle(currentNote.title);
    setEditedContent(currentNote.content);
    setSelectedLabels(initialLabels);
    setShowNoteModal(false);
  };

  if (!showNoteModal) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center transition-opacity ${
        showNoteModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClickOutside}
    >
      <div
        ref={modalContainerRef}
        className="bg-zinc-50 p-4 rounded-lg shadow-lg w-full max-w-xl border-2 border-zinc-500"
        // style={{ maxHeight: "80vh" }} // Set the maximum height based on the viewport height
      >
        <input
          type="text"
          name="title"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="w-full p-2 mb-0 focus:border-none focus:ring-0 textarea-title font-semibold bg-zinc-50 text-lg"
          placeholder="Title"
          autoComplete="no-autocomplete-please"
          maxLength={100}
        />
        <TextareaAutosize
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          placeholder="Note"
          className="w-full p-2 focus:border-none focus:ring-0 textarea-content resize-none font-semibold bg-zinc-50 textarea-content-limited"
          minRows={4}
          autoComplete="no-autocomplete-please"
        />
        <div className="flex flex-wrap items-center gap-1 p-1">
          {selectedLabels.map(({ id, name: labelName }) => (
            <div
              key={id}
              className="relative flex items-center bg-zinc-200 rounded px-2 py-1 group"
              style={{ minWidth: "max-content" }}
            >
              <span className="px-2 py-0.5 text-xs text-zinc-800 bg-zinc-200 rounded-full truncate transition-all duration-200 group-hover:mr-4">
                {labelName}
              </span>
              <button
                className="absolute right-0 mr-1 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLabel(id);
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
        <div className="flex justify-between w-full">
          <div>
            <button
              className={`px-2 rounded-full hover:bg-zinc-100 ${
                showLabelsModal ? "bg-zinc-100" : ""
              }`}
              onClick={() => setShowLabelsModal(!showLabelsModal)}
              onMouseEnter={() => setShowLabelTooltip(true)}
              onMouseLeave={() => setShowLabelTooltip(false)}
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
                showLabelTooltip ? "opacity-100" : "opacity-0"
              } transition ease-in-out duration-200`}
            >
              Add Label
            </div>
          </div>
          <div>
            <button
              className="py-1 px-2 mr-2 bg-zinc-50 rounded hover:bg-zinc-200 font-semibold text-zinc-800"
              onClick={handleCloseModal}
            >
              Close
            </button>
            <button
              className="py-1 px-2 rounded font-semibold bg-zinc-50 hover:bg-blue-100 hover:text-blue-700"
              onClick={handleSaveChanges}
            >
              Save
            </button>
          </div>
        </div>
        {showLabelsModal && (
          <div
            ref={modalLabelsRef}
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
              {filteredLabels.map((label) => (
                <div
                  key={label.id}
                  className="flex items-center mb-1 p-0.5 hover:bg-zinc-100 cursor-pointer text-sm"
                  onClick={() => toggleLabel(label.id, label.name)}
                >
                  <input
                    type="checkbox"
                    id={label.name}
                    className="mr-2"
                    checked={selectedLabels.some(
                      (selectedLabel) => selectedLabel.id === label.id
                    )}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleLabel(label.id, label.name);
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
    </div>
  );
};

export default NoteModal;
