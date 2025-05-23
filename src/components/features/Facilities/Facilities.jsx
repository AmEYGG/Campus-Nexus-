import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Input } from '../../ui/input';
import { motion, AnimatePresence } from 'framer-motion';
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
  Bell,
  TrendingUp
} from 'lucide-react';
import BookingRequestForm from '../Applications/BookingRequestform';
import { database } from '@/config/firebase';
import { ref, onValue, query, orderByChild, equalTo, get } from 'firebase/database';
import { useAuthContext } from '@/providers/AuthProvider';
import { getUserBookings } from '@/services/facilityBookingService';
import { toast } from 'react-hot-toast';

const facilityCategories = [
  {
    id: 'study-rooms',
    name: 'Study Rooms',
    icon: BookOpen,
    description: 'Quiet spaces for individual or group study sessions',
    facilities: [
      {
        id: 'quiet-zone-c',
        name: 'Quiet Study Zone C',
        location: 'Library Floor 1 - East Wing',
        capacity: 8,
        rating: 4.9,
        status: 'Limited',
        image: '/src/components/Images/IMG-20250522-WA0004.jpg',
        type: 'study-rooms',
        amenities: ['Quiet Environment', 'Study Tables', 'Power Outlets', 'WiFi']
      },
      {
        id: 'individual-room-a',
        name: 'Individual Study Room A',
        location: 'Library Floor 2',
        capacity: 1,
        rating: 4.8,
        status: 'Available',
        image: '/src/components/Images/IMG-20250522-WA0005.jpg',
        type: 'study-rooms',
        amenities: ['Private Space', 'Desk', 'Chair', 'WiFi']
      }
    ]
  },
  {
    id: 'computer-labs',
    name: 'Computer Labs',
    icon: Laptop,
    description: 'Fully equipped labs with high-performance computers',
    facilities: [
      {
        id: 'computer-lab-1',
        name: 'Computer Lab 1',
        location: 'Tech Building Floor 1',
        capacity: 30,
        rating: 4.6,
        status: 'Available',
        image: '/src/components/Images/IMG-20250522-WA0006.jpg',
        type: 'computer-labs',
        amenities: ['High-end PCs', 'Software Suite', 'Printing', 'Technical Support']
      }
    ]
  },
  {
    id: 'sports',
    name: 'Sports Facilities',
    icon: Dumbbell,
    description: 'Sports and fitness facilities for physical activities',
    facilities: [
      {
        id: 'swimming-pool',
        name: 'Swimming Pool',
        location: 'Sports Complex - Aquatic Center',
        capacity: 40,
        rating: 4.9,
        status: 'Limited',
        image: '/src/components/Images/IMG-20250522-WA0007.jpg',
        type: 'sports',
        amenities: ['Olympic Size Pool', 'Changing Rooms', 'Lockers', 'Lifeguard']
      }
    ]
  },
  {
    id: 'music-rooms',
    name: 'Music Rooms',
    icon: Music,
    description: 'Practice rooms with instruments for music students',
    facilities: [
      {
        id: 'piano-room',
        name: 'Piano Room',
        location: 'Music Building Floor 1',
        capacity: 3,
        rating: 4.7,
        status: 'Available',
        image: '/src/components/Images/IMG-20250522-WA0008.jpg',
        type: 'music-rooms',
        amenities: ['Grand Piano', 'Sound Proofing', 'Music Stands', 'Recording Equipment']
      }
    ]
  }
];

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

