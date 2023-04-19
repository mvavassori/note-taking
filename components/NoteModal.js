"use client";

import { useRef, useState, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";

const NoteModal = ({ showNoteModal, setShowNoteModal, currentNote }) => {
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedLabels, setEditedLabels] = useState([]);

  useEffect(() => {
    if (currentNote) {
      setEditedTitle(currentNote.title || "");
      setEditedContent(currentNote.content || "");
      setEditedLabels(currentNote.labels || []);
    }
  }, [currentNote]);
  const modalContentRef = useRef();

  const handleClickOutside = (e) => {
    if (!modalContentRef.current.contains(e.target)) {
      setShowNoteModal(false);
    }
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
        ref={modalContentRef}
        className="bg-zinc-50 p-4 rounded-lg shadow-lg w-full max-w-xl border-2 border-zinc-500"
        style={{ maxHeight: "80vh" }} // Set the maximum height based on the viewport height
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
          {editedLabels.map((labelName) => (
            <div
              key={labelName}
              className="relative flex items-center bg-zinc-200 rounded px-2 py-1 group"
              style={{ minWidth: "max-content" }}
            >
              <span className="px-2 py-0.5 text-sm text-zinc-800 bg-zinc-200 rounded-full truncate transition-all duration-200 group-hover:mr-4">
                {labelName}
              </span>
              {/* Implement logic to remove label */}
              <button className="absolute right-0 mr-1 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* SVG element for close icon */}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4">
          {/* Add the logic to handle saving changes, deleting the note, and closing the modal */}
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400">
            Save changes
          </button>
          <button className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400">
            Delete note
          </button>
          <button
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-400"
            onClick={() => setShowNoteModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
