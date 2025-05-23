import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { firebaseAuthService } from '../services/firebaseAuth.service';
import toast from 'react-hot-toast';
import GoogleProfileCompletion from './GoogleProfileCompletion';
import ResetPassword from './ResetPassword';
import { createLoginNotification } from '../utils/notificationUtils';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    // role is only for UI styling here, actual role will come from user profile
    role: 'student' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [googleSignInState, setGoogleSignInState] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginResponse = await firebaseAuthService.login(formData.email, formData.password);
      
      console.log('Full login response:', loginResponse);
      
      // Extract auth user and userProfile
      const authUser = loginResponse.authUser;
      const userProfile = loginResponse.userProfile;
      console.log('User profile:', userProfile);
      
      // Check if role exists in userProfile
      if (!userProfile || !userProfile.role) {
        console.error('Role not found in user profile:', userProfile);
        setError('Login failed: User role not found. Please contact support.');
        await firebaseAuthService.logout();
        setLoading(false);
        return;
      }

      console.log('User role:', userProfile.role);

      // Get the authentication token and store it in localStorage
      if (authUser && authUser.getIdToken) {
        const idToken = await authUser.getIdToken();
        localStorage.setItem('token', idToken);
        console.log('Firebase ID token stored in localStorage');
      }
      
      // Create login notification
      await createLoginNotification(authUser);

      // Store user profile and role in localStorage
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      localStorage.setItem('userRole', userProfile.role);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Redirect based on role
      handleRoleBasedNavigation(userProfile.role);
      
      toast.success('Login successful!');
    } catch (err) {
      console.error('Login failed:', err);
      if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleBasedNavigation = (role) => {
    console.log('Navigating based on role:', role);
    
    // Store the role in localStorage for the ProtectedRoute component
    localStorage.setItem('userRole', role);
    localStorage.setItem('isAuthenticated', 'true');

    // Navigate to the correct route based on role
    switch (role.toLowerCase()) {
      case 'admin':
        console.log('Redirecting to admin dashboard');
        navigate('/admin');
        break;
      case 'faculty':
        console.log('Redirecting to faculty dashboard');
        navigate('/faculty');
        break;
      case 'student':
        console.log('Redirecting to student dashboard');
        navigate('/student');
        break;
      default:
        console.warn(`Unknown role "${role}" found. Defaulting to student dashboard.`);
        navigate('/student');
    }
  };

  // Role-based color configurations (driven by dropdown for UI pre-login)
  const getRoleColors = () => {
    switch (formData.role) {
      case 'admin':
        return {
          button: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
          accent: 'text-purple-600'
        };
      case 'faculty':
        return {
          button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
          accent: 'text-emerald-600'
        };
      case 'student':
      default:
        return {
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          accent: 'text-blue-600'
        };
    }
  };

  const roleColors = getRoleColors();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const result = await firebaseAuthService.signInWithGoogle();
      
      if (result.needsProfileCompletion) {
        // Store the Google sign-in state for profile completion
        setGoogleSignInState({
          user: result.authUser,
          tempProfile: result.userProfile
        });
         // Also store the token for potential API calls during profile completion if needed
        if (result.authUser && result.authUser.getIdToken) {
           const idToken = await result.authUser.getIdToken();
           localStorage.setItem('token', idToken);
           console.log('Firebase ID token stored in localStorage after Google sign-in (needs completion)');
        }
      } else {
        // Existing user, proceed with normal navigation
        // Store the token
        if (result.authUser && result.authUser.getIdToken) {
           const idToken = await result.authUser.getIdToken();
           localStorage.setItem('token', idToken);
           console.log('Firebase ID token stored in localStorage after Google sign-in (existing user)');
        }
        handleRoleBasedNavigation(result.userProfile.role);
        toast.success('Successfully signed in with Google!');
      }
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
      toast.error(err.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleProfileCompletion = (completedProfile) => {
    setGoogleSignInState(null);
    // The token should already be in localStorage from handleGoogleSignIn
    handleRoleBasedNavigation(completedProfile.role);
  };

  const handleShowResetPassword = () => {
    setShowResetPassword(true);
    setError('');
  };

  // If we have Google sign-in state, show the profile completion form
  if (googleSignInState) {
    return (
      <GoogleProfileCompletion
        user={googleSignInState.user}
        tempProfile={googleSignInState.tempProfile}
        onComplete={handleProfileCompletion}
      />
    );
  }

  // If showResetPassword is true, render the ResetPassword component and pass the prop
  if (showResetPassword) {
    return <ResetPassword onBackToLogin={() => setShowResetPassword(false)} />;
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');

    try {
      await firebaseAuthService.resetPassword(resetEmail);
      toast.success('Password reset email sent! Please check your inbox.');
      setShowResetPassword(false);
      setResetEmail('');
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 transform -skew-y-6 -translate-y-24 z-0 opacity-10"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl z-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-bl-full opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-tr-full opacity-70"></div>
        
        <div className="relative">
          <div className="flex justify-center">
            <div className={`p-3 rounded-full ${formData.role === 'admin' ? 'bg-purple-100' : formData.role === 'faculty' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
              <User 
                className={`h-8 w-8 ${formData.role === 'admin' ? 'text-purple-600' : formData.role === 'faculty' ? 'text-emerald-600' : 'text-blue-600'}`}
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your {formData.role === 'admin' ? 'administrator' : formData.role} account
          </p>
        </div>
        
        {!showResetPassword ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <button 
                    type="button" 
                    onClick={handleShowResetPassword}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Select your role (for UI)</label>
                <select
                  id="role"
                  name="role"
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out appearance-none bg-none"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="admin">Administrator</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${roleColors.button} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out`}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <Lock className="h-4 w-4 text-white opacity-75" />
                  )}
                </span>
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && (
                  <ArrowRight className="ml-2 h-4 w-4 text-white opacity-75 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="relative">
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
                >
                  Back to login
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                  {resetLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || showResetPassword}
            className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>
        
        <div className="text-center pt-2 mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className={`font-medium ${roleColors.accent} hover:underline transition-colors duration-150`}
            >
              Sign up now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;