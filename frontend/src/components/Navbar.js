import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" className="navbar-brand">
            Store Ratings
          </Link>
          <ul className="navbar-nav">
            <li><Link to="/login" className="nav-link">Login</Link></li>
            <li><Link to="/register" className="nav-link">Register</Link></li>
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/dashboard" className="navbar-brand">
          Store Ratings
        </Link>

        {/* Mobile menu button */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          {isMobileMenuOpen ? '×' : '☰'}
        </button>

        <ul className={`navbar-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
          <li><Link to="/stores" className="nav-link">Stores</Link></li>

          {user.role === 'admin' && (
            <>
              <li><Link to="/admin/users" className="nav-link">Users</Link></li>
              <li><Link to="/admin/stores" className="nav-link">Management</Link></li>
              <li><Link to="/admin/ratings" className="nav-link">Ratings</Link></li>
            </>
          )}

          <li className="user-section">
            <span className="welcome-text">
              Welcome, <strong>{user.name}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                marginLeft: '16px'
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
