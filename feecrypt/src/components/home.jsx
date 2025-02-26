import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import mage from './Handler6.jpg';
import './home.css';

const Home = () => {
  const [Reg_No, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({}); 
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [position, setPosition] = useState("top");
  const navigate = useNavigate();
  
  console.clear();
  sessionStorage.clear(); // Remove any saved session data
  localStorage.clear();

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;
    const newError = {};

    if (!Reg_No) {
      newError.Reg_No = "Enter Your Register Number";
      hasError = true;
    }
    if (!password) {
      newError.password = "Enter Your Password";
      hasError = true;
    }

    if (hasError) {
      setError(newError);
      return;
    }

    axios
      .post("http://localhost:3001/home", { Reg_No, password })
      .then((res) => {
        if (
          res.data &&
          res.data.message !== "The password is incorrect" &&
          res.data.message !== "Reg No not found"
        ) {
          sessionStorage.setItem("isLoggedIn", "true");
          navigate("/profile", { state: res.data });
        } else {
          setError({
            general: res.data.message,
          });
        }
      })
      .catch(() => {
        setError({ general: "An error occurred. Please try again later." });
      });
  };
  
  const handleAdminLogin = () => {
    navigate("/admin-login");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => (prev === "top" ? "bottom" : "top"));
    }, 5000); // Change position every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login-page">
      <div className="header-image-container">
        <img src={mage} alt="Header Logo" className="header-image" />
      </div>
      <button className="admin-login-button" onClick={handleAdminLogin}>
        Admin Login
      </button>

      <div className="login-box">
        <h2>Student Login</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="Reg_No">Reg No</label>
          <input
            type="text"
            id="Reg_No"
            name="Reg_No"
            placeholder="Enter Your Reg No"
            value={Reg_No}
            onChange={(e) => {
              setRegNo(e.target.value);
              setError((prev) => ({ ...prev, Reg_No: "" }));
            }}
            className={error.Reg_No ? "input-error" : ""}
          />
          {error.Reg_No && <p className="error-message">{error.Reg_No}</p>}

          <label htmlFor="password">Password</label>
          <div className="password-container">
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              name="password"
              placeholder="DDMMYYYY (Your DOB)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError((prev) => ({ ...prev, password: "" }));
              }}
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
                  alignItems: "left",
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
                  marginRight: "18px", 
                  transform: "scale(1.2)", 
                }}
              />
              <span
                style={{
                  position: "relative",
                  top: "2px",
                  right:"12px" 
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

export default Home;
