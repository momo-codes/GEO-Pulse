import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";

import authRoutes from "./routes/auth.js";
import neighborhoodRoutes from "./routes/neighborhood.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

//middleware


//routes

app.use("/api/auth",authRoutes);
app.use("/api/neighborhoods",neighborhoodRoutes);

// test route
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  console.log(result.rows);
  return res.send(result.rows[0].current_database);
});

// server
app.listen(PORT, () => console.log(`server started on PORT:${PORT}`));
