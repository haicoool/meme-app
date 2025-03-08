import React, { useState } from "react";
import { auth, db } from "../config/firebase";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import Navbar from "../components/Navbar.tsx";

const Profile: React.FC = () => {
    const user = auth.currentUser;
    const navigate = useNavigate(); // Hook for redirection
    const [name, setName] = useState(user?.displayName || "");
    const [password, setPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpdateName = async () => {
        if (!user) return alert("No user logged in!");
        try {
            setLoading(true);
            await updateProfile(user, { displayName: name });
            alert("✅ Name updated successfully!");
        } catch (error: any) {
            alert("❌ " + error.message);
        }
        setLoading(false);
    };

    const handleChangePassword = async () => {
        if (!user) return alert("No user logged in!");
        if (!currentPassword || !password) return alert("Please enter both current and new password!");

        try {
            setLoading(true);
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, password);
            alert("✅ Password updated successfully!");
            setCurrentPassword("");
            setPassword("");
        } catch (error: any) {
            alert("❌ " + error.message);
        }
        setLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (!user) return alert("No user logged in!");
        if (!window.confirm("⚠️ Are you sure? This will delete your account and all liked memes!")) return;

        try {
            setLoading(true);
            const likedMemesQuery = query(collection(db, "likedMemes"), where("userId", "==", user.uid));
            const likedMemesSnapshot = await getDocs(likedMemesQuery);

            const deletePromises = likedMemesSnapshot.docs.map((docItem) => deleteDoc(doc(db, "likedMemes", docItem.id)));
            await Promise.all(deletePromises);

            await deleteUser(user);
            alert("✅ Account deleted successfully!");

            navigate("/"); // Redirect to home after deletion
        } catch (error: any) {
            alert("❌ " + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Navbar />

            <div className="flex flex-col items-center justify-center flex-1 px-4">
                <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-4">👤 Edit Profile</h2>

                    {/* Change Name */}
                    <div className="w-full mb-4">
                        <label className="block text-sm text-gray-400 text-left mb-1">Display Name:</label>
                        <input
                            className="w-full p-3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your new name"
                        />
                    </div>
                    <button
                        className="mb-4 w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg font-semibold transition-all disabled:bg-gray-600"
                        onClick={handleUpdateName}
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Save Changes"}
                    </button>

                    {/* Change Password */}
                    <div className="w-full mb-4">
                        <label className="block text-sm text-gray-400 text-left mb-1">Current Password:</label>
                        <input
                            className="w-full p-3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                        />
                    </div>
                    <div className="w-full mb-4">
                        <label className="block text-sm text-gray-400 text-left mb-1">New Password:</label>
                        <input
                            className="w-full p-3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>
                    <button
                        className="mb-4 w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg font-semibold transition-all disabled:bg-gray-600"
                        onClick={handleChangePassword}
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Change Password"}
                    </button>

                    {/* Delete Account */}
                    <button
                        className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-semibold transition-all disabled:bg-gray-600"
                        onClick={handleDeleteAccount}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete Account"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
