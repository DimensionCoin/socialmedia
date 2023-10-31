import React, { useState, useEffect } from "react";
import CommunityHeader from "../components/CommunityHeader.jsx";
import { useParams } from "react-router-dom";
import CommunityPost from "../components/CommunityPost.jsx";

const CommunityPage = () => {
  const { id } = useParams();
  const [communityData, setCommunityData] = useState(null);
  const [posts, setPosts] = useState([]); // <-- New state to hold community posts

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
       const response = await fetch(`/api/community/profile/${id}`);
       if (!response.ok) {
         throw new Error(`HTTP error! Status: ${response.status}`);
       }
       const data = await response.json();
       setCommunityData(data);

       const postsResponse = await fetch(`/api/community/${id}/posts`);
       if (!postsResponse.ok) {
         throw new Error(`HTTP error! Status: ${postsResponse.status}`);
       }
       const postsData = await postsResponse.json();
       setPosts(postsData);

      } catch (error) {
        console.error("Failed to fetch community data:", error);
      }
    };

    if (id) {
      fetchCommunityData();
    }
  }, [id]);

  if (!communityData) return "Loading...";

  return (
    <>
      <CommunityHeader communityData={communityData} />
      <CommunityPost posts={posts} community={communityData}/> {/* Pass down the posts as a prop */}
    </>
  );
};

export default CommunityPage;
