import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, User, Building, CheckCircle, XCircle, AlertCircle, Star, Filter, Search, FileText, Plus, Edit2, Trash2, Eye } from 'lucide-react';

// Enhanced mock data with more details
const initialStudentRequests = [
  {
    id: 1,
    requester: 'Emily Chen',
    facility: 'Main Auditorium',
    capacity: 500,
    date: '2024-06-10',
    time: '10:00 AM - 12:00 PM',
    purpose: 'AI Research Seminar',
    status: 'pending',
    priority: 'high',
    equipment: ['Projector', 'Microphone', 'Laptop'],
    submittedAt: '2024-06-05T09:30:00Z',
    description: 'Presentation on latest AI research findings for computer science students'
  },
  {
    id: 2,
    requester: 'Marcus Johnson',
    facility: 'Computer Lab',
    capacity: 30,
    date: '2024-06-12',
    time: '2:00 PM - 4:00 PM',
    purpose: 'Web Development Workshop',
    status: 'pending',
    priority: 'medium',
    equipment: ['Projector', 'Whiteboard'],
    submittedAt: '2024-06-06T14:15:00Z',
    description: 'Hands-on workshop for learning React and modern web development'
  },
  {
    id: 3,
    requester: 'Sarah Williams',
    facility: 'Library Study Hall',
    capacity: 100,
    date: '2024-06-15',
    time: '1:00 PM - 3:00 PM',
    purpose: 'Group Study Session',
    status: 'approved',
    priority: 'low',
    equipment: ['Whiteboard'],
    submittedAt: '2024-06-04T11:20:00Z',
    description: 'Collaborative study session for final exams preparation'
  }
];

const facilityOptions = [
  'Main Auditorium',
  'Computer Lab',
  'Library Study Hall',
  'Conference Room A',
  'Conference Room B',
  'Gymnasium',
  'Science Lab',
  'Art Studio'
];

