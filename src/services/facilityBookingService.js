import { database } from '../config/firebase';
import { ref, push, set, get, update, query, orderByChild, equalTo } from 'firebase/database';

export const createBookingRequest = async (bookingData) => {
  try {
    const bookingsRef = ref(database, 'facilityBookingRequests');
    const newBookingRef = push(bookingsRef);
    
    // Add additional metadata
    const requestData = {
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      userId: bookingData.userId, // Ensure userId is at the root level
      notifications: {
        student: {
          isRead: false,
          message: 'Your booking request has been submitted and is pending approval.'
        },
        admin: {
          isRead: false,
          message: `New facility booking request from ${bookingData.requester}`
        }
      }
    };

    await set(newBookingRef, requestData);

    // Create notification for admin
    const notificationsRef = ref(database, 'notifications');
    const newNotificationRef = push(notificationsRef);
    await set(newNotificationRef, {
      recipient: 'admin',
      title: 'New Facility Booking Request',
      message: `${bookingData.requester} has requested a facility booking for ${bookingData.purpose}`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
      requestId: newBookingRef.key
    });

    return { success: true, bookingId: newBookingRef.key };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: error.message };
  }
};

export const getUserBookings = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const bookingsRef = ref(database, 'facilityBookingRequests');
    
    // Create a query to fetch user's bookings
    const userBookingsQuery = query(
      bookingsRef,
      orderByChild('userId'),
      equalTo(userId)
    );

    // Fetch the data
    const snapshot = await get(userBookingsQuery);
    const bookings = [];

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const booking = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        bookings.push(booking);
      });

      // Sort bookings by date, most recent first
      bookings.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
    }

    return bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

export const getPendingBookings = async () => {
  try {
    const bookingsRef = ref(database, 'facilityBookingRequests');
    
    // Create a query to fetch pending bookings
    const pendingBookingsQuery = query(
      bookingsRef,
      orderByChild('status'),
      equalTo('pending')
    );
    
    const snapshot = await get(pendingBookingsQuery);
    const bookings = [];

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const booking = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        bookings.push(booking);
      });

      // Sort bookings by date, most recent first
      bookings.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
    }

    return bookings;
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId, status, message) => {
  try {
    const bookingRef = ref(database, `facilityBookingRequests/${bookingId}`);
    const snapshot = await get(bookingRef);

    if (!snapshot.exists()) {
      throw new Error('Booking not found');
    }

    const booking = snapshot.val();
    const updates = {
      status,
      updatedAt: new Date().toISOString(),
      statusMessage: message
    };

    await update(bookingRef, updates);

    // Create notification for the user
    const notificationsRef = ref(database, 'notifications');
    const newNotificationRef = push(notificationsRef);
    await set(newNotificationRef, {
      recipient: booking.userId,
      title: `Booking Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message,
      type: status === 'approved' ? 'success' : 'error',
      read: false,
      createdAt: new Date().toISOString(),
      requestId: bookingId
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { success: false, error: error.message };
  }
}; 