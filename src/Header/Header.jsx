import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <div className="navbar">
      <div className="logo">Medicare</div>

      <div className={`nav-links ${open ? 'open' : ''}`}>
        <NavLink to="/" onClick={toggleMenu}>Home</NavLink>
        <NavLink to="/admin/appoinment" onClick={toggleMenu}>Appoinment</NavLink>
        <NavLink to="/admin/departments" onClick={toggleMenu}>Departments</NavLink>
        <NavLink to="/admin/doctors" onClick={toggleMenu}>Doctors</NavLink>
        <NavLink to="/admin/jobs" onClick={toggleMenu}>Jobs</NavLink>
        <NavLink to="/admin/news-events" onClick={toggleMenu}>News</NavLink>
        <NavLink to="/admin/reviews" onClick={toggleMenu}>Reviews</NavLink>
        <NavLink to="/admin/users" onClick={toggleMenu}>Users</NavLink>
        <NavLink to="/admin/contacts" onClick={toggleMenu}>Contact</NavLink>
        {/* <NavLink to="/admin/insurance" onClick={toggleMenu}>Insurance</NavLink>
        <NavLink to="/admin/healthpackage" onClick={toggleMenu}>Health Package</NavLink>
        <NavLink to="/admin/emergencybed" onClick={toggleMenu}>Emergency</NavLink> */}
        <NavLink to="/admin" onClick={toggleMenu}>Login</NavLink>
      </div>

      <div className="hamburger" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default Header;
