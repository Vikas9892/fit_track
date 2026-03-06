import React, { useState } from "react";
import LogoImage from "../utils/Images/Logo.png";
import AuthImage from "../utils/Images/AuthImage.jpg";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex-1 h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Decoration Image */}
      <div className="hidden md:flex flex-1 relative overflow-hidden group">
        <img 
          src={LogoImage} 
          alt="Logo" 
          className="absolute top-10 left-10 w-20 z-10 transition-transform duration-500 group-hover:scale-110"
        />
        <img 
          src={AuthImage} 
          alt="Fitness" 
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter">Transform Your Life</h2>
          <p className="text-neutral-300 font-medium max-w-sm">Join the most advanced fitness tracking community today.</p>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-neutral-50">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-neutral-100">
          {isLogin ? (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <SignIn />
              <div className="text-center text-sm font-medium text-neutral-500">
                Don't have an account?{" "}
                <button 
                  onClick={() => setIsLogin(false)} 
                  className="text-primary font-bold hover:underline ml-1"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <SignUp />
              <div className="text-center text-sm font-medium text-neutral-500">
                Already have an account?{" "}
                <button 
                  onClick={() => setIsLogin(true)} 
                  className="text-primary font-bold hover:underline ml-1"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Authentication;
