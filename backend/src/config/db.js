import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const{Pool} = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

// pool.on("connect",()=>{
    
//     console.log("connected to database");
// })

pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err)
  } else {
    console.log('Connected to PostgreSQL successfully')
  }
})

export default pool;