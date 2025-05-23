import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  BarChart2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users,
  TrendingUp,
  Plus
} from 'lucide-react';
import Applications from './Applications';
import ApplicationNotifications from './ApplicationNotifications';
import { calculatePriority, sortByPriority } from './ApplicationPriority';
import ApplicationForm from './ApplicationForm';
import { database } from '@/config/firebase';
import { ref, onValue } from 'firebase/database';
import { useAuthContext } from '@/providers/AuthProvider';

const ApplicationDashboard = () => {
  const { user } = useAuthContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    highPriority: 0,
    today: 0
  });

  // Real-time data fetch from Firebase
  useEffect(() => {
    if (!user) {
      setApplications([]);
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        highPriority: 0,
        today: 0
      });
      return;
    }

    const categories = ['academic', 'administrative', 'financial'];
    const applicationsMap = new Map();
    const unsubscribes = [];

    categories.forEach(category => {
      const applicationsRef = ref(database, `applications/${category}`);
      
      const unsubscribe = onValue(applicationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const categoryApplications = Object.entries(snapshot.val())
            .filter(([_, app]) => app.userId === user.uid)
            .map(([id, app]) => ({
              id,
              ...app,
              category,
              lastChecked: new Date().toISOString()
            }));

          applicationsMap.set(category, categoryApplications);

          // Combine all applications
          const allApplications = Array.from(applicationsMap.values())
            .flat()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setApplications(allApplications);
          
          // Calculate stats
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const newStats = {
            total: allApplications.length,
            pending: allApplications.filter(app => app.status === 'pending').length,
            approved: allApplications.filter(app => app.status === 'approved').length,
            rejected: allApplications.filter(app => app.status === 'rejected').length,
            highPriority: allApplications.filter(app => 
              app.priority === 'urgent' || app.priority === 'high' ||
              calculatePriority(app) === 'high' || calculatePriority(app) === 'urgent'
            ).length,
            today: allApplications.filter(app => {
              const appDate = new Date(app.createdAt);
              appDate.setHours(0, 0, 0, 0);
              return appDate.getTime() === today.getTime();
            }).length
          };
          
          setStats(newStats);
        }
      }, (error) => {
        console.error(`Error fetching ${category} applications:`, error);
      });

      unsubscribes.push(unsubscribe);
    });

    // Cleanup function
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200`}
    >
      <div className="flex items-center">
        <div className={`p-3 ${color} rounded-lg`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-').replace('100', '600')}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </motion.div>
  );

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Application Dashboard</h1>
              <p className="mt-1 text-gray-600">Monitor and manage all applications</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Application
              </button>
              <ApplicationNotifications applications={applications} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Applications"
            value={stats.total}
            icon={FileText}
            color="bg-blue-100"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={Clock}
            color="bg-yellow-100"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
            color="bg-green-100"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={AlertTriangle}
            color="bg-red-100"
          />
          <StatCard
            title="High Priority"
            value={stats.highPriority}
            icon={TrendingUp}
            color="bg-purple-100"
          />
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl shadow-sm">
          <Applications />
        </div>
      </div>

      {/* Application Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <ApplicationForm onClose={handleFormClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDashboard; 