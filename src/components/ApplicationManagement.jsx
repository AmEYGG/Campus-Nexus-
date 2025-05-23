import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, CheckCircle2, XCircle, Clock, 
  AlertCircle, Calendar, DollarSign, Stethoscope,
  Building, MessageSquare, Eye, Filter, Search,
  Download, Paperclip, ArrowRight, TrendingUp,
  Users, BarChart2, PieChart, Activity,
  Check, X, Bell, UserCircle, ChevronRight,
  CheckCircle, Star, Sparkles, Shield, Trash2
} from 'lucide-react';
import { database } from '@/config/firebase';
import { ref, onValue, update, push, set, get, remove, query, orderByChild, equalTo } from 'firebase/database';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'react-hot-toast';
import { DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const ApplicationManagement = () => {
  const { user } = useAuthContext();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [comment, setComment] = useState('');
  const [viewDetails, setViewDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    urgent: 0,
    today: 0
  });
  const [userRole, setUserRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Define updateStats with useCallback before using it in useEffect
  const updateStats = useCallback((apps) => {
    if (!apps) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newStats = {
      total: apps.length,
      pending: apps.filter(app => app.status === 'pending').length,
      approved: apps.filter(app => app.status === 'approved').length,
      rejected: apps.filter(app => app.status === 'rejected').length,
      urgent: apps.filter(app => app.priority === 'urgent').length,
      today: apps.filter(app => {
        const appDate = new Date(app.createdAt);
        appDate.setHours(0, 0, 0, 0);
        return appDate.getTime() === today.getTime();
      }).length
    };

    setStats(newStats);
  }, []);

  // Check if user is admin/faculty
  useEffect(() => {
    const checkAuthorizationStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsAuthorized(false);
        setUserRole(null);
        localStorage.removeItem('authToken');
        return;
      }

      try {
        // Check both admin and faculty roles
        const adminRef = ref(database, `admins/${user.uid}`);
        const facultyRef = ref(database, `faculty/${user.uid}`);
        
        const [adminSnapshot, facultySnapshot] = await Promise.all([
          get(adminRef),
          get(facultyRef)
        ]);

        let role = null;
        let authorized = false;
        let isAdminUser = false;
        let permissions = {};

        if (adminSnapshot.exists()) {
          role = 'admin';
          authorized = true;
          isAdminUser = true;
          permissions = {
            canApprove: true,
            canReject: true,
            isAdmin: true,
            canManageApplications: true
          };
        } else if (facultySnapshot.exists()) {
          role = 'faculty';
          authorized = true;
          isAdminUser = false;
          permissions = {
            canApprove: true,
            canReject: true,
            isFaculty: true,
            canManageApplications: true,
            canUpdateApplications: true
          };
        }

        setUserRole(role);
        setIsAuthorized(authorized);
        setIsAdmin(isAdminUser);

        if (authorized) {
          // Store authorization token in localStorage with permissions
          const authToken = {
            uid: user.uid,
            role: role,
            permissions: permissions,
            timestamp: Date.now(),
            email: user.email,
            displayName: user.displayName
          };
          localStorage.setItem('authToken', JSON.stringify(authToken));
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Error checking authorization status:', error);
        setIsAdmin(false);
        setIsAuthorized(false);
        setUserRole(null);
        localStorage.removeItem('authToken');
      }
    };

    checkAuthorizationStatus();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribes = [];

    try {
      // Define categories to fetch
      const categories = ['academic', 'administrative', 'financial'];
      let allApplications = [];

      // Subscribe to each category
      categories.forEach(category => {
        const applicationsRef = ref(database, `applications/${category}`);
        const unsubscribe = onValue(applicationsRef, (snapshot) => {
          if (snapshot.exists()) {
            const applications = Object.entries(snapshot.val()).map(([id, app]) => ({
              id,
              ...app,
              category // Add category to each application
            }));
            
            // Update the allApplications array
            allApplications = allApplications.filter(app => app.category !== category);
            allApplications = [...allApplications, ...applications];
            
            // Sort applications by date
            allApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            // Update state and stats
            setApplications(allApplications);
            updateStats(allApplications);
          } else {
            // If no applications exist for this category, remove them from the list
            allApplications = allApplications.filter(app => app.category !== category);
            setApplications(allApplications);
            updateStats(allApplications);
          }
        }, (error) => {
          console.error(`Error fetching ${category} applications:`, error);
          if (error.message.includes('PERMISSION_DENIED')) {
            toast.error(`Permission denied for ${category} applications`);
          }
        });
        
        unsubscribes.push(unsubscribe);
      });

      // Subscribe to admin notifications
      const adminNotificationsRef = ref(database, 'notifications/admin');
      const notificationsUnsubscribe = onValue(adminNotificationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const notifications = Object.entries(snapshot.val())
            .map(([id, notification]) => ({
              id,
              ...notification
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          // Show toast for new notifications
          const lastChecked = localStorage.getItem('lastNotificationCheck');
          const newNotifications = notifications.filter(
            n => !lastChecked || new Date(n.createdAt) > new Date(lastChecked)
          );
          
          newNotifications.forEach(notification => {
            if (notification.type.startsWith('application_')) {
              toast(notification.message, {
                icon: notification.type.includes('approved') ? '✅' : 
                      notification.type.includes('rejected') ? '❌' : 'ℹ️'
              });
            }
          });

          localStorage.setItem('lastNotificationCheck', new Date().toISOString());
        }
      });
      unsubscribes.push(notificationsUnsubscribe);

    } catch (error) {
      console.error('Error setting up Firebase listeners:', error);
      setError('Failed to connect to the database');
      toast.error('Failed to connect to the database');
    } finally {
      setLoading(false);
    }

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [user, updateStats]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: CheckCircle,
        label: 'Approved'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: XCircle,
        label: 'Rejected'
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        icon: Clock,
        label: 'Pending Review'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      urgent: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: AlertCircle,
        label: 'Urgent'
      },
      high: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-200',
        icon: AlertCircle,
        label: 'High'
      },
      medium: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        icon: Star,
        label: 'Medium'
      },
      low: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: Clock,
        label: 'Low'
      }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className="w-3.5 h-3.5" />
        {config.label} Priority
      </span>
    );
  };

  const handleAction = async (application, action) => {
    if (!user) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    setProcessing(true);

    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      const timestamp = new Date().toISOString();
      
      // Create the reviewer info object
      const reviewerInfo = {
        name: user.displayName || user.email,
        email: user.email,
        uid: user.uid,
        role: userRole
      };
      
      // Create the response object
      const responseData = {
        status,
        reviewedAt: timestamp,
        reviewedBy: reviewerInfo,
        comment: comment.trim() || null
      };

      // Create base application update
      const baseUpdate = {
        status,
        updatedAt: timestamp,
        adminResponse: responseData
      };

      try {
        // 1. Update application status
        const applicationRef = ref(database, `applications/${application.category}/${application.id}`);
        await set(applicationRef, {
          ...application,
          ...baseUpdate
        });

        // 2. Create notification for user
        try {
          const notificationData = {
            type: `application_${status}`,
            applicationId: application.id,
            title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your ${application.type} application has been ${status}${comment ? ': ' + comment : '.'}`,
            status: 'unread',
            createdAt: timestamp,
            actionBy: reviewerInfo
          };

          // Create notification under the user's notifications
          const userNotificationRef = ref(database, `notifications/users/${application.userId}`);
          const newNotificationRef = push(userNotificationRef);
          await set(newNotificationRef, notificationData);

          // Also create a copy in admin notifications for tracking
          const adminNotificationRef = ref(database, 'notifications/admin');
          const newAdminNotificationRef = push(adminNotificationRef);
          await set(newAdminNotificationRef, {
            ...notificationData,
            userId: application.userId,
            userEmail: application.userEmail,
            applicationCategory: application.category
          });

        } catch (notificationError) {
          console.warn('Failed to create notification:', notificationError);
          // Continue with the process even if notification fails
        }

        // 3. Log the action
        const logPath = isAdmin ? 'adminActionLogs' : 'facultyActionLogs';
        const actionLogRef = ref(database, `${logPath}/${user.uid}`);
        await push(actionLogRef, {
          actionType: `application_${status}`,
          applicationId: application.id,
          userId: application.userId,
          timestamp,
          actionBy: reviewerInfo,
          applicationDetails: {
            id: application.id,
            type: application.type,
            category: application.category,
            status: status
          }
        });

        // Update local state
        setApplications(prevApps =>
          prevApps.map(app =>
            app.id === application.id
              ? {
                  ...app,
                  ...baseUpdate
                }
              : app
          )
        );

        // Update stats
        setStats(prev => ({
          ...prev,
          [status]: prev[status] + 1,
          pending: prev.pending - 1
        }));

        setViewDetails(null);
        setSelectedApp(null);
        setComment('');
        
        toast.success(`Application ${status} successfully!`);
      } catch (error) {
        console.error('Operation error:', error);
        if (error.message.includes('PERMISSION_DENIED')) {
          toast.error('Permission denied. Please check your access rights.');
        } else {
          toast.error('Failed to update application. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error in action handling:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickAction = async (application, action, event) => {
    event?.stopPropagation();
    setComment('');
    await handleAction(application, action);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchQuery || 
      (app.userName && app.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.userEmail && app.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.type && app.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = activeTab === 'all' || app.status === activeTab;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      medicalLeave: Stethoscope,
      sponsorship: DollarSign,
      eventPermission: Building
    };
    
    const IconComponent = iconMap[type] || FileText;
    return <IconComponent className="w-5 h-5" />;
  };

  // Stats Card Component
  const StatsCard = ({ title, value, icon, description, color = 'blue' }) => {
    const colorConfig = {
      blue: 'border-blue-500 bg-blue-50 text-blue-500',
      yellow: 'border-yellow-500 bg-yellow-50 text-yellow-500',
      green: 'border-green-500 bg-green-50 text-green-500',
      red: 'border-red-500 bg-red-50 text-red-500',
      purple: 'border-purple-500 bg-purple-50 text-purple-500',
      indigo: 'border-indigo-500 bg-indigo-50 text-indigo-500'
    };
    
    return (
      <div className={`bg-white rounded-xl shadow-sm border-l-4 ${colorConfig[color].split(' ')[0]} p-6 hover:shadow-md transition-shadow duration-200`}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${colorConfig[color].split(' ').slice(1).join(' ')}`}>
            {React.cloneElement(icon, { className: `w-6 h-6 ${colorConfig[color].split(' ')[2]}` })}
          </div>
        </div>
      </div>
    );
  };

  // Application Card Component
  const ApplicationCard = ({ application, onViewDetail }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                {getTypeIcon(application.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{application.userName}</h3>
                <p className="text-sm text-gray-600">{application.userEmail}</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full border">
                {application.category}
              </span>
              {getStatusBadge(application.status)}
              {getPriorityBadge(application.priority)}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Submitted {formatDate(application.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>ID: {application.id}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <button
              onClick={() => onViewDetail(application)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>

            {application.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleQuickAction(application, 'approve', e)}
                  disabled={processing}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 flex-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={(e) => handleQuickAction(application, 'reject', e)}
                  disabled={processing}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex-1"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add function to handle application deletion
  const handleDeleteApplication = async (application) => {
    if (!user || !application) return;
    
    // Check if user has permission to delete
    if (!isAdmin && application.status !== 'rejected') {
      toast.error('You do not have permission to delete this application');
      return;
    }

    try {
      setProcessing(true);

      // Delete the application first
      try {
        await remove(ref(database, `applications/${application.category}/${application.id}`));
      } catch (error) {
        console.error('Error deleting application:', error);
        toast.error('Failed to delete application');
        return;
      }

      // Delete user notifications
      try {
        const userNotificationsRef = ref(database, `notifications/users/${application.userId}`);
        const userNotificationsSnapshot = await get(userNotificationsRef);
        
        if (userNotificationsSnapshot.exists()) {
          const notifications = userNotificationsSnapshot.val();
          const deletePromises = Object.entries(notifications)
            .filter(([_, notification]) => notification.applicationId === application.id)
            .map(([key, _]) => 
              remove(ref(database, `notifications/users/${application.userId}/${key}`))
            );
          
          await Promise.all(deletePromises);
        }
      } catch (error) {
        console.error('Error deleting user notifications:', error);
        // Continue with the process even if notification deletion fails
      }

      // Delete admin notifications
      if (isAdmin) {
        try {
          const adminNotificationsRef = ref(database, 'notifications/admin');
          const adminNotificationsSnapshot = await get(adminNotificationsRef);
          
          if (adminNotificationsSnapshot.exists()) {
            const notifications = adminNotificationsSnapshot.val();
            const deletePromises = Object.entries(notifications)
              .filter(([_, notification]) => notification.applicationId === application.id)
              .map(([key, _]) => 
                remove(ref(database, `notifications/admin/${key}`))
              );
            
            await Promise.all(deletePromises);
          }
        } catch (error) {
          console.error('Error deleting admin notifications:', error);
          // Continue with the process even if notification deletion fails
        }
      }

      // Create deletion notification
      try {
        const timestamp = new Date().toISOString();
        const notificationData = {
          type: 'application_deleted',
          applicationId: application.id,
          title: 'Application Deleted',
          message: isAdmin 
            ? `Your ${application.type} application has been deleted by an administrator.`
            : `Your rejected ${application.type} application has been deleted.`,
          status: 'unread',
          createdAt: timestamp,
          actionBy: {
            uid: user.uid,
            name: user.displayName || user.email,
            role: isAdmin ? 'admin' : 'user'
          }
        };

        await push(ref(database, `notifications/users/${application.userId}`), notificationData);
      } catch (error) {
        console.error('Error creating deletion notification:', error);
        // Continue with the process even if notification creation fails
      }

      toast.success('Application deleted successfully');
      setViewDetails(null);

      // Update local state
      setApplications(prevApplications => 
        prevApplications.filter(app => app.id !== application.id)
      );
      
      // Update stats
      updateStats(applications.filter(app => app.id !== application.id));

    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    } finally {
      setProcessing(false);
    }
  };

  // Main render
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-800">Loading Applications</p>
            <p className="text-gray-600">Please wait while we fetch the latest data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-800">Authentication Required</p>
            <p className="text-gray-600">Please log in to access the application management system.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto max-w-7xl p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Application Management Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Review and manage student applications with advanced tools
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span>Admin Access</span>
                </div>
              )}
              <div className="bg-indigo-50 px-4 py-2 rounded-full border border-indigo-200">
                <span className="text-indigo-700 font-medium">
                  {stats.pending} Pending Reviews
                </span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md">
                <Bell className="w-4 h-4" />
                Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatsCard
            title="Total Applications"
            value={stats.total}
            icon={<FileText />}
            description="All submissions"
            color="blue"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={<Clock />}
            description="Awaiting review"
            color="yellow"
          />
          <StatsCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle2 />}
            description="Successfully approved"
            color="green"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle />}
            description="Not approved"
            color="red"
          />
          <StatsCard
            title="Urgent"
            value={stats.urgent}
            icon={<AlertCircle />}
            description="High priority"
            color="red"
          />
          <StatsCard
            title="Today"
            value={stats.today}
            icon={<Calendar />}
            description="New submissions"
            color="indigo"
          />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Requests</h2>
              <div className="w-full lg:w-auto max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { key: 'all', label: 'All', count: applications.length },
                { key: 'pending', label: 'Pending', count: stats.pending },
                { key: 'approved', label: 'Approved', count: stats.approved },
                { key: 'rejected', label: 'Rejected', count: stats.rejected }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                  Try adjusting your search criteria or check back later for new submissions.
                    </p>
                  </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onViewDetail={(application) => {
                      setSelectedApp(application);
                      setViewDetails(application);
                    }}
                  />
                ))}
                  </div>
                )}
              </div>
        </div>

        {/* Application Details Modal */}
        {viewDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                    <p className="text-gray-600">Review application information and make your decision</p>
                </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(viewDetails.status)}
                    {getPriorityBadge(viewDetails.priority)}
                    <button
                      onClick={() => setViewDetails(null)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-6 h-6" />
                    </button>
                </div>
              </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Student Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <UserCircle className="w-5 h-5" />
                      Student Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Full Name</p>
                        <p className="text-lg font-semibold text-gray-900">{viewDetails.userName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-600">Email Address</p>
                        <p className="text-lg font-semibold text-gray-900">{viewDetails.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-600">Application ID</p>
                        <p className="text-sm font-mono bg-white px-2 py-1 rounded border">{viewDetails.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Application Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Category</p>
                        <p className="text-lg font-semibold text-gray-900">{viewDetails.category}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-600">Submission Date</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(viewDetails.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-600">Priority Level</p>
                        <div className="mt-1">{getPriorityBadge(viewDetails.priority)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Content */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Application Content
                  </h3>
                    <div className="space-y-4">
                        <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-gray-900 whitespace-pre-wrap">{viewDetails.description}</p>
                          </div>
                        </div>
                    {viewDetails.additionalInfo && (
                        <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Additional Information</p>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-gray-900 whitespace-pre-wrap">{viewDetails.additionalInfo}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Review Section */}
                {viewDetails.status === 'pending' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Review & Decision
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                          Add Comment (Optional)
                        </label>
                        <textarea
                          id="comment"
                          placeholder="Add your review comments here..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows="4"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => handleAction(viewDetails, 'approve')}
                          disabled={processing}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Approve Application
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleAction(viewDetails, 'reject')}
                          disabled={processing}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5" />
                              Reject Application
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Response Section */}
                {viewDetails.adminResponse && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Admin Response
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Reviewed By</p>
                          <p className="text-gray-900 font-semibold">
                            {viewDetails.adminResponse?.reviewedBy?.name || 'Admin'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {viewDetails.adminResponse?.reviewedBy?.email || 'No email provided'}
                            </p>
                          </div>
                        <div>
                          <p className="text-sm font-medium text-blue-600">Review Date</p>
                          <p className="text-gray-900 font-semibold">
                            {viewDetails.adminResponse?.reviewedAt ? formatDate(viewDetails.adminResponse.reviewedAt) : 'Not available'}
                          </p>
                        </div>
                      </div>
                      {viewDetails.adminResponse?.comment && (
                        <div>
                          <p className="text-sm font-medium text-blue-600 mb-2">Review Comment</p>
                          <div className="bg-white p-4 rounded-lg border">
                            <p className="text-gray-900">{viewDetails.adminResponse.comment}</p>
                    </div>
                  </div>
                )}
                    </div>
              </div>
            )}
      </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setViewDetails(null)}
                    className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Close
                  </button>
                  {(isAdmin || viewDetails.status === 'rejected') && (
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        const message = isAdmin 
                          ? 'Are you sure you want to delete this application? This action cannot be undone.'
                          : 'Are you sure you want to delete this rejected application? This action cannot be undone.';
                        if (window.confirm(message)) {
                          handleDeleteApplication(viewDetails);
                        }
                      }}
                      className="mr-2"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete {viewDetails.status === 'rejected' ? 'Rejected ' : ''}Application
                    </Button>
                  )}
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Download All Documents
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {processing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-2xl text-center space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Processing Request</h3>
                <p className="text-gray-600">Please wait while we update the application...</p>
          </div>
        </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationManagement;