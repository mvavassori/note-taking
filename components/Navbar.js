"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/firebase";
import AccountModal from "@/components/AccountModal";

const Navbar = () => {
  const { user, loading } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const modalRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleSettingsModal = () => {
    setShowSettingsModal(!showSettingsModal);
  };

  const handleClickOutside = (event) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(event.target) &&
      !buttonRef.current.contains(event.target)
    ) {
      setShowSettingsModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-zinc-700 z-50 pl-8 h-12">
        <div className="container py-2 flex items-center justify-between">
          {/* Logo / App Name */}
          <div className="font-bold text-xl text-white">
            <Link href="/main">Logo</Link>
          </div>
          {/* Search Bar */}
          {/* <div className="w-full max-w-md">
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full py-2 px-4 bg-zinc-50 rounded focus:outline-none text-sm font-medium"
            />
          </div> */}
          {/* Search Button */}
          <div className="flex items-center">
            <button className="text-white hover:text-zinc-300 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5q0-2.725 1.888-4.612T9.5 3q2.725 0 4.612 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3l-1.4 1.4ZM9.5 14q1.875 0 3.188-1.313T14 9.5q0-1.875-1.313-3.188T9.5 5Q7.625 5 6.312 6.313T5 9.5q0 1.875 1.313 3.188T9.5 14Z"
                />
              </svg>
            </button>
            {/* Settings Button */}
            <button
              className="text-white hover:text-zinc-300 focus:outline-none mx-4"
              onClick={toggleSettingsModal}
              ref={buttonRef}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="m9.25 22l-.4-3.2q-.325-.125-.613-.3t-.562-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.337v-.674q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2h-5.5Zm2.8-6.5q1.45 0 2.475-1.025T15.55 12q0-1.45-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12q0 1.45 1.012 2.475T12.05 15.5Z"
                />
              </svg>
            </button>
            {showSettingsModal && (
              <div
                ref={modalRef}
                className="absolute z-10 bg-white border border-gray-300 rounded shadow-xl flex flex-col top-full text-sm right-1"
              >
                <button
                  className="text-left px-4 py-2 text-gray-700 hover:bg-gray-200 rounded focus:outline-none whitespace-nowrap"
                  onClick={() => setShowAccountModal(!showAccountModal)}
                >
                  {" "}
                  {/*Here i'll add the onClick to open the AccountModal*/}
                  Account Settings
                </button>
                <button className="text-left px-4 py-2 text-gray-700 hover:bg-gray-200 rounded focus:outline-none">
                  Dark Theme
                </button>
                <button className="text-left px-4 py-2 text-gray-700 hover:bg-gray-200 rounded focus:outline-none">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <AccountModal
          showAccountModal={showAccountModal}
          setShowAccountModal={setShowAccountModal}
        />
      </header>
    </>
  );
};

export default Navbar;

// export default function Navbar() {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (user) {
//     return (
//       <div className="flex justify-between p-2 bg-blue-400">
//         <Link href="/">Logo</Link>
//         <Link href="/main">Main</Link>
//         <span>{user.email}</span>
//       </div>
//     );
//   }
//   return (
//     <div className="flex justify-between p-2 bg-blue-400">
//       <Link href="/">Logo</Link>
//       <Link href="/main">Main</Link>
//       <Link href="/login">Log in</Link>
//     </div>
//   );
// }

// components/Navbar.js
