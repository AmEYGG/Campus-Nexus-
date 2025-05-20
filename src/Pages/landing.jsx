import React from "react";
import { BookOpen, Users, Calendar, Bell, ChevronRight, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();

  // Features section data
  const features = [
    {
      icon: <User className="h-8 w-8 text-blue-500" />,
      title: "Role Based Access",
      description: "Role-Based Access Control ensures that users can only access pages and features based on their assigned roles."
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Campus Community",
      description: "Connect with classmates, join groups, and collaborate on projects."
    },
    {
      icon: <Calendar className="h-8 w-8 text-purple-500" />,
      title: "Event Calendar",
      description: "Stay updated with campus events, deadlines, and important dates."
    },
    {
      icon: <Bell className="h-8 w-8 text-yellow-500" />,
      title: "Notifications",
      description: "Get real-time alerts for announcements, grades, and deadlines."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-blue-100 opacity-60 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-purple-100 opacity-60 blur-3xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-16 md:py-24">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xl">CN</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">Campus-Nexus</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </nav>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
                Connect Your <span className="text-blue-600">Campus</span> Life
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                The all-in-one platform for students and faculty to communicate, collaborate, and connect across campus.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                >
                  Login
                </button>
                
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </button>
              </div>
              
              <div className="mt-8 flex items-center">
                <div className="flex -space-x-2 mr-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className={`h-8 w-8 rounded-full border-2 border-white bg-blue-${item*100}`}></div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">10,000+</span> students using Campus-Nexus
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="relative">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Announcements</h3>
                      <p className="text-sm text-gray-500">Latest campus news</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-medium">Campus Event {item}</p>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Sample announcement text goes here...</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 h-20 w-20 bg-blue-100 rounded-lg -z-10"></div>
                <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-purple-100 rounded-lg -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Campus Life Made Simple</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to navigate your campus experience in one intuitive platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div id="testimonials" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">What Students Are Saying</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from students and faculty who have transformed their campus experience with Campus-Nexus.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className={`h-10 w-10 rounded-full bg-blue-${item*100} mr-3`}></div>
                  <div>
                    <h3 className="font-medium">Student Name</h3>
                    <p className="text-sm text-gray-500">Computer Science, Junior</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Campus-Nexus has completely transformed how I interact with my courses and classmates. 
                  Everything I need is now in one place!"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div id="contact" className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Campus Experience?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students and faculty who are already connecting and collaborating with Campus-Nexus.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">CN</span>
                </div>
                <span className="text-xl font-bold">Campus-Nexus</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">Connecting campus communities</p>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>© 2025 Campus-Nexus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;