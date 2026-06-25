import pool from "../config/db.js";

// create neighborhood
export const createNeighborhood = async (req , res)=>{
    const {name,city,pincode,type} = req.body;
    const user_id = req.user.user_id;
    try {
        const existing = await pool.query("SELECT * FROM neighborhoods WHERE (name,pincode,type) = ($1, $2, $3)",[name,pincode,type]);
        if(existing.rows.length >0){
            return res.status(400).json({
                message:"Neighborhoods With This Pincode Already Exists",
                neighborhood:existing.rows[0],
            })
        }

        const neighborhood = await pool.query("INSERT INTO neighborhoods(name,city,pincode,type) VALUES($1,$2,$3,$4) RETURNING *",[name,city,pincode,type]);

       await pool.query("INSERT INTO neighborhood_members (user_id,neighborhood_id,role) VALUES ($1, $2, $3)",[user_id,neighborhood.rows[0].id,"admin"]);

        return res.status(201).json({
            message:"Neighborhood Created Successfully",
            neighborhood:neighborhood.rows[0],
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
}


// join neighborhood

export const joinNeighborhood = async (req,res)=>{
    const {neighborhoodId} = req.body;
    const user_id = req.user.user_id;
    try {
     const result = await pool.query("SELECT * FROM neighborhoods WHERE id = $1",[neighborhoodId]);
     if(result.rows.length === 0 ){
        return res.status(400).json({message:"No neighborhood found with given details"});
     }   

     const neighborhood_id = result.rows[0].id;
     const alreadyMember = await pool.query("SELECT * FROM neighborhood_members WHERE user_id =$1 AND neighborhood_id = $2 ",[user_id,neighborhood_id]);

     if(alreadyMember.rows.length>0){
        return res.status(400).json({message:"You are already a member of this neighborhood"});
     }

     await pool.query("INSERT INTO neighborhood_members(user_id,neighborhood_id,role) VALUES ($1, $2, $3)",[user_id,neighborhood_id,"member"]);

     return res.json({message:"Successfully Joined the neighborhood",
        neighborhood:result.rows[0],
     });


    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
} 


// get all members of neighborhood

export const getNeighbours = async (req,res)=>{
    const {neighborhoodId} = req.params;
    try {
        const existNeighborhood = await pool.query("SELECT * FROM neighborhoods WHERE id = $1",[neighborhoodId]);
        if(existNeighborhood.rows.length === 0){
            return res.status(404).json({message:"Neighborhood not found"});
        }
        const result = await pool.query("SELECT u.id,u.name,u.email,u.phone,nm.role,nm.joined_at FROM users u JOIN neighborhood_members nm ON u.id = nm.user_id WHERE nm.neighborhood_id = $1 ORDER BY nm.joined_at ASC",[neighborhoodId]);
        return res.json({
            members:result.rows,
            count:result.rows.length,
        })
    } catch (error) {
        console.error(error);
        res.status(500)>json({message:"Server Error"});
    } 
}


// current users neighborhoods

export const getMyNeighborhood = async (req,res)=>{
    const user_id = req.user.user_id;

    const result = await pool.query("SELECT n.*,nm.role,nm.joined_at FROM neighborhoods n JOIN neighborhood_members nm ON nm.neighborhood_id = n.id WHERE nm.user_id = $1",[user_id]);

    if(result.rows.length === 0){
        return res.status(404).json({message:"You have not joined any neighborhood yet"})
    }

    return res.json({
        neighborhoods:result.rows,
        count:result.rows.length,
    })
}


//user searches neighborhood

export const searchNeighborhoods = async (req,res)=>{
    const{pincode,name,city} = req.query;
    try {
        let conditions = [];
        let values = [];
        let counter =1;



        if(pincode){
            conditions.push(`n.pincode ILIKE $${counter}`);
            values.push(`%${pincode}%`);
            counter++;
        }

        if(name){
            conditions.push(`n.name ILIKE $${counter}`);
            values.push(`%${name}%`);
            counter++;
        }

        if(city){
            conditions.push(`n.city ILIKE $${counter}`);
            values.push(`%${city}%`);
            counter++;
        }

        if(conditions.length===0){
            return res.status(400).json({message:"Please provide at least one search term"});
        }

        const query =`
            SELECT n.*,count(nm.id) AS member_count FROM neighborhoods n LEFT JOIN neighborhood_members nm ON n.id = nm.neighborhood_id
            WHERE ${conditions.join(' AND ')}
            GROUP BY n.id
            ORDER BY member_count DESC;     
        `

        const result = await pool.query(query,values);

        if(result.rows.length ===0){
            return res.status(404).json({message:"No neighborhod found"})
        }

        return res.json({
            neighborhoods:result.rows,
            count:result.rows.length,
        })


    } catch (error) {
        console.error(error);
        return res.json({message:"Server Error"});
    }
}