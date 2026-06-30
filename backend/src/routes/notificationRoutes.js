import express from "express";
const router = express.Router();
import checkLogin from "../middleware/authMiddleware.js";
import {getMyNotifications,markAsRead,markAllAsRead} from "../controllers/notificationControllers.js";

router.get("/",checkLogin,getMyNotifications);
router.patch("/:notificationId/read",checkLogin,markAsRead);
router.patch("/read-all",checkLogin,markAllAsRead);

export default router;
