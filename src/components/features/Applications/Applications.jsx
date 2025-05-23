import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Input } from '../../ui/input';
import { 
  FileText, Clock, CheckCircle, X, AlertCircle, Search, 
  Filter, Plus, Download, Upload, Calendar, ChevronDown, 
  Eye, Edit, Trash2, Info, Bell, RefreshCw, MoreVertical, Paperclip,
  DollarSign, Award, XCircle, AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../ui/alert-dialog';
import toast from 'react-hot-toast';
import { Skeleton } from '../../ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '@/config/firebase';
import { ref, onValue, query, orderByChild, equalTo, update, remove, get, push } from 'firebase/database';
import { useAuthContext } from '@/providers/AuthProvider';
import ApplicationForm from './ApplicationForm';

const applicationTypes = [
  {
    id: 'leave',
    name: 'Leave Application',
    description: 'Apply for medical, personal, or academic leave',
    icon: Calendar,
    fields: ['Start Date', 'End Date', 'Reason', 'Supporting Documents'],
    color: 'bg-blue-50'
  },
  {
    id: 'course',
    name: 'Course Change',
    description: 'Request to change courses or sections',
    icon: Edit,
    fields: ['Current Course', 'Requested Course', 'Reason', 'Academic Advisor'],
    color: 'bg-purple-50'
  },
  {
    id: 'scholarship',
    name: 'Scholarship',
    description: 'Apply for various scholarship programs',
    icon: FileText,
    fields: ['Scholarship Type', 'Academic Records', 'Financial Information'],
    color: 'bg-amber-50'
  },
  {
    id: 'event',
    name: 'Event Permission',
    description: 'Request permission for organizing events',
    icon: Calendar,
    fields: ['Event Type', 'Date', 'Venue', 'Expected Participants'],
    color: 'bg-green-50'
  }
];

// Status Badge Component
const StatusBadge = ({ status }) => {
  let colorClass = '';
  let Icon = Info;

  switch (status.toLowerCase()) {
    case 'pending':
      colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      Icon = Clock;
      break;
    case 'under review':
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
      Icon = Eye;
      break;
    case 'approved':
      colorClass = 'bg-green-100 text-green-800 border-green-200';
      Icon = CheckCircle;
      break;
    case 'rejected':
      colorClass = 'bg-red-100 text-red-800 border-red-200';
      Icon = X;
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  }

  return (
    <Badge className={`${colorClass} flex items-center gap-1 py-1 px-2 border`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{status}</span>
    </Badge>
  );
};

// Urgency Badge Component
const UrgencyBadge = ({ level }) => {
  let colorClass = '';
  const displayLevel = level || 'normal';
  
  switch (displayLevel.toLowerCase()) {
    case 'urgent':
      colorClass = 'text-red-600 border-red-200 bg-red-50';
      break;
    case 'high':
      colorClass = 'text-orange-600 border-orange-200 bg-orange-50';
      break;
    case 'medium':
      colorClass = 'text-amber-600 border-amber-200 bg-amber-50';
      break;
    case 'low':
      colorClass = 'text-green-600 border-green-200 bg-green-50';
      break;
    default:
      colorClass = 'text-gray-600 border-gray-200 bg-gray-50';
  }

  return (
    <Badge variant="outline" className={`${colorClass} py-1`}>
      {displayLevel.charAt(0).toUpperCase() + displayLevel.slice(1)} Priority
    </Badge>
  );
};

// Document Preview Component
const DocumentPreview = ({ document }) => {
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return "bg-red-100 text-red-700";
    if (['doc', 'docx'].includes(ext)) return "bg-blue-100 text-blue-700";
    if (['xls', 'xlsx', 'csv'].includes(ext)) return "bg-green-100 text-green-700";
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  const iconClass = getFileIcon(document);

  return (
    <div className="flex items-center space-x-2 py-1 px-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors group">
      <div className={`p-1.5 rounded ${iconClass}`}>
        <FileText className="h-4 w-4" />
      </div>
      <span className="text-sm truncate">{document}</span>
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Application Detail Dialog
const ApplicationDetail = ({ application, isOpen, onClose }) => {
  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{application.subject}</DialogTitle>
            <StatusBadge status={application.status} />
          </div>
          <DialogDescription>{application.type}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
            <p className="text-gray-800">{application.description}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Submitted Date</h4>
              <p className="text-gray-800 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                {application.submittedDate}
              </p>
            </div>
            
            {application.approvedDate && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Approved Date</h4>
                <p className="text-gray-800 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {application.approvedDate}
                </p>
              </div>
            )}
            
            {application.rejectedDate && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Rejected Date</h4>
                <p className="text-gray-800 flex items-center gap-1">
                  <X className="h-4 w-4 text-red-500" />
                  {application.rejectedDate}
                </p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Priority</h4>
              <UrgencyBadge level={application.urgency} />
            </div>
          </div>
          
          {application.reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Rejection Reason
              </h4>
              <p className="text-red-700 text-sm">{application.reason}</p>
            </div>
          )}
          
          {application.documents && application.documents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Documents</h4>
              <div className="space-y-2">
                {application.documents.map((doc, index) => (
                  <DocumentPreview key={index} document={doc} />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Download All Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Application Card Component with animations
const ApplicationCard = ({ application, onViewDetail }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format the admin response time
  const formatResponseTime = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get priority level with fallback
  const getPriorityLevel = () => {
    if (!application) return 'normal';
    return application.priority || application.urgency || 'normal';
  };
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 ${
        isHovered ? 'shadow-lg transform translate-y-[-4px]' : 'shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold group cursor-pointer" onClick={() => onViewDetail(application)}>
              <span className="text-gray-900 group-hover:text-blue-600 transition-colors">
                {application.subject}
              </span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">{application.type}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <p className="mt-4 text-gray-700 line-clamp-2">{application.description}</p>

        {/* Admin Response Section */}
        {application.adminResponse && (
          <div className={`mt-4 p-3 rounded-lg ${
            application.status === 'approved' ? 'bg-green-50 border border-green-100' :
            application.status === 'rejected' ? 'bg-red-50 border border-red-100' :
            'bg-gray-50 border border-gray-100'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                application.status === 'approved' ? 'bg-green-100' :
                application.status === 'rejected' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                {application.status === 'approved' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : application.status === 'rejected' ? (
                  <XCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {application.status === 'approved' ? 'Application Approved' :
                   application.status === 'rejected' ? 'Application Rejected' :
                   'Under Review'}
                </p>
                {application.adminResponse.comment && (
                  <p className="text-sm text-gray-600 mt-1">
                    {application.adminResponse.comment}
                  </p>
                )}
                {application.adminResponse.reviewedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Reviewed on {formatResponseTime(application.adminResponse.reviewedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Submitted: {application.submittedDate}</span>
          </div>
          {application.documents?.length > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{application.documents.length} document(s)</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <UrgencyBadge level={getPriorityLevel()} />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => onViewDetail(application)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {application.status === 'pending' && (
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-amber-50 hover:text-amber-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem 
                  className="flex items-center cursor-pointer"
                  onClick={() => onViewDetail(application)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {application.status === 'pending' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex items-center cursor-pointer"
                      onClick={() => setShowApplicationForm(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Application
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center text-red-600 cursor-pointer"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this application?')) {
                          handleDeleteApplication(application);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Application
                    </DropdownMenuItem>
                  </>
                )}
                {application.status === 'rejected' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex items-center text-red-600 cursor-pointer"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this rejected application? This action cannot be undone.')) {
                          handleDeleteApplication(application);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Rejected Application
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Application Type Selector Component
const ApplicationTypeSelector = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {applicationTypes.map((type) => (
        <div
          key={type.id}
          onClick={() => onSelect(type)}
          className={`${type.color} p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow transition-all cursor-pointer flex flex-col items-center text-center`}
        >
          <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
            <type.icon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium mb-1">{type.name}</h3>
          <p className="text-sm text-gray-600">{type.description}</p>
        </div>
      ))}
    </div>
  );
};

// Loading Skeleton Component
const ApplicationSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </Card>
  );
};

// Add this constant outside the component
const CATEGORIES = ['academic', 'administrative', 'financial'];

// Update the StatsCard component to make it interactive
const StatsCard = ({ icon: Icon, label, value, bgColor, iconColor, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`${bgColor} p-6 rounded-lg shadow-sm border border-gray-200 
        transition-all duration-200 cursor-pointer
        hover:shadow-md hover:scale-[1.02] hover:border-blue-300
        active:scale-[0.98]`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`${iconColor} p-3 rounded-full transition-colors duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Add this function to calculate stats
const calculateStats = (applications) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    highPriority: applications.filter(app => app.priority === 'urgent' || app.priority === 'high').length,
    today: applications.filter(app => {
      const appDate = new Date(app.createdAt);
      appDate.setHours(0, 0, 0, 0);
      return appDate.getTime() === today.getTime();
    }).length
  };
};

// Main Applications Component
const Applications = () => {
  const { user } = useAuthContext();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortCriteria, setSortCriteria] = useState('date');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    highPriority: 0,
    today: 0
  });
  const applicationsMapRef = useRef(new Map());

  // Function to update application statistics
  const updateStats = useCallback((apps) => {
    if (!apps) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newStats = apps.reduce((acc, app) => {
      // Increment total count
      acc.total++;

      // Count by status
      if (app.status === 'pending') acc.pending++;
      else if (app.status === 'approved') acc.approved++;
      else if (app.status === 'rejected') acc.rejected++;

      // Count urgent applications
      if (app.priority === 'urgent') acc.urgent++;

      // Count applications submitted today
      const appDate = new Date(app.createdAt);
      appDate.setHours(0, 0, 0, 0);
      if (appDate.getTime() === today.getTime()) {
        acc.today++;
      }

      return acc;
    }, {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      urgent: 0,
      today: 0
    });

    setStats(newStats);
  }, []);

  // Modify the useEffect hook that handles real-time updates
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
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribes = [];

    try {
      // Use the ref instead of a local variable
      applicationsMapRef.current.clear();

      // Subscribe to each category
      CATEGORIES.forEach(category => {
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

            // Update the map using the ref
            applicationsMapRef.current.set(category, categoryApplications);

            // Combine all applications from the map
            const allApplications = Array.from(applicationsMapRef.current.values())
              .flat()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setApplications(allApplications);
            // Update stats whenever applications change
            setStats(calculateStats(allApplications));
          } else {
            // If no applications exist for this category, remove them from the map
            applicationsMapRef.current.delete(category);
            
            // Update applications list with remaining applications
            const remainingApplications = Array.from(applicationsMapRef.current.values())
              .flat()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setApplications(remainingApplications);
            // Update stats whenever applications change
            setStats(calculateStats(remainingApplications));
          }
          setLoading(false);
        }, (error) => {
          console.error(`Error fetching ${category} applications:`, error);
          if (error.message.includes('PERMISSION_DENIED')) {
            toast.error(`Permission denied for ${category} applications`);
          }
          setLoading(false);
        });

        unsubscribes.push(unsubscribe);
      });

      // Subscribe to user notifications
      const userNotificationsRef = ref(database, `notifications/users/${user.uid}`);
      const notificationsUnsubscribe = onValue(userNotificationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const notificationsData = Object.entries(snapshot.val())
            .map(([id, notification]) => ({
              id,
              ...notification,
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setNotifications(notificationsData);
          setUnreadCount(notificationsData.filter(n => n.status === 'unread').length);

          // Show toast for new notifications
          const lastChecked = localStorage.getItem('lastNotificationCheck');
          const newNotifications = notificationsData.filter(
            n => !lastChecked || new Date(n.createdAt) > new Date(lastChecked)
          );

          newNotifications.forEach(notification => {
            if (notification.type.startsWith('application_')) {
              const icon = notification.type.includes('approved') ? '✅' : 
                          notification.type.includes('rejected') ? '❌' : 
                          notification.type.includes('deleted') ? '🗑️' : 'ℹ️';
              
              toast(notification.message, { icon });
            }
          });

          localStorage.setItem('lastNotificationCheck', new Date().toISOString());
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      }, (error) => {
        console.error('Error fetching notifications:', error);
        if (error.message.includes('PERMISSION_DENIED')) {
          toast.error('Permission denied for notifications');
        }
      });

      unsubscribes.push(notificationsUnsubscribe);

    } catch (error) {
      console.error('Error setting up Firebase listeners:', error);
      setError('Failed to connect to the database');
      toast.error('Failed to connect to the database');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
      applicationsMapRef.current.clear(); // Clear the map using the ref
    };
  }, [user]);

  // Function to mark notification as read
  const markAsRead = async (notificationId) => {
    if (!user) return;
    
    try {
      const notificationRef = ref(database, `notifications/users/${user.uid}/${notificationId}`);
      await update(notificationRef, {
        status: 'read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const updates = {};
      notifications.forEach(notification => {
        if (notification.status === 'unread') {
          updates[`notifications/users/${user.uid}/${notification.id}/status`] = 'read';
        }
      });
      
      await update(ref(database), updates);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Notification Bell Component
  const NotificationBell = () => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowNotifications(!showNotifications);
        }}
        className="relative p-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    notification.status === 'unread' ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      notification.type.includes('approved') ? 'bg-green-100' :
                      notification.type.includes('rejected') ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      {notification.type.includes('approved') ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : notification.type.includes('rejected') ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Bell className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {notification.status === 'unread' && (
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Add click handler to close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  // Filtering logic
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' ||
      app.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      app.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Sorting logic
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortCriteria === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortCriteria === 'priority') {
      const urgencyOrder = { 'urgent': 5, 'high': 4, 'medium': 3, 'low': 2, 'normal': 1 };
      const getPriority = (app) => app.priority || app.urgency || 'normal';
      return (urgencyOrder[getPriority(b).toLowerCase()] || 0) - (urgencyOrder[getPriority(a).toLowerCase()] || 0);
    }
    return 0;
  });

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedApplication(null);
  };

  // Add function to handle application deletion
  const handleDeleteApplication = async (application) => {
    if (!user || !application) return;
    
    // Only allow deletion of pending or rejected applications
    if (application.status !== 'pending' && application.status !== 'rejected') {
      toast.error('You can only delete pending or rejected applications');
      return;
    }

    try {
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
        const userNotificationsRef = ref(database, `notifications/users/${user.uid}`);
        const userNotificationsSnapshot = await get(userNotificationsRef);
        
        if (userNotificationsSnapshot.exists()) {
          const notifications = userNotificationsSnapshot.val();
          const deletePromises = Object.entries(notifications)
            .filter(([_, notification]) => notification.applicationId === application.id)
            .map(([key, _]) => 
              remove(ref(database, `notifications/users/${user.uid}/${key}`))
            );
          
          await Promise.all(deletePromises);
        }
      } catch (error) {
        console.error('Error deleting user notifications:', error);
        // Continue with the process even if notification deletion fails
      }

      // Create deletion notification
      try {
        const timestamp = new Date().toISOString();
        const notificationData = {
          type: 'application_deleted',
          applicationId: application.id,
          title: 'Application Deleted',
          message: `Your ${application.status} ${application.type} application has been deleted.`,
          status: 'unread',
          createdAt: timestamp,
          actionBy: {
            uid: user.uid,
            name: user.displayName || user.email,
            role: 'user'
          }
        };

        await push(ref(database, `notifications/users/${user.uid}`), notificationData);
      } catch (error) {
        console.error('Error creating deletion notification:', error);
        // Continue with the process even if notification creation fails
      }

      toast.success('Application deleted successfully');
      
      // Update local state
      setApplications(prevApplications => 
        prevApplications.filter(app => app.id !== application.id)
      );

      // Close any open modals
      setSelectedApplication(null);
      setIsDetailModalOpen(false);

    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <ApplicationSkeleton key={n} />
          ))}
        </div>
      ) : (
        <>
          {/* Search, Filter, Sort, Export */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search applications by subject, type, or content..."
                className="pl-9 pr-3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-4 h-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>

              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Sort by {sortCriteria === 'date' ? 'Date' : 'Priority'}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortCriteria('date')}>Date</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortCriteria('priority')}>Priority</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {sortedApplications.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No applications found matching your criteria.
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {sortedApplications.map(application => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ApplicationCard application={application} onViewDetail={handleViewApplication} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Application Detail Modal */}
          <ApplicationDetail
            application={selectedApplication}
            isOpen={isDetailModalOpen}
            onClose={handleCloseDetailModal}
          />

          {/* New Application Form Modal */}
          {showApplicationForm && (
            <ApplicationForm onClose={() => setShowApplicationForm(false)} />
          )}
        </>
      )}
    </div>
  );
};

export default Applications;