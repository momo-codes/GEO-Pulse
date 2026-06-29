import express from "express";
const router = express.Router();
import checkLogin from "../middleware/authMiddleware.js";
import {createPost,getEventPost,deletePost} from "../controllers/postController.js"

router.post("/events/:eventId/posts",checkLogin,createPost);
router.get("/events/:eventId/posts",checkLogin,getEventPost);
router.delete("/posts/:postId",checkLogin,deletePost);

export default router;