const FacilityManagement = () => {
  const [studentRequests, setStudentRequests] = useState(initialStudentRequests);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [facultyForm, setFacultyForm] = useState({ 
    facility: '', 
    date: '', 
    time: '', 
    purpose: '', 
    description: '',
    equipment: [],
    priority: 'medium'
  });
  const [facultyRequests, setFacultyRequests] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('requests');
  const [showRequestDetails, setShowRequestDetails] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filter student requests based on status and search term
  const filteredRequests = studentRequests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = req.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDecision = (id, decision) => {
    setStudentRequests(reqs => reqs.map(r => 
      r.id === id ? { ...r, status: decision, decidedAt: new Date().toISOString() } : r
    ));
    
    if (decision === 'approved') {
      const approved = studentRequests.find(r => r.id === id);
      setApprovedRequests(prev => [...prev, { ...approved, status: 'approved', review: '' }]);
      showNotification(`Request for ${approved.facility} has been approved!`);
    } else {
      showNotification(`Request has been ${decision}.`, 'info');
    }
  };

  const handleFacultyApply = e => {
    e.preventDefault();
    const newRequest = {
      ...facultyForm,
      id: Date.now(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      requester: 'Faculty Member' // In real app, would get from auth
    };
    setFacultyRequests(prev => [...prev, newRequest]);
    setFacultyForm({ 
      facility: '', 
      date: '', 
      time: '', 
      purpose: '', 
      description: '',
      equipment: [],
      priority: 'medium'
    });
    showNotification('Faculty request submitted successfully!');
  };

  const handleUpdateRequest = (id, field, value) => {
    setStudentRequests(reqs => reqs.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAddReview = (id) => {
    setApprovedRequests(reqs => reqs.map(r => 
      r.id === id ? { 
        ...r, 
        review: reviewText,
        reviewedAt: new Date().toISOString()
      } : r
    ));
    setReviewText('');
    setSelectedRequest(null);
    showNotification('Review added successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building className="w-8 h-8 text-blue-600" />
                Facility Management System
              </h1>
              <p className="text-gray-600 mt-2">Manage and review facility booking requests</p>
            </div>
            <div className="flex gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{studentRequests.filter(r => r.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex border-b">
            {[
              { id: 'requests', label: 'Student Requests', icon: FileText },
              { id: 'faculty', label: 'Faculty Application', icon: Plus },
              { id: 'approved', label: 'Approved Requests', icon: CheckCircle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Student Requests Tab */}
            {selectedTab === 'requests' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {filteredRequests.length} of {studentRequests.length} requests
                  </div>
                </div>

                {/* Requests Grid */}
                <div className="grid gap-4">
                  {filteredRequests.map(req => (
                    <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{req.facility}</h3>
                            <Badge className={getStatusColor(req.status)}>
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </Badge>
                            {getPriorityIcon(req.priority)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{req.requester}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(req.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{req.time}</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700">Purpose: </span>
                            {req.status === 'pending' ? (
                              <input
                                type="text"
                                defaultValue={req.purpose}
                                onBlur={e => handleUpdateRequest(req.id, 'purpose', e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1 ml-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <span className="text-gray-900">{req.purpose}</span>
                            )}
                          </div>

                          {req.description && (
                            <p className="text-gray-600 text-sm mb-4">{req.description}</p>
                          )}

                          {req.equipment && req.equipment.length > 0 && (
                            <div className="mb-4">
                              <span className="text-sm font-medium text-gray-700">Equipment: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {req.equipment.map((item, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Submitted: {formatDateTime(req.submittedAt)}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowRequestDetails(req.id)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Details
                          </Button>
                          
                          {req.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleDecision(req.id, 'approved')}
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDecision(req.id, 'rejected')}
                                className="flex items-center gap-1"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRequests.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            )}

            {/* Faculty Application Tab */}
            {selectedTab === 'faculty' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Submit Facility Request</h2>
                  <p className="text-gray-600">Fill out the form below to request facility access</p>
                </div>

                <form onSubmit={handleFacultyApply} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Facility</label>
                      <select
                        value={facultyForm.facility}
                        onChange={e => setFacultyForm(f => ({ ...f, facility: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a facility</option>
                        {facilityOptions.map(facility => (
                          <option key={facility} value={facility}>{facility}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={facultyForm.date}
                        onChange={e => setFacultyForm(f => ({ ...f, date: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        type="text"
                        placeholder="e.g., 2:00 PM - 4:00 PM"
                        value={facultyForm.time}
                        onChange={e => setFacultyForm(f => ({ ...f, time: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={facultyForm.priority}
                        onChange={e => setFacultyForm(f => ({ ...f, priority: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                      <input
                        type="text"
                        placeholder="Brief purpose of the booking"
                        value={facultyForm.purpose}
                        onChange={e => setFacultyForm(f => ({ ...f, purpose: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        placeholder="Detailed description of the event or activity"
                        value={facultyForm.description}
                        onChange={e => setFacultyForm(f => ({ ...f, description: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Request
                  </Button>
                </form>

                {/* Faculty Requests List */}
                {facultyRequests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Submitted Requests</h3>
                    <div className="space-y-3">
                      {facultyRequests.map(req => (
                        <div key={req.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{req.facility}</h4>
                              <p className="text-sm text-gray-600">{req.purpose}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(req.date)} • {req.time}
                              </p>
                            </div>
                            <Badge className={getStatusColor(req.status)}>
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Approved Requests Tab */}
            {selectedTab === 'approved' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Approved Facility Requests</h2>
                
                {approvedRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No approved requests yet</h3>
                    <p className="text-gray-500">Approved requests will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedRequests.map(req => (
                      <div key={req.id} className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{req.facility}</h3>
                              <Badge className="bg-green-100 text-green-800">Approved</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4" />
                                <span className="font-medium">{req.requester}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(req.date)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{req.time}</span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <span className="text-sm font-medium text-gray-700">Purpose: </span>
                              <span className="text-gray-900">{req.purpose}</span>
                            </div>

                            {req.review ? (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="font-medium text-gray-900">Review</span>
                                  {req.reviewedAt && (
                                    <span className="text-xs text-gray-500">
                                      • {formatDateTime(req.reviewedAt)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-700">{req.review}</p>
                              </div>
                            ) : (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                {selectedRequest === req.id ? (
                                  <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Add Review
                                    </label>
                                    <textarea
                                      placeholder="How was the facility usage? Any feedback?"
                                      value={reviewText}
                                      onChange={e => setReviewText(e.target.value)}
                                      rows={3}
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleAddReview(req.id)}
                                        disabled={!reviewText.trim()}
                                      >
                                        Submit Review
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => setSelectedRequest(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    onClick={() => setSelectedRequest(req.id)}
                                    className="flex items-center gap-1"
                                  >
                                    <Star className="w-4 h-4" />
                                    Add Review
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {showRequestDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              {(() => {
                const req = studentRequests.find(r => r.id === showRequestDetails);
                return req ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRequestDetails(null)}
                      >
                        Close
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Requester</span>
                          <p className="text-gray-900">{formatDate(req.date)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Time</span>
                          <p className="text-gray-900">{req.time}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Priority</span>
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(req.priority)}
                            <span className="text-gray-900 capitalize">{req.priority}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Submitted</span>
                          <p className="text-gray-900">{formatDateTime(req.submittedAt)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500">Purpose</span>
                        <p className="text-gray-900 mt-1">{req.purpose}</p>
                      </div>
                      
                      {req.description && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Description</span>
                          <p className="text-gray-900 mt-1">{req.description}</p>
                        </div>
                      )}
                      
                      {req.equipment && req.equipment.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Required Equipment</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {req.equipment.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-sm">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityManagement;