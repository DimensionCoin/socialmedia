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
  Text,
  Textarea,
  Image,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const UpdateCommunity = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    description: "",
    bio: "",
  });

  const coverImageFileRef = useRef(null);
  const profileImageFileRef = useRef(null);
  const [updating, setUpdating] = useState(false);

  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

 
   const [communityData, setCommunityData] = useState(null);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const response = await fetch(`/api/community/profile/${communityId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setCommunityData(data);

      } catch (error) {
        console.error("Failed to fetch community data:", error);
      }
    };

    if (communityId) {
      fetchCommunityData();
    }
  }, [communityId]);


  if (!communityData) return "Loading...";

  const handleImageChange = (setImageUrlFunction) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrlFunction(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch(`/api/community/update/${communityId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...inputs,
          coverImage: coverImageUrl,
          profileImage: profileImageUrl,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      navigate(`/community/${communityId}`);
    } catch (error) {
      alert(error);
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
            Community Profile Edit
          </Heading>

          {/* Cover Image */}
          <FormControl id="coverImage">
            <FormLabel>Cover Image</FormLabel>
            <Image src={coverImageUrl || communityData.coverImage || coverImageUrl}/>
            <Input
              type="file"
              hidden
              ref={coverImageFileRef}
              onChange={handleImageChange(setCoverImageUrl)}
            />
            <Button onClick={() => coverImageFileRef.current.click()}>
              Change Cover Image
            </Button>
          </FormControl>

          {/* Profile Image */}
          <FormControl id="profileImage">
            <FormLabel>Profile Image</FormLabel>
            <Avatar src={profileImageUrl || communityData.profileImage} />
            <Input
              type="file"
              hidden
              ref={profileImageFileRef}
              onChange={handleImageChange(setProfileImageUrl)}
            />
            <Button onClick={() => profileImageFileRef.current.click()}>
              Change Profile Image
            </Button>
          </FormControl>

          {/* Description */}
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Description about the community."
              value={inputs.description}
              onChange={(e) =>
                setInputs({ ...inputs, description: e.target.value })
              }
            />
          </FormControl>

          {/* Bio */}
          <FormControl>
            <FormLabel>Community Bio</FormLabel>
            <Textarea
              placeholder="Short bio for the community."
              value={inputs.bio}
              onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
            />
          </FormControl>

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
      </Flex>
    </form>
  );
};

export default UpdateCommunity;
