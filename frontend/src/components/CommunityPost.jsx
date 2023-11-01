import React, { useState } from "react";
import {
  Avatar,
  Box,
  Flex,
  Image,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Divider,
  chakra,
} from "@chakra-ui/react";
import { Portal } from "@chakra-ui/portal";
import { CgMoreO } from "react-icons/cg";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { useNavigate } from "react-router-dom";
import Linkify from "react-linkify";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { communityPostsAtom } from "../atoms/communityAtom";
import { Link, Link as RouterLink } from "react-router-dom";

const CommunityPost = ({ posts, community }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const User = useRecoilValue(userAtom);
  const communityPosts = useRecoilValue(communityPostsAtom);

  const openModal = (imageUrl) => {
    setCurrentImage(imageUrl);
    setIsModalOpen(true);
  };

  return (
    <Flex flexDirection="column" gap={4}>
      {posts.map((post, index) => (
        <chakra.div
          as={RouterLink}
          to={`/community/${community._id}/post/${post._id}`}
          key={post._id}
          style={{ textDecoration: "none", display: "block" }}
        >
          <Flex key={index} gap={3} mb={0} p={3} py={5}>
            <Avatar
              size="sm"
              name={post.postedBy.username}
              src={post.postedBy.profilePic}
              onClick={() => navigate(`/${post.postedBy.username}`)}
            />

            <Flex flex={1} flexDirection="column" gap={2}>
              <Flex
                justifyContent="space-between"
                w="full"
                gap={6}
                alignItems="center"
              >
                <Flex gap={3} alignItems="center">
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    onClick={() => navigate(`/${post.postedBy.username}`)}
                  >
                    {post.postedBy.username}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                  </Text>
                </Flex>
                <Flex alignItems="center">
                  <Menu>
                    <MenuButton>
                      <CgMoreO size={15} cursor={"pointer"} />
                    </MenuButton>
                    <Portal>
                      <MenuList bg={"gray.dark"}>
                        <MenuItem bg={"gray.dark"}>Copy link</MenuItem>
                      </MenuList>
                    </Portal>
                  </Menu>
                </Flex>
              </Flex>
              <Divider mb={1} />
              <Flex direction="row" align="start" justify="space-between">
                <Text fontSize="xs" flex="1" mr={3}>
                  <Linkify>
                    {post.text.length > 100
                      ? `${post.text.slice(0, 100)}...`
                      : post.text}
                  </Linkify>
                </Text>

                {post.img && (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius={6}
                    overflow="hidden"
                    border="1px solid"
                    borderColor="gray.dark"
                    p={3}
                    h={140}
                    w={180}
                    flexShrink={0} // This ensures the image doesn't shrink when text content grows
                  >
                    <Image
                      src={post.img}
                      w="full"
                      h={"auto"}
                      onClick={() => openModal(post.img)}
                    />
                  </Box>
                )}
              </Flex>
              <Text fontSize={"xs"}>{post.replies.length} replies</Text>
              <Divider mt={2} />
            </Flex>
          </Flex>
        </chakra.div>
      ))}
    </Flex>
  );
};

export default CommunityPost;
