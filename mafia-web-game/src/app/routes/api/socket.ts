import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import { initSocketServer } from "../../sockets/server";

// Extend NextApiResponse so TypeScript knows about `socket.server.io field
type NextApiResponseWithIO = NextApiResponse & {
    socket: {
        server: HTTPServer & { io?: import("socket.io").Server };
    };
};

export const config = {
    api: { bodyParser: false}, // Disable body parsing so socket.io can take over
};

export default function handler (
    _req: NextApiRequest,
    res: NextApiResponseWithIO
) {
    // --- Safety Check --- //
    if (!res.socket || !res.socket.server) {
        return res.status(500).end("Socket Not Available!");
    }

    // --- Initialize Once --- //
    if (!res.socket.server.io) {
        const io = initSocketServer(res.socket.server); // hook up server logic
        res.socket.server.io = io; // stash so we don't re-initialize
        console.log("socket.IO Initialized!");
    }

    // --- End HTTP Response --- //
    res.end(); 
}