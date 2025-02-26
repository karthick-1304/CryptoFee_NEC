import React,{ useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import  NotFound from "./components/notfound.jsx"
import ProtectedRoute from "./components/protectedroute.jsx";
import { scheduleMidnightRefresh } from "./components/midnightrefresher.jsx";
import  Home from "./components/home.jsx";
import AdminLogin from "./components/AdminLogin.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import  Profile from "./components/profile.jsx";
import Pay from "./components/pay.jsx"

const App = () => {
  useEffect(() => {
    scheduleMidnightRefresh(); // Schedule refresh at midnight
  }, []);
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/admin-login" 
      element=
      {<AdminLogin />}
      />

      <Route path="/admin-dashboard" 
      element=
      {<ProtectedRoute>
            <AdminDashboard />
        </ProtectedRoute>}
       />

      <Route path="/profile"
       element={
          <ProtectedRoute>
              <Profile />
        </ProtectedRoute>
      }
      />
      
      <Route path="/pay"
       element={
          <ProtectedRoute>
              <Pay />
        </ProtectedRoute>
      }
      />

      <Route path="/not-found" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;

