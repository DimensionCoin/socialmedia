import {
  Box,
  useBreakpointValue,
  Text,
  Link,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { FaMagnifyingGlass, FaUserGroup } from "react-icons/fa6";
import CreatePost from "./BottomBarPost";
import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";

const Bottombar = () => {
  const user = useRecoilValue(userAtom);
  const displayValue = useBreakpointValue({ base: "block", md: "none" });
  const [isVisible, setIsVisible] = useState(true);
  const timeoutId = useRef(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    // Fetch conversations for the logged-in user
    const fetchConversations = async () => {
      try {
        const response = await fetch(`/api/messages/conversations`, {
          headers: {
            Authorization: `Bearer ${user.token}`, // Assuming you store the token in the user object
          },
        });
        const conversations = await response.json();

        // Check if any conversation has the 'seen' property set to false
        const unread = conversations.some(
          (conversation) => !conversation.lastMessage.seen
        );
        setHasUnreadMessages(unread);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };

    fetchConversations();

    // If socket is available, listen for the unreadMessage event
    if (socket && typeof socket.on === "function") {
      socket.on("unreadMessage", () => {
        setHasUnreadMessages(true);
      });

      // Cleanup the listener when the component is unmounted or when the socket changes
      return () => {
        socket.off("unreadMessage");
      };
    }
  }, [user, socket]);

  // This useEffect will handle window-wide activity (scroll and click)
  useEffect(() => {
    const handleActivity = () => {
      clearTimeout(timeoutId.current);
      setIsVisible(true);
      timeoutId.current = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    };

    window.addEventListener("scroll", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("click", handleActivity);
      clearTimeout(timeoutId.current);
    };
  }, []);

  const handleTouch = () => {
    clearTimeout(timeoutId.current);
    setIsVisible(true);
    timeoutId.current = setTimeout(() => {
      setIsVisible(false);
    }, 1500);
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutId.current);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutId.current = setTimeout(() => {
      setIsVisible(false);
    }, 1500);
  };

  if (!user) return null;

  return (
    <Box
      as="footer"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      width="100%"
      bg="rgba(0, 0, 0, 0.7)" // <-- Semi-transparent black background
      backdropFilter="blur(4px)" // <-- Blur effect
      color="white"
      py={4}
      px={6}
      textAlign="center"
      boxShadow="md"
      display={displayValue === "none" ? "none" : "block"} // Only hide for md breakpoint
      transform={isVisible ? "translateY(0)" : "translateY(100%)"} // Toggle based on isVisible
      transition="transform 0.3s ease-in-out" // Smooth transition effect
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouch}
    >
      <Flex
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Link
          as={RouterLink}
          to={"/communities"}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <FaUserGroup size={20} />
          <Text fontSize={"xs"} mt={1}>Communities</Text>
        </Link>
        <Link
          as={RouterLink}
          to={`/${user.username}`}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <RxAvatar size={24} />
          <Text fontSize={"xs"} mt={1}>User</Text>
        </Link>
        <Box boxSize="44px">
          <CreatePost />
          
        </Box>
        <Link
        as={RouterLink}
        to={"/chat"}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <BsFillChatQuoteFill size={20} />
          <Text fontSize={"xs"} mt={1}>Chat</Text>
          {hasUnreadMessages && (
            <Badge
              position="absolute"
              top="-6px"
              right="-8px"
              borderRadius="100%"
              w="16px"
              h="16px"
              bg="red.500"
              border="2px solid white"
            ></Badge>
          )}
        </Link>
        <Link
          as={RouterLink}
          to={`/settings`}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <MdOutlineSettings size={20} />
          <Text fontSize={"xs"} mt={1}>Settings</Text>
        </Link>
      </Flex>
    </Box>
  );
};

export default Bottombar;
