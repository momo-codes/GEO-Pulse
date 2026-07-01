import { useState } from "react";
import {Link,useNavigate} from "react-router-dom";
import {login} from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const Login = ()=>{
    const [formData,setFormData] = useState({
        email:'',
        password:''
    })
    const [loading,setLoading] = useState(false);

    const Navigate = useNavigate();
    const {loginUser} = useAuth();

    const handleChange = (e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }

    const handleSubmit = async (e)=>{
        e.preventDefault();

        setLoading(true);
        try {
            const res = await login(formData);
            loginUser(res.data.token,res.data.user);
            toast.success(`Welcome Back ${res.data.user.name}!`);
            Navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login Failed');

        }
        finally{
            setLoading(false);
        }
    }


    return(
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white rounded-2xl shadow-lg 
        p-10 w-full max-w-md">
            <h1 className="text-3xl font-bold text-blue-600 
          text-center mb-2">
                GeoPulse 🏘️
            </h1>
            <h2 className="text-xl font-semibold text-gray-800 
          text-center mb-1">
                Welcome back
            </h2>
            <p className="text-gray-500 text-center text-sm mb-8">
                Sign in to your account to continue
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <label  className="text-sm font-semibold 
              text-gray-700">
                        Email
                    </label>
                    <input type ="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required className="px-4 py-3 rounded-xl border 
                border-gray-200 text-sm outline-none
                focus:border-blue-500 w-full"/>
                </div>

                <div className="flex flex-col gap-1">
                    <label  className="text-sm font-semibold 
              text-gray-700">
                        Password
                    </label>
                    <input type ="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required className="px-4 py-3 rounded-xl border 
                border-gray-200 text-sm outline-none
                focus:border-blue-500 w-full"/>
                </div>

                <button type="submit"
                disabled={loading}
                className = {`py-3 rounded-xl text-white font-semibold text-sm mt-2 
                    ${loading? 'bg-blue-300 cursor-not-allowed':'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`
                }>
                    {loading? 'Signing in...':'Sign In'}
                </button>
            </form>
            <p className="text-center mt-6 text-gray-500 text-sm">
          New to GeoPulse?{' '}
          <Link to="/signup" className="text-blue-600 
            font-semibold">
            Create account
          </Link>
        </p>
        </div>
        </div>
    )
}

export default Login;  