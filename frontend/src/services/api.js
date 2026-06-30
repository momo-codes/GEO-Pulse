import axios from "axios";
import { configs } from "eslint-plugin-react-hooks";

const API = axios.create({
    baseURL:"http://localhost:5000/api"
})

API.interceptors.request.use((config)=>{
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
})


//routes

// auth routes
export const signup = (data)=> API.post("/auth/signup",data);
export const login = (data)=> API.post("/auth/login",data);
export const getMe = ()=> API.get("/auth/me");

//neighborhood routes
export const createNeighborhood = (data)=> API.post("/neighborhoods/create",data);
export const joinNeighborhood = (data)=> API.post("/neighborhoods/join",data);
export const getNeighbors = (id)=> API.get(`/neighborhoods/${id}/members`);
export const getMyNeighborhood = ()=> API.get("/neighborhoods/my");
export const  searchNeighborhoods = (params)=> API.get("/neighborhoods/search",{params})

//event routes
export const createEvent = (data)=> API.post("/events/create",data);
export const getNeighborhoodEvents = (id)=> API.get(`/events/neighborhood/${id}`);
export const getEventById = (id)=> API.get(`/events/${id}`);
export const joinEvent = (id)=> API.post(`/events/${id}/join`)
export const deleteEvent = (id)=> API.delete(`/events/${id}`);

//contribution routes
export const addContribution = (eventId,data)=> API.post(`/events/${eventId}/contributions`,data);
export const getAllContributions= (eventId)=> API.get(`/events/${eventId}/contributions`)
export const updateContribution = (id,data)=> API.patch(`/contributions/${id}/status`,data);

// post routes
export const createPost = (eventId,data)=> API.post(`/events/${eventId}/posts`,data);
export const getEventPost = (id)=> API.get(`/events/${id}/posts`);
export const deletePost = (id)=> API.delete(`/posts/${id}`);

// feed routes
export const createCommunityPost = (data)=> API.post("/feed/create",data);
export const getNeighborhoodFeed = (id,params)=> API.get(`/feed/neighborhood/${id}`,{params});
export const getNews = (city)=> API.get("/feed/news",{params: { city } });

// notifications routes
export const getMyNotifications = ()=> API.get("/notifications"); 
export const marAsRead = (id)=> API.patch(`/notifications/${id}/read`);
export const markAllAsRead = ()=> API.patch("/notifications/read-all");

//alert routes
export const createAlert = (data)=> API.post("/alerts/create",data);
export const getNeighborhoodAlert = (id)=> API.get(`/alerts/neighborhood/${id}`);