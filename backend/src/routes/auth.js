import signup from "../controllers/authController.js";
import express from "express";
const router = express.Router();


router.post("/signup",signup);


export default router;