import { useState } from "react"
import{Link,useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import {signup} from "../services/api.js" 

const Signup = () => {
    const [formData,setFormData] = useState({
        name:'',
        email:'',
        phone:'',
        password:''
    })

    const [loading , setLoading] = useState(false);
    const Navigate = useNavigate();
    const{loginUser} = useAuth();

    const handleChange = (e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();

        setLoading(true);

        try {
            const res = await signup(formData);
            loginUser(res.data.token,res.data.user);
            toast.success("Account Created Successfully");
            Navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Sign Up Failed');
        }
        finally{
            setLoading(false);
        }
    }



  return <div className="min-h-screen bg-gray-100 flex 
      items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-lg 
        p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 
          text-center mb-2">
          GeoPulse 🏘️
        </h1>
         <h2 className="text-xl font-semibold text-gray-800 
          text-center mb-1">
          Join your neighborhood
        </h2>
        <p className="text-gray-500 text-center text-sm mb-8">
          Create your account to get started
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold 
              text-gray-700">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Rahul Sharma" className="px-4 py-3 rounded-xl border 
                border-gray-200 text-sm outline-none
                focus:border-blue-500 w-full" required />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold 
              text-gray-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="rahul@example.com" className="px-4 py-3 rounded-xl border 
                border-gray-200 text-sm outline-none
                focus:border-blue-500 w-full" required />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold 
              text-gray-700">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" className="px-4 py-3 rounded-xl border 
                border-gray-200 text-sm outline-none
                focus:border-blue-500 w-full" required />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold 
              text-gray-700">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a stron password" className="px-4 py-3 rounded-xl border 
                border-gray-200 text-sm outline-none
                focus:border-blue-500 w-full" required />
            </div>

            <button type="submit" 
            disabled={loading}
            className={`py-3 rounded-xl text-white 
              font-semibold text-sm mt-2
              ${loading? 'bg-blue-300 cursor-not-allowed':'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}>
                {loading?'Creating account...':'Create Account'}
              </button>
        </form>
                <p className="text-center mt-6 text-gray-500 text-sm">
                    Already Have An Account?{' '}
                    <Link to="/login" className="text-blue-600 
            font-semibold">
                    Log In
                    </Link>
                </p>
    </div>
  </div>
}
export default Signup