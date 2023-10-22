import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Image,
} from "@chakra-ui/react";
import { Portal } from "@chakra-ui/portal";
import { Button, useToast } from "@chakra-ui/react";
import { BsQrCode } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";
import QRCode from "qrcode.react";
import { useState } from "react";


const UserHeader = ({ user, posts }) => {
  const toast = useToast();
  const currentUser = useRecoilValue(userAtom); // logged in user
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const copyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).then(() => {
      toast({
        title: "Success.",
        status: "success",
        description: "Profile link copied.",
        duration: 3000,
        isClosable: true,
      });
    });
  };
  console.log(user.posts);
  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>@{user.username}</Text>
          </Flex>
        </Box>
        <Box>
          {user.profilePic && (
            <>
              <Avatar
                name={user.name}
                src={user.profilePic}
                size={{
                  base: "md",
                  md: "xl",
                }}
                onClick={() => setIsModalOpen(true)}
              />
              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size="full"
              >
                <ModalOverlay />
                <ModalContent
                  bg="transparent"
                  w="auto"
                  h="auto"
                  mx="auto"
                  my="auto"
                >
                  <ModalBody p="0">
                    <Image
                      src={user.profilePic}
                      maxW="100vw"
                      maxH="100vh"
                      borderRadius={"full"}
                      onClick={() => setIsModalOpen(false)}
                    />
                  </ModalBody>
                </ModalContent>
              </Modal>
            </>
          )}
          {!user.profilePic && (
            <Avatar
              name={user.name}
              src="https://bit.ly/broken-link"
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>

      <Text>{user.bio}</Text>

      <Flex gap={3}>
        <Button size={"sm"}>Use me </Button>
        {currentUser?._id !== user._id && (
          <Button
            size={"sm"}
            onClick={handleFollowUnfollow}
            isLoading={updating}
          >
            {following ? "Unfollow" : "Follow"}
          </Button>
        )}
      </Flex>
      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Link as={RouterLink} to={`/profile/${user._id}/followers`}>
            <Text color={"gray.light"}>{user.followers.length} followers</Text>
          </Link>
          <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
          <Link as={RouterLink} to={`/profile/${user._id}/following`}>
            <Text color={"gray.light"}>{user.following.length} following</Text>
          </Link>
        </Flex>
        <Flex>
          <Box className="icon-container">
            <Menu>
              <MenuButton>
                <BsQrCode size={24} cursor={"pointer"} />
              </MenuButton>
              <Portal>
                <MenuList bg={"gray.dark"} boxSize={60} p={0}>
                  <MenuItem
                    bg={"gray.dark"}
                    onClick={() => setShowQRCode(true)}
                    p={0}
                  >
                    <Flex position="relative" w="100%" h="100%">
                      <QRCode value={window.location.href} size={235} />
                    </Flex>
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
          <Box className="icon-container">
            <Menu>
              <MenuButton>
                <CgMoreO size={24} cursor={"pointer"} />
              </MenuButton>
              <Portal>
                <MenuList bg={"gray.dark"}>
                  <MenuItem bg={"gray.dark"} onClick={copyURL}>
                    Copy link
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>

      <Flex w={"full"}>
        <Flex
          flex={1}
          borderBottom={"1.5px solid white"}
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
        >
          <Text fontWeight={"bold"}> Posts ({posts.length || 0})</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
