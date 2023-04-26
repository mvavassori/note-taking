const Sidebar = ({ labelsData, onLabelClick }) => {
  return (
    <aside className="h-screen fixed left-0 top-0 w-1/5 pt-16 bg-zinc-800 overflow-y-hidden hover:overflow-y-auto pr-1">
      <button className="text-left w-full text-white hover:bg-zinc-700 py-3 pl-8 rounded focus:outline-none font-medium flex">
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
                className="text-left w-full text-white hover:bg-zinc-700 py-3 pl-8 rounded focus:outline-none font-medium flex"
                onClick={() => onLabelClick(label.id)}
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
    </aside>
  );
};

export default Sidebar;
