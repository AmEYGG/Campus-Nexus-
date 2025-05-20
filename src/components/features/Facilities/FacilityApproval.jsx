import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  MapPin,
  MessageSquare
} from 'lucide-react';

const FacilityApproval = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected

  // Sample data - replace with API call
  useEffect(() => {
    const mockBookings = [
      {
        id: 1,
        facility: {
          name: 'Tennis Court',
          location: 'Sports Complex'
        },
        date: '2024-03-15',
        timeSlot: '14:00',
        purpose: 'Inter-department Tennis Tournament',
        requestedBy: {
          name: 'John Doe',
          role: 'Student',
          department: 'Computer Science'
        },
        attendees: 4,
        status: 'pending',
        requestedAt: '2024-03-10T10:30:00Z'
      },
      // Add more mock bookings
    ];

    setBookings(mockBookings);
  }, []);

  const handleApproval = async (bookingId, isApproved) => {
    if (!approvalNote) {
      alert('Please add a note for your decision');
      return;
    }

    try {
      // API call would go here
      console.log('Processing approval:', {
        bookingId,
        isApproved,
        note: approvalNote
      });

      // Update local state
      setBookings(bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: isApproved ? 'approved' : 'rejected' }
          : booking
      ));
      
      setSelectedBooking(null);
      setApprovalNote('');
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Failed to process approval. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Facility Booking Approvals</h1>
        <p className="mt-1 text-gray-600">
          Review and manage facility booking requests
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          {['pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-2 font-medium text-sm rounded-md ${
                filter === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {bookings
            .filter(booking => filter === 'all' || booking.status === filter)
            .map(booking => (
              <motion.li
                key={booking.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {booking.facility.name}
                      </h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {booking.date} at {booking.timeSlot}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        {booking.facility.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        {booking.attendees} attendees
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Requested by: {booking.requestedBy.name} ({booking.requestedBy.role})
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
        </ul>
      </div>

      {/* Approval Dialog */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Booking Request Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Purpose</h3>
                  <p className="mt-1 text-gray-900">{selectedBooking.purpose}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Requester Details</h3>
                  <div className="mt-1 text-gray-900">
                    <p>{selectedBooking.requestedBy.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedBooking.requestedBy.role} - {selectedBooking.requestedBy.department}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Approval Note
                  </label>
                  <textarea
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Add a note for your decision..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApproval(selectedBooking.id, true)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(selectedBooking.id, false)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    setApprovalNote('');
                  }}
                  className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacilityApproval; 