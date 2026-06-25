import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const checkLogin = async(req , res , next)=>{
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                message:"No token, Access Denied"
            })
        }

        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token,process.env.JWT_SECRET);

        req.user = payload;

        next();


    } catch (error) {
        return res.status(401).json({message:"Invalid Token"});
    }
}


export default checkLogin;