// Indicator as to who is who in the game

import React from "react";

const PlayerAvatar = ({ id }: { id: string }) => {
  // Guard clause: If id is undefined or empty, do not render the avatar
  if (!id || id.length === 0) return null;

  // Sets the background color based on the first character of the PID
  const bg = id.charCodeAt(0) % 2 === 0 ? "bg-blue-500" : "bg-green-500";

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg}`}>
      {/* Displays the first character of the PID in uppercase */}
      <span className="text-white font-bold">{id[0].toUpperCase()}</span>
    </div>
  );
};

export default PlayerAvatar;
