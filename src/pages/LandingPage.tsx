import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const LandingPage = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqData = [
        {
            question: "📱 Install on Android?",
            answer: (
                <ul className="list-disc pl-4 text-gray-400 text-sm">
                    <li>Open the app in <b>Chrome</b>.</li>
                    <li className="flex items-center gap-2">
                        Tap the menu button
                        <img src="/icons/android-menu.png" alt="Android Menu" className="w-5 h-5" />
                        (top-right corner).
                    </li>
                    <li>Tap <b>Add to Home Screen</b>. Done!</li>
                </ul>
            ),
        },
        {
            question: "🍏 Install on iPhone?",
            answer: (
                <ul className="list-disc pl-4 text-gray-400 text-sm">
                    <li>Open the app in <b>Safari</b>.</li>
                    <li className="flex items-center gap-2">
                        Tap the <b>Share</b> button
                        <img src="/icons/ios-share.png" alt="iOS Share Icon" className="w-5 h-5" />
                    </li>
                    <li className="flex items-center gap-2">
                        Scroll and tap <b>Add to Home Screen</b>
                        <img src="/icons/ios-add-home.png" alt="Add to Home Screen Icon" className="w-5 h-5" />
                    </li>
                    <li>That’s it! 🎉</li>
                </ul>
            ),
        },
        {
            question: "❓ Why install the app?",
            answer: (
                <ul className="list-disc pl-4 text-gray-400 text-sm">
                    <li>One-tap access, no browser hassle.</li>
                    <li>Vibes like a real app, smooth and fast.</li>
                    <li>Even works offline. Memes anytime, anywhere.</li>
                </ul>
            ),
        },
    ];


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white px-6">

            {/* Hero Section */}
            <motion.h1
                className="text-6xl font-extrabold tracking-tight flex items-center gap-2 text-center mt-24"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Gradient Only on Text */}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                    MemeApp
                </span>
                <span>🎉</span>
            </motion.h1>
            <p className="mt-2 text-lg text-gray-400 text-center max-w-md">
                See and Like Random memes from Reddit
            </p>

            {/* CTA Button */}
            <motion.button
                onClick={() => navigate("/login")}
                className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-full shadow-md hover:scale-105 transition-transform"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                Hop In 🚀
            </motion.button>

            {/* FAQ Section */}
            <motion.div
                className="mt-12 p-5 w-full max-w-lg bg-gray-900 rounded-2xl shadow-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                <h2 className="text-2xl font-semibold text-blue-400 text-center">📲 Install MemeApp</h2>

                <div className="mt-6 space-y-4">
                    {faqData.map((item, index) => (
                        <div key={index} className="bg-gray-800 rounded-xl p-4">
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="flex justify-between items-center w-full text-white text-left"
                            >
                                <span className="font-medium">{item.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp size={20} className="text-gray-300" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-300" />
                                )}
                            </button>

                            {openIndex === index && (
                                <motion.div
                                    className="mt-2 text-gray-400"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {item.answer}
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
