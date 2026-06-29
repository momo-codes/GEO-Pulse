import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {Server} from "socket.io";
import pool from "./config/db.js";

dotenv.config();

const app = express();

const server =  http.createServer(app);

const io = new Server(server,{
  cors:{
    origin: '*',
    methods:['GET','POST']
  }
})

app.use(cors());
app.use(express.json());

// key par in app
app.set('io',io);

// socket.io connectionhandler
io.on('connection',(socket)=>{
  console.log(`user connected:`,socket.id);

// user join an event room
socket.on('join_event',(eventId)=>{
  socket.join(`event_${eventId}`);
  console.log(`user ${socket.id} joined event_${eventId}`);
})

// user leaves event room

socket.on('leave_event',(eventId)=>{
  socket.leave(`event_${eventId}`);
  console.log(`user ${socket.id} left event_${eventId}`);
})


//user gets disconnected 

socket.on('disconnect',()=>{
  console.log(`user disconnected:`,socket.id);
})


})




import authRoutes from "./routes/auth.js";
import neighborhoodRoutes from "./routes/neighborhood.js";
import eventRoutes from "./routes/eventRoutes.js";
import contributionRoutes from "./routes/contributionRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import feedRoutes from "./routes/feedRoutes.js";







const PORT = process.env.PORT || 5000;

//middleware


//routes

app.use("/api/auth",authRoutes);
app.use("/api/neighborhoods",neighborhoodRoutes);
app.use("/api/events",eventRoutes);
app.use("/api",contributionRoutes);
app.use("/api",postRoutes);
app.use("/api/feed",feedRoutes);

// test route
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  console.log(result.rows);
  return res.send(result.rows[0].current_database);
});

// server
server.listen(PORT,()=> {
  console.log(`server running on port: ${PORT}`);
})
