import {
  Box,
  useBreakpointValue,
  useTheme,
  Link,
  Flex,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { FaMagnifyingGlass } from "react-icons/fa6";
import CreatePost from "./BottomBarPost";
import React, { useState, useEffect, useRef } from "react";

const Bottombar = () => {
  const user = useRecoilValue(userAtom);
  const displayValue = useBreakpointValue({ base: "block", md: "none" });
  const [isVisible, setIsVisible] = useState(true);
  const timeoutId = useRef(null);

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
        <Link as={RouterLink} to={"/explore"}>
          <FaMagnifyingGlass size={20} />
        </Link>
        <Link as={RouterLink} to={`/${user.username}`}>
          <RxAvatar size={24} />
        </Link>
        <Box boxSize="50px">
          {" "}
          {/* Adjust this to make the CreatePost larger */}
          <CreatePost />
        </Box>
        <Link as={RouterLink} to={`/chat`}>
          <BsFillChatQuoteFill size={20} />
        </Link>
        <Link as={RouterLink} to={`/settings`}>
          <MdOutlineSettings size={20} />
        </Link>
      </Flex>
    </Box>
  );
};

export default Bottombar;
