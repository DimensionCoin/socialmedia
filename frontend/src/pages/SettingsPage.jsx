import {
  Button,
  Box,
  Flex,
  FormControl,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Spacer,
  useColorModeValue,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import useLogout from "../hooks/useLogout";
import { useRecoilValue, useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink, Link } from "react-router-dom";
import dotenv from "dotenv";


dotenv.config();


export const SettingsPage = () => {
  const showToast = useShowToast();
  const logout = useLogout();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const userId = useRecoilValue(userAtom); // logged in user
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userAtom);
  const API_BASE_URL = process.env.API_BASE_URL;

  const freezeAccount = async () => {
    if (!window.confirm("Are you sure you want to freeze your account?"))
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/freeze`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.error) {
        return showToast("Error", data.error, "error");
      }
      if (data.success) {
        await logout();
        showToast("Success", "Your account has been frozen", "success");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const deleteAccount = async () => {
    console.log("UserId", userId);
    if (deleteConfirmation !== "DELETE") {
      showToast(
        "Warning",
        "Please type 'DELETE' to confirm account deletion.",
        "warning"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/delete/${userId._id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }
      if (data.success || res.ok) {
        showToast("Success", "Your account has been deleted", "success");
        setLoading(false);
        await logout();
        navigate("/auth");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
      console.log("ERROR", error.message);
      setLoading(false); // ensure that loading state is reset on error
    }
  };

  if (!userId) return null; // or some loading or placeholder component

  return (
    <>
      <Box mb={5}>
        <Text fontSize={30} fontWeight="bold" mb={5}>
          Settings
        </Text>
        <Box mb={5}>
          <Flex align="center">
            <Box mr={2} mb={3}>
              <Text fontWeight={"bold"} mb={2} fontSize={18}>
                Freeze Your Account
              </Text>
              <Text fontSize={14}>
                You can unfreeze your account anytime by logging in.
              </Text>
            </Box>
            <Spacer />
            <Button size={"sm"} colorScheme="blue" onClick={freezeAccount}>
              Freeze
            </Button>
          </Flex>
        </Box>
        <Box>
          <Flex align="center">
            <Box mr={2}>
              <Text fontWeight={"bold"} mb={2} fontSize={18}>
                Delete Your Account
              </Text>
              <Text fontSize={14}>
                You cannot get your account back. Please be sure you want to
                delete account.
              </Text>
            </Box>
            <Spacer />
            <Button size={"sm"} colorScheme="red" onClick={onOpen} px={5}>
              Delete
            </Button>
          </Flex>
        </Box>
        <Box mt={10}>
          <Flex align="center">
            <Box mr={2}>
              <Text fontWeight={"bold"} mb={2} fontSize={18}>
                Update Your Account
              </Text>
              <Text fontSize={14}>
                You cannot get your account back. Please be sure you want to
                delete account.
              </Text>
            </Box>
            <Spacer />
            {userId?._id === user._id && (
              <Link as={RouterLink} to="/update">
                <Button size={"sm"}>Update</Button>
              </Link>
            )}
          </Flex>
        </Box>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent bg="gray.dark" color="white" m={2} py={10}>
            <ModalHeader>Delete Your Account</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <Text fontSize={18}>
                  Are you sure you want to delete your account?
                </Text>
                <Text fontSize={12} mt={2}>
                  There is no way of getting your account back
                </Text>
                <Text fontSize={14} mt={6} mb={2}>
                  Please type 'DELETE' to delete your account
                </Text>
                <Input
                  placeholder="DELETE"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={deleteAccount}
                colorScheme={"red"}
                mr={3}
                isLoading={loading}
                hover={"white"}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};
