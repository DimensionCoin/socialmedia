import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
  Text,
  VStack
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import usePreviewImg from "../hooks/usePreviewImg";
import useShowToast from "../hooks/useShowToast";
import { Link as RouterLink, useNavigate, Link } from "react-router-dom";

export default function UpdateProfilePage() {
  const [user, setUser] = useRecoilState(userAtom);
  const [inputs, setInputs] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    password: "",
    githubLink: user.githubLink || "",
    xLink: user.xLink || "", 
  });
  const profileFileRef = useRef(null);
  const headerFileRef = useRef(null);
  const [updating, setUpdating] = useState(false);

  const showToast = useShowToast();

  const { handleImageChange, imgUrl } = usePreviewImg(); // For profile image
  const { handleImageChange: handleHeaderImageChange, imgUrl: headerImgUrl } =
    usePreviewImg(); // For header image

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/users/update/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...inputs,
          profilePic: imgUrl,
          headerImage: headerImgUrl,
          githubLink: inputs.githubLink, // Add this line
          xLink: inputs.xLink, // Add this line
        }),
      });
      const data = await res.json(); // updated user object
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Profile updated successfully", "success");
      setUser(data);
      localStorage.setItem("user-threads", JSON.stringify(data));
      navigate(`/${user.username}`);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setUpdating(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <Flex align={"center"} justify={"center"} my={6}>
        <Stack
          spacing={4}
          w={"full"}
          maxW={"md"}
          bg={useColorModeValue("white", "gray.dark")}
          rounded={"xl"}
          boxShadow={"lg"}
          p={6}
        >
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
            User Profile Edit
          </Heading>
          <FormControl id="userName">
            <Stack direction={["column", "row"]} spacing={6}>
              <Center>
                <Avatar
                  size="xl"
                  boxShadow={"md"}
                  src={imgUrl || user.profilePic}
                />
              </Center>
              <Center w="full">
                <Button w="full" onClick={() => profileFileRef.current.click()}>
                  Change Avatar
                </Button>
                <Input
                  type="file"
                  hidden
                  ref={profileFileRef}
                  onChange={handleImageChange}
                />
              </Center>
            </Stack>
          </FormControl>
          <FormControl id="profileHeaderImage">
            <FormLabel>Profile Header Image</FormLabel>
            <Stack direction={["column", "row"]} spacing={6}>
              <Center>
                <img
                  src={
                    headerImgUrl ||
                    user.headerImage ||
                    "https://bit.ly/broken-link"
                  }
                  alt="Profile Header"
                  style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                />
              </Center>
              <Center w="full" flex={0}>
                <VStack spacing={2}>
                  <Button
                    w="full"
                    onClick={() => headerFileRef.current.click()}
                  >
                    Change Header Image
                  </Button>
                  <Text>*please use a wide photo</Text>
                </VStack>
                <Input
                  type="file"
                  hidden
                  ref={headerFileRef}
                  onChange={handleHeaderImageChange}
                />
              </Center>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>Full name</FormLabel>
            <Input
              placeholder="John Doe"
              value={inputs.name}
              onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
              _placeholder={{ color: "gray.500" }}
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>User name</FormLabel>
            <Input
              placeholder="johndoe"
              value={inputs.username}
              onChange={(e) =>
                setInputs({ ...inputs, username: e.target.value })
              }
              _placeholder={{ color: "gray.500" }}
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email address</FormLabel>
            <Input
              placeholder="your-email@example.com"
              value={inputs.email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              _placeholder={{ color: "gray.500" }}
              type="email"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Input
              placeholder="Your bio."
              value={inputs.bio}
              onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
              _placeholder={{ color: "gray.500" }}
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>GitHub Link</FormLabel>
            <Input
              placeholder="https://github.com/yourusername"
              value={inputs.githubLink}
              onChange={(e) =>
                setInputs({ ...inputs, githubLink: e.target.value })
              }
              _placeholder={{ color: "gray.500" }}
              type="url"
            />
          </FormControl>
          <FormControl>
            <FormLabel>X Link</FormLabel>
            <Input
              placeholder={
                user.xLink ? user.xLink : "https://x.com/yourusername"
              }
              value={inputs.xLink}
              onChange={(e) => setInputs({ ...inputs, xLink: e.target.value })}
              _placeholder={{ color: "gray.500" }}
              type="url"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="password"
              value={inputs.password}
              onChange={(e) =>
                setInputs({ ...inputs, password: e.target.value })
              }
              _placeholder={{ color: "gray.500" }}
              type="password"
            />
          </FormControl>
          <Stack spacing={6} direction={["column", "row"]}>
            <Link as={RouterLink} to={`/${user.username}`}>
              <Button
                bg={"red.400"}
                color={"white"}
                w="full"
                _hover={{
                  bg: "red.500",
                }}
              >
                Cancel
              </Button>
            </Link>
            <Button
              bg={useColorModeValue("gray.600", "gray.700")}
              color={"white"}
              w="full"
              _hover={{
                bg: useColorModeValue("gray.700", "gray.800"),
              }}
              type="submit"
              isLoading={updating}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </form>
  );
}
