import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
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
  Megaphone,
  Shield,
  Building,
  BarChart3,
  AlertCircle,
  Gavel
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const mainNavItems = [
    // Admin Dashboard
    { id: 'dashboard', icon: <Home size={20} />, label: 'Admin Dashboard', link: '/admin' },
    
    // Faculty features (accessible to admin)
    { 
      id: 'election', 
      icon: <Gavel size={20} />, 
      label: 'Election Administration', 
      link: '/admin/election-administration'  // Updated to match App.jsx route
    },
    { id: 'fund', icon: <DollarSign size={20} />, label: 'Fund Management', link: '/admin/fund-management' },
    { id: 'facilities', icon: <Building size={20} />, label: 'Facilities Management', link: '/admin/facilities-management' },
    { id: 'applications', icon: <ClipboardList size={20} />, label: 'Application Management', link: '/admin/ApplicationManagement' },
    { id: 'complaintReview', icon: <MessageSquare size={20} />, label: 'Complaint Review', link: '/admin/complaintReview' },
    { id: 'announcements', icon: <Megaphone size={20} />, label: 'Announcements', link: '/admin/announcements' }
  ];

  const utilityNavItems = [
      { id: 'logout', icon: <LogOut size={20} />, label: 'Log Out', onClick: handleLogout }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/admin" className="flex items-center">
          <Shield className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-xl font-semibold text-blue-600">Admin Portal</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="py-4">
        <p className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ADMIN CONTROLS</p>
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
      <div className="absolute bottom-0 w-64 border-t border-gray-200 bg-white">
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

export default AdminLayout; 