import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignOutButton = ({ onSignOut }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await axios.post("/auth/logout"); 
      onSignOut(); 
      navigate("/signin"); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      className="px-4 py-2 rounded-lg transition-colors bg-red-600 text-white"
      onClick={handleSignOut}
    >
     Logout
    </button>
  );
};

export default SignOutButton;
