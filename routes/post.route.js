import express from "express";
const router = express.Router()
import {getPosts,getPost,createPost,deletePost,featurePost,uploadAuth} from "../controllers/post.controller.js"
import {authMiddleware} from "../middlewares/auth.middleware.js"
import {IncreaseVisit} from "../middlewares/increaseVisit.js"

router.get("/upload-auth", uploadAuth);
router.get("/", getPosts);
router.get("/:slug",IncreaseVisit, getPost);
router.post("/",authMiddleware, createPost);
router.delete("/:id",authMiddleware, deletePost);
router.patch("/feature",authMiddleware, featurePost);

export default router;