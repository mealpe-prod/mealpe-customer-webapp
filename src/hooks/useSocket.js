import { useEffect, useState } from "react";
import io from "socket.io-client";

const SOCKET_SERVER_URL = import.meta.env.VITE_APP_BACKEND_BASE_URL;
let socket; // Persistent socket instance

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Initialize socket only once
    if (!socket) {
      socket = io(SOCKET_SERVER_URL, {
        transports: ["websocket"],
        autoConnect: false, // Connect explicitly
      });
    }

    return () => {
      if (socket) {
        socket.disconnect(); // Disconnect socket on unmount
        socket.off("meal_status_update");
        console.log("Socket disconnected and listeners cleaned up!");
      }
    };
  }, []);

  const connectSocket = (authId) => {
    if (socket && !socket.connected) {
      console.log("Connecting to socket...");
      socket.connect();

      socket.on("connect", () => {
        setConnected(true);
        console.log("Socket connected!");

        // Emit subscription event when connected
        socket.emit("subscribe_meal_status", { data: authId });
        console.log("Emitted subscribe_meal_status with authId:", authId);

        // Confirm subscription
        socket.on("subscription_confirmed", (data) => {
          setSubscribed(true);
          console.log("Subscription confirmed:", data);
        });

        // Listen for meal_status_update
        socket.on("meal_status_update", (data) => {
          console.log('Received meal_status_update:', data);
          setQrCodeData(data);
          // Disconnect after receiving required data
          // disconnectSocket();
        });
      });

      socket.on("disconnect", () => {
        setConnected(false);
        setSubscribed(false);
        console.log("Socket disconnected!");
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });
    }
  };

  const disconnectSocket = () => {
    if (socket && socket.connected) {
      console.log("Disconnecting socket...");
      socket.off("meal_status_update"); // Remove listeners to avoid duplicates
      socket.disconnect();
      setSubscribed(false);
      setQrCodeData(null);
    }
  };

  return {
    connected,
    subscribed,
    qrCodeData,
    connectSocket,
    disconnectSocket,
  };
};