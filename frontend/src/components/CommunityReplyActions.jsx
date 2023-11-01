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
  Button,
  FormControl,
  Input,
} from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";

const CommunityReplyActions = ({ reply, post }) => {
  const currentUser = useRecoilValue(userAtom);
  const [isLiked, setIsLiked] = useState(false); // Example state to track if the post is liked by the user
  const [isDisliked, setIsDisliked] = useState(false); // Example state to track if the post is disliked by the user
  const showToast = useShowToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (currentUser) {
      setIsLiked(reply.likes.includes(currentUser._id));
      setIsDisliked(reply.dislikes.includes(currentUser._id));
    }
  }, [reply, currentUser]);

  const handleLike = async () => {
    try {
      const response = await fetch(
        `/api/community/community-post/${post._id}/reply/${reply._id}/like`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        const wasLikedBefore = reply.likes.includes(currentUser._id);
        if (wasLikedBefore) {
          reply.likes = reply.likes.filter(
            (userId) => userId !== currentUser._id
          );
        } else {
          reply.likes.push(currentUser._id);
          reply.dislikes = reply.dislikes.filter(
            (userId) => userId !== currentUser._id
          );
        }

        setIsLiked(!wasLikedBefore);
        setIsDisliked(false);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error liking the reply:", error);
    }
  };

  const handleDislike = async () => {
    try {
      const response = await fetch(
        `/api/community/community-post/${post._id}/reply/${reply._id}/dislike`,
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
        const wasDislikedBefore = reply.dislikes.includes(currentUser._id);
        if (wasDislikedBefore) {
          reply.dislikes = reply.dislikes.filter(
            (userId) => userId !== currentUser._id
          );
        } else {
          reply.dislikes.push(currentUser._id);
          reply.likes = reply.likes.filter(
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

  const handleReplySubmit = async () => {
    try {
      const response = await fetch(
        `/api/community/community-post/${post._id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: replyText }), // Send replyText as the body
        }
      );

      const data = await response.json();
      if (response.ok) {
        showToast("Success", "Your reply has been posted.", "success");
        setReplyText(""); // Clear the input field after successful post
        onClose(); // Close the modal after successful post
      } else {
        showToast("Error", data.error, "error");
      }
    } catch (error) {
      showToast(
        "Error",
        "An error occurred while posting your reply.",
        "error"
      );
    }
  };
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
          <Text>{reply.likes.length || 0}</Text>
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
          <Text>{reply.dislikes.length || 0}</Text>
        </Flex>
        <Flex alignItems={"center"} ml={3}>
          <Button size={"sm"} onClick={onOpen}>
            <FaRegCommentDots />
          </Button>
        </Flex>
      </Stack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="black" color="white">
          <ModalHeader size={2}>Leave A Comment!</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply goes here.."
                colorScheme={"white"}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="gray"
              size={"sm"}
              mr={3}
              onClick={handleReplySubmit}
            >
              Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CommunityReplyActions;
