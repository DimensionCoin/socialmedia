import React from "react";
import { FaBackspace } from "react-icons/fa";
import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import useFollowUnfollow from "../hooks/useFollowUnfollow";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link, useNavigate } from "react-router-dom";

const FollowerItem = ({ follower }) => {
  const currentUser = useRecoilValue(userAtom);
  const { handleFollowUnfollow, following, updating } =
    useFollowUnfollow(follower);

  return (
    <>
      <li
        key={follower._id}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Flex alignItems="center" flexGrow={1}>
          <Link to={`/${follower.username}`}>
            <Avatar name={follower.name} src={follower?.profilePic} />
          </Link>
          <Text ml={4} mr={1}>
            {follower.username}
          </Text>
          <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
          <Text ml={1} mr={5}>
            {follower.name}
          </Text>
        </Flex>

        {/* Conditionally render the button */}
        {follower._id !== currentUser._id && (
          <Button
            size={"sm"}
            color={following ? "white" : "white"}
            bg={following ? "gray.dark" : "gray.dark"}
            onClick={(e) => {
              e.stopPropagation();
              handleFollowUnfollow();
            }}
            isLoading={updating}
            _hover={{
              color: following ? "white" : "white",
              opacity: ".8",
            }}
          >
            {following ? "UnFollow" : "Follow"}
          </Button>
        )}
      </li>
    </>
  );
};

const FollowersPage = ({ followers }) => {
  const navigate = useNavigate();

  return (
    <div style={{ width: "100%" }}>
      <Link>
        <Button
          mb={4}
          size={"xs"}
          borderRadius={"full"}
          onClick={() => navigate(-1)}
        >
          <FaBackspace />
        </Button>
      </Link>
      <ul
        className="followers-list"
        style={{ width: "100%", listStyle: "none", padding: 0 }}
      >
        {followers.map((follower) => (
          <FollowerItem key={follower._id} follower={follower} />
        ))}
      </ul>
    </div>
  );
};

export default FollowersPage;
