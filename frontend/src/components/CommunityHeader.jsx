import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Text,
  VStack,
  Image,
  Flex,
  Button,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";

const CommunityHeader = ({ communityData }) => {
  const [communities, setCommunities] = useState([]);
  const currentUser = useRecoilValue(userAtom);
  const isMember = communityData.members.includes(currentUser._id);

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
          <Text>{communityData.bio} bio</Text>
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
        {communityData.admins.includes(currentUser._id) && (
          <Flex alignItems={"center"} gap={2}>
            <Button size={"sm"}>Update</Button>
            <DeleteIcon onClick={() => handleDelete(community._id)} />
          </Flex>
        )}
      </Flex>
    </VStack>
  );
};

export default CommunityHeader;
