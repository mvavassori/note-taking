"use client";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import { useAuth, db } from "@/firebase";
import {
  doc,
  collection,
  getDocs,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";

const AccountModal = ({ showAccountModal, setShowAccountModal }) => {
  const router = useRouter();
  const { user } = useAuth();

  const modalContainerRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      modalContainerRef.current &&
      !modalContainerRef.current.contains(event.target)
    ) {
      setShowAccountModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // async function deleteUserData(uid) {
  //   const userDocRef = doc(db, "users", uid);

  //   // Delete notes subcollection
  //   const notesCollectionRef = collection(userDocRef, "notes");
  //   const notesSnapshot = await getDocs(notesCollectionRef);
  //   for (const noteDoc of notesSnapshot.docs) {
  //     await deleteDoc(noteDoc.ref);
  //   }

  //   // Delete labels subcollection
  //   const labelsCollectionRef = collection(userDocRef, "labels");
  //   const labelsSnapshot = await getDocs(labelsCollectionRef);
  //   for (const labelDoc of labelsSnapshot.docs) {
  //     await deleteDoc(labelDoc.ref);
  //   }

  //   // Delete the user document
  //   await deleteDoc(userDocRef);
  // }

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmNewPassword = e.target.confirmNewPassword.value;

    if (newPassword !== confirmNewPassword) {
      alert("New password and confirmation do not match.");
      return;
    }

    if (user) {
      // Re-authenticate the user
      const credentials = EmailAuthProvider.credential(
        user?.email,
        currentPassword
      );
      try {
        await reauthenticateWithCredential(user, credentials);

        try {
          await updatePassword(user, newPassword);
          alert("Password updated successfully.");
        } catch (error) {
          console.error(error);
          alert("Error updating password.");
        }
      } catch (error) {
        console.error(error);
        alert("Error re-authenticating user.");
      }
    } else {
      alert("No user is currently logged in.");
    }
  };

  // const handleDeleteAccount = async () => {
  //   const password = prompt("Please enter your password to confirm account deletion:");

  //   if (!password) {
  //     return;
  //   }

  //   try {
  //     // Re-authenticate user
  //     const credentials = EmailAuthProvider.credential(user?.email, password);
  //     await reauthenticateWithCredential(user, credentials);

  //     // Delete user's data from Firestore (or other database) here, if needed

  //     // Delete user's account
  //     await deleteUser(user);
  //     alert("Your account has been deleted successfully.");

  //     // Redirect user to the main page or login page
  //     router.push("/");
  //   } catch (error) {
  //     console.error(error);
  //     alert("Error deleting account.");
  //   }
  // };

  const handleDeleteAccount = async () => {
    const password = prompt(
      "Please enter your password to confirm account deletion:"
    );

    if (!password) {
      return;
    }

    try {
      // Re-authenticate user
      const credentials = EmailAuthProvider.credential(user?.email, password);
      await reauthenticateWithCredential(user, credentials);

      // Delete user's data from Firestore
      const userDocRef = doc(db, "users", user?.uid);
      const notesCollectionRef = collection(userDocRef, "notes");
      const labelsCollectionRef = collection(userDocRef, "labels");

      await deleteCollectionData(notesCollectionRef);
      await deleteCollectionData(labelsCollectionRef);
      await deleteDoc(userDocRef);

      // Delete user's account
      await deleteUser(user);
      alert("Your account has been deleted successfully.");

      // Redirect user to the main page or login page
      // router.push("/");
      setShowAccountModal(false);
    } catch (error) {
      console.error(error);
      alert("Error deleting account.");
    }
  };

  async function deleteCollectionData(collectionRef) {
    const querySnapshot = await getDocs(collectionRef);
    const batch = writeBatch(db);

    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  if (!showAccountModal) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center transition-opacity ${
        showAccountModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={modalContainerRef}
        className="bg-zinc-50 py-4 px-5 rounded-lg shadow-lg w-full max-w-md border-2 border-zinc-500 overflow-y-auto"
        style={{ maxHeight: "75vh" }}
      >
        <h2 className="text-xl mb-4">Account Settings</h2>
        <h3 className="text-lg mb-2">Change Password</h3>
        <div className="">
          <form onSubmit={handleChangePassword} className="">
            <div className="mb-2">
              <label htmlFor="currentPassword" className="block">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                className="w-full border border-zinc-500 px-1 py-0.5 text-sm rounded-md"
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="newPassword" className="block">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full border border-zinc-500 px-1 py-0.5 text-sm rounded-md"
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="confirmNewPassword" className="block">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                className="w-full border border-zinc-500 px-1 py-0.5 text-sm rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md p-2 text-white mt-2"
            >
              Change Password
            </button>
          </form>
        </div>
        <hr className="my-8" />
        <div>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-500 hover:bg-red-600 active:bg-red-700 p-2 rounded-lg text-white"
          >
            Delete Account
          </button>
        </div>
        <div className="flex justify-between">
          <div></div>
          <button
            className="py-1 px-2 mr-2 bg-zinc-50 rounded hover:bg-zinc-200 font-semibold text-zinc-800"
            onClick={() => setShowAccountModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
