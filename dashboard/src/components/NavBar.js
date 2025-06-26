// NavBar.js
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';  // תיקון הייבוא

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();  // הוספת useNavigate
  const { isAuthenticated, user, setIsAuthenticated, setUserEmail } = useContext(UserContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail"); // הוסיפי שורה זו
    setIsAuthenticated(false);
    setUserEmail(null);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="me-2">🛡️</span>
          ChatShield
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            {!isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                    to="/"
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`} 
                    to="/register"
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    Register
                  </Link>
                </li>
              </>
            )}

            {isAuthenticated && (
              <>
                {user?.registeredVia.includes('Extension') && (
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${location.pathname === '/my-dashboard' ? 'active' : ''}`} 
                      to="/my-dashboard"
                    >
                      My Dashboard
                    </Link>
                  </li>
                )}
                {user?.linkedEmails?.length > 0 && (
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${location.pathname === '/shared-dashboard' ? 'active' : ''}`} 
                      to="/shared-dashboard"
                    >
                      Linked Accounts
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                    <Link 
                      className={`nav-link ${location.pathname === '/statistics' ? 'active' : ''}`} 
                      to="/statistics"
                    >
                      Statistics
                    </Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
