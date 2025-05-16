"use client";

// can be used as a universal pop up renderer

import {useEffect, useState} from "react";

interface UsernamePromptProps {
    onSubmit: (username: string) => void;
}

const UsernamePrompt: React.FC<UsernamePromptProps> = ({onSubmit}) => {
    const [username, setUsername] = useState("");
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const storedUsername = sessionStorage.getItem("mafia-username");
        if (!storedUsername) {
            setVisible(true); // Show prompt if no username is stored
        } else {
            onSubmit(storedUsername); // Use stored username immediately
        }
    }, [onSubmit]);

    const handleSubmit = () => {
        const trimmed = username.trim();
        const finalUsername = 
            trimmed || `Guest-${Math.floor(Math.random() * 10000)}`; // Fallback username

        sessionStorage.setItem("mafia-username", finalUsername); // Store username
        onSubmit(finalUsername);
        setVisible(false); // Hide prompt
    };

    if (!visible) return null; // Don't render if not visible

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-zinc-800 p-6 rounded-lg shadow-lg w-full max-w-sm text-white">
          <h2 className="text-xl font-bold mb-4">Enter Your Username</h2>
          <input
            type="text"
            className="w-full p-2 mb-4 rounded bg-zinc-700 text-white"
            placeholder="e.g. Player123"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded w-full"
          >
            Confirm
          </button>
        </div>
      </div>
    );
};

export default UsernamePrompt;