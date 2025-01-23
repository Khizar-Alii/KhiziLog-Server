import express from "express";
import { addComment, deleteComment, getPostComments } from "../controllers/comment.controller.js"
import {authMiddleware} from "../middlewares/auth.middleware.js"
const router = express.Router()

router.get("/:postId",authMiddleware, getPostComments)
router.post("/:postId",authMiddleware, addComment)
router.delete("/:id",authMiddleware, deleteComment)

export default router;