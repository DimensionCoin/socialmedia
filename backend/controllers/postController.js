import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;

    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "Postedby and text fields are required" });
    }

    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post" });
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

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to delete post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    if (post.video) {
      const videoId = post.video.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(videoId, { resource_type: "video" });
    }

    // If the post is a repost, decrement the repostCount of the original post
    if (post.repostOf) {
      await Post.findByIdAndUpdate(post.repostOf, {
        $inc: { repostCount: -1 },
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    await Post.deleteMany({ repostOf: req.params.id });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      // Like post
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = { userId, text, userProfilePic, username };

    post.replies.push(reply);
    await post.save();

    res.status(200).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;

    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });

    res.status(200).json(feedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const allPosts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(allPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const repostPost = async (req, res) => {
  try {
    const originalPostId = req.params.id;
    const userId = req.user._id;
    const { repostText } = req.body; // Get the repostText from the request body

    // Check if post exists
    const originalPost = await Post.findById(originalPostId);
    if (!originalPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if user is reposting their own post
    if (originalPost.postedBy.toString() === userId.toString()) {
      return res.status(400).json({ error: "Can't repost your own post" });
    }

    // Fetch the user who made the original post to get their profile picture
    const originalPoster = await User.findById(originalPost.postedBy);
    const originalPosterProfileImg = originalPoster
      ? originalPoster.profilePic
      : "";

    // Create a new post as repost
    const repost = new Post({
      postedBy: userId,
      text: originalPost.text, // Using the same text as the original post
      img: originalPost.img, // Using the same image as the original post
      repostOf: originalPost._id,
      repostedBy: userId,
      originalPosterProfileImg: originalPosterProfileImg,
      repostText: repostText, // Save the repostText
    });

    await Post.findByIdAndUpdate(originalPostId, { $inc: { repostCount: 1 } });
    const alreadyReposted = await Post.findOne({
      repostOf: originalPostId,
      repostedBy: userId,
    });
    if (alreadyReposted) {
      return res
        .status(400)
        .json({ error: "You've already reposted this post" });
    }

    await repost.save();
    res.status(201).json(repost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
  getAllPosts,
  repostPost,
};
