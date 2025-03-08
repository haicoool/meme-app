import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { auth, db } from "../config/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { HiVolumeOff, HiVolumeUp } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const SUBREDDITS = ["memes", "196", "shitposting", "blursedimages", "comedyhomicide"];
const getRandomSubreddit = () => SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];

interface MemeData {
    url: string;
    title: string;
    isVideo: boolean;
    hasAudio: boolean;
}

const Meme: React.FC = () => {
    const [meme, setMeme] = useState<MemeData | null>(null);
    const [loading, setLoading] = useState(false);
    const [liked, setLiked] = useState(false);
    const [showBigHeart, setShowBigHeart] = useState(false);
    const [user, setUser] = useState(auth.currentUser);
    const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await fetchLikedMemes(currentUser.uid);
            }
        });
        fetchMeme();
        return () => unsubscribe();
    }, []);

    const fetchLikedMemes = async (userId: string) => {
        try {
            const q = query(collection(db, "likedMemes"), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            const likedUrls = new Set(querySnapshot.docs.map((doc) => doc.data().url));
            setLikedMemes(likedUrls);
        } catch (error) {
            console.error("Error fetching liked memes:", error);
        }
    };

    const fetchMeme = async () => {
        setLoading(true);
        let memeData: MemeData | null = null;

        for (let i = 0; i < 5; i++) {
            const subreddit = getRandomSubreddit();
            const API_URL = `https://www.reddit.com/r/${subreddit}/best/.json?limit=100`;

            try {
                const response = await axios.get(API_URL);
                const memes = response.data.data.children;

                const filteredMemes = memes
                    .map((m: any) => m.data)
                    .filter((m: any) =>
                        (m.post_hint === "image" || m.url.endsWith(".jpg") || m.url.endsWith(".png") || m.url.endsWith(".gif")) ||
                        (m.is_video && m.secure_media?.reddit_video?.fallback_url)
                    )
                    .filter((m: any) => !likedMemes.has(m.url));

                if (filteredMemes.length > 0) {
                    const randomMeme = filteredMemes[Math.floor(Math.random() * filteredMemes.length)];

                    memeData = randomMeme.is_video
                        ? {
                            url: randomMeme.secure_media.reddit_video.fallback_url,
                            title: randomMeme.title,
                            isVideo: true,
                            hasAudio: randomMeme.secure_media.reddit_video.has_audio || false
                        }
                        : {
                            url: randomMeme.url,
                            title: randomMeme.title,
                            isVideo: false,
                            hasAudio: false
                        };

                    break;
                }
            } catch (error) {
                console.error("Error fetching meme:", error);
            }
        }

        setTimeout(() => {
            setMeme(memeData || null);
            setLiked(false);
            setLoading(false);
            setIsMuted(!(memeData?.hasAudio ?? false)); // Mute if no audio
        }, 300);
    };


    const likeMeme = async () => {
        if (!user) {
            alert("You need to log in to like memes.");
            return;
        }
        if (!meme || liked) return;

        try {
            await addDoc(collection(db, "likedMemes"), {
                userId: user.uid,
                title: meme.title,
                url: meme.url,
                isVideo: meme.isVideo,
                createdAt: serverTimestamp(),
            });

            setLiked(true);
            setLikedMemes((prev) => new Set(prev).add(meme.url));

            // Show heart animation
            setShowBigHeart(true);
            setTimeout(() => setShowBigHeart(false), 800);

            // Auto-fetch next meme after liking
            setTimeout(fetchMeme, 800);
        } catch (error) {
            console.error("Error saving liked meme:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
            <motion.div
                className="relative bg-gray-800 p-5 rounded-xl shadow-lg w-96"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {loading ? (
                    <motion.div
                        className="flex justify-center items-center h-64"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                    </motion.div>
                ) : (
                    meme && (
                        <>
                            <h3 className="text-lg font-semibold text-white text-center mb-2">{meme.title}</h3>

                            <motion.div
                                key={meme.url}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative"
                            >
                                {meme.isVideo ? (
                                    <div className="relative rounded overflow-hidden">
                                        <video
                                            ref={videoRef}
                                            src={meme.url}
                                            autoPlay
                                            loop
                                            muted={isMuted}
                                            playsInline
                                            className="w-full rounded-lg"
                                            onDoubleClick={likeMeme}
                                        />
                                        {meme.hasAudio ? (
                                            <button
                                                onClick={() => setIsMuted(!isMuted)}
                                                className="absolute bottom-2 left-2 bg-black bg-opacity-50 p-2 rounded-full text-white"
                                            >
                                                {isMuted ? <HiVolumeOff size={22} /> : <HiVolumeUp size={22} />}
                                            </button>
                                        ) : (
                                            <p className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                No Audio
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <img
                                        src={meme.url}
                                        alt="Meme"
                                        className="w-full rounded-lg cursor-pointer"
                                        onDoubleClick={likeMeme}
                                    />
                                )}
                            </motion.div>

                            <AnimatePresence>
                                {showBigHeart && (
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                    >
                                        <AiFillHeart className="text-red-500 text-6xl opacity-80" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-4 flex justify-between items-center">
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" onClick={fetchMeme}>
                                    Next Meme
                                </button>

                                {user && (
                                    <button onClick={likeMeme} className="text-2xl transition-transform hover:scale-110">
                                        {liked ? <AiFillHeart className="text-red-500" /> : <AiOutlineHeart className="text-gray-400" />}
                                    </button>
                                )}
                            </div>
                        </>
                    )
                )}
            </motion.div>
        </div>
    );
};

export default Meme;
