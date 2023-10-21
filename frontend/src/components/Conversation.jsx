import {
  Avatar,
  AvatarBadge,
  Box,
  VStack,
  Text,
  WrapItem,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/messagesAtom";

const Conversation = ({ conversation, isOnline }) => {
  const user = conversation.participants[0];
  const currentUser = useRecoilValue(userAtom);
  const lastMessage = conversation.lastMessage;
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );

  return (
    <Flex
      direction="column" // main flex direction set to column
      gap={3}
      p={"1"}
      _hover={{
        cursor: "pointer",
        bg: useColorModeValue("gray.600", "gray.dark"),
        color: "white",
      }}
      onClick={() =>
        setSelectedConversation({
          _id: conversation._id,
          userId: user._id,
          userProfilePic: user.profilePic,
          username: user.username,
          mock: conversation.mock,
        })
      }
      bg={
        selectedConversation?._id === conversation._id
          ? useColorModeValue("gray.400", "gray.dark")
          : ""
      }
      borderRadius={"md"}
      alignItems="start" // align items to the top
      borderWidth="1px"
      borderStyle="solid"
      borderColor="gray.light"
      py={2}
      mt={2}
    >
      <Flex alignItems="center" gap={2}>
        <Avatar size={{ base: "xs", sm: "sm", md: "md" }} src={user.profilePic}>
          {isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
        </Avatar>
        <Text fontWeight="700">{user.username}</Text>
      </Flex>

      <Flex alignItems={"center"} gap={2}>
        {currentUser._id === lastMessage.sender && (
          <Box color={lastMessage.seen ? "blue.400" : ""}>
            <BsCheck2All size={16} />
          </Box>
        )}
        <Text fontSize={"xs"}>
          {lastMessage.text.length > 8
            ? lastMessage.text.substring(0, 30) + "..."
            : lastMessage.text || <BsFillImageFill size={16} />}
        </Text>
      </Flex>
    </Flex>
  );
};

export default Conversation;
