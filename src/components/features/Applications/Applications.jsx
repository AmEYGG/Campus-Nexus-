import React, { useState, useEffect } from 'react';
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
import { toast } from '../../ui/use-toast';
import { Skeleton } from '../../ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for applications
const mockApplications = {
  pending: [
    {
      id: 1,
      type: 'Leave Application',
      submittedDate: '2024-03-10',
      status: 'Pending',
      subject: 'Medical Leave Request',
      description: 'Request for medical leave due to health issues',
      documents: ['medical_certificate.pdf'],
      urgency: 'High'
    },
    {
      id: 2,
      type: 'Course Change',
      submittedDate: '2024-03-08',
      status: 'Under Review',
      subject: 'Request to Change Elective Course',
      description: 'Request to switch from Advanced Mathematics to Data Science',
      documents: ['course_form.pdf'],
      urgency: 'Medium'
    }
  ],
  approved: [
    {
      id: 3,
      type: 'Scholarship',
      submittedDate: '2024-02-15',
      approvedDate: '2024-02-20',
      status: 'Approved',
      subject: 'Merit Scholarship Application',
      description: 'Application for academic merit scholarship',
      documents: ['transcript.pdf', 'recommendation.pdf'],
      urgency: 'Medium'
    }
  ],
  rejected: [
    {
      id: 4,
      type: 'Event Permission',
      submittedDate: '2024-02-01',
      rejectedDate: '2024-02-03',
      status: 'Rejected',
      subject: 'Tech Fest Event Permission',
      description: 'Permission to organize technical workshop',
      documents: ['event_proposal.pdf'],
      reason: 'Venue not available for the requested dates',
      urgency: 'Low'
    }
  ]
};

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
  
  switch (level.toLowerCase()) {
    case 'high':
      colorClass = 'text-red-600 border-red-200 bg-red-50';
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
      {level} Priority
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

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Submitted: {application.submittedDate}</span>
          </div>
          {application.documents.length > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{application.documents.length} document(s)</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <UrgencyBadge level={application.urgency} />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => onViewDetail(application)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {application.status === 'Pending' && (
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
                <DropdownMenuItem className="flex items-center cursor-pointer">
                  <Download className="h-4 w-4 mr-2" />
                  Download Documents
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {application.status === 'Pending' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center cursor-pointer">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Application
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center text-red-600 cursor-pointer">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Application
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

// Main Applications Component
const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortCriteria, setSortCriteria] = useState('date'); // 'date' or 'priority'
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching data
    const fetchData = async () => {
      try {
        // In a real application, fetch from an API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setApplications(mockApplications.pending.concat(mockApplications.approved, mockApplications.rejected));
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleSortChange = (criteria) => {
    setSortCriteria(criteria);
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedApplication(null);
  };

  // Filtering logic
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' ||
      app.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      app.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Sorting logic
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortCriteria === 'date') {
      return new Date(b.submittedDate) - new Date(a.submittedDate);
    } else if (sortCriteria === 'priority') {
      // Assuming urgency maps to priority levels (High > Medium > Low)
      const urgencyOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
    }
    return 0; // Default no sort
  });

  return (
    <div className="p-6">
      {error && <div className="text-red-500">Error loading applications: {error.message}</div>}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
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
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center space-x-4">
              {/* Status Filter Tabs */}
              <Tabs value={filterStatus} onValueChange={handleStatusFilterChange} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-4 h-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Sort Dropdown */}
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
                  <DropdownMenuItem onClick={() => handleSortChange('date')}>Date</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('priority')}>Priority</DropdownMenuItem>
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
        </>
      )}
    </div>
  );
};

export default Applications;