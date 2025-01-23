import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

export const getPostComments = async (req, res) => {
  const postId = req.params.postId;
  if (!postId) {
    return res.json("Invalid Post id");
  }

  const comments = await Comment.find({ post: postId })
    .populate("user", "username img")
    .sort({ createdAt: -1 });

  if (!comments) {
    res.json("No comments were found...");
  }
  res.json(comments);
};

export const addComment = async (req, res) => {
  const userId = req.userId;
  const postId = req.params.postId;

  if (!userId) {
    return res.status(401).json("Not authenticated!");
  }

  const user = await User.findOne({ userId });

  const newComment = new Comment({
    ...req.body,
    user: userId,
    post: postId,
  });

  const savedComment = await newComment.save();

  setTimeout(() => {
    res.status(201).json(savedComment);
  }, 3000);
};

export const deleteComment = async (req, res) => {
  const userId = req.userId;
  const commentId = req.params.id;

  if (!userId) {
    return res.status(401).json("Not authenticated!");
  }

  // Fetch only the role of the user
  const user = await User.findById(userId).select("role");
  const role = user?.role || "user";

  // If the user is an admin, delete the comment directly
  if (role === "admin") {
    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json("Comment has been deleted");
  }

  // If the user is not an admin, check ownership and delete
  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    user: userId,
  });

  if (!deletedComment) {
    return res.status(403).json("You can delete only your comment!");
  }

  res.status(200).json("Comment deleted");
};
