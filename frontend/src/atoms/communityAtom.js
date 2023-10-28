import { atom } from "recoil";

// Atom for the community profile
export const communityProfileAtom = atom({
  key: "communityProfileAtom",
  default: {
    communityId: "",
    name: "",
    description: "",
    admins: [],
    moderators: [],
    members: [],
    // ... any other community fields you want to track
  },
});

// Atom for posts related to the community
export const communityPostsAtom = atom({
  key: "communityPostsAtom",
  default: [],
});

// Atom for a selected community post (e.g., when viewing details or replying)
export const selectedCommunityPostAtom = atom({
  key: "selectedCommunityPostAtom",
  default: {
    id: "",
    title: "",
    content: "",
    author: "",
    likes: 0,
    dislikes: 0,
    replies: [],
    // ... any other post fields you want to track
  },
});

// Atom for the admins and moderators. Useful if you want to quickly check if a user is an admin/moderator without digging into the community profile.
export const communityAdminsAtom = atom({
  key: "communityAdminsAtom",
  default: [],
});

export const communityModeratorsAtom = atom({
  key: "communityModeratorsAtom",
  default: [],
});
