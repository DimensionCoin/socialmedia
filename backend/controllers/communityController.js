import Community from "../models/communityModel.js";
import User from "../models/userModel.js";
import CommunityPost from "../models/communityPostModel.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const createCommunity = async (req, res) => {
  try {
    const { name, description, coverImage, bio, profileImage } = req.body;

    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ error: "Community already exists" });
    }

    const newCommunity = new Community({
      name,
      description,
      bio,
      coverImage,
      profileImage,
      admins: [req.user._id],
    });

    await newCommunity.save();
    res.status(201).json(newCommunity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addOrRemoveAdmin = async (req, res) => {
  try {
    const { communityId, userId, action } = req.body; // action can be 'add' or 'remove'
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    if (!community.admins.includes(req.user._id)) {
      return res.status(403).json({ error: "Only admins can modify admins" });
    }

    if (action === "add") {
      if (!community.admins.includes(userId)) {
        community.admins.push(userId);
      }
    } else if (action === "remove") {
      if (community.admins.includes(userId)) {
        community.admins.pull(userId);
      }
    }

    await community.save();
    res.status(200).json(community);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addOrRemoveModerator = async (req, res) => {
  try {
    const { communityId, userId, action } = req.body; // action can be 'add' or 'remove'
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    if (!community.admins.includes(req.user._id)) {
      return res
        .status(403)
        .json({ error: "Only admins can modify moderators" });
    }

    if (action === "add") {
      if (!community.moderators.includes(userId)) {
        community.moderators.push(userId);
      }
    } else if (action === "remove") {
      if (community.moderators.includes(userId)) {
        community.moderators.pull(userId);
      }
    }

    await community.save();
    res.status(200).json(community);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCommunityInfo = async (req, res) => {
  try {
    const { communityId, description, bio, coverImage, profileImage } =
      req.body;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    if (!community.admins.includes(req.user._id)) {
      return res
        .status(403)
        .json({ error: "Only admins can update community info" });
    }

    if (description) {
      community.description = description;
    }

    if (bio) {
      community.bio = bio;
    }

    if (coverImage) {
      community.coverImage = coverImage;
    }

    if (profileImage) {
      community.profileImage = profileImage;
    }

    await community.save();
    res.status(200).json(community);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCommunityProfile = async (req, res) => {
  // We will fetch community profile either with community name or communityId
  // query is either community name or communityId
  const { query } = req.params;

  try {
    let community;

    // query is communityId
    if (mongoose.Types.ObjectId.isValid(query)) {
      community = await Community.findOne({ _id: query });
    } else {
      // query is community name
      community = await Community.findOne({ name: query });
    }

    if (!community)
      return res.status(404).json({ error: "Community not found" });

    res.status(200).json(community);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getCommunityProfile: ", err.message);
  }
};

const joinOrLeaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.body;
    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    const isMember = community.members.includes(userId);

    if (isMember) {
      community.members.pull(userId);
    } else {
      community.members.push(userId);
    }

    await community.save();
    res.status(200).json({
      message: isMember ? "Left the community" : "Joined the community",
      community,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createCommunityPost = async (req, res) => {
    console.log(req.body);

  try {
    const { communityId, text } = req.body;
    let { img } = req.body;

    if (!communityId || !text) {
      return res
        .status(400)
        .json({ error: "CommunityId and text fields are required" });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    if (!community.members.includes(req.user._id.toString())) {
      return res
        .status(403)
        .json({ error: "Only members can post in this community" });
    }

    const maxLength = 10000;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newCommunityPost = new CommunityPost({
      postedBy: req.user._id,
      text,
      img,
    });

    await newCommunityPost.save();
    community.posts.push(newCommunityPost._id);
    await community.save();

    res.status(201).json(newCommunityPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
};

const likeCommunityPost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Community post not found" });
    }

    const userLikedPost = post.likes.includes(userId);
    const userDislikedPost = post.dislikes.includes(userId);

    if (userLikedPost) {
      post.likes.pull(userId);
      res.status(200).json({ message: "Community post unliked successfully" });
    } else if (userDislikedPost) {
      post.dislikes.pull(userId);
    }
    // You can safely add the like after checking both conditions above
    if (!userLikedPost) {
      post.likes.push(userId);
      res.status(200).json({ message: "Community post liked successfully" });
    }

    await post.save();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const dislikeCommunityPost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Community post not found" });
    }

    const userLikedPost = post.likes.includes(userId);
    const userDislikedPost = post.dislikes.includes(userId);

    if (userDislikedPost) {
      post.dislikes.pull(userId);
      res
        .status(200)
        .json({ message: "Dislike removed from community post successfully" });
    } else if (userLikedPost) {
      post.likes.pull(userId);
    }
    // You can safely add the dislike after checking both conditions above
    if (!userDislikedPost) {
      post.dislikes.push(userId);
      res.status(200).json({ message: "Community post disliked successfully" });
    }

    await post.save();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const replyToCommunityPost = async (req, res) => {
  try {
    const { text, img } = req.body; // Added img in case you want to allow image replies
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Community post not found" });
    }

    const reply = {
      text,
      image: img || "", // Added this line for image replies
      user: userId,
      createdAt: Date.now(),
    };

    post.replies.push(reply);
    await post.save();

    res.status(200).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const likeReply = async (req, res) => {
  try {
    const { postId, replyId } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Community post not found" });
    }

    const reply = post.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    if (reply.likes.includes(userId)) {
      reply.likes.pull(userId);
      await post.save();
      return res.status(200).json({ message: "Reply unliked successfully" });
    } else {
      reply.likes.push(userId);
      await post.save();
      return res.status(200).json({ message: "Reply liked successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const dislikeReply = async (req, res) => {
  try {
    const { postId, replyId } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Community post not found" });
    }

    const reply = post.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    if (reply.dislikes.includes(userId)) {
      reply.dislikes.pull(userId);
      await post.save();
      return res
        .status(200)
        .json({ message: "Dislike removed from reply successfully" });
    } else {
      reply.dislikes.push(userId);
      await post.save();
      return res.status(200).json({ message: "Reply disliked successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find();
    if (communities.length === 0) {
      return res.status(404).json({ message: "No communities found" });
    }
    res.status(200).json(communities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }
    console.log("Community:", community);
    // Verify if the requester is an admin of the community
    if (!community.admins.includes(req.user._id)) {
      return res
        .status(403)
        .json({ error: "Only admins can delete the community" });
    }
    console.log("Request user:", req.user);

    // Delete all associated posts of the community
    await CommunityPost.deleteMany({ _id: { $in: community.posts } });

    // Delete the community
    await Community.findByIdAndDelete(communityId);
    console.log("Community:", community);
    console.log("Request user:", req.user);


    res.status(200).json({ message: "Community deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCommunityPosts = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ error: "Invalid community ID" });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    const posts = await CommunityPost.find({ _id: { $in: community.posts } })
      .populate("postedBy", "username") // Assuming 'username' is a field in the User model
      .sort({ createdAt: -1 }); // Sorting in descending order by creation date

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPostReplies = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post.replies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getSpecificPostInCommunity = async (req, res) => {
  try {
    const { communityId, postId } = req.params; // Assuming route is like: /community/:communityId/post/:postId

    // Fetch the community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Check if the community has the post
    if (!community.posts.includes(postId)) {
      return res
        .status(404)
        .json({ error: "Post not found in this community" });
    }

    // Fetch the specific post
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Return the post
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export {
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
  getAllCommunities,
  deleteCommunity,
  getCommunityPosts,
  getPostReplies,
  getSpecificPostInCommunity,
};
