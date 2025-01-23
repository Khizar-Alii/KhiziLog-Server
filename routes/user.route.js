import express from "express";
const router = express.Router();
import { register, login,logout,me ,getUserSavedPost,savePost} from "../controllers/user.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js"

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me",authMiddleware,me);

router.get("/saved",authMiddleware,getUserSavedPost)
router.patch("/save/:id",authMiddleware,savePost)

export default router;
