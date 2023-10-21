import { Box, Image, Text, Link } from "@chakra-ui/react";

const SuggestedPost = ({ post }) => {
  return (
    <Box>
      <Image src={post.imgUrl} alt={post.title} w="100%" borderRadius="md" />
      <Text fontWeight="bold">{post.title}</Text>
      <Link to={`/${post.username}`} color="blue.500">
        @{post.username}
      </Link>
    </Box>
  );
};

export default SuggestedPost;
