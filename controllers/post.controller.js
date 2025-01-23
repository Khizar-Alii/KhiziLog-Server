import dotenv from "dotenv";
dotenv.config();
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import ImageKit from "imagekit";

const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const query = {};
  const category = req.query.cat;
  const author = req.query.author;
  const searchQuery = req.query.search;
  const sortQuery = req.query.sort;
  const featured = req.query.featured;

  if (category) {
    query.category = category;
  }
  if (searchQuery) {
    query.title = { $regex: searchQuery, $options: "i" };
  }

  if (author) {
    const user = await User.findOne({ username: author }).select("_id");

    if (!user) {
      return res.status(404).json("No post found!");
    }

    query.user = user._id;
  }
  let sortObj = { createdAt: -1 };
  if (sortQuery) {
    switch (sortQuery) {
      case "newest":
        sortObj = { createdAt: -1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "popular":
        sortObj = { visit: -1 };
        break;
      case "trending":
        sortObj = { visit: -1 };
        query.createdAt = {
          $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        };
        break;
      default:
        break;
    }
  }
  if (featured) {
    query.isFeatured = true;
  }

  const posts = await Post.find(query)
    .sort(sortObj)
    .populate("user", "username")
    .limit(5)
    .skip((page - 1) * limit);

  const totalPost = await Post.countDocuments();

  const hasMore = page * limit < totalPost;

  if (!posts) {
    res.status(404).json({
      success: false,
      message: "No Posts Exists",
    });
  }
  res.status(200).json({ posts, hasMore });
};

const getPost = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate(
    "user",
    "username img"
  );
  if (!post) {
    return res.status(404).json("Post Doesn't Exist..");
  }
  return res.status(200).json(post);
};

const createPost = async (req, res) => {
  const userId = req.userId;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json("User not found!");
  }

  // Generate base slug
  const title = req.body.title.trim();
  let slugBase = title
    .replace(/ /g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, ""); // Removes non-alphanumeric characters
  let slug = slugBase;

  let counter = 1;

  // Check for duplicates and update slug
  while (await Post.findOne({ slug })) {
    slug = `${slugBase}-${counter}`;
    counter++;
  }
  const newPost = new Post({ user: user._id, slug, ...req.body });
  const post = await newPost.save();

  res.status(200).json({
    success: true,
    message: "Post Created Successfully",
    data: post,
  });
};

const deletePost = async (req, res) => {
  const POSTID = req.params.id;
  if (!POSTID) {
    return res.status(404).json("Cannot get post");
  }

  // Find the post by ID
  const post = await Post.findById(POSTID);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found",
    });
  }

  const userId = req.userId;

  const user = await User.findById(userId).select("role");

  if (user.role === "admin") {
    const deletedPost = await Post.findByIdAndDelete(POSTID);
    return res.status(200).json({
      success: true,
      message: "Post Deleted Successfully",
      data: deletedPost,
    });
  }

  // Check if the logged-in user is the one who created the post
  if (post.user.toString() !== req.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own posts",
    });
  }

  // Delete the post
  const deletedPost = await Post.findByIdAndDelete(POSTID);

  return res.status(200).json({
    success: true,
    message: "Post Deleted Successfully",
    data: deletedPost,
  });
};

const featurePost = async (req, res) => {
  const userId = req.userId;

  // Fetch the role of the user
  const user = await User.findById(userId).select("role");

  if (!user) {
    res.status(404).json("User not Found");
  }

  const role = user?.role || "user";

  const postId = req.body.postId;
  if (!postId) {
    return res.status(404).json("Cannot get post");
  }

  // Find the post by ID
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found",
    });
  }

  // Allow only admin to perform feature updates
  if (role !== "admin") {
    return res.status(403).json("You cannot feature posts!");
  }

  const isFeatured = post.isFeatured;
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      isFeatured: !isFeatured,
    },
    { new: true }
  );

  res.status(200).json({
    message: isFeatured ? "Post Unfeatured" : "Post Featured",
    updatedPost,
  });
};




const imagekit = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});

const uploadAuth = async (req, res) => {
  var result = imagekit.getAuthenticationParameters();
  res.send(result);
};

export { getPosts, getPost, createPost, deletePost, featurePost, uploadAuth };
