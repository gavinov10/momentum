import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard">🚀 Momentum</Link>
        </div>
        
        <div className="navbar-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
            Dashboard
          </Link>
          <Link to="/job-tracker" className={`nav-link ${isActive('/job-tracker')}`}>
            Job Tracker
          </Link>
          <Link to="/resume-generator" className={`nav-link ${isActive('/resume-generator')}`}>
            Resume Generator
          </Link>
        </div>

        <div className="navbar-user">
          <span className="user-name">Welcome, {user?.name || user?.email}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};