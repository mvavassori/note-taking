"use client";
import { useState, useRef, useEffect } from "react";

const LabelsModal = ({
  showLabelsModal,
  setShowLabelsModal,
  labelsData,
  onUpdateLabel,
  onDeleteLabel,
  onCreateLabel,
}) => {
  const [editedLabelNames, setEditedLabelNames] = useState({});
  const [newLabelName, setNewLabelName] = useState("");
  const [activeTooltip, setActiveTooltip] = useState("");
  const [focusedLabelId, setFocusedLabelId] = useState(null);
  const [newLabelFocused, setNewLabelFocused] = useState(false);

  const modalContainerRef = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (
      modalContainerRef.current &&
      !modalContainerRef.current.contains(event.target)
    ) {
      setShowLabelsModal(false);
    }
  };

  const handleDeleteLabel = (labelId) => {
    onDeleteLabel(labelId);
  };

  const handleUpdateLabel = (labelId) => {
    if (editedLabelNames[labelId]) {
      onUpdateLabel(labelId, editedLabelNames[labelId]);
    }
  };

  const handleCreateLabel = () => {
    if (newLabelName) {
      onCreateLabel(newLabelName);
      setNewLabelName("");
    }
  };

  if (!showLabelsModal) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center transition-opacity ${
        showLabelsModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={modalContainerRef}
        className="bg-zinc-50 py-4 rounded-lg shadow-lg w-full max-w-sm border-2 border-zinc-500 overflow-y-auto"
        style={{ maxHeight: "65vh" }}
      >
        <h2 className="text-xl px-5 mb-4">Edit Labels</h2>
        <hr className="mb-4" />
        <div className="flex items-center mb-2 p-2 ml-8 px-7">
          <input
            type="text"
            placeholder="New label"
            value={newLabelName}
            onFocus={() => setNewLabelFocused(true)}
            onBlur={() => setNewLabelFocused(false)}
            onChange={(e) => setNewLabelName(e.target.value)}
            className="w-full border border-zinc-500 px-1 py-0.5 text-sm rounded-md"
          />

          {newLabelFocused && (
            <div className="relative flex items-center">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCreateLabel();
                }}
                onMouseEnter={() => setActiveTooltip("createLabel")}
                onMouseLeave={() => setActiveTooltip("")}
                className="ml-2 active:text-green-600 hover:text-green-500 rounded"
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
              <span
                className={`absolute bg-zinc-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap ${
                  activeTooltip === "createLabel" ? "opacity-100" : "opacity-0"
                } transition-opacity duration-200 -bottom-6 left-1/2 transform -translate-x-1/2`}
              >
                Create Label
              </span>
            </div>
          )}
        </div>

        {labelsData.map((label) => (
          <div key={label.id} className="flex mb-1 items-center py-2 px-7">
            <div className="relative flex items-center">
              <button
                onClick={() => handleDeleteLabel(label.id)}
                onMouseEnter={() => setActiveTooltip(`deleteLabel-${label.id}`)}
                onMouseLeave={() => setActiveTooltip("")}
                className="mr-2 active:text-red-600 hover:text-red-500"
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
              <span
                className={`absolute bg-zinc-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap ${
                  activeTooltip === `deleteLabel-${label.id}`
                    ? "opacity-100"
                    : "opacity-0"
                } transition-opacity duration-200 -bottom-6 left-1/2 transform -translate-x-1/2`}
              >
                Delete Label
              </span>
            </div>
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
              className="w-full border border-zinc-500 px-1 py-0.5 text-sm rounded-md"
            />

            {focusedLabelId === label.id && (
              <div className="relative flex items-center">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input from losing focus
                    handleUpdateLabel(
                      label.id,
                      editedLabelNames[label.id] || label.name
                    );
                  }}
                  onMouseEnter={() =>
                    setActiveTooltip(`updateLabel-${label.id}`)
                  }
                  onMouseLeave={() => setActiveTooltip("")}
                  className="ml-2 active:text-blue-600 hover:text-blue-500 rounded"
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
                <span
                  className={`absolute bg-zinc-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap ${
                    activeTooltip === `updateLabel-${label.id}`
                      ? "opacity-100"
                      : "opacity-0"
                  } transition-opacity duration-200 -bottom-6 left-1/2 transform -translate-x-1/2`}
                >
                  Update Label
                </span>
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-between px-5">
          <div></div>
          <button
            className="py-1 px-2 mr-2 bg-zinc-50 rounded hover:bg-zinc-200 font-semibold text-zinc-800"
            onClick={() => setShowLabelsModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabelsModal;
