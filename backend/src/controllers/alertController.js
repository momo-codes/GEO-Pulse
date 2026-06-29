import pool from "../config/db.js";
import {notifyNeighbors} from "../utils/notificationHelper.js"

//create alert 
export const createAlert = async (req,rea)=>{
    const user_id = req.user.user_id;
    const{neighborhoodId,type,description} =  req,body;

    const validTypes = ['safety','emergency','infrastructure','other'];

    if(!validTypes.includes(type)){
        return res.status(400).json({message:"Invalid type. Must be safety, emergency, infrastructure or other"})
    }
    try {
        const isMember = await pool.query(`SElECT * FROM neighborhood_members WHERE user_id =$1 AND neighborhood_id = $2`,[user_id,neighborhoodId]);
        if(isMember.rows.length ===0){
            return res.status(403).json({message:"You are not member of this neighborhood"});
        }
        // create alert
        const alert = await pool.query(`INSERT INTO alerts (neighborhood_id,user_id,type,description) VALUES ($1,$2,$3,$4) RETURNING *`,[neighborhoodId,user_id,type,description]);

        // creating poster for notification
        const poster = await pool.query(`SELECT name FROM users WHERE id = $1`,[user_id]);
        const message = `🚨${poster.rows[0].name} posted a ${type} alert:${description.substring(0,50)}...`;
        // io instance
        const io = req.app.get('io');
        await notifyNeighbors(neighborhoodId,user_id,'alert',message,alert.rows[0].id,io);

        io.to('neigborhood_${neighborhoodId}').emit('urgent_alert',({
            type,
            description,
            posted_by:poster.rows[0].name
        }))

        return res.status(201).json({message:"Alert created successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"})
    }
}


export const getNeighborhoodAlert = async(req,res)=>{
    const user_id = req.user.user_id;
    const{neighborhoodId} = req.params;

    try {
        const isMember = await pool.query(`SELECT * FROM neighborhood_members WHERE user_id =$1 AND neighborhood_id = $2`,[user_id,neighborhoodId]);
        if(isMember.rows.length ===0){
            return res.status(403).json({message:"You are not member of this neighborhood"})
        }
        const alerts = await pool.query(`SELECT u.name , a.* FROM alerts a JOIN users u ON u.id = a.user_id
            WHERE a.neighborhood_id = $1 ORDER BY a.created_at DESC`,[neighborhoodId]);

            return res.json({
                alerts:alerts.rows,
                counta:alerts.rows.length
            })
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
}