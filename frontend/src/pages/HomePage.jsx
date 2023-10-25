import { Box, Divider, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";
import CreatePost from "../components/CreatePost";
import AllPost from "../components/AllPost";
import UserHeader from "../components/UserHeader";



const HomePage = ({}) => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();

  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        const res = await fetch(`/api/posts/feed`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        console.log(data);
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          showToast("Error", "Unexpected data format received", "error");
        }
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    getFeedPosts();
  }, [showToast, setPosts]);

  return (
    <Flex gap="10" alignItems={"flex-start"}>
      <Box flex={70}>
        {!loading && posts.length === 0 && (
          <>
            <h1 className="h1-margin-bottom">
              Follow some users to see the feed
            </h1>

            <Box display={{ base: "block", md: "none" }} gap={5}>
              {" "}
              {/* Added display prop */}
              <SuggestedUsers />
              <Divider mt={2} borderWidth={"2px"} />
              <AllPost />
            </Box>
            <Box
              flex={30}
              display={{
                base: "none",
                md: "block",
              }}
            >
              <AllPost />
            </Box>
          </>
        )}

        {loading && (
          <Flex justify="center">
            <Spinner size="xl" />
          </Flex>
        )}

        {Array.isArray(posts) &&
          posts.map((post) => (
            <Post key={post._id} post={post} postedBy={post.postedBy} />
          ))}
      </Box>
      <Box
        flex={30}
        display={{
          base: "none",
          md: "block",
        }}
      >
        <SuggestedUsers />
      </Box>
      <CreatePost />
    </Flex>
  );
};

export default HomePage;
