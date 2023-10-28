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
import {AiFillGithub} from "react-icons/ai"
import {FaXTwitter} from "react-icons/fa6"
import { FaDonate } from "react-icons/fa";
import CreateCommunity from "./CreateCommunity";

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

  return (
    <VStack gap={4} alignItems={"start"} w={"full"}>
      {/* Display the header image */}
      <Box w={"full"} position="relative">
        {user.headerImage && (
          <Image
            src={user.headerImage}
            alt="User Header Image"
            w="100%"
            h="300px"
            borderRadius="lg"
            objectFit={"cover"}
          />
        )}

        {/* Position the Avatar at the bottom middle of the headerImage */}
        <Box
          position="absolute"
          bottom={-4}
          left="50%"
          transform="translateX(-50%)"
        >
          {user.profilePic ? (
            <>
              <Avatar
                name={user.name}
                src={user.profilePic}
                size={{
                  base: "2xl",
                  md: "2xl",
                }}
                boxShadow="0px 7px 30px 10px rgba(1, 2, 3, 1)"
                borderColor="#1e1e1e"
                borderWidth="4px"
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
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      height="100vh"
                    >
                      <Image
                        src={user.profilePic}
                        maxW="100vw"
                        maxH="100vh"
                        borderRadius={"md"}
                        onClick={() => setIsModalOpen(false)}
                      />
                    </Flex>
                  </ModalBody>
                </ModalContent>
              </Modal>
            </>
          ) : (
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
      </Box>

      {/* User's name and username */}
      <Box textAlign="start" >
        <Text fontSize={"2xl"} fontWeight={"bold"} mt={3}>
          {user.name}
        </Text>
        <Text fontSize={"sm"}>@{user.username}</Text>
      </Box>

      <Text>{user.bio}</Text>

      <Flex gap={3}>
        <Link href={user.githubLink} isExternal mt={2}>
          <AiFillGithub />
        </Link>
        <Link href={user.xLink || ""} isExternal mt={2}>
          <FaXTwitter />
        </Link>
        {currentUser?._id !== user._id && (
          <>
            <Box mt={2}>
              <FaDonate />
            </Box>
            <Button
              size={"sm"}
              onClick={handleFollowUnfollow}
              isLoading={updating}
            >
              {following ? "Unfollow" : "Follow"}
            </Button>
          </>
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
          <Box borderRadius={"full"}>
            <CreateCommunity/>
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
