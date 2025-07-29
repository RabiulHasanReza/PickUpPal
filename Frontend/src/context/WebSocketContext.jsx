import { useEffect, useRef, useState } from "react";

const useWebSocket = () => {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    ws.current = new WebSocket("ws://127.0.0.1:3000/ws/ride");

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Helper function to send messages
  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  return { 
    ws: ws.current, // Return the current WebSocket instance
    connected,
    sendMessage // Provide a convenient way to send messages
  };
};

export default useWebSocket;