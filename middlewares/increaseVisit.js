import Post from "../models/post.model.js";

export const IncreaseVisit = async (req, res, next) => {
  const slug = req.params.slug;

  try {
    await Post.findOneAndUpdate(
      { slug },
      { $inc: { visit: 1 } }, 
      { new: true } 
    );
    next(); 
  } catch (error) {
    console.error("Error in IncreaseVisit middleware:", error);
    return res.status(500).json({ error: "Failed to update visit count" });
  }
};
