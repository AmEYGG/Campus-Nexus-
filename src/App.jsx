import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import Landing from './Pages/Landing'
import Login from './components/Login'
import Signup from './components/Signup'
import StudentDashboard from './components/dashboards/StudentDashboard'
import Budget from './components/features/Budget/Budget'
import FacultyDashboard from './components/dashboards/FacultyDashboard'
import AdminDashboard from './components/dashboards/AdminDashboard'
import ElectionDashboard from './components/features/Elections/ElectionDashboard'
import ElectionAdministration from './components/features/Elections/ElectionAdministration'
import FundManagement from './components/features/FundManagement/FundManagement'
import ApplicationManagement from './components/ApplicationManagement'
import FacilityBooking from './components/features/Facilities/FacilityBooking'
import ApplicationDashboard from './components/features/Applications/ApplicationDashboard'
import Complaints from './components/features/Complaints/Complaints'
import Facilities from './components/features/Facilities/Facilities'
import Layout from './components/layout/Layout'
import ComplaintReview from './components/features/Complaints/ComplaintReview'
import FacilityManagement from './components/features/Facilities/FacilityManagement'
import Announcement from './components/Announcement'
import ApplicationForm from './components/features/Applications/ApplicationForm'
import { firebaseAuthService } from './services/firebaseAuth.service'
import { AuthProvider } from './providers/AuthProvider'

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await firebaseAuthService.getCurrentUser();
        console.log('Current user:', currentUser);
        
        if (currentUser && currentUser.userProfile) {
          console.log('User profile found:', currentUser.userProfile);
          setIsAuthenticated(true);
          setUserRole(currentUser.userProfile.role.toLowerCase());
          // Update localStorage to match Firebase auth state
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', currentUser.userProfile.role.toLowerCase());
        } else {
          // Try to get role from localStorage as fallback
          const storedRole = localStorage.getItem('userRole');
          const storedProfile = localStorage.getItem('userProfile');
          
          if (storedRole && storedProfile) {
            console.log('Using stored role:', storedRole);
            setIsAuthenticated(true);
            setUserRole(storedRole.toLowerCase());
          } else {
            console.log('No authentication found');
            setIsAuthenticated(false);
            setUserRole(null);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userProfile');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userProfile');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log('Role not allowed:', userRole, 'Allowed roles:', allowedRoles);
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'faculty':
        return <Navigate to="/faculty" />;
      case 'student':
        return <Navigate to="/student" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Student Routes */}
            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<StudentDashboard />} />
                    <Route path="/elections" element={<ElectionDashboard />} />
                    <Route path="/Budget" element={<Budget />} />
                    <Route path="/facilities" element={<Facilities />} />
                    <Route path="/applications" element={<ApplicationDashboard />} />
                    <Route path="/applications/new" element={<ApplicationForm />} />
                    <Route path="/complaints" element={<Complaints />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Faculty Routes */}
            <Route path="/faculty/*" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<FacultyDashboard />} />
                    <Route path="/election-administration" element={<ElectionAdministration />} />
                    <Route path="/fund-management" element={<FundManagement />} />
                    <Route path="/facilities-management" element={<FacilityManagement />} />
                    <Route path="/ApplicationManagement" element={<ApplicationManagement />} />
                    <Route path="/complaints" element={<Complaints />} />
                    <Route path="/complaints/review" element={<ComplaintReview />} />
                    <Route path="/announcements" element={<Announcement />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/election-administration" element={<ElectionAdministration />} />
                    <Route path="/fund-management" element={<FundManagement />} />
                    <Route path="/facilities-management" element={<FacilityManagement />} />
                    <Route path="/ApplicationManagement" element={<ApplicationManagement />} />
                    <Route path="/complaints" element={<Complaints />} />
                    <Route path="/complaint-review" element={<ComplaintReview />} />
                    <Route path="/announcements" element={<Announcement />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  )
}

export default App