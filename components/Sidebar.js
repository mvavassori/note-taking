"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LabelsModal from "@/components/LabelsModal";

const Sidebar = ({ labelsData, updateLabel, deleteLabel }) => {
  const [showLabelModal, setShowLabelModal] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const labelQuery = searchParams.get("label");
  return (
    <aside className="h-screen fixed left-0 top-0 w-64 mt-12 pt-2 pb-14 bg-zinc-900 overflow-y-hidden hover:overflow-y-auto pr-1 z-20">
      <button
        className={`text-left w-full text-white hover:bg-zinc-700 ${
          !labelQuery ? "bg-zinc-700" : ""
        } py-3 pl-8 rounded focus:outline-none font-medium flex`}
        onClick={() => router.push("/main")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M4 13q-.425 0-.713-.288T3 12q0-.425.288-.713T4 11h16q.425 0 .713.288T21 12q0 .425-.288.713T20 13H4Zm0 5q-.425 0-.713-.288T3 17q0-.425.288-.713T4 16h10q.425 0 .713.288T15 17q0 .425-.288.713T14 18H4ZM4 8q-.425 0-.713-.288T3 7q0-.425.288-.713T4 6h16q.425 0 .713.288T21 7q0 .425-.288.713T20 8H4Z"
          />
        </svg>
        <span className="ml-2">All Notes</span>
      </button>
      <ul>
        {labelsData &&
          labelsData.map((label) => (
            <li key={label.id} className="">
              <button
                className={`text-left w-full text-white hover:bg-zinc-700 ${
                  labelQuery === label.id ? "bg-zinc-700" : ""
                } py-3 pl-8 rounded focus:outline-none font-medium flex`}
                onClick={() => router.push(`/main?label=${label.id}`)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M5 19q-.825 0-1.413-.588T3 17V7q0-.825.588-1.413T5 5h10q.5 0 .938.225t.712.625l3.525 5q.35.525.35 1.15t-.35 1.15l-3.525 5q-.275.4-.712.625T15 19H5Zm13.55-7L15 7H5v10h10l3.55-5ZM5 12v5V7v5Z"
                  />
                </svg>
                <span className="ml-2">{label.name}</span>
              </button>
            </li>
          ))}
      </ul>
      <button
        className="text-left w-full text-white hover:bg-zinc-700 py-3 pl-8 rounded focus:outline-none font-medium flex"
        onClick={() => setShowLabelModal(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 20h16M4 20v-4l8-8M4 20h4l8-8m-4-4l2.869-2.869l.001-.001c.395-.395.593-.593.821-.667a1 1 0 0 1 .618 0c.228.074.425.272.82.666l1.74 1.74c.396.396.594.594.668.822a1 1 0 0 1 0 .618c-.074.228-.272.426-.668.822h0L16 12.001m-4-4l4 4"
          />
        </svg>
        <span className="ml-2">Edit Labels</span>
      </button>
      <LabelsModal
        showLabelModal={showLabelModal}
        setShowLabelModal={setShowLabelModal}
        labelsData={labelsData}
        onUpdateLabel={updateLabel}
        onDeleteLabel={deleteLabel}
      />
    </aside>
  );
};

export default Sidebar;
