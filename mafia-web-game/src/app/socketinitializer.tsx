"use client";

import { useEffect, PropsWithChildren } from "react";

export default function SocketInitializer({ children }: PropsWithChildren) {
    useEffect(() => {
        fetch("/api/socket"); // ping the API to set up Socket.IO on the server
    }, []);

    return <>{children}</>; // Render children without any additional markup
}