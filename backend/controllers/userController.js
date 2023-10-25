import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const getUserProfile = async (req, res) => {
  // We will fetch user profile either with username or userId
  // query is either username or userId
  const { query } = req.params;

  try {
    let user;

    // query is userId
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      // query is username
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserProfile: ", err.message);
  }
};

const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in signupUser: ", err.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: "Invalid username or password" });

    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in loginUser: ", error.message);
  }
};

const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in signupUser: ", err.message);
  }
};

const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in followUnFollowUser: ", err.message);
  }
};

const updateUser = async (req, res) => {
  const { name, email, username, password, bio, githubLink, xLink } = req.body; // Extract githubLink
  let { profilePic, headerImage } = req.body;

  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }
     if (githubLink) {
       user.githubLink = githubLink;
     }
     if(xLink) {
      user.xLink = xLink
     }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
      user.profilePic = profilePic;
    }

    if (headerImage) {
      if (user.headerImage) {
        await cloudinary.uploader.destroy(
          user.headerImage.split("/").pop().split(".")[0]
        );
      }
      const uploadedHeaderResponse = await cloudinary.uploader.upload(
        headerImage
      );
      headerImage = uploadedHeaderResponse.secure_url;
      user.headerImage = headerImage;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;

    user = await user.save();

    // Find all posts that this user replied and update username and userProfilePic fields
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    // password should be null in response
    user.password = null;

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in updateUser: ", err.message);
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    // exclude the current user from suggested users array and exclude users that current user is already following
    const userId = req.user._id;

    const usersFollowedByYou = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const freezeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    user.isFrozen = true;
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllFollowers = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId).select("followers");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followers = await User.find({ _id: { $in: user.followers } }).select(
      "-password -updatedAt"
    ); // Get all user objects that match the IDs in the followers array and exclude password and updatedAt fields
    res.status(200).json(followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getAllFollowers: ", err.message);
  }
};

const getAllFollowing = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId).select("following");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = await User.find({ _id: { $in: user.following } }).select(
      "-password -updatedAt"
    ); // Get all user objects that match the IDs in the following array and exclude password and updatedAt fields
    res.status(200).json(following);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getAllFollowing: ", err.message);
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this user" });
    }

    // If the user has a profile pic stored on Cloudinary, delete it
    if (user.profilePic && typeof user.profilePic === "string") {
      try {
        const cloudinaryPublicId = user.profilePic
          .split("/")
          .pop()
          .split(".")[0];
        await cloudinary.uploader.destroy(cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
      }
    }

    // Find all posts by the user
    const userPosts = await Post.find({ postedBy: userId });

    // For each post, check if it has an image and delete it from Cloudinary
    for (let post of userPosts) {
      if (post.img && typeof post.img === "string") {
        const imgId = post.img.split("/").pop().split(".")[0];
        console.log("Attempting to delete Cloudinary ID:", imgId); // Log the ID
        try {
          await cloudinary.uploader.destroy(imgId);
          console.log("Successfully deleted Cloudinary ID:", imgId);
        } catch (cloudinaryError) {
          console.error(
            "Error deleting post image from Cloudinary:",
            cloudinaryError
          );
        }
      }
    }

    // Delete all posts by the user
    await Post.deleteMany({ postedBy: userId });

    // Remove user's posts that are reposted by others
    await Post.updateMany(
      { repostOf: userId },
      {
        $set: {
          repostOf: null,
          repostedBy: null,
          originalPosterProfileImg: null,
        },
      }
    );

    await User.findByIdAndRemove(userId);

    res
      .status(200)
      .json({ message: "User and associated posts deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in deleteUser: ", err.message);
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  followUnFollowUser,
  updateUser,
  getUserProfile,
  getSuggestedUsers,
  freezeAccount,
  getAllFollowers,
  getAllFollowing,
  deleteUser,
};
