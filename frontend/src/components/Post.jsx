import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Link, useNavigate } from "react-router-dom";
import Actions from "./Actions";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";
import { FaUserCircle } from "react-icons/fa"
import Linkify from "react-linkify";
import CustomLink from "./CustomLink";
import dotenv from "dotenv";


dotenv.config();


const Post = ({ post, postedBy }) => {
  const [user, setUser] = useState(null);
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [originalPoster, setOriginalPoster] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.API_BASE_URL;


  useEffect(() => {
    const getOriginalPoster = async () => {
      try {
        if (!post.repostOf) return; // No repostOf field means it's not a repost
        const originalPost = await fetch(
          `${API_BASE_URL}/api/posts/` + post.repostOf
        );
        const postData = await originalPost.json();
        const res = await fetch(
          `${API_BASE_URL}/api/users/profile/` + postData.postedBy
        );
        const userData = await res.json();
        setOriginalPoster(userData);
      } catch (error) {
        showToast("Error", error.message, "error");
        setOriginalPoster(null);
      }
    };

    getOriginalPoster();
  }, [post, showToast]);


  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/users/profile/` + postedBy
        );
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUser(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setUser(null);
      }
    };

    getUser();
  }, [postedBy, showToast]);

  const handleDeletePost = async (e) => {
    e.stopPropagation(); // stop the event from bubbling up
    try {
      e.preventDefault();
      if (!window.confirm("Are you sure you want to delete this post?")) return;

      const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post deleted", "success");
      setPosts(posts.filter((p) => p._id !== post._id));
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  if (!user) return null;
  return (
    <Flex
      gap={3}
      mb={4}
      p={3}
      onClick={() => navigate(`/${user.username}/post/${post._id}`)}
      borderWidth="1px"
      borderStyle="solid"
      borderColor="gray.dark"
      borderRadius={"lg"}
      py={5}
      mt={2}
    >
      <Flex flexDirection={"column"} alignItems={"center"}>
        <Avatar
          size="md"
          name={user.name}
          src={user?.profilePic}
          onClick={(e) => {
            navigate(`/${user.username}`);
          }}
        />
        <Box w="1px" h={"full"} bg="gray.light" my={2}></Box>
        <Box position={"relative"} w={"full"}>
          {post.replies.length === 0 && <Text textAlign={"center"}>🥱</Text>}
          {post.replies[0] && (
            <Avatar
              size="xs"
              name="John doe"
              src={post.replies[0].userProfilePic}
              position={"absolute"}
              top={"-10px"}
              left="15px"
              padding={"3px"}
              
            />
          )}

          {post.replies[1] && (
            <Avatar
              size="xs"
              name="John doe"
              src={post.replies[1].userProfilePic}
              position={"absolute"}
              bottom={"0px"}
              right="-5px"
              padding={"2px"}
            />
          )}

          {post.replies[2] && (
            <Avatar
              size="xs"
              name="John doe"
              src={post.replies[2].userProfilePic}
              position={"absolute"}
              bottom={"0px"}
              left="4px"
              padding={"2px"}
            />
          )}
        </Box>
      </Flex>
      <Flex flex={1} flexDirection={"column"} gap={2}>
        <Flex justifyContent={"space-between"} w={"full"}>
          <Flex w={"full"} alignItems={"center"}>
            <Text
              fontSize={"sm"}
              fontWeight={"bold"}
              onClick={(e) => {
                e.stopPropagation(); // stop propagation
                navigate(`/${user.username}`);
              }}
            >
              {user?.username}
            </Text>
            <Image src="/verified.png" w={4} h={4} ml={1} />
          </Flex>
          <Flex gap={4} alignItems={"center"}>
            <Text
              fontSize={"xs"}
              width={36}
              textAlign={"right"}
              color={"gray.light"}
            >
              {formatDistanceToNow(new Date(post.createdAt))} ago
            </Text>

            {currentUser?._id === user._id && (
              <DeleteIcon size={20} onClick={handleDeletePost} />
            )}
          </Flex>
        </Flex>
        {post.repostOf && originalPoster && (
          <Flex alignItems="center" gap={3} mb={3}>
            <Flex
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${originalPoster.username}/post/${post._id}`);
              }}
            >
              <Text fontSize={"xs"} color={"gray.light"}>
                Repost from: <span>@{originalPoster.username}</span>
              </Text>
            </Flex>
            {originalPoster.profilePic ? (
              <Flex
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${originalPoster.username}`);
                }}
              >
                {" "}
                <Image
                  src={originalPoster.profilePic}
                  alt={`${originalPoster.username}'s profile`}
                  boxSize="20px"
                  borderRadius="full"
                />
              </Flex>
            ) : (
              <Flex>
                <FaUserCircle size="20" />
              </Flex>
            )}
          </Flex>
        )}

        <Text fontSize={"sm"}>
          <Linkify
            componentDecorator={(decoratedHref, decoratedText, key) => (
              <CustomLink key={key} href={decoratedHref}>
                {decoratedText}
              </CustomLink>
            )}
          >
            {post.text}
          </Linkify>
        </Text>
        {post.img && (
          <Box
            borderRadius={6}
            overflow={"hidden"}
            border={"1px solid"}
            borderColor={"gray.light"}
          >
            <Image src={post.img} w={"full"} />
          </Box>
        )}

        <Flex gap={3} my={1}>
          <Actions post={post} originalPoster={originalPoster} />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Post;

