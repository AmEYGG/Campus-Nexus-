import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  X,
  ChevronDown,
  Download,
  AlertCircle,
  MoreVertical,
  Calendar,
  Users,
  Bell,
  Trash2,
  MailCheck,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ref, onValue, query, orderByChild, equalTo, update, getDatabase } from 'firebase/database';
import { database, auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import ComplaintForm from './ComplaintForm';

const ComplaintDashboard = () => {
  const [user] = useAuthState(auth);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const database = getDatabase();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    averageResolutionTime: 'N/A',
    highPriority: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Fetch user's complaints
  useEffect(() => {
    if (!user) {
      setLoading(false); // Stop loading if no user
      return;
    }
    setLoading(true);
    const complaintsRef = ref(database, 'complaintRequests');
    const userComplaintsQuery = query(
      complaintsRef,
      orderByChild('studentId'),
      equalTo(user.uid)
    );

    const unsubscribeComplaints = onValue(userComplaintsQuery, (snapshot) => {
      const complaintsData = [];
      snapshot.forEach((childSnapshot) => {
        complaintsData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      complaintsData.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      setComplaints(complaintsData);
      setLoading(false);

      const newStats = {
        total: complaintsData.length,
        pending: complaintsData.filter(c => c.status === 'pending').length,
        inProgress: complaintsData.filter(c => c.status === 'in_progress').length,
        resolved: complaintsData.filter(c => c.status === 'resolved').length,
        rejected: complaintsData.filter(c => c.status === 'rejected').length,
        highPriority: complaintsData.filter(c => c.priority === 'high').length
      };
      setStats({
        ...newStats,
        averageResolutionTime: calculateAverageResolutionTime(complaintsData)
      });
    });
    
    // This part handles TOASTS for unread notifications and marks them as read in DB.
    // It might be better to integrate this with the main notification fetching logic
    // to avoid multiple listeners or race conditions, but following current structure for now.
    const notificationsToastRef = ref(database, `notifications/${user.uid}`);
    const unsubscribeNotificationsToast = onValue(notificationsToastRef, (snapshot) => {
      const notificationsSnapshot = snapshot.val();
      if (notificationsSnapshot) {
        Object.entries(notificationsSnapshot).forEach(([key, notification]) => {
          if (!notification.read) {
            toast(notification.message, {
              icon: notification.status === 'rejected' ? '❌' : 
                    notification.status === 'resolved' ? '✅' : 'ℹ️',
              duration: 5000,
            });
            // Mark notification as read in Firebase after toasting
            update(ref(database, `notifications/${user.uid}/${key}`), { read: true });
          }
        });
      }
    });

    return () => {
      unsubscribeComplaints();
      unsubscribeNotificationsToast();
    };
  }, [user]);

  // Update the notifications useEffect to fetch from the correct database path
  useEffect(() => {
    if (!user) return;

    const database = getDatabase();
    const notificationsRef = ref(database, `notifications/${user.uid}`);
    const unsubscribeNotificationsDisplay = onValue(notificationsRef, (snapshot) => {
      const notificationsData = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const notification = {
            id: child.key,
            ...child.val(),
            read: child.val().read || false
          };
          // Only include complaint-related notifications
          if (notification.type === 'complaint' || notification.category === 'complaint') {
            notificationsData.push(notification);
          }
        });
      }
      
      // Sort notifications by date, most recent first
      notificationsData.sort((a, b) => {
        const dateA = new Date(b.timestamp || b.createdAt || 0);
        const dateB = new Date(a.timestamp || a.createdAt || 0);
        return dateA - dateB;
      });
      
      setNotifications(notificationsData);
      setUnreadNotifications(notificationsData.filter(n => !n.read).length);
    });

    return () => unsubscribeNotificationsDisplay();
  }, [user]);


  const calculateAverageResolutionTime = (complaints) => {
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved' && c.submittedAt && c.reviewedAt);
    if (resolvedComplaints.length === 0) return 'N/A';

    const totalTime = resolvedComplaints.reduce((acc, complaint) => {
      const submitted = new Date(complaint.submittedAt);
      const resolved = new Date(complaint.reviewedAt);
      return acc + (resolved.getTime() - submitted.getTime());
    }, 0);

    const avgTimeMs = totalTime / resolvedComplaints.length;
    const avgDays = Math.round((avgTimeMs / (1000 * 60 * 60 * 24)) * 10) / 10;
    if (avgDays < 1) {
        const avgHours = Math.round((avgTimeMs / (1000 * 60 * 60)) * 10) / 10;
        return `${avgHours} hours`;
    }
    return `${avgDays} days`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'resolved': return 'bg-green-100 text-green-700 border border-green-300';
      case 'rejected': return 'bg-red-100 text-red-700 border border-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'low': return 'bg-green-100 text-green-700 border border-green-300';
      default: return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    const iconProps = { className: "h-5 w-5" };
    switch (category?.toLowerCase()) {
      case 'academic': return <FileText {...iconProps} />;
      case 'facility': return <Calendar {...iconProps} />;
      case 'staff': return <Users {...iconProps} />;
      case 'financial': return <Users {...iconProps} />; // Example, replace with appropriate icon
      case 'other': return <AlertCircle {...iconProps} />;
      default: return <FileText {...iconProps} />;
    }
  };

  const handleNewComplaint = () => {
    if (!user) {
      toast.error('You must be logged in to submit a complaint.');
      return;
    }
    setIsFormOpen(true);
    // Remove any existing dialog with the same ID
    const existingDialog = document.querySelector('[role="dialog"]');
    if (existingDialog) {
      existingDialog.remove();
    }
  };

  const handleComplaintSubmit = (formData) => {
    // The ComplaintForm itself handles submission to Firebase.
    // This callback is mainly for post-submission actions like closing form and toasting.
    toast.success('Complaint submitted successfully!');
    setIsFormOpen(false);
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = filter === 'all' || complaint.status === filter;
    const matchesSearch = searchQuery === '' || 
      complaint.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const markNotificationAsRead = async (notificationId) => {
    if (!user || !notificationId) return;
    
    try {
      const database = getDatabase();
      const notificationRef = ref(database, `notifications/${user.uid}/${notificationId}`);
      await update(notificationRef, { read: true });
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Could not update notification status');
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const database = getDatabase();
      const updates = {};
      notifications.forEach(notification => {
        if (!notification.read) {
          updates[`notifications/${user.uid}/${notification.id}/read`] = true;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Could not update notifications');
    }
  };

  const handleCancelComplaint = async (complaintId) => {
    if (!user || !complaintId) return;
    
    // Find the complaint to ensure it's cancellable (e.g., status is 'pending')
    const complaintToCancel = complaints.find(c => c.id === complaintId);
    if (!complaintToCancel || complaintToCancel.status !== 'pending') {
        toast.error("This complaint cannot be cancelled.");
        return;
    }

    if (window.confirm("Are you sure you want to cancel this complaint? This action cannot be undone.")) {
      try {
        await update(ref(database, `complaintRequests/${complaintId}`), {
          status: 'cancelled',
          // Optionally, add a cancelledAt timestamp
          // cancelledAt: new Date().toISOString(), 
        });
        toast.success('Complaint cancelled successfully.');
        // State will update via onValue listener
      } catch (error) {
        console.error('Error cancelling complaint:', error);
        toast.error('Could not cancel the complaint.');
      }
    }
  };


  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <X className="h-5 w-5 text-red-500" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-500" />; // Added for in_progress
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const UserProfileDisplay = ({ user }) => (
    <div className="flex items-center space-x-3">
      <Avatar className="h-12 w-12 border-2 border-orange-500">
        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
        <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
        <h2 className="text-xl font-semibold text-gray-800">{user?.displayName || 'Student User'}</h2>
        <p className="text-sm text-gray-500">ID: {user?.uid ? user.uid.substring(0, 10) + '...' : 'N/A'}</p>
          </div>
        </div>
  );

  if (loading && complaints.length === 0) { // Show full page loader only on initial load
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <header className="mb-6 md:mb-8 pb-4 border-b border-gray-200">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          {user ? <UserProfileDisplay user={user} /> : <div>Loading user...</div>}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-orange-500">
                  <Bell className="h-6 w-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 shadow-xl">
                <div className="p-3 font-medium text-gray-700">Notifications</div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">No notifications yet.</div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 5).map((n) => (
                      <DropdownMenuItem 
                        key={n.id} 
                        onClick={() => !n.read && markNotificationAsRead(n.id)}
                        className={`flex items-start gap-3 p-3 ${!n.read ? 'bg-orange-50' : 'opacity-75'}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(n.status)}</div>
                        <div className="flex-1">
                          <p className={`text-xs ${!n.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                 {notifications.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem 
                    onClick={() => document.getElementById('notifications-panel')?.scrollIntoView({ behavior: 'smooth' })}
                    className="justify-center p-2 text-sm text-orange-600 hover:!bg-orange-100"
                >
                  View All in Panel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

        <Button
          onClick={handleNewComplaint}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md hover:shadow-lg transition-shadow"
              disabled={!user}
        >
          <Plus className="h-5 w-5 mr-2" />
          New Complaint
        </Button>
      </div>
        </div>
      </header>
      
      {/* Main Content Grid */}
      <div className="container mx-auto">
        {/* Main Content Area (Complaints, Stats) */}
        <div className="space-y-6">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { title: 'Total Complaints', value: stats.total, icon: FileText, color: 'bg-orange-500' },
              { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-green-500' },
              { title: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
              { title: 'Avg. Resolution', value: stats.averageResolutionTime, icon: AlertCircle, color: 'bg-blue-500' }
            ].map(stat => (
              <Card key={stat.title} className="p-5 shadow-md hover:shadow-lg transition-shadow rounded-xl">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </Card>
            ))}
      </div>

          {/* Filters and Search */}
          <Card className="p-4 shadow-md rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
                  placeholder="Search by subject, description, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 w-full sm:w-[300px] lg:w-[350px] rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
          </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 capitalize rounded-md border-gray-300 hover:border-orange-500">
                      <Filter className="h-4 w-4 text-orange-500" />
                      {filter === 'all' ? 'All' : filter.replace('_', ' ')}
                      <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="shadow-xl">
                    {['all', 'pending', 'in_progress', 'resolved', 'rejected', 'cancelled'].map(f => (
                      <DropdownMenuItem key={f} onClick={() => setFilter(f)} className="capitalize hover:!bg-orange-50">
                        {f.replace('_', ' ')}
                      </DropdownMenuItem>
                    ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
            </div>
          </Card>

          {/* Complaints List */}
          {loading && complaints.length > 0 && ( // Show inline loader if updating
             <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="ml-2 text-gray-600">Updating complaints...</p>
             </div>
          )}
      <div className="space-y-4">
            {filteredComplaints.length > 0 ? filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="p-5 shadow-md hover:shadow-lg transition-shadow rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg bg-orange-100 text-orange-600 hidden sm:block`}>
                    {getCategoryIcon(complaint.category)}
                  </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-md font-semibold text-gray-800 hover:text-orange-600 cursor-pointer">
                          {complaint.subject}
                        </h3>
                        <div className="sm:hidden"> {/* Actions for mobile */}
                            <ComplaintActionsDropdown complaint={complaint} handleCancelComplaint={handleCancelComplaint} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">ID: {complaint.id}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">
                        {complaint.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge className={`text-xs px-2 py-0.5 ${getStatusBadgeClass(complaint.status)}`} variant="outline">
                          {complaint.status?.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Badge>
                        <Badge className={`text-xs px-2 py-0.5 ${getPriorityBadgeClass(complaint.priority)}`} variant="outline">
                          {complaint.priority?.charAt(0).toUpperCase() + complaint.priority?.slice(1)} Priority
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(complaint.submittedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block ml-4"> {/* Actions for desktop */}
                    <ComplaintActionsDropdown complaint={complaint} handleCancelComplaint={handleCancelComplaint} />
                  </div>
                </div>
              </Card>
            )) : (
              !loading && ( // Only show "No complaints" if not loading
                <Card className="text-center py-12 shadow-md rounded-xl">
                  <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-xl font-medium">No Complaints Found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {filter === 'all' && searchQuery === ''
                      ? 'You haven\'t submitted any complaints yet.'
                      : 'Try adjusting your search or filters.'}
                  </p>
                  {filter === 'all' && searchQuery === '' && (
                    <Button size="sm" className="mt-6 bg-orange-500 hover:bg-orange-600" onClick={handleNewComplaint}>
                      <Plus className="h-4 w-4 mr-1.5" /> Create First Complaint
                    </Button>
                  )}
            </Card>
              )
            )}
          </div>
        </div>
      </div>

      {/* Complaint Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <ComplaintForm 
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleComplaintSubmit}
          />
      </Dialog>

      <style jsx global>{`
        .nice-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .nice-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .nice-scrollbar::-webkit-scrollbar-thumb {
          background: #f97316; // orange-500
          border-radius: 10px;
        }
        .nice-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ea580c; // orange-600
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
};


const ComplaintActionsDropdown = ({ complaint, handleCancelComplaint }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-orange-500">
        <span className="sr-only">Open menu</span>
        <MoreVertical className="h-5 w-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="shadow-xl">
      <DropdownMenuItem className="hover:!bg-orange-50" onClick={() => toast.info("View Details feature coming soon!")}>
        <FileText className="mr-2 h-4 w-4" />
        View Details
      </DropdownMenuItem>
      <DropdownMenuItem className="hover:!bg-orange-50" onClick={() => toast.info("Download feature coming soon!")}>
        <Download className="mr-2 h-4 w-4" />
        Download PDF
      </DropdownMenuItem>
      {complaint.status === 'pending' && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600 hover:!bg-red-50 hover:!text-red-700 focus:!bg-red-50 focus:!text-red-700"
            onClick={() => handleCancelComplaint(complaint.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Cancel Complaint
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default ComplaintDashboard;