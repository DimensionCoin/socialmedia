import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import Actions from "../components/Actions";
import { useEffect, useState } from "react"; 
import Comment from "../components/Comment";
import useGetUserProfile from "../hooks/useGetUserProfile";
import useShowToast from "../hooks/useShowToast";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";
import postsAtom from "../atoms/postsAtom";
import Linkify from "react-linkify";
import CustomLink from "../components/CustomLink";
import { FaUserCircle } from "react-icons/fa";

const PostPage = () => {
  const { user, loading } = useGetUserProfile();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const showToast = useShowToast();
  const { pid } = useParams();
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();

  const currentPost = posts[0];

  const [originalPoster, setOriginalPoster] = useState(null);

  const handleprofile = () => {
    navigate(`/${user.username}`);
  };

  useEffect(() => {
    const getOriginalPoster = async () => {
      if (!currentPost || !currentPost.repostOf) return; // Check if currentPost exists and has repostOf property

      try {
        const originalPost = await fetch(`/api/posts/` + currentPost.repostOf);
        const postData = await originalPost.json();
        const res = await fetch(`/api/users/profile/` + postData.postedBy);
        const userData = await res.json();
        setOriginalPoster(userData);
      } catch (error) {
        showToast("Error", error.message, "error");
        setOriginalPoster(null);
      }
    };

    getOriginalPoster();
  }, [currentPost, showToast]);

  useEffect(() => {
    const getPost = async () => {
      setPosts([]);
      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setPosts([data]);
      } catch (error) {
        showToast("Error", error.message, "error");
      }
    };
    getPost();
  }, [showToast, pid, setPosts]);

  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) return;

      const res = await fetch(`/api/posts/${currentPost._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post deleted", "success");
      navigate(`/${user.username}`);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!currentPost) return null;
  console.log("currentPost", currentPost);

  return (
    <>
      {currentPost && (
        <Flex
          gap={3}
          mb={4}
          p={3}
          py={5}
          mt={2}
        >
          <Flex flexDirection={"column"} alignItems={"center"}>
            <Avatar
              src={user.profilePic}
              size={"md"}
              name={user.name}
              onClick={handleprofile}
            />
            <Box w="1px" h={"full"} bg="gray.light" my={2}></Box>
          </Flex>
          <Flex flex={1} flexDirection={"column"} gap={2}>
            <Flex justifyContent={"space-between"} w={"full"}>
              <Flex w={"full"} alignItems={"center"}>
                <Text
                  fontSize={"sm"}
                  fontWeight={"bold"}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/${user.username}`);
                  }}
                >
                  {user.username}
                </Text>
                <Image src="/verified.png" w={4} h={4} ml={1} />
              </Flex>
              {currentUser?._id === user._id && (
                <DeleteIcon size={20} onClick={handleDeletePost} />
              )}
            </Flex>
            {currentPost.repostOf && originalPoster && (
              <Box mb={3}>
                {/* Repost Text */}
                <Text mb={2} w="full">
                  {currentPost.repostText}
                </Text>

                {/* Original Poster's Info */}
                <Flex alignItems="center" gap={3}>
                  {originalPoster.profilePic ? (
                    <Image
                      src={originalPoster.profilePic}
                      alt={`${originalPoster.username}'s profile`}
                      boxSize="20px"
                      borderRadius="full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${originalPoster.username}`);
                      }}
                    />
                  ) : (
                    <FaUserCircle
                      size="20"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${originalPoster.username}`);
                      }}
                    />
                  )}
                  {/* Original Poster's Username */}
                  <Text fontSize={"xs"} color={"gray.light"}>
                    Repost from: <span>@{originalPoster.username}</span>
                  </Text>
                </Flex>
              </Box>
            )}

            <Text fontSize={"sm"}>
              <Linkify
                componentDecorator={(decoratedHref, decoratedText, key) => (
                  <CustomLink key={key} href={decoratedHref}>
                    {decoratedText}
                  </CustomLink>
                )}
              >
                {currentPost.text}
              </Linkify>
            </Text>
            {currentPost.img && (
              <Box
                borderRadius={6}
                overflow={"hidden"}
                border={"1px solid"}
                borderColor={"gray.light"}
              >
                <Image src={currentPost.img} w={"full"} />
              </Box>
            )}

            <Flex gap={3} my={1}>
              <Actions post={currentPost} />
            </Flex>
          </Flex>
        </Flex>
      )}

      {currentPost.replies.map((reply) => (
        <Comment
          key={reply._id}
          reply={reply}
          lastReply={
            reply._id ===
            currentPost.replies[currentPost.replies.length - 1]._id
          }
        />
      ))}
    </>
  );
};

export default PostPage;
