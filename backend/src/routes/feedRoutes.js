import express from "express";
const router = express.Router();
import {createCommunityPost,getNeighborhoodFeed} from "../controllers/communityPostController.js";
import checkLogin from "../middleware/authMiddleware.js";
import {getNews} from "../controllers/newsController.js";

router.post("/create",checkLogin,createCommunityPost);
router.get("/neighborhood/:neighborhoodId",checkLogin,getNeighborhoodFeed);
router.get("/news",checkLogin,getNews);

export default router;