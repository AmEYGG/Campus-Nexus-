import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StudentMenu from './StudentMenu';
import FacultyMenu from './FacultyMenu';
import AdminLayout from './AdminLayout';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const defaultRole = path.startsWith('/student') ? 'student' : 
                     path.startsWith('/faculty') ? 'faculty' : 
                     path.startsWith('/admin') ? 'admin' : null;
  const userRole = localStorage.getItem('userRole') || defaultRole;

  const renderMenu = () => {
    switch (userRole) {
      case 'student':
        return <StudentMenu />;
      case 'faculty':
        return <FacultyMenu />;
      case 'admin':
        return <AdminLayout />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {renderMenu()}
      <div className="flex-1 ml-64">
        <main className="p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;