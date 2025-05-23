import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../config/firebase';
import ComplaintDashboard from './ComplaintDashboard';
import ComplaintReview from './ComplaintReview';

const Complaints = () => {
  const [user] = useAuthState(auth);

  // Check if user is faculty
  const isFaculty = user?.userProfile?.role === 'faculty';

  return isFaculty ? <ComplaintReview /> : <ComplaintDashboard />;
};

export default Complaints; 