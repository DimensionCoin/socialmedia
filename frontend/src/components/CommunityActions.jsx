import React, { useState, useEffect } from "react";
import {
  BsHandThumbsUp,
  BsHandThumbsUpFill,
  BsHandThumbsDown,
  BsHandThumbsDownFill,
} from "react-icons/bs";
import { FaRegCommentDots } from "react-icons/fa6";
import { useRecoilValue, useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import {
  Box,
  IconButton,
  Tooltip,
  Text,
  Stack,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";

const CommunityActions = ({ post }) => {
  const currentUser = useRecoilValue(userAtom);
  const [isLiked, setIsLiked] = useState(false); // Example state to track if the post is liked by the user
  const [isDisliked, setIsDisliked] = useState(false); // Example state to track if the post is disliked by the user
  const showToast = useShowToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLike = async () => {
    try {
      const response = await fetch(
        `/api/community/community-post/${post._id}/like`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("Server response data:", data);

      if (response.ok) {
        const wasLikedBefore = post.likes.includes(currentUser._id);
        if (wasLikedBefore) {
          post.likes = post.likes.filter(
            (userId) => userId !== currentUser._id
          );
        } else {
          post.likes.push(currentUser._id);
          post.dislikes = post.dislikes.filter(
            (userId) => userId !== currentUser._id
          ); // remove dislike if user had previously disliked
        }

        setIsLiked(!wasLikedBefore);
        setIsDisliked(false);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error liking the post:", error);
    }
  };

  const handleDislike = async () => {
    try {
      const response = await fetch(
        `/api/community/community-post/${post._id}/dislike`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("Server response data:", data);

      if (response.ok) {
        const wasDislikedBefore = post.dislikes.includes(currentUser._id);
        if (wasDislikedBefore) {
          post.dislikes = post.dislikes.filter(
            (userId) => userId !== currentUser._id
          );
        } else {
          post.dislikes.push(currentUser._id);
          post.likes = post.likes.filter(
            (userId) => userId !== currentUser._id
          ); // remove like if user had previously liked
        }

        setIsDisliked(!wasDislikedBefore);
        setIsLiked(false);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error disliking the post:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setIsLiked(post.likes.includes(currentUser._id));
      setIsDisliked(post.dislikes.includes(currentUser._id));
    }
  }, [post, currentUser]);
  return (
    <Box d="flex" alignItems="center">
      <Stack direction="row" spacing={1}>
        <Flex alignItems={"center"}>
          <Tooltip label="Like" aria-label="Like tooltip">
            <IconButton
              icon={isLiked ? <BsHandThumbsUpFill /> : <BsHandThumbsUp />}
              onClick={handleLike}
              colorScheme={isLiked ? "blue" : "gray"}
              variant="ghost"
              aria-label="Like button"
            />
          </Tooltip>
          <Text>{post.likes.length || 0}</Text>
        </Flex>

        <Flex alignItems={"center"}>
          <Tooltip label="Dislike" aria-label="Dislike tooltip">
            <IconButton
              icon={
                isDisliked ? <BsHandThumbsDownFill /> : <BsHandThumbsDown />
              }
              onClick={handleDislike}
              colorScheme={isDisliked ? "red" : "gray"}
              variant="ghost"
              aria-label="Dislike button"
            />
          </Tooltip>
          <Text>{post.dislikes.length || 0}</Text>
        </Flex>
        <Flex alignItems={"center"} ml={3}>
          <Box>
            <FaRegCommentDots />
          </Box>{" "}
        </Flex>
      </Stack>
    </Box>
  );
};

export default CommunityActions;
