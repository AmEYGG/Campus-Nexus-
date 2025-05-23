import React, { useState, useEffect } from 'react';
import { ref, onValue, update, serverTimestamp, get, set } from 'firebase/database';
import { database, auth } from '../../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-hot-toast';
import { 
  FileText, CheckCircle2, XCircle, Clock, 
  AlertCircle, Calendar, MessageSquare, Eye,
  Filter, Search, TrendingUp, Users, BarChart2,
  PieChart, Activity, Shield, Flag, ThumbsUp,
  ThumbsDown, MessageCircle, Archive, RefreshCw,
  Download, CheckCircle, XCircle as LucideXCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createComplaintNotification } from '../../../utils/notificationUtils';

// Mock data for complaints
const mockComplaints = [
  {
    id: 'CMP001',
    category: 'Academic',
    subCategory: 'Grading',
    description: 'Inconsistent grading across different sections of the same course',
    priority: 'high',
    status: 'pending',
    submittedAt: '2024-03-15T10:30:00',
    lastUpdated: '2024-03-15T10:30:00',
    resolution: null,
    reviewComment: null,
    reviewedBy: null,
    reviewedAt: null,
    attachments: ['grading_comparison.pdf'],
    department: 'Computer Science',
    semester: 'Spring 2024',
    courseCode: 'CS101',
    impact: 'Affects multiple students',
    suggestedResolution: 'Request for standardized grading criteria',
    anonymousId: 'ANON001'
  },
  {
    id: 'CMP002',
    category: 'Facility',
    subCategory: 'Infrastructure',
    description: 'Air conditioning not working in Building B classrooms',
    priority: 'medium',
    status: 'in_progress',
    submittedAt: '2024-03-14T14:20:00',
    lastUpdated: '2024-03-16T09:15:00',
    resolution: 'Maintenance team notified',
    reviewComment: 'Scheduled for repair on March 18',
    reviewedBy: 'Dr. Smith',
    reviewedAt: '2024-03-16T09:15:00',
    attachments: ['temperature_log.pdf', 'classroom_photos.pdf'],
    department: 'All Departments',
    semester: 'Spring 2024',
    impact: 'Affects multiple classrooms',
    suggestedResolution: 'Regular maintenance checks',
    anonymousId: 'ANON002'
  },
  {
    id: 'CMP003',
    category: 'Administrative',
    subCategory: 'Registration',
    description: 'Difficulty in course registration system during peak hours',
    priority: 'high',
    status: 'resolved',
    submittedAt: '2024-03-13T09:45:00',
    lastUpdated: '2024-03-15T16:30:00',
    resolution: 'System upgraded with additional servers',
    reviewComment: 'Implemented load balancing and increased server capacity',
    reviewedBy: 'IT Department',
    reviewedAt: '2024-03-15T16:30:00',
    attachments: ['system_logs.pdf'],
    department: 'All Departments',
    semester: 'Spring 2024',
    impact: 'System-wide issue',
    suggestedResolution: 'System upgrade required',
    anonymousId: 'ANON003'
  },
  {
    id: 'CMP004',
    category: 'Academic',
    subCategory: 'Course Content',
    description: 'Outdated course materials in Advanced Mathematics',
    priority: 'medium',
    status: 'pending',
    submittedAt: '2024-03-16T11:20:00',
    lastUpdated: '2024-03-16T11:20:00',
    resolution: null,
    reviewComment: null,
    reviewedBy: null,
    reviewedAt: null,
    attachments: ['current_syllabus.pdf', 'updated_materials.pdf'],
    department: 'Mathematics',
    semester: 'Spring 2024',
    courseCode: 'MATH301',
    impact: 'Affects course quality',
    suggestedResolution: 'Update course materials',
    anonymousId: 'ANON004'
  },
  {
    id: 'CMP005',
    category: 'Facility',
    subCategory: 'Safety',
    description: 'Broken handrails in Science Building staircases',
    priority: 'high',
    status: 'resolved',
    submittedAt: '2024-03-12T15:40:00',
    lastUpdated: '2024-03-14T10:20:00',
    resolution: 'Handrails repaired and safety inspection completed',
    reviewComment: 'Emergency repair completed. Regular safety audits implemented',
    reviewedBy: 'Facility Management',
    reviewedAt: '2024-03-14T10:20:00',
    attachments: ['safety_inspection.pdf', 'repair_photos.pdf'],
    department: 'Science',
    semester: 'Spring 2024',
    impact: 'Safety hazard',
    suggestedResolution: 'Immediate repair required',
    anonymousId: 'ANON005'
  }
];

