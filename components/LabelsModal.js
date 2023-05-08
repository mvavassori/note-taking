"use client";
import { useState, useRef, useEffect } from "react";

const LabelsModal = ({
  showLabelModal,
  setShowLabelModal,
  labelsData,
  onUpdateLabel,
  onDeleteLabel,
}) => {
  const [focusedLabelId, setFocusedLabelId] = useState(null);
  const [editedLabelNames, setEditedLabelNames] = useState({});
  const [activeTooltip, setActiveTooltip] = useState("");

  const modalContainerRef = useRef(null);

  const handleDeleteLabel = (labelId) => {
    onDeleteLabel(labelId);
  };

  const handleUpdateLabel = (labelId) => {
    console.log("Label ID:", labelId);
    console.log("Edited Label Name:", editedLabelNames[labelId]);
    if (editedLabelNames[labelId]) {
      onUpdateLabel(labelId, editedLabelNames[labelId]);
    }
  };

  const handleClickOutside = (event) => {
    if (
      modalContainerRef.current &&
      !modalContainerRef.current.contains(event.target)
    ) {
      setShowLabelModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!showLabelModal) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center transition-opacity ${
        showLabelModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={modalContainerRef}
        className="bg-zinc-50 p-4 rounded-lg shadow-lg w-full max-w-md border-2 border-zinc-500 overflow-y-auto"
        style={{ maxHeight: "45vh" }}
      >
        <h2 className="text-xl mb-4">Edit Labels</h2>
        {labelsData.map((label) => (
          <div
            key={label.id}
            className="flex mb-2 border border-black rounded-md items-center p-2"
          >
            <button
              onClick={() => handleDeleteLabel(label.id)}
              //   onMouseEnter={() => setActiveTooltip(`deleteLabel-${label.id}`)}
              //   onMouseLeave={() => setActiveTooltip("")}
              className="mr-2"
              title="Delete Label"
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
            {/* <span
              className={`absolute top-auto mt-3 right-0 bg-zinc-700 text-white text-xs px-2 py-1 rounded ${
                activeTooltip === `deleteLabel-$-${label.id}`
                  ? "opacity-100"
                  : "opacity-0"
              } transition-opacity duration-200`}
            >
              Delete Label
            </span> */}
            <input
              type="text"
              defaultValue={label.name}
              onFocus={() => setFocusedLabelId(label.id)}
              onBlur={() => setFocusedLabelId(null)}
              onChange={(e) =>
                setEditedLabelNames({
                  ...editedLabelNames,
                  [label.id]: e.target.value,
                })
              }
              className="w-full bg-zinc-50 focus:outline-none"
            />

            {focusedLabelId === label.id && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input from losing focus
                  handleUpdateLabel(
                    label.id,
                    editedLabelNames[label.id] || label.name
                  );
                }}
                className="ml-2 active:bg-zinc-200 rounded"
                title="Update Label"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M5 19h1.4l8.625-8.625l-1.4-1.4L5 17.6V19ZM19.3 8.925l-4.25-4.2l1.4-1.4q.575-.575 1.413-.575t1.412.575l1.4 1.4q.575.575.6 1.388t-.55 1.387L19.3 8.925ZM4 21q-.425 0-.713-.288T3 20v-2.825q0-.2.075-.388t.225-.337l10.3-10.3l4.25 4.25l-10.3 10.3q-.15.15-.337.225T6.825 21H4ZM14.325 9.675l-.7-.7l1.4 1.4l-.7-.7Z"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button onClick={() => setShowLabelModal(false)}>Close</button>
      </div>
    </div>
  );
};

export default LabelsModal;
