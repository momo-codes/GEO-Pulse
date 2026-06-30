import express from "express";
const router = express.Router();
import checkLogin from "../middleware/authMiddleware";
import {getMyNotifications,markAsRead,markAllAsRead} from "../controllers/notificationControllers.js";
import { defaults } from "pg";

router.get("/",checkLogin,getMyNotifications);
router.patch("/:notificationId/read",checkLogin,markAsRead);
router.patch("/read-all",checkLogin,markAllAsRead);

export default router;
