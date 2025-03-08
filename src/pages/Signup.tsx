import React, { useState } from "react";
import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Signup: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSignup = async () => {
        setError(null);
        if (username.length < 3) return setError("Username must be at least 3 characters.");

        setLoading(true);
        try {
            // Check if username is taken
            const usernameRef = doc(db, "usernames", username);
            const usernameSnap = await getDoc(usernameRef);
            if (usernameSnap.exists()) {
                setLoading(false);
                return setError("Username is already taken!");
            }

            // Create user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile with username
            await updateProfile(user, { displayName: username });

            // Save user data in Firestore
            await setDoc(doc(db, "users", user.uid), { email, username });

            // Save username mapping to prevent duplicates
            await setDoc(doc(db, "usernames", username), { userId: user.uid });

            navigate("/");
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <motion.div
                className="w-full max-w-md bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <h2 className="text-3xl font-bold text-center text-white mb-6">Create an Account</h2>

                {error && <p className="text-red-400 text-center mb-4">{error}</p>}

                <input
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-400 outline-none mb-3"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-400 outline-none mb-3"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-400 outline-none mb-4"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <motion.button
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition active:scale-95"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignup}
                    disabled={loading}
                >
                    {loading ? "Signing up..." : "Sign Up"}
                </motion.button>

                <p className="mt-6 text-center text-gray-300">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-400 hover:underline">
                        Login
                    </a>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
