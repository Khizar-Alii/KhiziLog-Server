import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({
      message: "All the fields are required",
    });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json("Password must contain minimum 6 characters...");
  }

  const checkusernameexists = await User.findOne({ username });
  if (checkusernameexists) {
    return res.status(400).json({
      status: false,
      message: "Username already Exist... Please try a different username",
    });
  }

  //to hash a password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    name: name,
    username: username,
    password: hashedPassword,
  });
  await user.save();
  return res.status(200).json({
    status: true,
    message: "User Register Successfully...",
  });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      message: "All the fields are required",
    });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({
      status: false,
      message: "Invalid Credentials",
    });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      status: false,
      message: "Invalid Credentials",
    });
  }

  // exclude password
  const { password: _, ...userWithoutPassword } = user.toObject();

  // generate token
  const token = await generateToken(user._id);
  res.status(200).json({
    message: "Login successful",
    data: {
      token,
      userWithoutPassword,
    },
  });
};

// get owns info

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user data
    res.status(200).json({ data: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user info", error: error.message });
  }
};
// logout a  user
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout Successfully",
  });
};

export const getUserSavedPost = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json("User not Found");
  }
  return res.status(200).json(user.savedPosts);
};

export const savePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.userId;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json("Not Authenticated");
  }

  const isSaved = user.savedPosts.some((p) => p === postId);

  if (!isSaved) {
    await User.findByIdAndUpdate(user._id, {
      $push: {
        savedPosts: postId,
      },
    });
  } else {
    await User.findByIdAndUpdate(user._id, {
      $pull: {
        savedPosts: postId,
      },
    });
  }
  setTimeout(() => {
    res.status(200).json(isSaved ? "Post Unsaved" : "Post Saved")
  }, 3000);
};
