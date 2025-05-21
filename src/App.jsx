import React from 'react'
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
import ComplaintDashboard from './components/features/Complaints/ComplaintDashboard'
import Facilities from './components/features/Facilities/Facilities'
import Layout from './components/layout/Layout'
import ComplaintReview from './components/ComplaintReview'
import FacilityManagement from './components/features/Facilities/FacilityManagement'
import Announcement from './components/Announcement'
import ApplicationForm from './components/features/Applications/ApplicationForm'

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Get role from localStorage or URL path as fallback
  const path = window.location.pathname;
  const defaultRole = path.startsWith('/student') ? 'student' : 
                     path.startsWith('/faculty') ? 'faculty' : 
                     path.startsWith('/admin') ? 'admin' : null;
                     
  const isAuthenticated = true; // localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole') || defaultRole;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4CAF50',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#F44336',
            },
          },
        }}
      />
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
                <Route path="/complaints" element={<ComplaintDashboard />} />
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
                <Route path="/complaintReview" element={<ComplaintReview />} />
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
                <Route path="/complaintReview" element={<ComplaintReview />} />
                <Route path="/announcements" element={<Announcement />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App