import pool from "../config/db.js";


export const createPost = async(req , res)=>{
    const user_id = req.user.user_id;
    const {eventId} = req.params;
    const {content} = req.body;

    if(!content || content.trim() === ''){
        return res.status(400).json({message:"Post content cannot be empty"});
    }
    try {
        const event = await pool.query(`SELECT * FROM events WHERE id = $1`,[eventId]);
        if(event.rows.length === 0){
            return res.status(404).json({message:"event not found"});
        }
        const isMember = await pool.query(`SELECT * FROM neighborhood_members WHERE neighborhood_id =$1 AND user_id = $2`,[event.rows[0].neighborhood_id,user_id]);
        if(isMember.rows.length ===0){
            return res.status(403).json({message:"You must be a member of this neighborhood"});
        }

        const post = await pool.query(`INSERT INTO posts (event_id,user_id,content) VALUES ($1,$2,$3) RETURNING *`,[eventId,user_id,content.trim()]);

        const postWithAuthor = await pool.query(`SELECT p.*,u.name AS author_name FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1`,[post.rows[0].id]);

        const newPost = postWithAuthor.rows[0];

        // io instance
        const io = req.app.get('io');
        io.to(`event_${eventId}`).emit('newPost',newPost);

        return res.status(201).json({
            message:"post created successfully",
            post:newPost
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
}


// get all event post

export const getEventPost = async(req,res)=>{
    const user_id = req.user.user_id;
    const {eventId} = req.params;

    try {
        const event = await pool.query(`SELECT * FROM events WHERE id = $1`,[eventId]);
        if(event.rows.length === 0){
            return res.status(404).json({message:"event not found"});
        }
        const isMember = await pool.query(`SELECT * FROM neighborhood_members WHERE neighborhood_id =$1 AND user_id = $2`,[event.rows[0].neighborhood_id,user_id]);
        if(isMember.rows.length ===0){
            return res.status(403).json({message:"You must be a member of this neighborhood"});
        }

        const posts = await pool.query(`SELECT u.name AS author_name,p.content,p.created_at FROM posts p JOIN users u ON p.user_id = u.id WHERE p.event_id  = $1 ORDER BY p.created_at ASC`,[eventId]);

        return res.json({
            posts:posts.rows,
            count:posts.rows.length,
        })


    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }

}


export const deletePost = async(req,res)=>{
    const user_id = req.user.user_id;
    const{postId} = req.params;

    try {
        const post = await pool.query(`SELECT * FROM posts WHERE id = $1`,[postId]);

        if(post.rows.length === 0){
            return res.status(404).json({message:"post does not exists"});
        }

        if(user_id !== post.rows[0].user_id){
            return res.status(403).json({message:"You can only delete your own posts"})
        }

        const deleted = await pool.query(`DELETE FROM posts WHERE id -$1`,[postId]);

        const io = req.app.get('io');

        io.to(`event_${post.rows[0].event_id}`),emit('post_deleted',{postId});

        return res.json({message:"Post deleted successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
}
