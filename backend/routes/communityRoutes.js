import express from "express";
import {
  createCommunity,
  addOrRemoveAdmin,
  addOrRemoveModerator,
  updateCommunityInfo,
  getCommunityProfile,
  joinOrLeaveCommunity,
  createCommunityPost,
  likeCommunityPost,
  dislikeCommunityPost,
  replyToCommunityPost,
  likeReply,
  dislikeReply,
} from "../controllers/communityController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// GET routes
router.get("/profile/:query", getCommunityProfile);

// POST routes
router.post("/create-community", protectRoute, createCommunity);
router.post("/join-leave", protectRoute, joinOrLeaveCommunity); // Route to join or leave a community
router.post("/community-post", protectRoute, createCommunityPost); // Route to create a community post
router.post("/community-post/:id/reply", protectRoute, replyToCommunityPost); // Route to reply to a community post

// PUT routes
router.put("/admin/:communityId", protectRoute, addOrRemoveAdmin);
router.put("/moderator/:communityId", protectRoute, addOrRemoveModerator);
router.put("/update/:communityId", protectRoute, updateCommunityInfo);
router.put("/community-post/:id/like", protectRoute, likeCommunityPost); // Route to like a community post
router.put("/community-post/:id/dislike", protectRoute, dislikeCommunityPost); // Route to dislike a community post
router.put("/community-post/:postId/reply/:replyId/like", protectRoute, likeReply); // Route to like a reply
router.put("/community-post/:postId/reply/:replyId/dislike", protectRoute, dislikeReply); // Route to dislike a reply

export default router;