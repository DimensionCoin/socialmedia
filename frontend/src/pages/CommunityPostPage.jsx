import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Image, Text, Divider, Flex, Avatar } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import CommunityActions from "../components/CommunityActions";

const CommunityPostPage = () => {
  const { communityId, postId } = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const showToast = useShowToast();
  const navigate = useNavigate();



  useEffect(() => {
    // Specify the full URL for the fetch request
    fetch(`/api/community/${communityId}/posts`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const specificPost = data.find((p) => p._id === postId);
        setPost(specificPost);
      })

      .catch((error) => console.error("Error fetching post:", error));
  }, [communityId, postId]);

  if (!post) return <div>Loading...</div>;

  return (
    <Box p={5}>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems={"center"} gap={3}>
          <Avatar
            size="sm"
            name={post.postedBy.username}
            src={post.postedBy.profilePic}
            onClick={(e) => {
              navigate(`/${user.username}`);
            }}
          />
          <Text fontSize="sm" fontWeight="bold">
            {post.postedBy?.username || "Unknown User"}
          </Text>
        </Flex>
        <Text fontSize={"xs"}>
          {formatDistanceToNow(new Date(post.createdAt))} ago
        </Text>
      </Flex>
      <Divider my={3} />
      <Text fontSize="sm">{post.text}</Text>
      <Divider my={3} />
      {post.img && (
        <>
          <Flex justifyContent="center" alignItems="center">
            <Flex>
              <Box mt={0}>
                <Image src={post.img} w="200px" h="auto" alt="Community post" />
              </Box>
            </Flex>
          </Flex>
          <Divider my={1}/>
        </>
      )}
      <CommunityActions post={post}/>
    </Box>
  );
};

export default CommunityPostPage;
