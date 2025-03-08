import React from "react";
import Navbar from "./components/Navbar";
import Meme from "./components/Meme";

const App: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Navbar /> {/* Now the Navbar is reusable! */}
            <Meme />
        </div>
    );
};

export default App;
