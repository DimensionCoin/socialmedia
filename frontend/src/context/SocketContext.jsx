import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import io from "socket.io-client";
import userAtom from "../atoms/userAtom";
import Header from "../components/Header";
import Bottombar from "../components/Bottombar";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false); // New state
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      query: {
        userId: user?._id,
      },
    });

    setSocket(socket);

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("unreadMessage", () => {
      setHasUnreadMessages(true);
    });

    return () => socket && socket.close();
  }, [user?._id]);

  return (
    <SocketContext.Provider
      value={{ socket, onlineUsers, hasUnreadMessages, setHasUnreadMessages }}
    >
      {children}
  
    </SocketContext.Provider>
  );
};

