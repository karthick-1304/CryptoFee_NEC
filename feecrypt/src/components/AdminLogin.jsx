import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import mage from './Handler6.jpg';

const AdminLogin = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState({});
  
  const navigate = useNavigate();

    console.clear();
    sessionStorage.clear(); // Remove any saved session data
    localStorage.clear(); 

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = {};

    if (!adminId) {
      newError.adminId = "Enter Admin ID.";
      hasError = true;
    }

    if (!password) {
      newError.password = "Enter password.";
      hasError = true;
    }

    if (hasError) {
      setError(newError);
      return;
    }

    axios
      .post("http://localhost:3001/admin/login", { adminId, password })
      .then((res) => {
        if (res.data.success) {
          sessionStorage.setItem("isLoggedIn", "true");
          navigate("/admin-dashboard"); 
        }
        else {
          setError({ general: res.data.message });
        }
      })
      .catch(() => {
        setError({ general: "Error occurred during admin login." });
      });
  };
  const handleStudentLogin = () => {
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="header-image-container">
        <img src={mage} alt="Header Logo" className="header-image" />
      </div>
      <button className="student-login-button" onClick={handleStudentLogin}>
        Student Login
      </button>
      <div className="login-box">
        <h2>Admin Login</h2>
        <form onSubmit={handleAdminSubmit}>
          <label htmlFor="adminId">Admin ID</label>
          <input
            type="text"
            id="adminId"
            name="adminId"
            placeholder="Enter Admin ID"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className={error.adminId ? "input-error" : ""}
          />
          {error.adminId && <p className="error-message">{error.adminId}</p>}

          <label htmlFor="password">Password</label>
          <div className="password-container">
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error.password ? "input-error" : ""}
            />
          </div>
          {error.password && <p className="error-message">{error.password}</p>}


          <div
            className="password-visibility"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              marginTop: "10px",
            }}
          >
            <label
              htmlFor="show-password"
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "14px",
                color: "#333",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <input
                  type="checkbox"
                  id="show-password"
                  checked={passwordVisible}
                  onChange={() => setPasswordVisible(!passwordVisible)}
                  style={{
                    marginRight: "8px", 
                    transform: "scale(1.2)", 
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    top: "-5px", 
                  }}
                >
                  Show&nbsp;Password
                </span>

            </label>
          </div>

          {error.general && <p className="error-message general-error">{error.general}</p>}

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
