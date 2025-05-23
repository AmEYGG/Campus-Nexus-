import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { 
  User, 
  Mail, 
  Lock, 
  AlertCircle, 
  UserPlus, 
  Briefcase, 
  GraduationCap, 
  Building, 
  CheckCircle
} from 'lucide-react';
import { firebaseAuthService } from '../services/firebaseAuth.service';

const Signup = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '', // Only for students
    facultyId: '', // Only for faculty
    department: '' // For faculty and admin
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        department: formData.department || null,
        ...(formData.role === 'student' && { studentId: formData.studentId }),
        ...(formData.role === 'faculty' && { facultyId: formData.facultyId }),
      };
      
      // Firebase Auth registration using the service
      const user = await firebaseAuthService.register(registrationData);
      
      console.log('User registered successfully:', user);
      setIsRegistered(true);

      // Optional: Automatically navigate to login after a few seconds
      // setTimeout(() => {
      //   navigate('/login');
      // }, 5000);

    } catch (err) {
      console.error('Registration failed:', err);
      if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
          <p className="text-gray-600">
            Your account has been created. Please check your email to verify your account before logging in.
          </p>
          <button 
            onClick={() => navigate('/login')} // Navigate to login
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const getRoleConfig = () => {
    switch (formData.role) {
      case 'admin':
        return {
          button: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
          accent: 'text-purple-600',
          bg: 'bg-purple-100',
          icon: <Building className="h-8 w-8 text-purple-600" />,
          roleTitle: 'Administrator'
        };
      case 'faculty':
        return {
          button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
          accent: 'text-emerald-600',
          bg: 'bg-emerald-100',
          icon: <Briefcase className="h-8 w-8 text-emerald-600" />,
          roleTitle: 'Faculty Member'
        };
      case 'student':
        return {
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          accent: 'text-blue-600',
          bg: 'bg-blue-100',
          icon: <GraduationCap className="h-8 w-8 text-blue-600" />,
          roleTitle: 'Student'
        };
      default:
        return {
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          accent: 'text-blue-600',
          bg: 'bg-blue-100',
          icon: <GraduationCap className="h-8 w-8 text-blue-600" />,
          roleTitle: 'Student'
        };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 transform -skew-y-6 -translate-y-24 opacity-10"></div>
      
      <div className="max-w-lg w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-bl-full opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-tr-full opacity-70"></div>
        
        <div className="relative">
          <div className="flex justify-center">
            <div className={`p-3 rounded-full ${roleConfig.bg}`}>
              {roleConfig.icon}
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Register as a new {roleConfig.roleTitle.toLowerCase()}
          </p>
        </div>
        
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
              <select
                id="role"
                name="role"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="admin">Administrator</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6"> {/* Adjusted pt-6 for label */}
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            {formData.role === 'student' && (
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    required
                    className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your student ID"
                    value={formData.studentId}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {formData.role === 'faculty' && (
              <div>
                <label htmlFor="facultyId" className="block text-sm font-medium text-gray-700 mb-1">Faculty ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="facultyId"
                    name="facultyId"
                    type="text"
                    required
                    className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your faculty ID"
                    value={formData.facultyId}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="department"
                  name="department"
                  type="text"
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength 
                            ? passwordStrength === 1 ? 'bg-red-500' 
                            : passwordStrength === 2 ? 'bg-yellow-500' 
                            : passwordStrength === 3 ? 'bg-blue-500' 
                            : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {passwordStrength === 0 && formData.password && 'Very weak password'}
                    {passwordStrength === 1 && 'Weak password'}
                    {passwordStrength === 2 && 'Medium strength password'}
                    {passwordStrength === 3 && 'Strong password'}
                    {passwordStrength === 4 && 'Very strong password'}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    Password should include uppercase, lowercase, numbers, and special characters.
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the <span className={`font-medium ${roleConfig.accent} cursor-pointer hover:underline`}>Terms of Service</span> and <span className={`font-medium ${roleConfig.accent} cursor-pointer hover:underline`}>Privacy Policy</span>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${roleConfig.button} focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                (loading || (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)) 
                  ? 'opacity-70 cursor-not-allowed' 
                  : ''
              }`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <UserPlus className="h-4 w-4 text-white opacity-75" />
                )}
              </span>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')} // Navigate to login
              className={`font-medium ${roleConfig.accent} hover:underline transition-colors duration-150`}
            >
              Sign in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;