// Quick Stats Card
const QuickStatsCard = ({ icon: Icon, label, value, onClick, className = '' }) => (
  <Card 
    className={`p-4 flex items-center space-x-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    <div className="p-2 rounded-full bg-white bg-opacity-60">
      <Icon className="h-6 w-6 text-gray-900" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  </Card>
);

// Booking Tip Card
const BookingTipCard = ({ icon: Icon, title, description }) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="p-3 rounded-full bg-blue-100 w-fit mb-4">
      <Icon className="h-6 w-6 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </Card>
);

// Updated Facility Card
const FacilityCard = ({ facility, onBook, popular, onStatusChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Booked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-full flex flex-col"
    >
      <div className="h-48 relative">
        {popular && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-blue-100 text-blue-800">
              <TrendingUp className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          </div>
        )}
        <div className="absolute top-2 left-2 z-10">
          <Badge className={getStatusColor(facility.status)}>{facility.status}</Badge>
        </div>
        <img 
          src={facility.image} 
          alt={facility.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/src/components/Images/IMG-20250522-WA0004.jpg';
          }}
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm font-medium">{facility.rating}</span>
          </div>
        </div>
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{facility.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">Capacity: {facility.capacity}</span>
          </div>
          {facility.amenities && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Amenities:</p>
              <div className="flex flex-wrap gap-2">
                {facility.amenities.map((amenity, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-auto">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => onBook(facility)}
          >
            Quick Book
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-gray-600 hover:text-red-600"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
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
          <h3 className="text-xl font-semibold mb-2">Booking Request Submitted!</h3>
          <p className="text-gray-600 text-center mb-6">
            Your booking request has been submitted successfully. You will be notified once it's approved.
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
  const { user } = useAuthContext();
  const [facilities, setFacilities] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [availableFacilities, setAvailableFacilities] = useState(0);

  // Facility images mapping
  const facilityImages = {
    'study-room': '/assets/images/facilities/study-room.jpg',
    'computer-lab': '/assets/images/facilities/computer-lab.jpg',
    'sports-facility': '/assets/images/facilities/sports.jpg',
    'music-room': '/assets/images/facilities/music-room.jpg',
    'auditorium': '/assets/images/facilities/auditorium.jpg',
    'library': '/assets/images/facilities/library.jpg',
  };

  // Function to update facility availability
  const updateFacilityAvailability = (facilityId, newStatus) => {
    setFacilities(prevFacilities => {
      const updatedFacilities = prevFacilities.map(facility => {
        if (facility.id === facilityId) {
          return { ...facility, status: newStatus };
        }
        return facility;
      });
      
      // Update available count
      const availableCount = updatedFacilities.filter(f => f.status === 'Available').length;
      setAvailableFacilities(availableCount);
      
      return updatedFacilities;
    });
  };

  useEffect(() => {
    let unsubscribeNotifications = null;
    let unsubscribeBookings = null;
    
    // Initialize facilities from categories
    const initialFacilities = facilityCategories.reduce((acc, category) => {
      return [...acc, ...category.facilities];
    }, []);
    setFacilities(initialFacilities);
    
    // Calculate initial available count
    const availableCount = initialFacilities.filter(f => f.status === 'Available').length;
    setAvailableFacilities(availableCount);

    // Fetch facilities and their availability
    const facilitiesRef = ref(database, 'facilities');
    const unsubscribeFacilities = onValue(facilitiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const facilitiesData = [];
        let availableCount = 0;
        
        snapshot.forEach((childSnapshot) => {
          const facility = {
            id: childSnapshot.key,
            ...childSnapshot.val(),
            image: facilityImages[childSnapshot.val().type] || '/assets/images/facilities/default.jpg'
          };
          facilitiesData.push(facility);
          
          if (facility.status === 'Available') {
            availableCount++;
          }
        });
        
        setFacilities(facilitiesData);
        setAvailableFacilities(availableCount);
      }
      setLoading(false);
    });

    // Fetch user's bookings and notifications if logged in
    if (user) {
      // Set up real-time listener for bookings
      const bookingsRef = ref(database, 'facilityBookingRequests');
      const userBookingsQuery = query(
        bookingsRef,
        orderByChild('userId'),
        equalTo(user.uid)
      );

      unsubscribeBookings = onValue(userBookingsQuery, (snapshot) => {
        const bookingsData = [];
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            bookingsData.push({
              id: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
          
          // Sort bookings by date
          bookingsData.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date);
            const dateB = new Date(b.createdAt || b.date);
            return dateB - dateA;
          });
        }
        
        setUserBookings(bookingsData);
      }, (error) => {
        console.error('Error fetching bookings:', error);
        setUserBookings([]);
        toast.error('Failed to fetch your bookings');
      });

      // Set up real-time listener for notifications
      const notificationsRef = ref(database, 'notifications');
      const notificationsQuery = query(
        notificationsRef,
        orderByChild('recipient'),
        equalTo(user.uid)
      );
      
      unsubscribeNotifications = onValue(notificationsQuery, (snapshot) => {
        const notificationsData = [];
        let unreadCount = 0;
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const notification = childSnapshot.val();
            // Only include facility-related notifications
            if (notification.type === 'facility' || notification.requestId) {
              notificationsData.push({
                id: childSnapshot.key,
                ...notification
              });
              if (!notification.read) {
                unreadCount++;
              }
            }
          });
          
          // Sort notifications by date
          notificationsData.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          console.log('Facility notifications:', notificationsData); // Debug log
        }
        
        setNotifications(notificationsData);
        setUnreadNotifications(unreadCount);
      }, (error) => {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadNotifications(0);
      });
    } else {
      setUserBookings([]);
      setNotifications([]);
      setUnreadNotifications(0);
    }

    return () => {
      if (unsubscribeFacilities) unsubscribeFacilities();
      if (unsubscribeBookings) unsubscribeBookings();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, [user]);

  const handleBooking = (facility) => {
    setSelectedFacility(facility);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setShowSuccessModal(true);
    // Refresh user bookings
    if (user) {
      const fetchUserBookings = async () => {
        try {
          const bookings = await getUserBookings(user.uid);
          setUserBookings(bookings);
        } catch (error) {
          console.error('Error fetching user bookings:', error);
          toast.error('Failed to refresh your bookings');
        }
      };
      fetchUserBookings();
    }
  };

  // Filter facilities based on search and category
  const filteredFacilities = facilities.filter((facility) => {
    const matchesSearch =
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || facility.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Popular facilities (example implementation)
  const popularFacilities = facilities.slice(0, 3);

  // Notifications Panel Component
  const NotificationsPanel = ({ notifications }) => {
    if (!notifications.length) {
      return (
        <div className="text-center py-4 text-gray-500">
          No facility notifications
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg ${
              notification.read ? 'bg-gray-50' : 'bg-blue-50'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className={`p-2 rounded-full ${
                notification.status === 'approved' ? 'bg-green-100' :
                notification.status === 'rejected' ? 'bg-red-100' :
                'bg-blue-100'
              }`}>
                {notification.status === 'approved' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : notification.status === 'rejected' ? (
                  <X className="w-4 h-4 text-red-600" />
                ) : (
                  <Info className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{notification.title || 'Facility Booking Update'}</h4>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <span className="text-xs text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Facility Booking Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage your facility bookings and check availability</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Quick Stats Cards with enhanced styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QuickStatsCard
            icon={CheckCircle}
            label="Available Now"
            value={availableFacilities}
            className="bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow transform hover:-translate-y-1"
          />
          <QuickStatsCard
            icon={Calendar}
            label="Your Bookings"
            value={userBookings.length}
            onClick={() => setShowBookings(!showBookings)}
            className="bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow transform hover:-translate-y-1 cursor-pointer"
          />
          <QuickStatsCard
            icon={Bell}
            label="Notifications"
            value={unreadNotifications}
            className="bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow transform hover:-translate-y-1"
          />
        </div>

        {/* Popular Facilities Section - Moved up */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {facilities
              .filter(f => f.rating >= 4.5)
              .slice(0, 3)
              .map(facility => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  onBook={handleBooking}
                  popular
                  onStatusChange={(newStatus) => updateFacilityAvailability(facility.id, newStatus)}
                />
              ))}
          </div>
        </section>

        {/* Two Column Layout for Notifications and Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Notifications Panel */}
          {user && (
            <section className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Facility Notifications</h2>
                    {unreadNotifications > 0 && (
                      <Badge className="bg-blue-100 text-blue-800 px-2 py-1">
                        {unreadNotifications} unread
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <NotificationsPanel notifications={notifications} />
                </div>
              </div>
            </section>
          )}

          {/* Active Bookings Panel */}
          {user && userBookings.length > 0 && showBookings && (
            <section className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Your Bookings</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowBookings(false)}
                      className="hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 overflow-y-auto max-h-[500px]">
                  <div className="grid gap-4">
                    {userBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search facilities..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 whitespace-nowrap">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 w-full pb-2">
              <TabsTrigger 
                value="all" 
                className="px-4 py-2 rounded-lg hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                All Facilities
              </TabsTrigger>
              {facilityCategories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex items-center gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities
                  .filter(facility => 
                    facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    facility.location.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(facility => (
                    <FacilityCard
                      key={facility.id}
                      facility={facility}
                      onBook={handleBooking}
                      onStatusChange={(newStatus) => updateFacilityAvailability(facility.id, newStatus)}
                    />
                  ))}
              </div>
            </TabsContent>

            {facilityCategories.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                      <p className="text-gray-500 mt-1">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facilities
                      .filter(facility => 
                        facility.type === category.id &&
                        (facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.location.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map(facility => (
                        <FacilityCard
                          key={facility.id}
                          facility={facility}
                          onBook={handleBooking}
                          onStatusChange={(newStatus) => updateFacilityAvailability(facility.id, newStatus)}
                        />
                      ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Booking Tips Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BookingTipCard
              icon={Calendar}
              title="Book in Advance"
              description="Reserve your space early to ensure availability, especially for popular time slots."
            />
            <BookingTipCard
              icon={Clock}
              title="Check Availability"
              description="Review the facility schedule to find the perfect time for your booking."
            />
            <BookingTipCard
              icon={Bell}
              title="Set Reminders"
              description="Don't forget your booking! Set up notifications to stay on track."
            />
          </div>
        </section>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showBookingForm && selectedFacility && (
          <BookingRequestForm
            facility={selectedFacility}
            onClose={() => setShowBookingForm(false)}
            onSuccess={handleBookingSuccess}
          />
        )}
        {showSuccessModal && (
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Separate BookingCard component for better organization
const BookingCard = ({ booking }) => (
  <Card className="p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-medium text-gray-900">{booking.facilityName}</h3>
        <p className="text-sm text-gray-500">{booking.purpose}</p>
      </div>
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
    </div>
    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex items-center">
        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
        {new Date(booking.date).toLocaleDateString()}
      </div>
      <div className="flex items-center">
        <Clock className="w-4 h-4 mr-2 text-gray-400" />
        {booking.timeSlot}
      </div>
      {booking.statusMessage && (
        <div className="flex items-center text-sm mt-2 p-2 bg-gray-50 rounded">
          <Info className="w-4 h-4 mr-2 text-blue-500" />
          {booking.statusMessage}
        </div>
      )}
    </div>
  </Card>
);

export default Facilities;