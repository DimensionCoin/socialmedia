import { FaPeopleGroup, FaPlus } from "react-icons/fa6";
import {
  Button,
  Flex,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useColorModeValue,
  useDisclosure,
  FormLabel,
  Stack,
  Avatar,
  VStack,
  Center,
  ModalHeader,
  Box,
  HStack
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import usePreviewImg from "../hooks/usePreviewImg";
import useShowToast from "../hooks/useShowToast";
import { AddIcon } from "@chakra-ui/icons";

const CreateCommunity = () => {
 const { isOpen, onOpen, onClose } = useDisclosure();
  const user = useRecoilState(userAtom);
  const showToast = useShowToast();
  const iconFileRef = useRef(null);
  const headerFileRef = useRef(null);
  
 const [communityInputs, setCommunityInputs] = useState({
   name: "",
   description: "",
   communityIcon: "",
   profileHeaderImage: "",
 });

 const { handleImageChange: handleIconChange, imgUrl: iconImgUrl } =
   usePreviewImg();
 const { handleImageChange: handleHeaderChange, imgUrl: headerImgUrl } =
   usePreviewImg();

 const handleSubmit = async (e) => {
   console.log("handleSubmit triggered"); // <-- Add this line

   try {
     const res = await fetch(`/api/community/create-community`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         ...communityInputs,
         profileImage: iconImgUrl,
         coverImage: headerImgUrl,
       }),
     });

     const data = await res.json();

     if (data.error) {
       showToast("Error", data.error, "error");
       return;
     }

     showToast("Success", "Community created successfully", "success");
     onClose()
   } catch (error) {
     showToast("Error", error.message, "error");
   }

   
 };

 return (
   <>
   
       <Button
         position={"center"}
         bg={useColorModeValue("gray.300", "gray.dark")}
         onClick={onOpen}
         size={{ base: "xl", sm: "md" }}
      
       >
         <VStack>
           <AddIcon />
          
         </VStack>
       </Button>
       <Flex
         
         top="0"
         right="0"
         p="1"
         className="overlay-icon" // <-- Add class for hover target
         opacity="0"
         alignItems="center"
         justifyContent="center"
         rounded="full"
         bg="gray.500"
         w="1rem"
         h="1rem"
         
       >
         <FaPlus color="white" size="0.6rem" />
       </Flex>


     <form onSubmit={handleSubmit}>
       <Modal isOpen={isOpen} onClose={onClose}>
         <ModalOverlay />

         <ModalContent bg="gray.dark" color="white">
           <ModalHeader>Create Community</ModalHeader>
           <ModalCloseButton />
           <ModalBody pb={6}>
             <FormControl>
               <Flex
                 minH={"50vh"}
                 align={"top"}
                 justify={"center"}
                 bg={useColorModeValue("gray.dark", "gray.dark")}
               >
                 <Stack
                   spacing={4}
                   w={"full"}
                   maxW={"md"}
                   bg={useColorModeValue("white", "black")}
                   rounded={"xl"}
                   boxShadow={"lg"}
                   p={6}
                   my={12}
                 >
                   <FormControl id="userName">
                     <FormLabel>Community Icon</FormLabel>
                     <Stack direction={["column", "row"]} spacing={6}>
                       <Center>
                         <Avatar
                           size="xl"
                           src={iconImgUrl || "https://bit.ly/sage-adebayo"}
                         />
                       </Center>
                       <Center w="full">
                         <Button onClick={() => iconFileRef.current.click()}>
                           Change Icon
                         </Button>
                         <Input
                           type="file"
                           hidden
                           ref={iconFileRef}
                           onChange={handleIconChange}
                         />
                       </Center>
                     </Stack>
                   </FormControl>
                   <FormControl id="name" isRequired>
                     <FormLabel>Community name</FormLabel>
                     <Input
                       value={communityInputs.name}
                       onChange={(e) =>
                         setCommunityInputs((prev) => ({
                           ...prev,
                           name: e.target.value,
                         }))
                       }
                       placeholder="Community Name"
                       _placeholder={{ color: "gray.500" }}
                       type="text"
                     />
                   </FormControl>
                   <FormControl id="description" isRequired>
                     <FormLabel>Community Description</FormLabel>

                     <Input
                       value={communityInputs.description}
                       onChange={(e) =>
                         setCommunityInputs((prev) => ({
                           ...prev,
                           description: e.target.value,
                         }))
                       }
                       placeholder="tell us about your community"
                       _placeholder={{ color: "gray.500" }}
                       type="email"
                     />
                   </FormControl>
                   <FormControl id="profileHeaderImage">
                     <FormLabel>Profile Header Image</FormLabel>
                     <Stack direction={["column", "row"]} spacing={6}>
                       <Center>
                         <img
                           src={headerImgUrl || "https://bit.ly/broken-link"}
                           alt="Profile Header"
                           style={{
                             width: "100%",
                             height: "auto",
                             borderRadius: "8px",
                           }}
                         />
                       </Center>
                       <Center w="full" flex={0}>
                         <VStack spacing={2}>
                           <Button
                             onClick={() => headerFileRef.current.click()}
                           >
                             Change Header Image
                           </Button>
                           <Input
                             type="file"
                             hidden
                             ref={headerFileRef}
                             onChange={handleHeaderChange}
                           />
                           <Text>*please use a wide photo</Text>
                         </VStack>
                         <Input type="file" hidden />
                       </Center>
                     </Stack>
                   </FormControl>
                   <Stack spacing={6} direction={["column", "row"]}>
                     <Button
                       bg={"gray.dark"}
                       color={"white"}
                       w="full"
                       _hover={{
                         bg: "red.500",
                       }}
                       onClick={onClose}
                     >
                       Cancel
                     </Button>
                     <Button
                       type="submit"
                       bg={"gray.dark"}
                       color={"white"}
                       w="full"
                       _hover={{
                         bg: "blue.800",
                       }}
                       onClick={handleSubmit}
                     >
                       Submit
                     </Button>
                   </Stack>
                 </Stack>
               </Flex>
             </FormControl>
           </ModalBody>
         </ModalContent>
       </Modal>
     </form>
   </>
 );
};

export default CreateCommunity;