const ComplaintReview = () => {
  const [user, loading] = useAuthState(auth);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    averageResolutionTime: 'N/A',
    highPriority: 0
  });
  const [modalMode, setModalMode] = useState('review'); // 'review' or 'view'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verify permissions (faculty or admin)
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user || loading) {
        return;
      }

      try {
        // First check if user has a role in their profile
        if (user.userProfile && user.userProfile.role) {
          if (user.userProfile.role === 'admin' || user.userProfile.role === 'faculty') {
            setHasPermission(true);
            setPageLoading(false);
            return;
          }
        }

        // If no role in profile, check in specific collections
        const userRef = ref(database, `users/${user.uid}`);
        const facultyRef = ref(database, `faculty/${user.uid}`);
        const adminRef = ref(database, `administrators/${user.uid}`);
        
        const [userSnapshot, facultySnapshot, adminSnapshot] = await Promise.all([
          get(userRef),
          get(facultyRef),
          get(adminRef)
        ]);

        const isAdmin = adminSnapshot.exists() || 
                       (userSnapshot.exists() && userSnapshot.val().role === 'admin');
        const isFaculty = facultySnapshot.exists() || 
                         (userSnapshot.exists() && userSnapshot.val().role === 'faculty');
        
        if (isAdmin || isFaculty) {
          setHasPermission(true);
        } else {
          setHasPermission(false);
          toast.error('You do not have permission to review complaints');
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasPermission(false);
        toast.error('Error verifying permissions');
      } finally {
        setPageLoading(false);
      }
    };

    checkPermissions();
  }, [user, loading]);

  // Fetch complaints only if user has permission
  useEffect(() => {
    if (!user || !hasPermission || loading) return;

    const complaintsRef = ref(database, 'complaintRequests');
    
    const unsubscribe = onValue(complaintsRef, (snapshot) => {
      const complaintsData = [];
      snapshot.forEach((childSnapshot) => {
        complaintsData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      setComplaints(complaintsData);
      setPageLoading(false);

      // Update statistics
      const stats = {
        total: complaintsData.length,
        pending: complaintsData.filter(c => c.status === 'pending').length,
        inProgress: complaintsData.filter(c => c.status === 'in_progress').length,
        resolved: complaintsData.filter(c => c.status === 'resolved').length,
        rejected: complaintsData.filter(c => c.status === 'rejected').length,
        highPriority: complaintsData.filter(c => c.priority === 'high').length
      };

      setStats({
        ...stats,
        averageResolutionTime: calculateAverageResolutionTime(complaintsData)
      });
    });

    return () => unsubscribe();
  }, [user, hasPermission, loading]);

  const calculateAverageResolutionTime = (complaints) => {
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved' && c.submittedAt && c.reviewedAt);
    if (resolvedComplaints.length === 0) return 'N/A';

    const totalTime = resolvedComplaints.reduce((acc, complaint) => {
      const submitted = new Date(complaint.submittedAt);
      const resolved = new Date(complaint.reviewedAt);
      return acc + (resolved - submitted);
    }, 0);

    const avgDays = Math.round((totalTime / resolvedComplaints.length) / (1000 * 60 * 60 * 24) * 10) / 10;
    return `${avgDays} days`;
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const complaintRef = ref(database, `complaints/${complaintId}`);
      const complaintSnapshot = await get(complaintRef);
      const complaint = complaintSnapshot.val();

      await update(complaintRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Create notification for the student
      const message = getStatusChangeMessage(newStatus, complaint.subject);
      await createComplaintNotification(complaint.userId, complaintId, newStatus, message);

      toast.success(`Complaint status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    }
  };

  const getStatusChangeMessage = (status, subject) => {
    switch (status) {
      case 'resolved':
        return `Your complaint "${subject}" has been resolved.`;
      case 'rejected':
        return `Your complaint "${subject}" has been rejected.`;
      case 'in_progress':
        return `Your complaint "${subject}" is now being processed.`;
      default:
        return `Your complaint "${subject}" status has been updated to ${status}.`;
    }
  };

  // Chart data
  const getChartData = () => {
    const statusData = [
      { name: 'Pending', value: stats.pending, color: '#F59E0B' },
      { name: 'In Progress', value: stats.inProgress, color: '#3B82F6' },
      { name: 'Resolved', value: stats.resolved, color: '#10B981' },
      { name: 'Rejected', value: stats.rejected, color: '#EF4444' }
    ];

    const categoryData = [
      { name: 'Academic', value: complaints.filter(c => c.category === 'Academic').length, color: '#3B82F6' },
      { name: 'Facility', value: complaints.filter(c => c.category === 'Facility').length, color: '#10B981' },
      { name: 'Administrative', value: complaints.filter(c => c.category === 'Administrative').length, color: '#8B5CF6' }
    ];

    const trendData = [
      { month: 'Jan', complaints: 8, resolved: 6 },
      { month: 'Feb', complaints: 12, resolved: 9 },
      { month: 'Mar', complaints: 15, resolved: 12 },
      { month: 'Apr', complaints: 10, resolved: 8 },
      { month: 'May', complaints: 7, resolved: 5 }
    ];

    const priorityData = [
      { subject: 'Academic', high: 3, medium: 2, low: 1 },
      { subject: 'Facility', high: 2, medium: 3, low: 1 },
      { subject: 'Administrative', high: 1, medium: 2, low: 1 }
    ];

    return { statusData, categoryData, trendData, priorityData };
  };

  const { statusData, categoryData, trendData, priorityData } = getChartData();

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      in_progress: { variant: 'bg-blue-100 text-blue-800', icon: Clock, text: 'In Progress' },
      resolved: { variant: 'bg-green-100 text-green-800', icon: CheckCircle2, text: 'Resolved' },
      rejected: { variant: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${config.variant}`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </div>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { variant: 'bg-red-50 text-red-700 border-red-300', text: 'High' },
      medium: { variant: 'bg-orange-50 text-orange-700 border-orange-300', text: 'Medium' },
      low: { variant: 'bg-blue-50 text-blue-700 border-blue-300', text: 'Low' }
    };
    
    const config = priorityConfig[priority];
    
    return (
      <div className={`text-xs border px-2 py-0.5 rounded ${config.variant}`}>
        {config.text}
      </div>
    );
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Complaints</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <Flag className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-blue-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>15% increase from last month</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending Review</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-full">
            <Clock className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-yellow-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{stats.highPriority} high priority issues</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Resolution Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-full">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-green-600">
          <Activity className="h-4 w-4 mr-1" />
          <span>Avg. resolution time: {stats.averageResolutionTime}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Reviewers</p>
            <p className="text-2xl font-bold text-gray-900">5</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-full">
            <Users className="h-6 w-6 text-purple-500" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-purple-600">
          <BarChart2 className="h-4 w-4 mr-1" />
          <span>Processing 10 complaints/day</span>
        </div>
      </div>
    </div>
  );

  // Analytics Charts Component
  const AnalyticsCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-blue-500" />
          Complaint Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="complaints" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.2} 
              />
              <Area 
                type="monotone" 
                dataKey="resolved" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-500" />
          Category Distribution
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Priority Analysis by Category
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={priorityData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="High Priority" dataKey="high" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
              <Radar name="Medium Priority" dataKey="medium" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
              <Radar name="Low Priority" dataKey="low" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Complaint Card Component
  const ComplaintCard = ({ complaint }) => {
    const formattedDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    return (
      <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                <Flag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {complaint.category} - {complaint.subCategory}
                </h3>
                <p className="text-sm text-gray-600">
                  ID: {complaint.anonymousId}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(complaint.status)}
              {getPriorityBadge(complaint.priority)}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-gray-900 line-clamp-2">{complaint.description}</p>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Submitted: {formattedDate(complaint.submittedAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="h-4 w-4" />
              <span>Department: {complaint.department}</span>
            </div>
            {complaint.status === 'resolved' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Resolved: {formattedDate(complaint.reviewedAt)}</span>
              </div>
            )}
          </div>

          {/* File attachments */}
          {complaint.files && complaint.files.length > 0 && (
            <div className="mt-3 space-y-1">
              {complaint.files.map((file, index) => (
                <a
                  key={index}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                </a>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-2 justify-end">
            {complaint.status === 'pending' ? (
              <button
                className="px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 text-white bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setSelectedComplaint(complaint);
                  setIsModalOpen(true);
                }}
              >
                <Eye className="h-4 w-4" />
                Review
              </button>
            ) : (
              <button
                className="px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100"
                onClick={() => {
                  setSelectedComplaint(complaint);
                  setIsModalOpen(true);
                }}
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleComplaintAction = async (action) => {
    if (!user || !hasPermission) {
      toast.error('You do not have permission to review complaints');
      return;
    }

    if (!selectedComplaint) return;

    try {
      const status = action === 'approve' ? 'resolved' : 'rejected';
      
      // Update complaint status in Firebase
      const complaintRef = ref(database, `complaintRequests/${selectedComplaint.id}`);
      const updateData = {
        status,
        reviewedBy: {
          uid: user.uid,
          name: user.displayName || 'Faculty Member',
          email: user.email,
          role: hasPermission ? 'admin/faculty' : 'unauthorized'
        },
        reviewedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        notifications: {
          student: {
            type: 'complaint_update',
            message: `Your complaint (ID: ${selectedComplaint.anonymousId}) has been ${status}.`,
            createdAt: serverTimestamp(),
            read: false
          },
          faculty: {
            type: 'complaint_reviewed',
            message: `Complaint ${selectedComplaint.anonymousId} has been ${status}`,
            createdAt: serverTimestamp(),
            read: false
          }
        }
      };

      await update(complaintRef, updateData);

      // Update user's complaint reference
      try {
        const userComplaintRef = ref(database, `users/${selectedComplaint.studentId}/complaints/${selectedComplaint.id}`);
        await update(userComplaintRef, {
          status,
          lastUpdated: serverTimestamp()
        });
      } catch (userUpdateError) {
        console.warn('Failed to update user complaint reference:', userUpdateError);
        // Continue with the process
      }

      // Try to create notification in user's notifications
      try {
        const userNotificationRef = ref(database, `users/${selectedComplaint.studentId}/notifications/${selectedComplaint.id}`);
        await set(userNotificationRef, {
          type: 'complaint_update',
          complaintId: selectedComplaint.id,
          status,
          message: `Your complaint (ID: ${selectedComplaint.anonymousId}) has been ${status}.`,
          createdAt: serverTimestamp(),
          read: false
        });
      } catch (notificationError) {
        console.warn('Failed to create user notification:', notificationError);
        // Continue with the process
      }

      // Log faculty action
      try {
        const facultyActionRef = ref(database, `facultyActionLogs/${user.uid}/${selectedComplaint.id}`);
        await set(facultyActionRef, {
          actionType: status,
          complaintId: selectedComplaint.id,
          timestamp: serverTimestamp(),
          details: `Complaint ${status}`
        });
      } catch (logError) {
        console.warn('Failed to log faculty action:', logError);
        // Continue with the process
      }

      // Verify if the complaint was actually updated
      try {
        const updatedSnapshot = await get(complaintRef);
        if (updatedSnapshot.exists() && updatedSnapshot.val().status === status) {
          toast.success(`Complaint ${status === 'resolved' ? 'approved' : 'rejected'} successfully`);
          setIsModalOpen(false);
          setSelectedComplaint(null);
          return;
        }
      } catch (verifyError) {
        console.error('Error verifying complaint update:', verifyError);
      }

      // If we get here and haven't returned, show a warning
      toast.warning('Complaint status updated but some notifications may have failed');
      setIsModalOpen(false);
      setSelectedComplaint(null);

    } catch (error) {
      console.error('Error updating complaint:', error);
      
      // Check if the complaint was actually updated despite the error
      try {
        const snapshot = await get(complaintRef);
        if (snapshot.exists() && snapshot.val().status === status) {
          toast.success(`Complaint ${status === 'resolved' ? 'approved' : 'rejected'} successfully`);
          setIsModalOpen(false);
          setSelectedComplaint(null);
          return;
        }
      } catch (checkError) {
        console.error('Error checking complaint status:', checkError);
      }

      if (error.code === 'PERMISSION_DENIED') {
        toast.error('Permission denied. Please make sure you have proper authorization.');
      } else {
        toast.error('Failed to update complaint status. Please try again.');
      }
    }
  };

  // Review Modal Component
  const ComplaintReviewModal = ({ complaint }) => {
    if (!complaint) return null;

    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Complaint</DialogTitle>
            <DialogDescription>
              Complaint ID: {complaint.anonymousId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Subject</h3>
              <p className="text-gray-700">{complaint.subject}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700">{complaint.description}</p>
            </div>

            {complaint.files && Array.isArray(complaint.files) && complaint.files.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Attachments</h3>
                <div className="space-y-2">
                  {complaint.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              Cancel
            </Button>
            {complaint.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleComplaintAction('reject')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleComplaintAction('approve')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.subCategory.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {pageLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : !hasPermission ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Access Denied</h3>
            <p className="text-gray-500">You do not have permission to access this page.</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Complaint Review System</h1>
            <p className="mt-1 text-gray-600">Review and manage anonymous complaints</p>
          </div>

          {/* Statistics Cards */}
          <StatisticsCards />

          {/* Analytics Charts */}
          <AnalyticsCharts />

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 sm:p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex space-x-1">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Flag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No complaints found</h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? "No complaints match your search criteria."
                      : filterStatus !== 'all' || filterPriority !== 'all'
                      ? "No complaints match the selected filters."
                      : "No complaints available at the moment."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredComplaints.map(complaint => (
                    <ComplaintCard key={complaint.id} complaint={complaint} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedComplaint && (
        <ComplaintReviewModal complaint={selectedComplaint} />
      )}
    </div>
  );
};

export default ComplaintReview; 