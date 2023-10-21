import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
  getAllPosts,
  repostPost
} from "../controllers/postController.js";
import multer from "multer";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();
const upload = multer();


// More specific routes first
router.get("/feed", protectRoute, getFeedPosts);
router.get("/allposts", protectRoute, getAllPosts);
router.get("/user/:username", getUserPosts);

// General/wildcard routes later
router.get("/:id", getPost);
router.post("/create", protectRoute, upload.any(), createPost);
router.delete("/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, likeUnlikePost);
router.put("/reply/:id", protectRoute, replyToPost);
router.post("/repost/:id", protectRoute, repostPost);


export default router;

