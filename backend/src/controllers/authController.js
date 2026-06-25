import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

export const signup = async (req , res)=>{
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



export const login = async(req,res)=>{
    const{email,password} = req.body;
    try {
        const existUser = await pool.query("SELECT * FROM users WHERE email =$1",[email]);
        if(existUser.rows.length ===0){
            return res.status(404).json({message:"User Not Found"});
        }
        const user = existUser.rows[0];

        const isMatch = await bcrypt.compare(password,user.password_hash);
        if(!isMatch){
            return res.status(400).json({message:"Invalid Email Or Password"});
        }

        const payload = {
            user_id : user.id,
            name:user.name,
        }

        const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'7d'});

        return res.status(200).json({
            message:"Login Successful",
            token,
            user:{
                id:user.id,
                name:user.name,
                email:user.email
            }
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"server error"})
    }
}





export const getMe = async (req,res)=>{
    try {
        const result = await pool.query("SELECT * FROM users WHERE id = $1",[req.user.user_id]);
        if(result.rows.length === 0){
            return res.status(404).json({message:"User Not Found"});
        }
        return res.json({user:result.rows[0]});

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Server Error"});
    }
}