import express from "express";
import {
  followUnFollowUser,
  getUserProfile,
  loginUser,
  logoutUser,
  signupUser,
  updateUser,
  getSuggestedUsers,
  freezeAccount,
  getAllFollowers,
  getAllFollowing,
  deleteUser
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// GET routes
router.get("/suggested", protectRoute, getSuggestedUsers);
router.get("/profile/:query", getUserProfile); // kept after "/suggested" to avoid conflicts
router.get("/:id/followers", protectRoute, getAllFollowers); // this is at the end because ":id" is very generic and can match many strings
router.get("/:id/following", protectRoute, getAllFollowing);

// POST routes
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnFollowUser);

// PUT routes
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);

//DELETE routes
router.delete("/delete/:id", protectRoute, deleteUser);


export default router;
