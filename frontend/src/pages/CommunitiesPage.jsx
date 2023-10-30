import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Flex,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
  chakra,
  
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import useShowToast from "../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import CreateCommunity from "../components/CreateCommunity";
import { Link, Link as RouterLink } from "react-router-dom"; // <-- Rename the Link component to avoid confusion

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState([]);
  const showToast = useShowToast();
  const bgColor = useColorModeValue("white", "gray.dark");
  const [loading, setLoading] = useState(true); // <-- 1. Introduce loading state
  const currentUser = useRecoilValue(userAtom);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch("/api/community/communities");
        const data = await response.json();

        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        setCommunities(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false); // <-- 2. Set loading to false after fetching data or error
      }
    };

    fetchCommunities();
  }, [showToast]);

    if (loading) {
      return (
        <Flex justifyContent={"center"}>
          <Spinner size={"xl"} />
        </Flex>
      );
    }

  if (!communities.length) {
    return (
      <>
        <Flex justifyContent={"center"}>
          <Text>No Communities Yet</Text>
        </Flex>
        <Box
          position="fixed" // <-- Set to fixed positioning
          top="4rem" // <-- Set to 2rem from the bottom
          right="1.5rem" // <-- Set to 2rem from the right
          borderRadius="full"
          zIndex="10" // <-- Optional: ensure it's on top of other elements
        >
          <CreateCommunity />
        </Box>
      </>
    );
  }

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
        prevCommunities.filter((community) => community._id !== communityId)
      );

      showToast("Success", "Community deleted successfully", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  console.log("Current User ID:", currentUser._id);

  return (
    <>
      <VStack
        spacing={6}
        align="center"
        alignItems={"flex-start"}
        ml={2}
        width="100%"
      >
        {communities.map((community) => (
          <chakra.div
            as={RouterLink}
            to={`/community/${community._id}`}
            key={community._id}
            style={{ textDecoration: "none", display: "block" }} // Setting display to block ensures it wraps the entire Box
          >
            <Box
              key={community._id}
              p={5}
              w={{ base: "95%", md: "75%" }} // 100% width on smaller screens and 75% on medium and up
              h="auto"
              boxShadow="md"
              borderRadius="lg"
              bg={bgColor}
              position="relative"
              mt={3}
            >
              {/* Conditionally render DeleteIcon if current user is an admin of the community */}
              {community.admins.includes(currentUser._id) && (
                <DeleteIcon
                  position="absolute"
                  top="11px"
                  right="11px"
                  cursor="pointer"
                  zIndex="10"
                  onClick={() => handleDelete(community._id)}
                />
              )}
              <Flex gap={6} alignItems={"center"}>
                <Avatar
                  src={community.profileImage}
                  size="md"
                  name={community.name}
                  mb={2}
                />
                <Text fontWeight="bold" fontSize="xl">
                  {community.name}
                </Text>
              </Flex>
              <VStack align="start" mt="4" spacing="2">
                <Text>{community.description}</Text>
                <Text fontSize="sm" color="gray.500">
                  {community.bio}
                </Text>
              </VStack>
            </Box>
          </chakra.div>
        ))}
      </VStack>
      <Box
        position="fixed" // <-- Set to fixed positioning
        top="4rem" // <-- Set to 2rem from the bottom
        right="1.5rem" // <-- Set to 2rem from the right
        borderRadius="full"
        zIndex="10" // <-- Optional: ensure it's on top of other elements
      >
        <CreateCommunity />
      </Box>
    </>
  );
};

export default CommunitiesPage;
