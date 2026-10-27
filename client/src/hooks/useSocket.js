
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext.jsx";

export function useSocket(roomId) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !roomId) return;

    const s = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",
      { auth: { token } }
    );

    setSocket(s);

    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onConnect = () => {
      s.emit("room:join", roomId);
    };

    s.on("connect", onConnect);
    s.on("chat:message", onMessage);

    return () => {
      s.off("connect", onConnect);
      s.off("chat:message", onMessage);
      s.disconnect();
      setSocket(null);
    };
  }, [token, roomId]);

  const sendMessage = useCallback(
    (text) => {
      if (typeof text === "string" && text.trim()) {
        socket?.emit("chat:message", {
          roomId,
          text: text.trim(),
        });
      }
    },
    [socket, roomId]
  );

  return { messages, sendMessage };
}
