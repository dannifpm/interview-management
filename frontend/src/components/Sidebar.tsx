import React, { useState } from 'react';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon, { IconName } from './Icons';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  const menuItems: { label: string; path: string; icon: IconName }[] =
    user?.role === 'recruiter'
      ? [
        { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
        { label: 'Job Listings', path: '/jobs-listings-recruiter', icon: 'jobListings' },
        { label: 'Applications', path: '/applications', icon: 'applications' },
        { label: 'Interviews', path: '/interviews-recruiter', icon: 'interviews' },
        { label: 'Reports', path: '/reports', icon: 'reports' },
        { label: 'Settings', path: '/settings', icon: 'settings' },
      ]
      : [
        { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
        { label: 'Available Jobs', path: '/jobs-listings-candidate', icon: 'jobListings' },
        { label: 'My Applications', path: '/my-applications', icon: 'myApplications' },
        { label: 'Saved Jobs', path: '/saved-jobs', icon: 'savedJobs' },
        { label: 'Interviews', path: '/interviews-candidate', icon: 'interviews' },
        { label: 'Settings', path: '/settings', icon: 'settings' },
      ];

  return (
    <>
      {!isOpen && (
        <button className="sidebar-toggle open-btn" onClick={toggleSidebar}>
          ☰
        </button>
      )}
      <div className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
        {isOpen && (
          <>
            <button className="sidebar-toggle close-btn" onClick={toggleSidebar}>
              ×
            </button>
            <div className="sidebar-content">
              <div className="profile-section">
                <div className="profile-picture-container">
                  <img
                    src={`${process.env.REACT_APP_API_URL}${user?.profilePicture}`|| '/assets/default-profile.svg'}
                    alt="Profile"
                    className="profile-picture"
                  />
                </div>
                <h3 className="profile-name">{user ? `${user.name} ${user.lastName}` : 'User'}</h3>
              </div>

              <nav className="menu">
                {menuItems.map((item) => (
                  <a
                    href="#!"
                    key={item.path}
                    className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.path)}
                  >
                    <Icon name={item.icon} className="menu-icon" />
                    <span className="label">{item.label}</span>
                  </a>
                ))}
                <a href="#!" className="menu-item logout" onClick={handleLogout}>
                  <Icon name="logout" className="menu-icon" />
                  <span className="label">Logout</span>
                </a>
              </nav>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Sidebar;
