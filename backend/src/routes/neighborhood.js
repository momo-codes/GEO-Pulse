import express from "express";
const router = express.Router();
import {createNeighborhood,joinNeighborhood,getNeighbours,getMyNeighborhood} from "../controllers/neighborhoodController.js";
import checkLogin from "../middleware/authMiddleware.js";

router.post("/create",checkLogin,createNeighborhood);
router.post("/join",checkLogin,joinNeighborhood);
router.get("/:neighborhoodId/members",checkLogin, getNeighbours);
router.get("/my",checkLogin,getMyNeighborhood);

export default router;

