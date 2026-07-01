import {createContext,useContext,useState,useEffect} from "react";
import {getMe} from "../services/api.js";
import  socket from "../utils/socket.js";

const AuthContext = createContext();

export const AuthProvider = ({children})=>{
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        const token = localStorage.getItem('token');
        if(token){
            loadUser();
        }
        else{
            setLoading(false);
        }
    },[]);

   const loadUser = async()=>{
        try{
        const res = await getMe();
        setUser(res.data.user);
        socket.connect();
        socket.emit('join_user_room',res.data.user.id);
        }
        catch(error){
                // token invalid or expired;
                localStorage.removeItem('token');
        }
        finally{
            setLoading(false);
        }
    }

    const loginUser = (token,userData)=>{
        localStorage.setItem('token',token);
        setUser(userData);
        socket.connect();
        socket.emit('join_user_room',userData.id);
    }

    const logoutUser = ()=>{
        localStorage.removeItem('token');
        setUser(null);
        socket.disconnect();
    }

    return(
        <AuthContext.Provider value={{user,loading,loginUser,logoutUser}}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = ()=> useContext(AuthContext);