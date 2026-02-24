

import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';


import Dashboard from './pages/Dashboard';
import AlertsPage from './pages/AlertsPage';
import RawDataPage from './pages/RawDataPage';

import './App.css';

function App() {
  
  return (
    <Router>
      <div className="app-container">
        
        {/* --- THE SIDEBAR ON THE LEFT --- */}
        <nav className="sidebar">
          
          <div className="sidebar-header">
            <div className="logo-icon">📡</div>
            <h1 className="sidebar-title">IoT Dashboard</h1>
          </div>
          
          <ul className="nav-list">
            {/* Link 1: The Home/Dashboard page */}
            <li>
              <NavLink 
                to="/" 
                end 
                className={function(navData) {
                  
                  if (navData.isActive) {
                    return 'nav-link active';
                  } else {
                    return 'nav-link';
                  }
                }}
              >
                <span className="nav-icon">🏠</span>
                Dashboard
              </NavLink>
            </li>

            {/* Link 2: The Alerts page for warnings */}
            <li>
              <NavLink 
                to="/alerts" 
                className={function(navData) {
                  
                  if (navData.isActive) {
                    return 'nav-link active';
                  } else {
                    return 'nav-link';
                  }
                }}
              >
                <span className="nav-icon">🚨</span>
                Alerts
              </NavLink>
            </li>

            {/* Link 3: The page with all the raw sensor data */}
            <li>
              <NavLink 
                to="/raw-data" 
                className={function(navData) {
                  if (navData.isActive) {
                    return 'nav-link active';
                  } else {
                    return 'nav-link';
                  }
                }}
              >
                <span className="nav-icon">📊</span>
                Raw Data
              </NavLink>
            </li>
          </ul>
          
          <div className="sidebar-footer">
            <p>IoT Monitor v1.0</p>
          </div>
        </nav>
        
        {/* --- THE MAIN WINDOW FOR CONTENT --- */}
        <main className="main-content">
          <Routes>
            {/* If the URL is just / show the Dashboard */}
            <Route path="/" element={<Dashboard />} />
            
            {/* If the URL has /alerts show the AlertsPage */}
            <Route path="/alerts" element={<AlertsPage />} />
            
            {/* If the URL has /raw-data show the RawDataPage */}
            <Route path="/raw-data" element={<RawDataPage />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;