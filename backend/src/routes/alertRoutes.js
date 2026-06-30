import express from "express";
import checkLogin from "../middleware/authMiddleware.js";
import {createAlert,getNeighborhoodAlert} from "../controllers/alertController.js";
const router = express.Router();

router.post("/create",checkLogin,createAlert);
router.get("/neighborhood/:neighborhoodId",checkLogin,getNeighborhoodAlert);

export default router;