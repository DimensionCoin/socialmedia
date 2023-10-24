import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Flex, Text } from "@chakra-ui/react";
import FollowersPage from "../components/FollowersPage";

const Followers = () => {
  const currentUser = useRecoilValue(userAtom);
  const { id } = useParams();
  const [followers, setFollowers] = useState([]);
  const [username, setUsername] = useState(""); // New state for the username
  const API_BASE_URL = process.env.VITE_API_BASE_URL;


  useEffect(() => {
    if (id) {
      // Fetch the followers
      fetch(`${API_BASE_URL}/api/users/${id}/followers`)
        .then((res) => res.json())
        .then((data) => {
          setFollowers(data);
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
          Followers
        </Text>
        <FollowersPage followers={followers}  />
      </Flex>
    </div>
  );
};

export default Followers;
