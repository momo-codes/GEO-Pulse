import {Navigate} from 'react-router-dom';
import {useAuth} from "../context/AuthContext.jsx";

const ProtectRoute = ({children})=>{
    const {user,loading} = useAuth();

    if(loading){
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                loading...
            </div>
        )
    }

    if(!user){
        return <Navigate to="/login" />
    }

    return children;
}

export default ProtectRoute;