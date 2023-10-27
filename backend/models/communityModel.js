import mongoose from "mongoose";
import Post from "./communityPostModel.js"; // Import the Post model

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      maxLength: 5000,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    coverImage: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    validate: {
      validator: function () {
        return this.admins.length <= 3;
      },
      message: "A community can have a maximum of 3 admins.",
    },
  }
);

const Community = mongoose.model("Community", communitySchema);

export default Community;
