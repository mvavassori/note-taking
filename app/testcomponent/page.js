"use client";
import React, { useState, useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

const NoteTakingApp = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [showTitleAndButtons, setShowTitleAndButtons] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [labels, setLabels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentLabel, setCurrentLabel] = useState("");
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
        setCurrentLabel("");
        setTitle("");
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
    setCurrentLabel(e.target.value);
  };

  const addLabel = () => {
    // setLabels([...labels, { name: currentLabel, checked: true }]);
    // setCurrentLabel("");
    // setSearchTerm("");
    const newLabel = { name: currentLabel, checked: true };
    setLabels([...labels, newLabel]);
    setSelectedLabels([...selectedLabels, currentLabel]);
    setCurrentLabel("");
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

  return (
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
          // autoComplete="off"
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
      <div className="flex flex-wrap items-center gap-1 p-1">
        {selectedLabels.map((label) => (
          <div
            key={label}
            className="flex items-center bg-gray-200 rounded px-2 py-1"
          >
            <span
              // key={label}
              className="px-2 py-0.5 text-sm text-gray-700 bg-gray-200 rounded-full"
            >
              {label}
            </span>
            <button
              className="ml-1 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                toggleLabel(label);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-x-circle"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </button>
          </div>
        ))}
      </div>
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
              className="py-1 px-2 mr-2 bg-white rounded hover:bg-gray-100"
              onClick={
                //   () => {
                //   setTitle("");
                //   setContent("");
                //   setLabels(
                //     labels.map((label) => ({ ...label, checked: false }))
                //   );
                //   setShowTitleAndButtons(false);
                // }
                handleCancel
              }
            >
              Cancel
            </button>
            <button
              className={`py-1 px-2 bg-white rounded  ${
                saveButtonDisabled
                  ? "opacity-50 cursor-not-allowed hover:bg-white hover:text-gray-black"
                  : "hover:bg-blue-100 hover:text-blue-700"
              }`}
              onClick={() => {
                console.log({ title, content, labels });
                setFocus(false);
              }}
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
                key={label}
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
          {currentLabel && (
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
              <span className="ml-2">Create &quot;{currentLabel}&quot;</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteTakingApp;
