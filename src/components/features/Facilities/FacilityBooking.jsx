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
  ChevronRight,
  Bell,
  AlertCircle,
  X
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import toast from 'react-hot-toast';
import { createBookingRequest } from '../../../services/facilityBookingService';
import { useAuthContext } from '../../../providers/AuthProvider';
import { Button } from '@/components/ui/button';

const FacilityBooking = () => {
  const { user } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [attendees, setAttendees] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book facilities.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFacility || !selectedTimeSlot || !bookingPurpose) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        userId: user.uid,
        userEmail: user.email,
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot,
        purpose: bookingPurpose,
        attendees: attendees || 'N/A'
      };

      const { success, error, bookingId } = await createBookingRequest(bookingData);

      if (success) {
        toast({
          title: "Booking Request Submitted",
          description: "Your booking request has been submitted and is pending approval.",
          variant: "default"
        });

        // Reset form
        setSelectedFacility(null);
        setSelectedTimeSlot(null);
        setBookingPurpose('');
        setAttendees('');
      } else {
        throw new Error(error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="bg-blue-600 text-white py-16 px-8 rounded-lg mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold">Campus Facilities</h2>
            {user && (
              <button className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                <Bell className="w-6 h-6" />
              </button>
            )}
          </div>
          <p className="text-blue-100 mb-8">Book study rooms, labs, and other campus resources</p>
          <div className="flex space-x-4">
            <button className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-md shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2">
              View Availability
            </button>
            <button 
              className="px-6 py-3 border border-white text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
              onClick={() => document.getElementById('bookingForm').scrollIntoView({ behavior: 'smooth' })}
            >
              Book a Facility
            </button>
          </div>
        </div>
      </div>

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

      <div id="bookingForm" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                  disabled={slot.status === 'booked' || isSubmitting}
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
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Please describe the purpose of your booking..."
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Attendees (Optional)
              </label>
              <input
                type="number"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter number of attendees"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleBooking}
                disabled={isSubmitting}
                className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const BookingRequestForm = ({ onClose, onSubmit }) => {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    requester: '',
    date: '',
    time: '',
    priority: 'High',
    purpose: '',
    description: '',
    equipment: [],
    status: 'pending',
    submittedAt: new Date().toISOString()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const equipmentOptions = ['Projector', 'Microphone', 'Laptop'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit a booking request');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const { success, error } = await createBookingRequest(bookingData);

      if (success) {
        toast.success('Booking request submitted successfully');
        onSubmit();
      } else {
        throw new Error(error || 'Failed to submit booking request');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEquipmentChange = (equipment) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Facility Booking Request</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requester</label>
              <input
                type="text"
                name="requester"
                value={formData.requester}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  placeholder="10:00 AM - 12:00 PM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Equipment</label>
              <div className="flex flex-wrap gap-3">
                {equipmentOptions.map((equipment) => (
                  <label key={equipment} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.equipment.includes(equipment)}
                      onChange={() => handleEquipmentChange(equipment)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{equipment}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default FacilityBooking; 