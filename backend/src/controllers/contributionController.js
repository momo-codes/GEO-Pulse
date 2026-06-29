import pool from "../config/db.js";


//add contribution to an event

export const addContribution = async (req,res)=>{
    const {eventId} = req.params;
    const user_id = req.user.user_id;
    const{type,value,description} = req.body;

    try {

        // check event exists
        const event = await pool.query(`SELECT * FROM events WHERE id=$1`,[eventId]);
        if(event.rows.length === 0){
            return res.status(404).json({message:"Event not found"});
        }

        //check if member
       const isMember = await pool.query(`SELECT * FROM neighborhood_members WHERE user_id=$1 AND neighborhood_id=$2`,[user_id,event.rows[0].neighborhood_id]);
        if(isMember.rows.length ===0){
            return res.status(403).json({message:"You are not a member of this neighborhood"})
        }
        // add contribution
        const contribution = await pool.query(`INSERT INTO contributions (event_id,user_id,type,value,description,status) VALUES ($1,$2,$3,$4,$5,'pending') RETURNING *`,[eventId,user_id,type,value,description]);
        
        return res.status(201).json({
            message:"Contribution added successfully",
            contribution:contribution.rows[0],
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
}

//get all contributions of an event

export const getAllContributions = async (req,res)=>{
    const {eventId} = req.params;
    const user_id = req.user.user_id;

    try{
        // check event exists
        const event = await pool.query(`SELECT * FROM events WHERE id=$1`,[eventId]);
        if(event.rows.length === 0){
            return res.status(404).json({message:"Event not found"});
        }



        //check is member
        const isMember = await pool.query(`SELECT * FROM neighborhood_members WHERE user_id=$1 AND neighborhood_id=$2`,[user_id,event.rows[0].neighborhood_id]);
        if(isMember.rows.length ===0){
            return res.status(403).json({message:"You are not a member of this neighborhood"})
        }

        const contributions = await pool.query(`SELECT c.*,u.name FROM contributions c JOIN users u ON c.user_id = u.id WHERE c.event_id = $1
            ORDER BY created_at `,[eventId]);

            const summary = await pool.query(`SELECT type,
                COUNT(*) AS total_contributions,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed_contribution,
                SUM(CASE
                WHEN type = 'money' THEN CAST(VALUE AS NUMERIC)
                ELSE 0 
                END) AS total_money_collected
                FROM contributions WHERE event_id=$1 GROUP BY type`,[eventId]);

                return res.json({
                    contributions:contributions.rows,
                    summary:summary.rows,
                    total_contribution:contributions.rows.length,
                })
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
}
    //update contribution
export const updateContribution = async(req,res)=>{
        const user_id = req.user.user_id;
        const {status} = req.body;
        const{contributionId} = req.params;

        const validStatus = ['pending','completed','canceled'];
        if(!validStatus.includes(status)){
            return res.status(400).json({message:"Invalid status. Must be pending, completed or cancelled"})
        }

        try {
            const contribution = await pool.query(`SELECT * FROM contributions WHERE id = $1`,[contributionId]);
            if(contribution.rows.length === 0){
                return res.status(404).json({message:"Contribution Not Found"});
            }

            if(contribution.rows[0].user_id !== user_id){
                return res.status(403).json({message:"You can only update your own contributions"});
            }

            const updatedContribution = await pool.query(`UPDATE contributions SET status = $1 WHERE id =$2`,[status,contributionId]);

            return res.json({
                message:"contribution updated successfully",
                contribution:updatedContribution.rows[0],
            })


        } catch (error) {
         console.error(error);
         return res.status(500).json({message:"Server Error"});   
        }
    }