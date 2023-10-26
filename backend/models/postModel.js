import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      maxLength: 10000,
    },
    img: {
      type: String,
    },
    video: {
      type: String,
    },
    likes: {
      // array of user ids
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    replies: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        userProfilePic: {
          type: String,
        },
        username: {
          type: String,
        },
      },
    ],
    // Repost Fields
    repostOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // reference to the Post model
    },
    repostedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to the User model
    },
    originalPosterProfileImg: {
      type: String,
    },
    repostCount: {
      type: Number,
      default: 0,
    },
    repostText: {
      type: String,
      maxLength: 10000,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
