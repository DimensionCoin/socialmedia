import React, { useState, useEffect } from "react";
import Post from "./Post";
import useShowToast from "../hooks/useShowToast";



const AllPost = () => {
  const [posts, setPosts] = useState([]);
  const showToast = useShowToast();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts/allposts`); // Assuming your API endpoint to fetch all posts is /api/posts/all
        const data = await response.json();

        if (data.error) {
          showToast("Error", data.error, "error");
          console.log(data.error)
          return;
        }

        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      }
    };

    fetchAllPosts();
  }, [showToast]);

  return (
    <div>
      {posts.map((post) => (
        <Post key={post._id} post={post} postedBy={post.postedBy} />
      ))}
    </div>
  );
};

export default AllPost;
