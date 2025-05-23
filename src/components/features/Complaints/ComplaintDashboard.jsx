import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
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
  ChevronUp, // For closing the panel
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'; // Kept for other dropdowns
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ref, onValue, query, orderByChild, equalTo, update, getDatabase } from 'firebase/database';
import { auth } from '@/config/firebase'; // Removed database import from here to use getDatabase()
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import ComplaintForm from './ComplaintForm';

const UserProfileDisplay = ({ user }) => (
  <div className="flex items-center space-x-3">
    <Avatar className="h-12 w-12 border-2 border-orange-500">
      <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
      <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
    </Avatar>
    <div>
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{user?.displayName || 'Student Dashboard'}</h1>
      <p className="text-xs sm:text-sm text-gray-500">ID: {user?.uid ? `${user.uid.substring(0, 6)}...${user.uid.substring(user.uid.length - 4)}` : 'N/A'}</p>
    </div>
  </div>
);

const ComplaintDashboard = () => {
  const [user] = useAuthState(auth);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false); // New state for panel

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setComplaints([]);
      return;
    }
    setLoading(true);
    const db = getDatabase();
    const complaintsRef = ref(db, 'complaintRequests');
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
      // Only set loading to false after initial data or if user changes
      if(loading) setLoading(false);


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
        averageResolutionTime: calculateAverageResolutionTime(complaintsData.filter(c => c.status === 'resolved'))
      });
    });
    
    const notificationsToastRef = ref(db, `notifications/${user.uid}`);
    const unsubscribeNotificationsToast = onValue(notificationsToastRef, (snapshot) => {
      const notificationsSnapshot = snapshot.val();
      if (notificationsSnapshot) {
        Object.entries(notificationsSnapshot).forEach(([key, notification]) => {
          if (notification && !notification.read) {
            toast(notification.message, {
              icon: notification.status === 'rejected' ? '❌' : 
                    notification.status === 'resolved' ? '✅' : 'ℹ️',
              duration: 5000,
            });
            update(ref(db, `notifications/${user.uid}/${key}`), { read: true });
          }
        });
      }
    });

    return () => {
      unsubscribeComplaints();
      unsubscribeNotificationsToast();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Removed 'loading' from deps as it can cause loops when set inside

  useEffect(() => {
    if (!user) {
        setNotifications([]);
        setUnreadNotifications(0);
        return;
    }

    const db = getDatabase();
    const notificationsDisplayRef = ref(db, `users/${user.uid}/notifications`);
    const unsubscribeNotificationsDisplay = onValue(notificationsDisplayRef, (snapshot) => {
      const notificationsData = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const notification = {
            id: child.key,
            ...child.val(),
            read: child.val().read || false
          };
          if (['complaint_status', 'complaint_update'].includes(notification.type) || notification.category === 'complaint') {
            notificationsData.push(notification);
          }
        });
      }
      
      notificationsData.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
      
      setNotifications(notificationsData);
      setUnreadNotifications(notificationsData.filter(n => !n.read).length);
    });

    return () => unsubscribeNotificationsDisplay();
  }, [user]);


  const calculateAverageResolutionTime = (resolvedComplaints) => {
    const validComplaints = resolvedComplaints.filter(c => c.submittedAt && c.reviewedAt);
    if (validComplaints.length === 0) return 'N/A';

    const totalTime = validComplaints.reduce((acc, complaint) => {
      const submitted = new Date(complaint.submittedAt);
      const resolved = new Date(complaint.reviewedAt);
      return acc + (resolved.getTime() - submitted.getTime());
    }, 0);
    
    try {
      const avgTimeMs = totalTime / validComplaints.length;
      const avgDays = avgTimeMs / (1000 * 60 * 60 * 24);
      
      if (avgDays < 1) {
        const avgHours = Math.round((avgTimeMs / (1000 * 60 * 60)) * 10) / 10;
        return `${avgHours} hour${avgHours !== 1 ? 's' : ''}`;
      }
      return `${Math.round(avgDays * 10) / 10} day${Math.round(avgDays * 10) / 10 !== 1 ? 's' : ''}`;
    } catch (error) {
      console.error('Error calculating average time:', error);
      return 'N/A';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    const iconProps = { className: "h-5 w-5", strokeWidth: 1.5 };
    switch (category?.toLowerCase()) {
      case 'academic': return <FileText {...iconProps} />;
      case 'facility': return <Users {...iconProps} />;
      case 'staff': return <Users {...iconProps} />;
      case 'financial': return <AlertCircle {...iconProps} />;
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
  };

  const handleComplaintSubmit = () => {
    toast.success('Complaint submitted successfully!');
    setIsFormOpen(false);
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = filter === 'all' || complaint.status === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      complaint.subject?.toLowerCase().includes(searchLower) ||
      complaint.description?.toLowerCase().includes(searchLower) ||
      complaint.id?.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const markNotificationAsRead = async (notificationId) => {
    if (!user || !notificationId) return;
    try {
      const db = getDatabase();
      await update(ref(db, `users/${user.uid}/notifications/${notificationId}`), { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Could not update notification status');
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user || notifications.length === 0 || unreadNotifications === 0) return;
    try {
      const db = getDatabase();
      const updates = {};
      notifications.forEach(notification => {
        if (!notification.read) {
          updates[`users/${user.uid}/notifications/${notification.id}/read`] = true;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
        toast.success('All unread notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Could not update notifications');
    }
  };

  const handleCancelComplaint = async (complaintId) => {
    if (!user || !complaintId) return;
    
    const complaintToCancel = complaints.find(c => c.id === complaintId);
    if (!complaintToCancel || complaintToCancel.status !== 'pending') {
        toast.error("This complaint cannot be cancelled as it's no longer pending.");
        return;
    }

    if (window.confirm("Are you sure you want to cancel this complaint? This action cannot be undone.")) {
      try {
        const db = getDatabase();
        await update(ref(db, `complaintRequests/${complaintId}`), {
          status: 'cancelled',
          lastUpdatedAt: new Date().toISOString(), 
        });
        toast.success('Complaint cancelled successfully.');
      } catch (error) {
        console.error('Error cancelling complaint:', error);
        toast.error('Could not cancel the complaint.');
      }
    }
  };

  const getNotificationIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <X className="h-5 w-5 text-red-500" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  if (loading && complaints.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        <p className="ml-4 text-lg text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      <header className="mb-6 md:mb-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Complaint Dashboard</h1>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-b border-gray-200">
            <div>
              {user ? <UserProfileDisplay user={user} /> : <div className="h-12 w-48 bg-gray-200 animate-pulse rounded-md"></div>}
            </div>
            <div className="flex items-center space-x-3">
              <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationPanelOpen(prev => !prev)} // Toggle panel
              className="relative text-gray-600 hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 rounded-full"
              aria-label="Toggle notifications panel"
            >
              <Bell className="h-6 w-6" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </Button>

            <Button
              onClick={handleNewComplaint}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-150 ease-in-out px-4 py-2 rounded-lg"
              disabled={!user}
            >
              <Plus className="h-5 w-5 mr-1.5" />
              New Complaint
            </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto">
        <div className="space-y-6">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: 'Total Complaints', value: stats.total, icon: FileText, color: 'bg-orange-500' },
              { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-green-500' },
              { title: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
              { title: 'Avg. Resolution', value: stats.averageResolutionTime, icon: AlertCircle, color: 'bg-indigo-500' }
            ].map(stat => (
              <Card key={stat.title} className="p-5 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-xl border-l-4" style={{ borderColor: stat.color }}>
                <div className="flex items-center">
                  <div className={`p-2.5 rounded-lg ${stat.color} mr-4`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Filters and Search */}
          <Card className="p-4 shadow-lg rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="relative flex-grow w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by ID, subject, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 w-full h-10 rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8 text-gray-400 hover:text-gray-600 rounded-full"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-sm text-gray-600 font-medium">Filter:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1.5 capitalize h-10 rounded-lg border-gray-300 hover:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1">
                      <Filter className="h-4 w-4 text-orange-500" />
                      {filter === 'all' ? 'All Statuses' : filter.replace('_', ' ')}
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="shadow-xl rounded-lg border-gray-200">
                    {['all', 'pending', 'in_progress', 'resolved', 'rejected', 'cancelled'].map(f => (
                      <DropdownMenuItem key={f} onClick={() => setFilter(f)} className={`capitalize cursor-pointer hover:!bg-orange-50 ${filter === f ? 'bg-orange-100 text-orange-700' : 'text-gray-700'}`}>
                        {f.replace('_', ' ')}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>

          {/* Loading indicator for updates */}
          {loading && complaints.length > 0 && (
             <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="ml-3 text-gray-600">Updating complaints list...</p>
             </div>
          )}

          {/* Complaints List */}
          <div className="space-y-4 md:space-y-5">
            {filteredComplaints.length > 0 ? filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="p-4 sm:p-5 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                    <div className={`p-2.5 rounded-lg bg-orange-100 text-orange-600 hidden sm:flex items-center justify-center flex-shrink-0 mt-1`}>
                      {getCategoryIcon(complaint.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 hover:text-orange-600 cursor-pointer line-clamp-1" title={complaint.subject}>
                          {complaint.subject}
                        </h3>
                        <div className="sm:hidden flex-shrink-0 ml-2">
                          <ComplaintActionsDropdown complaint={complaint} handleCancelComplaint={handleCancelComplaint} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-1.5 sm:mb-2">ID: <span className="font-mono">{complaint.id}</span></p>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-2.5 sm:mb-3">
                        {complaint.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge className={`px-2.5 py-0.5 ${getStatusBadgeClass(complaint.status)} font-medium`} variant="outline">
                          {complaint.status?.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Badge>
                        <Badge className={`px-2.5 py-0.5 ${getPriorityBadgeClass(complaint.priority)} font-medium`} variant="outline">
                          <AlertCircle className="h-3 w-3 mr-1 opacity-75"/> {complaint.priority?.charAt(0).toUpperCase() + complaint.priority?.slice(1)}
                        </Badge>
                        <span className="text-gray-500 flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1 opacity-70" />
                          {complaint.submittedAt ? format(new Date(complaint.submittedAt), 'MMM d, yyyy, p') : 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block flex-shrink-0">
                    <ComplaintActionsDropdown complaint={complaint} handleCancelComplaint={handleCancelComplaint} />
                  </div>
                </div>
              </Card>
            )) : (
              !loading && (
                <Card className="text-center py-12 sm:py-16 shadow-lg rounded-xl bg-white">
                  <FileText className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-700 text-xl font-semibold">No Complaints Found</p>
                  <p className="text-gray-500 text-sm mt-1.5 max-w-xs mx-auto">
                    {filter === 'all' && searchQuery === ''
                      ? 'You haven\'t submitted any complaints yet. Get started by creating one.'
                      : 'Try adjusting your search query or filter settings to find what you\'re looking for.'}
                  </p>
                  {filter === 'all' && searchQuery === '' && (
                    <Button size="md" className="mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-lg" onClick={handleNewComplaint}>
                      <Plus className="h-4.5 w-4.5 mr-1.5" /> Create First Complaint
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

      {/* Notification Panel */}
      {isNotificationPanelOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 transition-opacity duration-300 ease-in-out"
          onClick={() => setIsNotificationPanelOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-xl z-40 max-h-[75vh] md:max-h-[60vh] flex flex-col transition-transform duration-300 ease-in-out
                    ${isNotificationPanelOpen ? 'translate-y-0' : 'translate-y-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-panel-title"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 id="notification-panel-title" className="text-lg font-semibold text-gray-800">Notifications</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsNotificationPanelOpen(false)} className="rounded-full hover:bg-gray-100">
            <ChevronDown className="h-5 w-5 text-gray-600" /> {/* Changed to ChevronDown for "pull down" affordance */}
            <span className="sr-only">Close notifications</span>
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-sm text-gray-500">
            <Bell className="h-12 w-12 text-gray-300 mb-3"/>
            You have no new notifications.
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto nice-scrollbar p-1">
            {notifications.map((n) => (
              <div
                key={n.id} 
                onClick={() => markNotificationAsRead(n.id)} // Mark as read on click
                className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 last:border-b-0 cursor-pointer ${!n.read ? 'bg-orange-50/60 hover:bg-orange-100/70' : 'hover:bg-gray-50'}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && markNotificationAsRead(n.id)}
              >
                <div className={`mt-0.5 flex-shrink-0 p-1.5 rounded-full ${
                  n.status === 'rejected' ? 'bg-red-100' :
                  n.status === 'resolved' ? 'bg-green-100' :
                  n.status === 'pending' ? 'bg-yellow-100' :
                  n.status === 'in_progress' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {getNotificationIcon(n.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.read ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {n.timestamp ? formatDistanceToNow(new Date(n.timestamp), { addSuffix: true }) : 'No date'}
                  </p>
                </div>
                {!n.read && <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 flex-shrink-0 self-center" title="Unread"></div>}
              </div>
            ))}
          </div>
        )}
        {notifications.length > 0 && unreadNotifications > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl sticky bottom-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllNotificationsAsRead}
              className="w-full text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-100"
            >
              Mark all as read
            </Button>
          </div>
        )}
      </div>


      <style>{`
        .nice-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .nice-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc; /* Tailwind gray-50 */
          border-radius: 10px;
        }
        .nice-scrollbar::-webkit-scrollbar-thumb {
          background: #fb923c; /* Tailwind orange-400 */
          border-radius: 10px;
        }
        .nice-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f97316; /* Tailwind orange-500 */
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
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
      <Button variant="ghost" className="h-9 w-9 p-0 text-gray-500 hover:text-orange-500 hover:bg-orange-100/50 rounded-md focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1">
        <span className="sr-only">Open menu</span>
        <MoreVertical className="h-5 w-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="shadow-xl rounded-lg w-48 border-gray-200">
      <DropdownMenuItem className="cursor-pointer hover:!bg-orange-50 focus:!bg-orange-100 text-gray-700" onClick={() => toast.info("View Details feature coming soon!")}>
        <FileText className="mr-2 h-4 w-4" />
        View Details
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer hover:!bg-orange-50 focus:!bg-orange-100 text-gray-700" onClick={() => toast.info("Download PDF feature coming soon!")}>
        <Download className="mr-2 h-4 w-4" />
        Download PDF
      </DropdownMenuItem>
      {complaint.status === 'pending' && (
        <>
          <DropdownMenuSeparator className="bg-gray-100" />
          <DropdownMenuItem 
            className="cursor-pointer text-red-600 hover:!bg-red-50 hover:!text-red-700 focus:!bg-red-100 focus:!text-red-700"
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