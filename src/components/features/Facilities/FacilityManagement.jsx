import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, User, Building, CheckCircle, XCircle, AlertCircle, Star, Filter, Search, FileText, Plus, Edit2, Trash2, Eye, MapPin, Users, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { database } from '@/config/firebase';
import { ref, onValue, update, push, set, get } from 'firebase/database';
import { useAuthContext } from '@/providers/AuthProvider';

const FacilityManagement = () => {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    // Fetch facility booking requests from Firebase
    const bookingsRef = ref(database, 'facilityBookingRequests');
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const bookingsData = [];
        snapshot.forEach((childSnapshot) => {
          bookingsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        // Sort by date, most recent first
        bookingsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(bookingsData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleViewDetails = async (booking) => {
    setViewingBooking(booking);
    try {
      // Fetch additional details if needed
      const bookingRef = ref(database, `facilityBookingRequests/${booking.id}`);
      const snapshot = await get(bookingRef);
      if (snapshot.exists()) {
        setBookingDetails({
          ...snapshot.val(),
          id: booking.id
        });
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to fetch booking details');
    }
  };

  const handleApprove = async (bookingId) => {
    setIsProcessing(true);
    try {
      const bookingRef = ref(database, `facilityBookingRequests/${bookingId}`);
      const updates = {
        status: 'approved',
        updatedAt: new Date().toISOString(),
        approvedBy: user.uid,
        statusMessage: 'Your facility booking request has been approved.'
      };

      await update(bookingRef, updates);

      // Create notification for the student
      const notificationsRef = ref(database, 'notifications');
      const newNotificationRef = push(notificationsRef);
      await set(newNotificationRef, {
        recipient: bookings.find(b => b.id === bookingId).userId,
        title: 'Facility Booking Approved',
        message: 'Your facility booking request has been approved.',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
        requestId: bookingId
      });

      toast.success('Booking request approved successfully');
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (bookingId) => {
    if (!rejectionReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      const bookingRef = ref(database, `facilityBookingRequests/${bookingId}`);
      const updates = {
        status: 'rejected',
        updatedAt: new Date().toISOString(),
        rejectedBy: user.uid,
        rejectionReason,
        statusMessage: `Your facility booking request has been rejected. Reason: ${rejectionReason}`
      };

      await update(bookingRef, updates);

      // Create notification for the student
      const notificationsRef = ref(database, 'notifications');
      const newNotificationRef = push(notificationsRef);
      await set(newNotificationRef, {
        recipient: bookings.find(b => b.id === bookingId).userId,
        title: 'Facility Booking Rejected',
        message: `Your facility booking request has been rejected. Reason: ${rejectionReason}`,
        type: 'error',
        read: false,
        createdAt: new Date().toISOString(),
        requestId: bookingId
      });

      setRejectionReason('');
      toast.success('Booking request rejected successfully');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking request');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter bookings based on status and search term
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = 
      booking.requester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.facility?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building className="w-8 h-8 text-blue-600" />
                Facility Management
              </h1>
              <p className="text-gray-600 mt-2">Manage and review facility booking requests</p>
            </div>
            <div className="flex gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-xl shadow-sm border p-6">
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
            Showing {filteredBookings.length} of {bookings.length} requests
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.requester}</TableCell>
                    <TableCell>{booking.facility}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{format(new Date(booking.date), 'MMM d, yyyy')}</span>
                        <span className="text-sm text-gray-500">{booking.timeSlot}</span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.purpose}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          booking.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleApprove(booking.id)}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setRejectionReason('');
                              }}
                              disabled={isProcessing}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setViewingBooking(null);
                  setBookingDetails(null);
                }}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Requester</span>
                    <p className="font-medium">{viewingBooking.requester}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Facility</span>
                    <p className="font-medium">{viewingBooking.facility}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Date</span>
                    <p className="font-medium">
                      {format(new Date(viewingBooking.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Time Slot</span>
                    <p className="font-medium">{viewingBooking.timeSlot}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Additional Details</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Purpose</span>
                    <p className="font-medium">{viewingBooking.purpose}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <Badge
                      className={
                        viewingBooking.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : viewingBooking.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {viewingBooking.status.charAt(0).toUpperCase() + viewingBooking.status.slice(1)}
                    </Badge>
                  </div>
                  {viewingBooking.attendees && (
                    <div>
                      <span className="text-sm text-gray-500">Expected Attendees</span>
                      <p className="font-medium">{viewingBooking.attendees}</p>
                    </div>
                  )}
                  {viewingBooking.equipment && (
                    <div>
                      <span className="text-sm text-gray-500">Required Equipment</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {viewingBooking.equipment.map((item, index) => (
                          <Badge key={index} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {viewingBooking.status === 'rejected' && viewingBooking.rejectionReason && (
                <div className="col-span-2">
                  <h4 className="font-medium text-gray-700 mb-2">Rejection Reason</h4>
                  <p className="text-gray-600 bg-red-50 p-3 rounded-lg">
                    {viewingBooking.rejectionReason}
                  </p>
                </div>
              )}

              <div className="col-span-2">
                <h4 className="font-medium text-gray-700 mb-2">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Requested: {format(new Date(viewingBooking.createdAt), 'PPpp')}
                  </div>
                  {viewingBooking.updatedAt && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Last Updated: {format(new Date(viewingBooking.updatedAt), 'PPpp')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Reject Booking Request</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedBooking(null)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleReject(selectedBooking.id);
                  setSelectedBooking(null);
                }}
                disabled={isProcessing || !rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FacilityManagement;