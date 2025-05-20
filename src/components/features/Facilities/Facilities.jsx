import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Avatar } from '../../ui/avatar';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  X,
  Search,
  Filter,
  Building,
  BookOpen,
  Laptop,
  Coffee,
  Dumbbell,
  Music,
  ChevronDown,
  AlertCircle,
  Star,
  Info,
  Heart,
  Zap,
  Bell
} from 'lucide-react';

// Enhanced mock data with more details and imagery concepts
const facilitiesData = {
  categories: [
    {
      id: 1,
      name: 'Study Rooms',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-700',
      description: 'Quiet spaces for individual or group study sessions',
      facilities: [
        {
          id: 101,
          name: 'Individual Study Room A',
          capacity: 1,
          location: 'Library Floor 2',
          amenities: ['Desk', 'Chair', 'Power Outlet', 'Wi-Fi'],
          availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
          rating: 4.8,
          popularity: 'High',
          status: 'Available',
          bgColor: 'bg-blue-50'
        },
        {
          id: 102,
          name: 'Group Study Room B',
          capacity: 6,
          location: 'Library Floor 3',
          amenities: ['Large Table', '6 Chairs', 'Whiteboard', 'Projector', 'Wi-Fi'],
          availableSlots: ['09:00', '10:00', '13:00', '14:00', '16:00'],
          rating: 4.5,
          popularity: 'Medium',
          status: 'Available',
          bgColor: 'bg-blue-50'
        },
        {
          id: 103,
          name: 'Quiet Study Zone C',
          capacity: 8,
          location: 'Library Floor 1 - East Wing',
          amenities: ['8 Desks', 'Noise Cancelling', 'Power Outlets', 'Natural Lighting'],
          availableSlots: ['08:00', '09:00', '11:00', '13:00', '16:00'],
          rating: 4.9,
          popularity: 'Very High',
          status: 'Limited',
          bgColor: 'bg-blue-50'
        }
      ]
    },
    {
      id: 2,
      name: 'Computer Labs',
      icon: Laptop,
      color: 'bg-purple-100 text-purple-700',
      description: 'Fully equipped labs with high-performance computers',
      facilities: [
        {
          id: 201,
          name: 'Computer Lab 1',
          capacity: 30,
          location: 'Tech Building Floor 1',
          amenities: ['30 Computers', 'Printing Service', 'Scanner', 'Technical Support'],
          availableSlots: ['08:00', '10:00', '12:00', '14:00', '16:00'],
          rating: 4.6,
          popularity: 'High',
          status: 'Available',
          bgColor: 'bg-purple-50'
        },
        {
          id: 202,
          name: 'Design Lab',
          capacity: 20,
          location: 'Arts Building Floor 2',
          amenities: ['20 iMacs', 'Adobe Creative Suite', 'Graphic Tablets', 'Printing'],
          availableSlots: ['09:00', '11:00', '13:00', '15:00'],
          rating: 4.7,
          popularity: 'Very High',
          status: 'Limited',
          bgColor: 'bg-purple-50'
        }
      ]
    },
    {
      id: 3,
      name: 'Sports Facilities',
      icon: Dumbbell,
      color: 'bg-green-100 text-green-700',
      description: 'Stay fit with our range of sports and fitness facilities',
      facilities: [
        {
          id: 301,
          name: 'Gymnasium',
          capacity: 50,
          location: 'Sports Complex',
          amenities: ['Basketball Court', 'Fitness Equipment', 'Changing Rooms', 'Lockers'],
          availableSlots: ['07:00', '09:00', '11:00', '15:00', '17:00'],
          rating: 4.4,
          popularity: 'Medium',
          status: 'Available',
          bgColor: 'bg-green-50'
        },
        {
          id: 302,
          name: 'Swimming Pool',
          capacity: 40,
          location: 'Sports Complex - Aquatic Center',
          amenities: ['Olympic Pool', 'Diving Area', 'Heated Water', 'Lifeguard'],
          availableSlots: ['08:00', '10:00', '14:00', '16:00', '18:00'],
          rating: 4.9,
          popularity: 'Very High',
          status: 'Limited',
          bgColor: 'bg-green-50'
        }
      ]
    },
    {
      id: 4,
      name: 'Music Rooms',
      icon: Music,
      color: 'bg-red-100 text-red-700',
      description: 'Practice rooms with instruments for music students',
      facilities: [
        {
          id: 401,
          name: 'Piano Room',
          capacity: 3,
          location: 'Music Building Floor 1',
          amenities: ['Grand Piano', 'Sound Proofing', 'Music Stands', 'Recording Equipment'],
          availableSlots: ['09:00', '11:00', '13:00', '15:00', '17:00'],
          rating: 4.7,
          popularity: 'High',
          status: 'Available',
          bgColor: 'bg-red-50'
        },
        {
          id: 402,
          name: 'Band Practice Room',
          capacity: 10,
          location: 'Music Building Basement',
          amenities: ['Drum Kit', 'Amplifiers', 'Microphones', 'Sound System'],
          availableSlots: ['10:00', '12:00', '14:00', '16:00', '18:00'],
          rating: 4.8,
          popularity: 'High',
          status: 'Available',
          bgColor: 'bg-red-50'
        }
      ]
    }
  ]
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  let colorClass;
  let Icon;
  
  switch(status) {
    case 'Available':
      colorClass = 'bg-green-100 text-green-700';
      Icon = CheckCircle;
      break;
    case 'Limited':
      colorClass = 'bg-yellow-100 text-yellow-700';
      Icon = AlertCircle;
      break;
    case 'Unavailable':
      colorClass = 'bg-red-100 text-red-700';
      Icon = X;
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-700';
      Icon = Info;
  }
  
  return (
    <Badge className={`${colorClass} flex items-center gap-1`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{status}</span>
    </Badge>
  );
};

// Animated Facility Card
const FacilityCard = ({ facility, onBook, showDetails }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${facility.bgColor} border-2 border-gray-100`}>
        <div className="aspect-video relative">
          {/* Placeholder for facility image with gradient overlay */}
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-600 relative overflow-hidden">
            <Building className="h-16 w-16 text-white opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-3 left-3 z-10">
              <StatusBadge status={facility.status} />
            </div>
            <button 
              className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
              onClick={toggleFavorite}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">{facility.name}</h3>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-yellow-500" />
                <span className="text-sm font-medium">{facility.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{facility.location}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Capacity: {facility.capacity} people</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Popularity: {facility.popularity}</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-3">
              {facility.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs py-0.5">
                  {amenity}
                </Badge>
              ))}
              {facility.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs py-0.5">
                  +{facility.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{facility.availableSlots.length} available slots</span>
              </div>
              <motion.button 
                onClick={showDetails}
                whileHover={{ scale: 1.05 }}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                Details
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            </div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button 
                onClick={() => onBook(facility)} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Book Now
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Booking Form Component with better styling and animation
const BookingForm = ({ facility, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    purpose: '',
    numberOfPeople: 1,
    additionalNotes: ''
  });
  
  const [formStep, setFormStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmit(formData);
      setIsLoading(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{facility.name}</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-blue-500">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-blue-100">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{facility.location}</span>
          </div>
        </div>

        <div className="p-1 bg-gray-100">
          <div className="flex">
            <div className={`flex-1 p-2 text-center ${formStep === 1 ? 'bg-white rounded-t-md' : ''}`}>
              <span className={`text-sm font-medium ${formStep === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                Select Time
              </span>
            </div>
            <div className={`flex-1 p-2 text-center ${formStep === 2 ? 'bg-white rounded-t-md' : ''}`}>
              <span className={`text-sm font-medium ${formStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                Details
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formStep === 1 ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    required
                    className="w-full p-2 pl-10 border rounded-md"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time Slot</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    required
                    className="w-full p-2 pl-10 border rounded-md appearance-none"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  >
                    <option value="">Select a time slot</option>
                    {facility.availableSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  type="button" 
                  onClick={() => setFormStep(2)}
                  disabled={!formData.date || !formData.timeSlot}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g., Group Study, Project Meeting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of People</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    max={facility.capacity}
                    className="w-full p-2 pl-10 border rounded-md"
                    value={formData.numberOfPeople}
                    onChange={(e) => setFormData({ ...formData, numberOfPeople: parseInt(e.target.value) })}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Maximum capacity: {facility.capacity}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Any special requirements or notes..."
                />
              </div>

              <div className="flex justify-between gap-3 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormStep(1)}
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </div>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
};

// Facility Details Modal
const FacilityDetails = ({ facility, isOpen, onClose, onBook }) => {
  if (!isOpen || !facility) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">{facility.name}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-600 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-16 w-16 text-white opacity-50" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{facility.location}</span>
                  </div>
                  <StatusBadge status={facility.status} />
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>Capacity: {facility.capacity} people</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Rating: {facility.rating}/5.0</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {facility.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Available Time Slots</h4>
                <div className="grid grid-cols-3 gap-2">
                  {facility.availableSlots.map((slot, index) => (
                    <Badge key={index} className="justify-center py-1">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => {
                    onClose();
                    onBook(facility);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Book This Facility
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Success Modal
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="p-6 flex flex-col items-center">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Booking Successful!</h3>
          <p className="text-gray-600 text-center mb-6">
            Your facility booking has been confirmed. A confirmation email has been sent to your account.
          </p>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Component
const Facilities = () => {
  const [selectedCategory, setSelectedCategory] = useState(facilitiesData.categories[0]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    capacity: 0,
    timeOfDay: 'any',
    status: 'any'
  });
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState('grid');
  const [notificationCount, setNotificationCount] = useState(2);

  useEffect(() => {
    // Simulate getting user data
    const timeout = setTimeout(() => {
      setFavorites([101, 301]); // IDs of facilities marked as favorites
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  const handleBooking = (facility) => {
    setSelectedFacility(facility);
    setShowBookingForm(true);
  };

  const handleShowDetails = (facility) => {
    setSelectedFacility(facility);
    setShowDetails(true);
  };

  const handleBookingSubmit = (formData) => {
    // Here you would typically send the booking data to your backend
    console.log('Booking submitted:', { facility: selectedFacility, ...formData });
    setShowBookingForm(false);
    // Show success message
    setShowSuccess(true);
  };

  const filteredFacilities = selectedCategory.facilities.filter(
    facility => {
      // Search filter
      const nameMatch = facility.name.toLowerCase().includes(searchQuery.toLowerCase());
      const locationMatch = facility.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply other filters
      let capacityMatch = true;
      if (filters.capacity > 0) {
        capacityMatch = facility.capacity >= filters.capacity;
      }
      
      let statusMatch = true;
      if (filters.status !== 'any') {
        statusMatch = facility.status === filters.status;
      }
      
      let timeMatch = true;
      if (filters.timeOfDay !== 'any') {
        // This is a simplification. In a real app, you'd have proper time filtering
        if (filters.timeOfDay === 'morning') {
          timeMatch = facility.availableSlots.some(slot => parseInt(slot) < 12);
        } else if (filters.timeOfDay === 'afternoon') {
          timeMatch = facility.availableSlots.some(slot => parseInt(slot) >= 12 && parseInt(slot) < 17);
        } else if (filters.timeOfDay === 'evening') {
          timeMatch = facility.availableSlots.some(slot => parseInt(slot) >= 17);
        }
      }
      
      return (nameMatch || locationMatch) && capacityMatch && statusMatch && timeMatch;
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2">
              <motion.h1 
                className="text-3xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Campus Facilities
              </motion.h1>
              <motion.p 
                className="mt-2 text-lg text-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Book study rooms, labs, and other campus resources
              </motion.p>
              <motion.div 
                className="mt-6 flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  variant="secondary"
                  className="font-semibold shadow-sm"
                >
                  View Availability
                </Button>
                <Button 
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  My Bookings
                </Button>
              </motion.div>
            </div>
            <motion.div 
              className="hidden md:block mt-6 md:mt-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-xl">
                <div className="flex items-center gap-3 text-white mb-3">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Quick Booking Stats</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-md text-center">
                    <div className="text-2xl font-bold">24</div>
                    <div className="text-xs text-blue-100">Available Now</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-md text-center">
                    <div className="text-2xl font-bold">132</div>
                    <div className="text-xs text-blue-100">Weekly Bookings</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-md text-center">
                    <div className="text-2xl font-bold">5</div>
                    <div className="text-xs text-blue-100">Your Bookings</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, location, or amenities..."
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <Badge className="ml-1 bg-blue-100 text-blue-700">
                    {Object.values(filters).filter(val => val !== 'any' && val !== 0).length}
                  </Badge>
                </Button>
                
                {isFilterOpen && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="p-4 border-b">
                      <h3 className="font-medium">Filter Options</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Minimum Capacity</label>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={filters.capacity}
                          onChange={(e) => setFilters({...filters, capacity: parseInt(e.target.value)})}
                        >
                          <option value="0">Any capacity</option>
                          <option value="1">1+ people</option>
                          <option value="5">5+ people</option>
                          <option value="10">10+ people</option>
                          <option value="20">20+ people</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Time of Day</label>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={filters.timeOfDay}
                          onChange={(e) => setFilters({...filters, timeOfDay: e.target.value})}
                        >
                          <option value="any">Any time</option>
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Availability Status</label>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                          <option value="any">Any status</option>
                          <option value="Available">Available</option>
                          <option value="Limited">Limited</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setFilters({
                              capacity: 0,
                              timeOfDay: 'any',
                              status: 'any'
                            });
                          }}
                        >
                          Reset All
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => setIsFilterOpen(false)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="flex items-center border rounded-md overflow-hidden">
                <button 
                  className={`p-2 ${view === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
                  onClick={() => setView('grid')}
                  title="Grid View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button 
                  className={`p-2 ${view === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
                  onClick={() => setView('list')}
                  title="List View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className="relative">
                <Button variant="ghost" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 rounded-full text-white text-xs w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs 
          value={selectedCategory.id.toString()} 
          onValueChange={(value) => setSelectedCategory(facilitiesData.categories.find(cat => cat.id === parseInt(value)))}
          className="mb-8"
        >
          <motion.div 
            className="bg-white p-1 rounded-xl shadow-sm overflow-x-auto hide-scrollbar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TabsList className="inline-flex min-w-full bg-transparent p-1 space-x-1">
              {facilitiesData.categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id.toString()}
                  className={`px-4 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`rounded-md p-1 ${category.color.split(' ')[0]} ${selectedCategory.id === category.id ? 'bg-blue-500 text-white' : category.color}`}>
                      {React.createElement(category.icon, { className: "h-4 w-4" })}
                    </div>
                    {category.name}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {/* Active Tab Description */}
          {selectedCategory && (
            <motion.div 
              className="bg-white rounded-lg p-4 mb-6 shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={selectedCategory.id}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-full p-2 ${selectedCategory.color}`}>
                  {React.createElement(selectedCategory.icon, { className: "h-6 w-6" })}
                </div>
                <div>
                  <h2 className="text-lg font-medium">{selectedCategory.name}</h2>
                  <p className="text-gray-600">{selectedCategory.description}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Facilities Lists */}
          {selectedCategory && (
            <TabsContent value={selectedCategory.id.toString()}>
              {filteredFacilities && filteredFacilities.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                  layout
                >
                  {view === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredFacilities.map((facility) => (
                        <FacilityCard
                          key={facility.id}
                          facility={facility}
                          onBook={handleBooking}
                          showDetails={() => handleShowDetails(facility)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredFacilities.map((facility) => (
                        <motion.div
                          key={facility.id}
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className={`overflow-hidden ${facility.bgColor} border border-gray-200`}>
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-48 aspect-video md:aspect-square relative">
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-600">
                                  <Building className="h-10 w-10 text-white opacity-50" />
                                </div>
                                <div className="absolute top-2 left-2">
                                  <StatusBadge status={facility.status} />
                                </div>
                              </div>
                              <div className="p-4 flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-lg font-semibold">{facility.name}</h3>
                                    <div className="flex items-center gap-1 text-gray-600 mt-1">
                                      <MapPin className="h-4 w-4" />
                                      <span className="text-sm">{facility.location}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="h-4 w-4 fill-yellow-500" />
                                    <span className="font-medium">{facility.rating}</span>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">Capacity: {facility.capacity}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{facility.availableSlots.length} available slots</span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {facility.amenities.slice(0, 3).map((amenity, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                  {facility.amenities.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{facility.amenities.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="p-4 flex flex-row md:flex-col justify-between md:border-l border-gray-200">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleShowDetails(facility)}
                                  className="flex items-center gap-1"
                                >
                                  Details
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleBooking(facility)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Book Now
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-white rounded-lg p-12 text-center">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No facilities found</h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        capacity: 0,
                        timeOfDay: 'any',
                        status: 'any'
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Reset All Filters
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      {/* Popular Facilities Section */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Popular Facilities</h2>
            <p className="text-gray-600 mt-2">Most frequently booked spaces on campus</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {facilitiesData.categories.flatMap(cat => cat.facilities)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3)
              .map(facility => (
                <motion.div
                  key={facility.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                    <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-600">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building className="h-12 w-12 text-white opacity-50" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-semibold text-white">{facility.name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1 text-white/90">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-sm">{facility.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-4 w-4 fill-yellow-400" />
                            <span className="font-medium">{facility.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Capacity: {facility.capacity}</span>
                        </div>
                        <StatusBadge status={facility.status} />
                      </div>
                      <Button 
                        onClick={() => handleBooking(facility)} 
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                      >
                        Quick Book
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Quick Booking Tips */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Booking Tips</h2>
            <p className="text-gray-600 mt-2">Make the most of campus facilities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Book in Advance</h3>
              <p className="text-gray-600">
                Popular facilities fill up quickly. Book at least 48 hours in advance to secure your spot.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Check Availability</h3>
              <p className="text-gray-600">
                Morning slots tend to be less crowded. Choose off-peak hours for a better experience.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Set Reminders</h3>
              <p className="text-gray-600">
                Enable notifications to get reminders about your upcoming bookings and available slots.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedFacility && (
        <>
          <BookingForm
            facility={selectedFacility}
            isOpen={showBookingForm}
            onClose={() => setShowBookingForm(false)}
            onSubmit={handleBookingSubmit}
          />
          
          <FacilityDetails
            facility={selectedFacility}
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
            onBook={handleBooking}
          />
        </>
      )}
      
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default Facilities;