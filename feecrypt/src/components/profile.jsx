import React from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import "./profile.css"

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { RegNo,Name,Degree,Branch,Semester,Batchyear,DOB,Photo} = location.state;
  
  const handleLogout = () => {
    
    console.clear();
    sessionStorage.clear(); 
    localStorage.clear(); 

    navigate("/", { replace: true });

    window.history.pushState(null, null, window.location.href);
    window.onpopstate = () => {
      navigate("/", { replace: true });
    };
  };

  const handlePay = () => {
    navigate("/pay", { state: { RegNo,Name,Degree,Branch,Semester,Batchyear,DOB,Photo } });
  };

  return (
    <>
      <div className="user-details-page">
      <header className="page-header">National Engineering College</header>
      <button className="logout-button" type="button" onClick={handleLogout}>Logout</button>

      <div className="profile-section">
        <div className="image-container">
          <img 
            src={Photo} 
            alt="User Image" 
            className="profile-image" 
          />
        </div>

        <div className="details">
          <p>
            <strong>Student Name:</strong> <span>{Name}</span>
          </p>
          <p>
            <strong>Degree:</strong> <span>{Degree}</span>
          </p>
          <p>
            <strong>Branch:</strong> <span>{Branch}</span>
          </p>
          <p>
            <strong>Semester:</strong> <span>{Semester}</span>
          </p>
          <p>
            <strong>Batch Year:</strong> <span>{Batchyear}</span>
          </p>
        </div>
      </div>

      <div className="button-section">
        <button className="pay-online-button" type="button" onClick={handlePay}>Pay</button>
      </div>
      </div>
    </>
  );
};

export default Profile;

  