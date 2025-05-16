// client-side connection and reusable emit/on logics

import io from "socket.io-client";

const socket = io({
    path: "/api/socket",
});

export default socket;