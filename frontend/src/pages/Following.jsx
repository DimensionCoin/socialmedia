import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Flex, Text } from "@chakra-ui/react";
import FollowersPage from "../components/FollowersPage";
import dotenv from "dotenv";

dotenv.config();

const Following = () => {
  const currentUser = useRecoilValue(userAtom);
  const { id } = useParams(); // Assuming id is the username of the profile being viewed
  const [following, setFollowing] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (id) {
      // Fetch the followers
      fetch(`${API_BASE_URL}/api/users/${id}/following`)
        .then((res) => res.json())
        .then((data) => {
          setFollowing(data);
        })
        .catch((err) => console.error(err));
    }
  }, [id]);

  if (!currentUser) return null; // or some loading or placeholder component

  return (
    <div>
      <Flex
        direction="column"
        gap={4}
        w="100%" // Ensure the Flex container takes full width
        alignItems={"start"}
      >
        <Text fontSize={"2xl"} fontWeight={"bold"}>
          Following
        </Text>
        <FollowersPage followers={following} />
      </Flex>
    </div>
  );
};

export default Following;
