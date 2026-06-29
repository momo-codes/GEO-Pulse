import pool from "../config/db.js";
import {notifyNeighbors} from "../utils/notificationHelper.js";

// create community post

export const createCommunityPost = async(req,res)=>{
    const user_id = req.user.user_id;
    const {neighborhood_id,type,title,content,is_urgent} = req.body;
        const validType = ['news','help','alert','update'];
        if(!validType.includes(type)){
            return res.status(400).json({message:"Invalid type. Must be news, help, alert or update"})
        }

    try {
        const isMember = await pool.query(`SELECT * FROM neighborhood_members WHERE neighborhood_id = $1 AND user_id =$2`,[neighborhood_id,user_id]);
        
        if(isMember.rows.length ===0){
            return res.status(403).json({message:"You are not member of this neighborhood"});
        }

        const post  = await pool.query(`INSERT INTO community_posts (neighborhood_id,user_id,type,title,content,is_urgent) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,[neighborhood_id,user_id,type,title,content, is_urgent || false]);

        // if urgent then notify the neighbors

        if(is_urgent){
            const io = req.app.get('io');
            io.to(`neighborhood_${neighborhood_id}`).emit('urgent_alert',{
                title,
                content,
                type,
                posted_by:user_id
            })
        }
if(type === 'help'){
    const poster = await pool.query(`SELECT name FROM users WHERE id = $1`,[user_id]);
    const message = `🆘 ${poster.rows[0].name} needs help : ${title}`;
    const io = req.app.get('io');

    await notifyNeighbors(neighborhood_id,user_id,'help',message,post.rows[0].id,io);
    
}


        return res.status(201).json({
            message:"Post created successfully",
            post:post.rows[0]
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"})
    }
}


// get feed (all community posts)

export const getNeighborhoodFeed = async(req,res)=>{
    const user_id = req.user.user_id;
    const{neighborhoodId} = req.params;
    const {type,page=1} =req.query;
    const limit = 20;
    const offset = (page-1)*limit;

    try {
        const isMember = await pool.query(`SELECT * FROM neighborhood_members WHERE neighborhood_id =$1 AND user_id = $2`,[neighborhoodId,user_id]);
        if(isMember.rows.length ===0){
            return res.status(403).json({message:"You must be a member of this neighborhood"});
        }
        //dynamic query
        let query = `SELECT u.name,cp.* FROM community_posts cp JOIN users u ON u.id = cp.user_id WHERE cp.neighborhood_id = $1`;

        // dynamic value array
        let values = [neighborhoodId];

        if(type){
            values.push(type);
            query+= ` AND cp.type = $${values.length}`;
        }
        values.push(limit);
        query+=` ORDER BY cp.is_urgent DESC, cp.created_at DESC LIMIT $${values.length}`;

        values.push(offset);
        query+=` OFFSET $${values.length}`

        const posts = await pool.query(query,values);

        return res.json({
            posts:posts.rows,
            page:Number(page),
            totalInPage:posts.rows.length,
            hasMore: posts.rows.length === limit
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"})
    }
}