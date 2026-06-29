import pool from "../config/db.js";
import {notifyNeighbors} from "../utils/notificationHelper.js"

export const createEvent = async (req,res)=>{
    const {title,description,date,location,neighborhood_id} =req.body;
    const user_id = req.user.user_id;

    try {
        //is member
        const membership = await pool.query(`SELECT * FROM neighborhood_members WHERE user_id = $1 AND neighborhood_id=$2`,[user_id,neighborhood_id]);
        if(membership.rows.length === 0){
            return res.status(403).json({
                message:"you must be a member of this society to create an event"
            })
        }

        const event = await pool.query(`INSERT INTO events (title, description, date, location, neighborhood_id, created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,[title, description, date, location, neighborhood_id, user_id]);

        await pool.query(`INSERT INTO event_attendees (user_id,event_id) VALUES ($1,$2)`,[user_id,event.rows[0].id]);

        // poster for notification
        const poster = await pool.query(`SELECT name FROM users WHERE id = $1`,[user_id]);
        const message = `🎉 ${poster.rows[0].name} created a new event ${title}`;
        const io = req.app.get('io');
        await notifyNeighbors(
            neighborhood_id,
            user_id,
            'event',
            message,
            event.rows[0].id,
            io);
        return res.status(201).json({
            message:"Event Created Successfully",
            event:event.rows[0],
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
}


export const getNeighborhoodEvents = async (req,res)=>{
    const{neighborhoodId} = req.params;
    const user_id = req.user.user_id;
    
    try {
        const isMember = await pool.query(`Select * from neighborhood_members where neighborhood_id =$1 AND user_id=$2`,[neighborhoodId,user_id]);
        if(isMember.rows.length ===0){
            return res.status(400).json({
                message:"You are not member of this neighborhood"
            })
        }
        const events = await pool.query(`SELECT e.*,u.name AS created_by,
            COUNT(DISTINCT ea.user_id) AS attendee_count,
            COUNT(DISTINCT c.id) AS contrubution_count
            FROM events e JOIN users u ON e.created_by = u.id
            LEFT JOIN event_attendees ea ON e.id = ea.event_id
            LEFT JOIN  contributions c ON e.id = c.event_id
            WHERE e.id = $1    
            GROUP BY e.id ,u.name
            ORDER BY e.date DESC`,
        [neighborhoodId]);

        return res.json({
            events:events.rows,
            count:events.rows.length,
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server Error"})    
    }
}



export const getEventById = async (req,res)=>{
    const {eventId} = req.params;
    const user_id = req.user.user_id;

    try {
        const event = await pool.query(`SELECT e.*,u.name AS creator_name,n.name AS neighborhood_name FROM events e JOIN 
            users u ON e.created_by = u.id
            JOIN neighborhoods n ON n.id = e.neighborhood_id
            WHERE e.id = $1 
            `,[eventId]);

        if(event.rows.length === 0){
            return res.status(404).json({message:"Event not found"});
        }

        const isMember = await pool.query(`SELECT * FROM neighborhood_members WHERE user_id =$1 AND neighborhood_id =$2`,[user_id,event.rows[0].neighborhood_id]);

        if(isMember.rows.length===0){
            return res.status(403).json({message:"You are not a member of this neighborhood"});
        }

        // get attendees
        const attendees = await pool.query(`SELECT u.id,u.name,ea.joined_at FROM users u JOIN event_attendees ea ON u.id = ea.user_id WHERE event_id =$1`,[eventId]);

        // if current user is attending;

        const isAttending = attendees.rows.some(a=> a.id === user_id);

        res.json({
            event:event.rows[0],
            attendees_count:attendees.rows.length,
            attendees:attendees.rows,
            isAttending:isAttending
        })


    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
}


// join event
export const joinEvent = async (req,res)=>{
    const {eventId} = req.params;
    const user_id = req.user.user_id;
    
try{
const event = await pool.query(`SELECT * FROM events WHERE id = $1`,[eventId]);

if(event.rows.length === 0){
    return res.status(404).json({message:"Event not found"});
}

    const isMember = await pool.query(`SELECT * FROM neighborhood_members nm WHERE nm.user_id=$1 AND nm.neighborhood_id = $2`,[user_id,event.rows[0].neighborhood_id]);
    if(isMember.rows.length===0){
        return res.status(403).json({message:"You must be a member of this neighborhood"});
    }

    const isAttending = await pool.query(`SELECT * FROM event_attendees ea WHERE ea.user_id=$1 AND ea.event_id =$2`,[user_id,eventId]);

    if(isAttending.rows.length>0){
        return res.status(400).json({message:"You are already attending this event"});
    }

    await pool.query(`INSERT INTO event_attendees (user_id,event_id) VALUES ($1,$2)`,[user_id,eventId]);

    return res.json({message:"successfully joined the event"});
}
catch(error){
    console.error(error);
    return res.status(500).json({message:"Server Error"});
}

}

//delete event

export const deleteEvent = async (req,res)=>{
    const {eventId} = req.params;
    const user_id = req.user.user_id;

    try {
        const event = await pool.query(`SELECT * FROM events WHERE id = $1`,[eventId]);
        if(event.rows.length===0){
            return res.status(404).json({message:"Event not Found"});
        }
        
        if(user_id !== event.rows[0].created_by){
            return res.status(403).json({message:"Only the event creator can delete this event"});
        }

        await pool.query(`DELETE FROM events WHERE id =$1`,[eventId]);

        return res.json({message:"event deleted successfully"});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }

}