import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const signup = async (req , res)=>{
    const {name,email,password,phone} = req.body;
    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE email =$1",[email]);
        if(existingUser.rows.length>0){
            return res.status(400).json({message:"Email Already Registered"})
        }

        // hashing password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password,salt);

        const newUser = await pool.query("INSERT INTO users(name,email,password_hash,phone) VALUES($1,$2,$3,$4) RETURNING id, name, email",[name,email,password_hash,phone])

        const payload = {
            user_id:newUser.rows[0].id,
            name:newUser.rows[0].name
        }
        const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'7d'});

        return res.status(201).json({
            message:"User Created Successfully",
            token,
            user:newUser.rows[0]
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"server error"});        
    }
}

export default signup;