import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Vote,
  Clock,
  Building,
  FileText,
  AlertCircle,
  Settings,
  LogOut,
  Calendar,
  BookOpen
} from 'lucide-react';

const StudentMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const menuItems = [
    // Main Navigation
    { id: 'dashboard', icon: <Home size={20} />, label: 'Dashboard', link: '/student' },
    { id: 'elections', icon: <Vote size={20} />, label: 'Elections', link: '/student/elections' },
    { id: 'budget', icon: <Clock size={20} />, label: 'Budget', link: '/student/budget' },
    { id: 'facilities', icon: <Building size={20} />, label: 'Facilities', link: '/student/facilities' },
    { id: 'applications', icon: <FileText size={20} />, label: 'Applications', link: '/student/applications' },
    { id: 'complaints', icon: <AlertCircle size={20} />, label: 'Complaints', link: '/student/complaints' }
  ];

  const roleSpecificItems = [
    { id: 'my-bookings', icon: <Calendar size={20} />, label: 'My Bookings', link: '/student/bookings' },
    { id: 'my-courses', icon: <BookOpen size={20} />, label: 'My Courses', link: '/student/courses' }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-semibold text-blue-600">Campus Nexus</span>
        </Link>
      </div>

      {/* Main Menu */}
      <div className="py-4">
        <p className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">STUDENT PORTAL</p>
        <nav className="mt-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="mr-3 text-gray-500">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Role Specific */}
      <div className="py-4">
        <p className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ROLE SPECIFIC</p>
        <nav className="mt-2">
          {roleSpecificItems.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-100"
            >
              <span className="mr-3 text-blue-500">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Settings at the bottom */}
      <div className="absolute bottom-0 w-full border-t border-gray-200">
        <Link
          to="/student/settings"
          className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 border-b border-gray-200"
        >
          <span className="mr-3 text-gray-500"><Settings size={20} /></span>
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <span className="mr-3 text-gray-500"><LogOut size={20} /></span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default StudentMenu;