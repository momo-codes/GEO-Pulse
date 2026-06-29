import pool from "../config/db.js";

// get all notification for an user

export const getMyNotifications = async(req,res)=>{
    const user_id = req.user.user_id;
    try {
        const notifications = await pool.query(`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,[user_id]);
        const unread = await pool.query(`SELECT COUNT(*) FROM notifications WHERE user_id =$1 AND is_read =false`,[user_id]);
        return res.json({
            notifications:notifications.rows,
            unreadCount:unread.rows.length
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
}

export const markAsRead = async(req,res)=>{
    const user_id = req.user.user_id;
    const{notificationId} = req.params;
    try {
        const notification = await pool.query(`SELECT * FROM notifications WHERE id=$1`,[notificationId]);
        if(notification.rows.length ===0){
            return res.status(404).json({message:"Notification not found"});
        }
        // only owner can mark it is true
        if(user_id !==notification.rows[0].user_id){
            return res.status(403).json({message:"Not your notification"})
        } 
        
        await pool.query(`UPDATE notifications SET is_read = true WHERE id=$1`,[notificationId]);

        return res.json({message:"Marked as read"})
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"})
    }
}

// mark all notifications as read

export const markAllAsRead = async(req,res)=>{
    const user_id = req.user.user_id;
    try {
        await pool.query(`UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,[user_id]);
        return res.json({message:"All notifications marked as read"})
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"})
    }
}