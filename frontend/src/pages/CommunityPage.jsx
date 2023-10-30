import React, { useState, useEffect } from "react";
import CommunityHeader from "../components/CommunityHeader.jsx";
import { useParams } from "react-router-dom";

const CommunityPage = () => {
  const { id } = useParams();
  const [communityData, setCommunityData] = useState(null);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const response = await fetch(`/api/community/profile/${id}`);
        const data = await response.json();
        setCommunityData(data);
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
    </>
  );
};

export default CommunityPage;
