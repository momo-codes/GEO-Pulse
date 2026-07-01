import {BrowserRouter,Route,Routes,Navigate} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext.jsx";;
import {Toaster} from "react-hot-toast";
import ProtectRoute from "./components/ProtectRoute.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Neighborhood from "./pages/Neighborhood.jsx";
import Event from "./pages/Event.jsx";
import Feed from "./pages/Feed.jsx";


function App() {
  return(
    <BrowserRouter>
        <AuthProvider>
            <Toaster position="top-right" />
               <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path ="/signup" element={<Signup />} />

                    <Route path="/" element={
                      <ProtectRoute>
                        <Home />
                      </ProtectRoute>
                    } />
                    <Route path = "/neighborhood/:id" element={
                      <ProtectRoute>
                        <Neighborhood/>
                      </ProtectRoute>
                    }/>

                    <Route path = "/event/:id" element={
                      <ProtectRoute>
                        <Event />
                      </ProtectRoute>
                    } />

                    <Route path = "/feed" element={
                      <ProtectRoute>
                        <Feed/>
                      </ProtectRoute>
                    }/>

                    <Route path='*' element={<Navigate to="/" />}/>
               </Routes>
        </AuthProvider>
    </BrowserRouter>
  )
}

export default App;
