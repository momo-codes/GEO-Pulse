import express from "express";
import checkLogin from "../middleware/authMiddleware.js";
import {addContribution,getAllContributions, updateContribution} from "../controllers/contributionController.js";
const router = express.Router();

router.post("/events/:eventId/contributions",checkLogin,addContribution);
router.get("/events/:eventId/contributions",checkLogin,getAllContributions);
router.patch("/contributions/:contributionId/status",checkLogin,updateContribution);

export default router;
