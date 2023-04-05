"use client";
import React, { useState, useEffect, useRef } from "react";

const NoteTakingApp = () => {
  const [title, setTitle] = useState("");

  const [showTitleAndButtons, setShowTitleAndButtons] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [labels, setLabels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentLabel, setCurrentLabel] = useState("");

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentLabel(e.target.value);
  };

  const addLabel = () => {
    // setLabels([...labels, currentLabel]);
    setLabels([...labels, { name: currentLabel, checked: true }]);
    setCurrentLabel("");
    setSearchTerm("");
  };

  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative p-4">
      {showTitleAndButtons && (
        <input
          ref={titleInputRef}
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Add title"
        />
      )}
      <textarea
        ref={textAreaRef}
        className="w-full h-64 p-4 border border-gray-300 rounded"
        placeholder="Take a note..."
      ></textarea>
      {showTitleAndButtons && (
        <button
          className={`absolute bottom-6 left-5 p-1 rounded-full hover:bg-gray-300 ${
            showModal ? "bg-gray-300" : ""
          }`}
          onClick={() => setShowModal(!showModal)}
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
      )}

      {showModal && (
        <div
          ref={modalRef}
          className="absolute z-10 w-64 p-2 bg-white border border-gray-300 rounded shadow-lg overflow-y-auto max-h-64"
        >
          <input
            type="text"
            className="w-full p-1 mb-2 border border-gray-300 rounded"
            placeholder="Search or create labels"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div>
            {filteredLabels.map((label) => (
              <div
                key={label}
                className="flex items-center mb-1 p-0.5 hover:bg-gray-100"
              >
                {/* <input type="checkbox" id={label} className="mr-2" /> */}
                <input
                  type="checkbox"
                  id={label.name}
                  className="mr-2"
                  checked={label.checked}
                  onChange={() => {
                    const updatedLabels = labels.map((l) =>
                      l.name === label.name ? { ...l, checked: !l.checked } : l
                    );
                    setLabels(updatedLabels);
                  }}
                />
                <label htmlFor={label.name}>{label.name}</label>
              </div>
            ))}
          </div>
          {currentLabel && (
            <button
              className="w-full p-2 mt-2 text-white bg-green-500 rounded"
              onClick={addLabel}
            >
              Create Label &quot;{currentLabel}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteTakingApp;
