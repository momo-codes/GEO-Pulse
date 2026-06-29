import pool from "../config/db.js";

export const createNotification = async(userId,type,message,referenceId = null)=>{
        try {
            await pool.query(`INSERT INTO notifications (user_id,type,message,reference_id) VALUES ($1,$2,$3,$4)`,[userId,type,message,referenceId]);
        } catch (error) {
            console.error("message error",error);
        }
}

// notify all neighbors except itself

export const notifyNeighbors = async(neighborhoodId,excludedUserId,type, message, referenceId = null,io= null)=>{
    try {
        //get all users except self
        const members = await pool.query(`SELECT user_id FROM neighborhood_members WHERE neighborhood_id = $1 AND user_id!=$2`,[neighborhoodId,excludedUserId]);

        //create notification for every member
        for(const member of members.rows){
            await createNotification(member.user_id,type,message,referenceId);
            if(io){
                io.to(`user_${member.userId}`).emit('new_notification',{
                    type,
                    message,
                    referenceId
                })
            }
        }
    } catch (error) {
        console.error('Notify members error',error);
    }
}