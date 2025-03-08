import React, { useState, useEffect, TouchEvent } from "react";
import Navbar from "../components/Navbar";
import { auth, db } from "../config/firebase";
import { collection, query, where, getDocs, orderBy, DocumentData } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { AiOutlineClose, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

const LikedMemes: React.FC = () => {
    const [likedMemes, setLikedMemes] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    // Listen for authentication changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
                setLikedMemes([]); // Clear memes if user logs out
            }
        });

        return () => unsubscribe();
    }, []);

    // Fetch liked memes when userId is available
    useEffect(() => {
        if (!userId) return;

        const fetchLikedMemes = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, "likedMemes"),
                    where("userId", "==", userId),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const memes: DocumentData[] = [];
                querySnapshot.forEach((doc) => memes.push(doc.data()));
                setLikedMemes(memes);
            } catch (error) {
                console.error("Error fetching liked memes:", error);
            }
            setLoading(false);
        };

        fetchLikedMemes();
    }, [userId]); // Re-run when userId changes

    // Handle swipe gestures
    const handleTouchStart = (e: TouchEvent) => setTouchStartX(e.touches[0].clientX);
    const handleTouchEnd = (e: TouchEvent) => {
        if (touchStartX === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchStartX - touchEndX;

        if (swipeDistance > 50) handleNext(); // Swipe left → Next
        else if (swipeDistance < -50) handlePrev(); // Swipe right → Previous

        setTouchStartX(null);
    };

    const handleNext = () => {
        if (selectedIndex !== null && selectedIndex < likedMemes.length - 1) {
            setSelectedIndex(selectedIndex + 1);
        }
    };

    const handlePrev = () => {
        if (selectedIndex !== null && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white px-4">
            <Navbar />
            <h2 className="text-3xl font-bold mt-6 mb-4 text-center">Liked Memes</h2>

            {loading ? (
                <p className="text-lg text-gray-400 animate-pulse">Loading...</p>
            ) : likedMemes.length === 0 ? (
                <p className="text-lg text-gray-400">No liked memes yet! 😭</p>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-1 w-full max-w-5xl">
                        {likedMemes.map((meme, index) => (
                            <div
                                key={index}
                                className="relative aspect-square bg-gray-800 overflow-hidden group cursor-pointer"
                                onClick={() => setSelectedIndex(index)}
                            >
                                {meme.isVideo ? (
                                    <video
                                        src={meme.url}
                                        poster={meme.thumbnail || "https://via.placeholder.com/300"}
                                        className="w-full h-full object-cover"
                                        playsInline
                                        muted
                                    />
                                ) : (
                                    <img src={meme.url} alt="Meme" className="w-full h-full object-cover" />
                                )}

                                {/* Hover effect for title */}
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white text-sm px-2 text-center">{meme.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Liked Memes Count */}
                    <p className="text-lg mt-4">Total Liked Memes: {likedMemes.length}</p>
                </>
            )}

            {/* Fullscreen Meme Modal with Swipe */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="relative max-w-4xl w-full p-4 flex flex-col items-center">
                        <button
                            className="absolute top-2 right-2 text-white text-2xl p-2 bg-gray-800 rounded-full"
                            onClick={() => setSelectedIndex(null)}
                        >
                            <AiOutlineClose />
                        </button>

                        {likedMemes[selectedIndex]?.isVideo ? (
                            <video
                                src={likedMemes[selectedIndex].url}
                                controls
                                autoPlay
                                poster={likedMemes[selectedIndex].thumbnail || "https://via.placeholder.com/600"}
                                className="w-full max-h-[90vh] object-contain"
                            />
                        ) : (
                            <img src={likedMemes[selectedIndex].url} alt="Meme" className="w-full max-h-[90vh] object-contain" />
                        )}

                        <p className="text-center text-gray-300 mt-2">{likedMemes[selectedIndex]?.title}</p>

                        {/* Navigation Buttons */}
                        <div className="absolute inset-y-1/2 w-full flex justify-between px-4">
                            <button
                                className={`p-2 bg-gray-700 text-white rounded-full ${selectedIndex === 0 ? "opacity-50" : ""}`}
                                onClick={handlePrev}
                                disabled={selectedIndex === 0}
                            >
                                <AiOutlineLeft size={32} />
                            </button>
                            <button
                                className={`p-2 bg-gray-700 text-white rounded-full ${selectedIndex === likedMemes.length - 1 ? "opacity-50" : ""}`}
                                onClick={handleNext}
                                disabled={selectedIndex === likedMemes.length - 1}
                            >
                                <AiOutlineRight size={32} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LikedMemes;
