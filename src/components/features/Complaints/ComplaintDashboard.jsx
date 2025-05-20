import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import ComplaintForm from './ComplaintForm';
import { Avatar } from '../../ui/avatar';
import { Dialog } from '../../ui/dialog';

const ComplaintDashboard = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for demonstration
  const user = {
    name: 'John Doe',
    avatar: '/avatars/default.png',
    studentId: 'STU123456'
  };

  // Mock statistics data
  const stats = [
    {
      title: 'Total Complaints',
      value: '66',
      icon: FileText,
      color: 'bg-orange-500'
    },
    {
      title: 'Resolved',
      value: '94',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Pending',
      value: '51',
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Resolution Rate',
      value: '233%',
      icon: AlertCircle,
      color: 'bg-blue-500'
    }
  ];

  // State for complaints data
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      subject: 'Library Access Issue',
      category: 'facility',
      priority: 'high',
      status: 'pending',
      date: '2024-03-15',
      updates: 3
    },
    {
      id: 2,
      subject: 'Late Grade Submission',
      category: 'academic',
      description: 'Grades for CS101 have not been posted for over two weeks.',
      status: 'resolved',
      priority: 'medium',
      date: '2024-03-14',
      updates: 5
    },
    {
      id: 3,
      subject: 'Cafeteria Food Quality',
      category: 'facility',
      description: 'Concerns about the quality of food served in the main cafeteria.',
      status: 'in-progress',
      priority: 'medium',
      date: '2024-03-13',
      updates: 2
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'academic':
        return <FileText className="h-5 w-5" />;
      case 'facility':
        return <Calendar className="h-5 w-5" />;
      case 'staff':
        return <Users className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleNewComplaint = () => {
    setIsFormOpen(true);
  };

  // Function to handle form submission
  const handleComplaintSubmit = (formData) => {
    // Create a new complaint object
    const newComplaint = {
      id: complaints.length + 1,
      subject: formData.subject,
      category: formData.category,
      description: formData.description,
      status: 'pending',
      priority: formData.priority,
      date: formData.date || new Date().toISOString().split('T')[0],
      updates: 0
    };

    // Add the new complaint to the list
    setComplaints([newComplaint, ...complaints]);
    
    // Close the form
    setIsFormOpen(false);
  };

  // Filter complaints based on search query and filter
  const filteredComplaints = complaints.filter(complaint => {
    // Filter by status
    if (filter !== 'all' && complaint.status !== filter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && 
        !complaint.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!complaint.description || !complaint.description.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with User Profile */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <img src={user.avatar} alt={user.name} />
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-500">Student ID: {user.studentId}</p>
          </div>
        </div>
        <Button
          onClick={handleNewComplaint}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Complaint
        </Button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-[300px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('pending')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('resolved')}>Resolved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('in-progress')}>In Progress</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Current filter indicator */}
        <div className="text-sm text-gray-500">
          {filter !== 'all' && (
            <Badge variant="outline" className="mr-2">
              Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <button onClick={() => setFilter('all')} className="ml-1 text-gray-400 hover:text-gray-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="outline">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="ml-1 text-gray-400 hover:text-gray-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <Card key={complaint.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                    {getCategoryIcon(complaint.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{complaint.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge className={getStatusColor(complaint.status)} variant="secondary">
                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                      </Badge>
                      <Badge className={getPriorityColor(complaint.priority)} variant="secondary">
                        {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
                      </Badge>
                      <span className="text-sm text-gray-500">{complaint.date}</span>
                      {complaint.updates > 0 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {complaint.updates} updates
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Download</DropdownMenuItem>
                    {complaint.status === 'pending' && (
                      <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No complaints found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or create a new complaint</p>
          </div>
        )}
      </div>

      {/* Complaint Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <ComplaintForm 
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleComplaintSubmit}
        />
      </Dialog>
    </div>
  );
};

export default ComplaintDashboard;