import React, { useRef, useState } from "react";
import {
  Avatar,
  Box,
  Text,
  VStack,
  Image,
  Flex,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useColorModeValue,
  useDisclosure,
  CloseButton,
  Divider,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";
import useShowToast from "../hooks/useShowToast";
import usePreviewImg from "../hooks/usePreviewImg";
import { BsFillImageFill } from "react-icons/bs";
import { Link } from "react-router-dom";


const MAX_CHAR = 10000;

const CommunityHeader = ({ communityData }) => {
  const [communities, setCommunities] = useState([]);
  const currentUser = useRecoilValue(userAtom);
  const isMember = communityData.members.includes(currentUser._id);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const showToast = useShowToast();
  const imageRef = useRef(null);
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [postText, setPostText] = useState("");
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (communityId) => {
    console.log(communityId);
    try {
      const response = await fetch(
        `/api/community/deleteCommunity/${communityId}`,

        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      console.log(data);

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // Filter out the deleted community from the state
      setCommunities((prevCommunities) =>
        prevCommunities.filter((community) => communityData._id !== communityId)
      );

      showToast("Success", "Community deleted successfully", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const handleJoinOrLeave = async () => {
    // Optimistically update the UI before making the API call
    if (isMember) {
      communityData.members = communityData.members.filter(
        (id) => id !== currentUser._id
      );
    } else {
      communityData.members.push(currentUser._id);
    }

    setCommunities((prevCommunities) =>
      prevCommunities.map((community) =>
        community._id === communityData._id ? communityData : community
      )
    );

    try {
      const response = await fetch(`/api/community/join-leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          communityId: communityData._id,
        }),
      });
      const data = await response.json();

      if (data.error) {
        // Handle error here and revert the optimistic update
        showToast("Error", data.error, "error");

        // Reverse the previous optimistic update
        if (isMember) {
          communityData.members.push(currentUser._id);
        } else {
          communityData.members = communityData.members.filter(
            (id) => id !== currentUser._id
          );
        }
        setCommunities((prevCommunities) =>
          prevCommunities.map((community) =>
            community._id === communityData._id ? communityData : community
          )
        );
      }
    } catch (error) {
      // Handle fetch error here and revert the optimistic update
      showToast("Error", error.message, "error");

      // Reverse the previous optimistic update
      if (isMember) {
        communityData.members.push(currentUser._id);
      } else {
        communityData.members = communityData.members.filter(
          (id) => id !== currentUser._id
        );
      }
      setCommunities((prevCommunities) =>
        prevCommunities.map((community) =>
          community._id === communityData._id ? communityData : community
        )
      );
    }
  };

  const handleTextChange = (e) => {
    const inputText = e.target.value;

    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChar(0);
    } else {
      setPostText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };

const handleCreateCommunityPost = async () => {
  setLoading(true);
  try {
    const response = await fetch(`/api/community/community-post`, {
      // changed 'res' to 'response'
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        communityId: communityData._id,
        postedBy: currentUser._id,
        text: postText,
        img: imgUrl,
      }),
    });

    const data = await response.json();

    if (data.error) {
      showToast("Error", data.error, "error");
    } else {
      showToast("Success", "Post added successfully!", "success");
      onClose(); // close the modal after successful post
      setPostText(""); // reset the post text
      setImgUrl(""); // reset the image URL
      // Optionally, you can update your local state to reflect the new post, if necessary.
    }
  } catch (error) {
    showToast("Error", error.message, "error");
  } finally {
    setLoading(false);
  }
};


  return (
    <VStack gap={4} alignItems={"start"} w={"full"}>
      {/* Display the community cover image */}
      <Box w={"full"} position="relative">
        {communityData.coverImage && (
          <Image
            src={communityData.coverImage}
            alt="Community Header Image"
            w="100%"
            h="200px"
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
          <Avatar
            name={communityData.name}
            src={communityData.profileImage}
            size={{
              base: "2xl",
              md: "2xl",
            }}
            boxShadow="0px 7px 30px 10px rgba(1, 2, 3, 1)"
            borderColor="#1e1e1e"
            borderWidth="4px"
          />
        </Box>
      </Box>

      {/* Community's name and bio */}
      <Flex justifyContent={"space-between"} alignItems={"center"} w={"100%"}>
        <Box textAlign="start">
          <Text fontSize={"2xl"} fontWeight={"bold"} mt={3}>
            {communityData.name}
          </Text>
          <Text>{communityData.bio}</Text>
        </Box>
        <Button onClick={handleJoinOrLeave}>
          {isMember ? "Leave" : "Join"}
        </Button>
      </Flex>
      <Flex justifyContent={"space-between"} alignItems={"center"} w={"100%"}>
        <Flex gap={1}>
          <Text>{communityData.members.length}</Text>
          <Text>Members</Text>
        </Flex>
        <Flex gap={2}>
          <Button
            bg={useColorModeValue("gray.300", "gray.dark")}
            onClick={onOpen}
            size={{ base: "sm", sm: "md" }}
          >
            <AddIcon />
          </Button>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />

            <ModalContent bg="gray.dark" color="white">
              <ModalHeader>Create Community Post</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <FormControl>
                  <Textarea
                    placeholder="Post content goes here.."
                    onChange={handleTextChange}
                    value={postText}
                  />
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    textAlign={"right"}
                    m={"1"}
                    color={"gray.800"}
                  >
                    {remainingChar}/{MAX_CHAR}
                  </Text>

                  <Input
                    type="file"
                    hidden
                    ref={imageRef}
                    onChange={handleImageChange}
                  />

                  <BsFillImageFill
                    style={{ marginLeft: "5px", cursor: "pointer" }}
                    size={16}
                    onClick={() => imageRef.current.click()}
                  />
                </FormControl>

                {imgUrl && (
                  <Flex mt={5} w={"full"} position={"relative"}>
                    <Image src={imgUrl} alt="Selected img" />
                    <CloseButton
                      onClick={() => {
                        setImgUrl("");
                      }}
                      bg={"gray.800"}
                      position={"absolute"}
                      top={2}
                      right={2}
                    />
                  </Flex>
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  colorScheme={"gray"}
                  mr={3}
                  isLoading={loading}
                  hover={"white"}
                  onClick={handleCreateCommunityPost}
                >
                  Post
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          {communityData.admins.includes(currentUser._id) && (
            <Flex alignItems={"center"} gap={2}>
              <Link to={`/updateCommunity/${communityData._id}`}>
                <Button size={"sm"}>Update</Button>
              </Link>
              <DeleteIcon onClick={() => handleDelete(communityData._id)} />
            </Flex>
          )}
        </Flex>
      </Flex>
      <Divider />
    </VStack>
  );
};

export default CommunityHeader;
