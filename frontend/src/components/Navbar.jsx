import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!token) return null;

  // Pretty print roles
  const formatRole = (roleStr) => {
    if (!roleStr) return '';
    return roleStr.replace('ROLE_', '');
  };

  return (
    <nav className="bg-gradient-to-r from-hospital-700 to-hospital-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <span className="font-bold text-xl tracking-tight">CareFlow HMS</span>
            </Link>
            
            <div className="hidden md:block ml-10 flex items-baseline space-x-4">
              {role === 'ROLE_ADMIN' && (
                <span className="text-hospital-100 px-3 py-2 rounded-md text-sm font-medium bg-hospital-800">
                  Control Center
                </span>
              )}
              {role === 'ROLE_DOCTOR' && (
                <span className="text-hospital-100 px-3 py-2 rounded-md text-sm font-medium bg-hospital-800">
                  Medical Portal
                </span>
              )}
              {role === 'ROLE_PATIENT' && (
                <span className="text-hospital-100 px-3 py-2 rounded-md text-sm font-medium bg-hospital-800">
                  Patient Services
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold">{username}</span>
              <span className="text-xs text-sky-200 uppercase tracking-widest">{formatRole(role)}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-sky-600 hover:bg-sky-500 hover:scale-105 transition-all text-white font-medium py-1.5 px-4 rounded-lg text-sm shadow-md"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
