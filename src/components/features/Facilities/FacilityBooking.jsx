import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

const FacilityBooking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [attendees, setAttendees] = useState('');

  // Sample facilities data (replace with API call)
  const facilities = [
    {
      id: 1,
      name: 'Tennis Court',
      type: 'sports',
      capacity: 4,
      image: '/facilities/tennis-court.jpg',
      location: 'Sports Complex'
    },
    {
      id: 2,
      name: 'Main Auditorium',
      type: 'auditorium',
      capacity: 500,
      image: '/facilities/auditorium.jpg',
      location: 'Academic Block'
    },
    {
      id: 3,
      name: 'Conference Room A',
      type: 'conference',
      capacity: 30,
      image: '/facilities/conference-room.jpg',
      location: 'Admin Block'
    }
  ];

  // Generate time slots
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 7; // Start from 7 AM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Sample availability data (replace with API call)
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    // Fetch availability data from API
    // This is a mock implementation
    const mockAvailability = {};
    facilities.forEach(facility => {
      mockAvailability[facility.id] = {
        [format(selectedDate, 'yyyy-MM-dd')]: timeSlots.map(slot => ({
          time: slot,
          status: Math.random() > 0.3 ? 'available' : 'booked'
        }))
      };
    });
    setAvailability(mockAvailability);
  }, [selectedDate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'booked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleBooking = async () => {
    if (!selectedFacility || !selectedTimeSlot || !bookingPurpose) {
      alert('Please fill in all required fields');
      return;
    }

    // Implement booking logic here
    console.log('Booking:', {
      facilityId: selectedFacility.id,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      purpose: bookingPurpose,
      attendees
    });
  };

  const WeekView = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {days.map((day) => (
          <motion.button
            key={day.toString()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedDate(day)}
            className={`flex flex-col items-center p-3 rounded-lg min-w-[100px] ${
              isSameDay(day, selectedDate)
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm font-medium">
              {format(day, 'EEE')}
            </span>
            <span className="text-lg font-bold">
              {format(day, 'd')}
            </span>
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Facility Booking</h1>
        <p className="mt-1 text-gray-600">
          Book campus facilities for your events and activities
        </p>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-medium">
          {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
        </span>
        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <WeekView />

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {facilities.map((facility) => (
          <motion.div
            key={facility.id}
            whileHover={{ scale: 1.02 }}
            className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer ${
              selectedFacility?.id === facility.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedFacility(facility)}
          >
            <div className="h-48 bg-gray-200">
              {/* Replace with actual image */}
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">{facility.name}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{facility.name}</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  {facility.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  Capacity: {facility.capacity}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Time Slots */}
      {selectedFacility && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Available Time Slots</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {availability[selectedFacility.id]?.[format(selectedDate, 'yyyy-MM-dd')]?.map(
              (slot) => (
                <motion.button
                  key={slot.time}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={slot.status === 'booked'}
                  onClick={() => setSelectedTimeSlot(slot.time)}
                  className={`p-3 rounded-lg border ${getStatusColor(slot.status)} ${
                    selectedTimeSlot === slot.time ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {slot.time}
                  </div>
                </motion.button>
              )
            )}
          </div>
        </div>
      )}

      {/* Booking Form */}
      {selectedFacility && selectedTimeSlot && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose of Booking
              </label>
              <textarea
                value={bookingPurpose}
                onChange={(e) => setBookingPurpose(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe the purpose of your booking..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Attendees
              </label>
              <input
                type="number"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                max={selectedFacility.capacity}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Max ${selectedFacility.capacity} people`}
              />
            </div>
            <button
              onClick={handleBooking}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Booking Request
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FacilityBooking; 