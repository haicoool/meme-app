import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LikedMemes from "./pages/LikedMemes";
import Profile from "./pages/Profile";
import LandingPage from "./pages/LandingPage";

// Loading Animation Component
const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-lg font-medium text-gray-600">Loading...</p>
    </div>
);

const Root = () => {
    const [user, setUser] = useState(auth.currentUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // Listen for online/offline status and show toast notifications
        const handleOnline = () => toast.success("✅ You’re back online!", { position: "top-center" });
        const handleOffline = () => toast.error("⚠️ MemeApp requires an internet connection.", { position: "top-center" });

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            unsubscribe();
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (loading) return <LoadingScreen />;

    return (
        <>
            <ToastContainer />
            <Router>
                <Routes>
                    <Route path="/" element={user ? <App /> : <LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/liked" element={user ? <LikedMemes /> : <Navigate to="/" />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
                </Routes>
            </Router>
        </>
    );
};

// Render the App
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>
);

// Register Service Worker for PWA (Offline Support)
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("✅ Service Worker Registered"))
        .catch((err) => console.error("❌ Service Worker Registration Failed", err));
}
