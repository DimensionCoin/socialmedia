import React from "react";
import { Box, Text, Flex, Avatar, Divider } from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import CommunityReplyActions from "./CommunityReplyActions";

const CommunityPostReplies = ({ post }) => {
  const navigate = useNavigate();
  // Destructuring replies from the post object
  const { replies } = post;

  // Rendering each reply in the post
  return (
    <Box mt={5}>
      {replies && replies.length > 0 ? (
        replies.map((reply) => (
          <Box key={reply._id} my={4} bg="gray.dark" p={4} borderRadius="md">
            <Flex alignItems="center" justifyContent="space-between">
              <Flex alignItems={"center"} gap={3}>
                <Avatar
                  size="sm"
                  name={reply.user.name}
                  src={reply.user.profilePic}
                  onClick={(e) => {
                    navigate(`/${reply.user.username}`);
                  }}
                />
                <Text fontSize="sm" fontWeight="bold">
                  {reply.user.username || "Unknown User"}
                </Text>
              </Flex>
              <Text fontSize={"xs"}>
                {formatDistanceToNow(new Date(reply.createdAt))} ago
              </Text>
            </Flex>
            <Divider my={3} />
            <Text fontSize="sm">{reply.text}</Text>
            <CommunityReplyActions post={post} reply={reply}/>
            {reply.image && (
              <Box mt={3}>
                <img
                  src={reply.image}
                  alt="Reply"
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}
          </Box>
        ))
      ) : (
        <Text>No replies yet!</Text>
      )}
    </Box>
  );
};

export default CommunityPostReplies;
