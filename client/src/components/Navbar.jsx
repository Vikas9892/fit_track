import React, { useState } from "react";
import LogoImg from "../utils/Images/Logo.png";
import { Link as LinkR, NavLink } from "react-router-dom";
import { MenuRounded } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { useDispatch } from "react-redux";
import { logout } from "../redux/reducers/userSlice";

const Navbar = ({ currentUser }) => {
  const dispatch = useDispatch();
  const [isOpen, setisOpen] = useState(false);

  const activeLinkClass = "text-primary border-b-[1.8px] border-primary";
  const normalLinkClass = "text-neutral-700 hover:text-primary transition-all duration-300";

  return (
    <nav className="bg-white h-20 flex items-center justify-center sticky top-0 z-50 border-b border-neutral-200">
      <div className="w-full max-w-[1400px] px-6 flex items-center justify-between gap-4">
        {/* Mobile Icon */}
        <div 
          className="md:hidden flex items-center cursor-pointer text-neutral-800"
          onClick={() => setisOpen(!isOpen)}
        >
          <MenuRounded />
        </div>

        {/* Logo */}
        <LinkR to="/" className="flex items-center gap-4 font-semibold text-lg no-underline text-black">
          <img src={LogoImg} alt="Logo" className="h-10" />
          <span>Fittrack</span>
        </LinkR>

        {/* Mobile Menu */}
        <ul className={`md:hidden flex flex-col items-start gap-4 list-none absolute top-20 right-0 w-[90%] p-6 py-8 bg-white rounded-b-2xl shadow-lg transition-all duration-500 ease-in-out z-[1000] ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}>
          <li><NavLink to="/" onClick={() => setisOpen(false)} className={({ isActive }) => `block text-base font-medium ${isActive ? activeLinkClass : normalLinkClass}`}>Dashboard</NavLink></li>
          <li><NavLink to="/workouts" onClick={() => setisOpen(false)} className={({ isActive }) => `block text-base font-medium ${isActive ? activeLinkClass : normalLinkClass}`}>Workouts</NavLink></li>
          <li><NavLink to="/tutorials" onClick={() => setisOpen(false)} className={({ isActive }) => `block text-base font-medium ${isActive ? activeLinkClass : normalLinkClass}`}>Tutorials</NavLink></li>
          <li><NavLink to="/blogs" onClick={() => setisOpen(false)} className={({ isActive }) => `block text-base font-medium ${isActive ? activeLinkClass : normalLinkClass}`}>Blogs</NavLink></li>
          <li><NavLink to="/contact" onClick={() => setisOpen(false)} className={({ isActive }) => `block text-base font-medium ${isActive ? activeLinkClass : normalLinkClass}`}>Contact</NavLink></li>
        </ul>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center justify-center gap-8 list-none px-2">
          <li><NavLink to="/" className={({ isActive }) => `text-base font-medium ${isActive ? activeLinkClass : normalLinkClass}`}>Dashboard</NavLink></li>
          <li><NavLink to="/workouts" className={({ isActive }) => `text-base font-medium ${isActive ? activeLinkClass : normalLinkClass}`}>Workouts</NavLink></li>
          <li><NavLink to="/tutorials" className={({ isActive }) => `text-base font-medium ${isActive ? activeLinkClass : normalLinkClass}`}>Tutorials</NavLink></li>
          <li><NavLink to="/blogs" className={({ isActive }) => `text-base font-medium ${isActive ? activeLinkClass : normalLinkClass}`}>Blogs</NavLink></li>
          <li><NavLink to="/contact" className={({ isActive }) => `text-base font-medium ${isActive ? activeLinkClass : normalLinkClass}`}>Contact</NavLink></li>
        </ul>

        {/* User Profile */}
        <div className="flex items-center justify-end gap-4 px-2">
          <Avatar src={currentUser?.img}>{currentUser?.name?.[0]}</Avatar>
          <div 
            onClick={() => dispatch(logout())}
            className="text-secondary hover:text-primary cursor-pointer font-semibold transition-all duration-300"
          >
            Logout
          </div>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
