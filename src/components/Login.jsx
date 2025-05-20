import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student' // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (formData.email && formData.password) {
        localStorage.setItem('userRole', formData.role);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Redirect based on role
        switch (formData.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'faculty':
            navigate('/faculty');
            break;
          case 'student':
            navigate('/student');
            break;
          default:
            navigate('/student');
        }
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Role-based color configurations
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
        return {
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          accent: 'text-blue-600'
        };
      default:
        return {
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          accent: 'text-blue-600'
        };
    }
  };

  const roleColors = getRoleColors();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 transform -skew-y-6 -translate-y-24 z-0 opacity-10"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl z-10 relative overflow-hidden">
        {/* Decorative Elements */}
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
                  required
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="flex justify-end mt-1">
                <button type="button" className="text-sm text-gray-500 hover:text-gray-700">
                  Forgot password?
                </button>
              </div>
            </div>
            
            <div className="relative">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
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
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.0003 2C6.47731 2 2.00031 6.477 2.00031 12C2.00031 16.991 5.65731 21.128 10.4373 21.879V14.89H7.89931V12H10.4373V9.797C10.4373 7.291 11.9323 5.907 14.2153 5.907C15.3103 5.907 16.4543 6.102 16.4543 6.102V8.562H15.1913C13.9513 8.562 13.5633 9.333 13.5633 10.124V12H16.3363L15.8933 14.89H13.5633V21.879C18.3433 21.129 22.0003 16.99 22.0003 12C22.0003 6.477 17.5233 2 12.0003 2Z" />
            </svg>
          </button>
          <button
            type="button"
            className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          <button
            type="button"
            className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.503 15.424c-1.2.923-2.576 1.037-3.118 1.059-.654-.022-2.606-.045-3.978-1.976-1.047-1.423-1.644-3.68-1.468-5.843.187-2.256 1.17-4.053 2.643-4.955 1.136-.704 2.14-.612 3.342-.404.603.107 1.888.404 2.69 1.245-2.41.485-2.006 2.872-.443 3.432 1.578.561 3.13-.656 3.578-1.93.448-1.275-.02-2.903-1.99-3.526-.637-.22-1.443-.353-2.531-.391C9.973 1.96 6.71 5.145 6.285 9.776c-.052 2.99 1.157 6.045 3.516 7.1 2.359 1.057 5.676.182 7.213-1.920.325-.434 1.43-2.073.722-3.597-.707-1.525-2.237-2.27-4.233-.934z" />
            </svg>
          </button>
        </div>
        
        <div className="text-center pt-2">
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
