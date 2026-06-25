import express from "express";
import {signup,login,getMe} from "../controllers/authController.js";
import checkLogin from "../middleware/authMiddleware.js";
const router = express.Router();


router.post("/signup",signup);
router.post("/login",login);
router.get("/me",checkLogin,getMe);

export default router;