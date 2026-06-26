import express from "express";
import checkLogin from "../middleware/authMiddleware.js"
import {createEvent,getEventById,getNeighborhoodEvents,deleteEvent,joinEvent} from "../controllers/eventController.js"
 const router = express.Router();


router.post("/create",checkLogin,createEvent);
router.get("/neighborhood/:neighborhoodId",checkLogin,getNeighborhoodEvents);
router.get("/:eventId",checkLogin,getEventById);
router.post("/:eventId/join",checkLogin,joinEvent);
router.delete("/:eventId",checkLogin,deleteEvent);


export default router;