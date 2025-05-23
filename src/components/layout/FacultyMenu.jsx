import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Bell,
  User,
  ClipboardList,
  MessageSquare,
  Vote,
  DollarSign,
  Speaker,
  Megaphone
} from 'lucide-react';

const FacultyMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const mainNavItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Dashboard', link: '/faculty' },
    { id: 'election', icon: <Vote size={20} />, label: 'Election Administration', link: '/faculty/election-administration' },
    { id: 'fund', icon: <DollarSign size={20} />, label: 'Fund Management', link: '/faculty/fund-management' },
    { id: 'facilities', icon: <Calendar size={20} />, label: 'Facilities Management', link: '/faculty/facilities-management' },
    { id: 'applications', icon: <ClipboardList size={20} />, label: 'Application Management', link: '/faculty/ApplicationManagement' },
    { id: 'complaints', icon: <MessageSquare size={20} />, label: 'Complaint Review', link: '/faculty/complaints/review' },
    { id: 'announcements', icon: <Megaphone size={20} />, label: 'Announcements', link: '/faculty/announcements' }
  ];
  const utilityNavItems = [
    { id: 'logout', icon: <LogOut size={20} />, label: 'Log Out', onClick: handleLogout }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 fixed h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-semibold text-blue-600">Campus Nexus</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="py-4">
        <p className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">FACULTY PORTAL</p>
        <nav className="mt-2">
          {mainNavItems.map((item) => (
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

      {/* Utility Navigation */}
      <div className="absolute bottom-0 w-64 border-t border-gray-200">
        <nav>
          {utilityNavItems.map((item) => (
            item.onClick ? (
              <button
                key={item.id}
                onClick={item.onClick}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <span className="mr-3 text-gray-500">{item.icon}</span>
                {item.label}
              </button>
            ) : (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <span className="mr-3 text-gray-500">{item.icon}</span>
                {item.label}
              </Link>
            )
          ))}
        </nav>
      </div>
    </div>
  );
};

export default FacultyMenu; 