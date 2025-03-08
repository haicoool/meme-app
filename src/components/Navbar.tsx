import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaSignOutAlt, FaHeart, FaHome } from "react-icons/fa";
import { auth } from "../config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(auth.currentUser);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert("Logged out!");
            navigate("/login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="flex justify-between items-center w-full px-6 py-3 bg-gray-900 text-white shadow-lg relative z-50">
            {/* Brand Title with Gradient */}
            <h1 className="text-2xl font-bold tracking-wider">
                <span>
                    <span className="text-[#A7C7E7]">Meme</span>
                    <span className="text-[#F4A7B9]">App</span>
                </span>
            </h1>

            <div className="flex items-center gap-6">
                {/* Home Button (Visible Only When Logged In) */}
                {user && (
                    <Link to="/" className="flex items-center gap-2 text-lg hover:text-gray-300 transition">
                        <FaHome size={22} />
                    </Link>
                )}

                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        {/* Profile Button */}
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all"
                        >
                            <FaUser size={22} />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-3 w-48 bg-gray-900/90 backdrop-blur-lg border border-gray-700 shadow-xl rounded-lg p-2 z-50">
                                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-800 rounded-md">
                                    <FaUser className="inline mr-2 text-blue-400" />
                                    Profile
                                </Link>
                                <Link to="/liked" className="block px-4 py-2 hover:bg-gray-800 rounded-md">
                                    <FaHeart className="inline mr-2 text-pink-400" />
                                    Liked Memes
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 rounded-md"
                                >
                                    <FaSignOutAlt className="inline mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // Non-logged-in user options
                    <div className="flex gap-4">
                        <Link to="/login" className="hover:text-blue-400 transition text-lg">Login</Link>
                        <Link to="/signup" className="hover:text-pink-400 transition text-lg">Register</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
