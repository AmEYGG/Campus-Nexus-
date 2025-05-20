import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users,
  Vote,
  BarChart2,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  PieChart,
  Building,
  FileText,
  Settings,
  LogOut,
  Book,
  Calendar,
  Trophy,
  Star,
  Award,
  TrendingUp,
  Activity,
  Shield,
  Medal
} from 'lucide-react';

const ElectionDashboard = () => {
  const [activeElection, setActiveElection] = useState('student-council');
  const [timeRemaining, setTimeRemaining] = useState({ days: 3, hours: 14, minutes: 32 });
  const [liveUpdate, setLiveUpdate] = useState(true);
  const navigate = useNavigate();

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => ({
        ...prev,
        minutes: prev.minutes > 0 ? prev.minutes - 1 : 59,
        hours: prev.minutes === 0 && prev.hours > 0 ? prev.hours - 1 : prev.hours
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const elections = [
    {
      id: 'student-council',
      title: 'Student Council Election 2024',
      status: 'active',
      endDate: '2024-03-15',
      totalVotes: 450,
      eligibleVoters: 1200,
      candidates: [
        {
          id: 1,
          name: 'Sarah Johnson',
          position: 'President',
          year: '3rd Year',
          department: 'Computer Science',
          votes: 195,
          percentage: 43,
          manifesto: 'Building a more inclusive campus community with enhanced student services, better mental health support, and sustainable infrastructure development.',
          experience: '2 years as Class Representative',
          achievements: ['Dean\'s List', 'Student Leader'],
          image: '/api/placeholder/150/150',
          trending: 'up'
        },
        {
          id: 2,
          name: 'Michael Chen',
          position: 'President',
          year: '3rd Year',
          department: 'Electrical Engineering',
          votes: 165,
          percentage: 37,
          manifesto: 'Improving campus facilities and student services through innovative technology solutions and better infrastructure.',
          experience: '1 year as Department Representative',
          achievements: ['Academic Excellence', 'Tech Innovation Award'],
          image: '/api/placeholder/150/150',
          trending: 'down'
        },
        {
          id: 3,
          name: 'Emma Rodriguez',
          position: 'President',
          year: '4th Year',
          department: 'Business Administration',
          votes: 90,
          percentage: 20,
          manifesto: 'Fostering entrepreneurship and creating better career opportunities for all students.',
          experience: '3 years in Student Organizations',
          achievements: ['Leadership Award', 'Community Service'],
          image: '/api/placeholder/150/150',
          trending: 'up'
        }
      ]
    }
  ];

  const selectedElection = elections.find(e => e.id === activeElection);

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-white opacity-5 rounded-full"></div>
        <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
        
        <div className="relative px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Live Results
                  </span>
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Student Elections 2024
                </h1>
                <p className="text-blue-100 text-xl font-medium">Your voice shapes our future</p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Real-time updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Secure voting</span>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-3">
                <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-4xl font-bold">38%</div>
                  <div className="text-blue-100 text-sm font-medium">Voter Turnout</div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full w-9/24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 -mt-8">
            {/* Time Remaining Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100">
                  <Clock className="h-7 w-7 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Time Remaining</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-gray-900">{timeRemaining.days}</span>
                  <span className="text-sm text-gray-600">d</span>
                  <span className="text-2xl font-bold text-gray-700">{timeRemaining.hours}</span>
                  <span className="text-sm text-gray-600">h</span>
                  <span className="text-xl font-bold text-gray-600">{timeRemaining.minutes}</span>
                  <span className="text-sm text-gray-600">m</span>
                </div>
              </div>
            </div>

            {/* Total Votes Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100">
                  <Users className="h-7 w-7 text-blue-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Votes</p>
                <p className="text-3xl font-bold text-gray-900">{selectedElection.totalVotes.toLocaleString()}</p>
                <p className="text-sm text-green-600 font-medium">+23 in last hour</p>
              </div>
            </div>

            {/* Candidates Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-violet-100">
                  <BarChart2 className="h-7 w-7 text-purple-600" />
                </div>
                <Medal className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Candidates</p>
                <p className="text-3xl font-bold text-gray-900">{selectedElection.candidates.length}</p>
                <p className="text-sm text-purple-600 font-medium">Presidential race</p>
              </div>
            </div>

            {/* Leading Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100">
                  <Trophy className="h-7 w-7 text-yellow-600" />
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-yellow-600 font-bold">LIVE</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Current Leader</p>
                <p className="text-lg font-bold text-gray-900">{selectedElection.candidates[0].name}</p>
                <p className="text-sm text-yellow-600 font-medium">{selectedElection.candidates[0].percentage}% support</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Enhanced Presidential Candidates */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Vote className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Presidential Candidates</h2>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-700 font-semibold">Voting Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-8">
                    {selectedElection.candidates.map((candidate, index) => (
                      <div key={candidate.id} className="group relative border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300">
                        {/* Candidate Ranking Badge */}
                        <div className="absolute -top-3 -left-3 z-10">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                            'bg-gradient-to-r from-orange-400 to-orange-600'
                          }`}>
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex items-start space-x-6">
                          <div className="relative">
                            <img
                              src={candidate.image}
                              alt={candidate.name}
                              className="w-28 h-28 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-lg">
                              {getTrendIcon(candidate.trending)}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                                  {index === 0 && (
                                    <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                                      <Trophy className="h-3 w-3 text-yellow-600 mr-1" />
                                      <span className="text-xs font-bold text-yellow-700">LEADING</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-gray-600 font-medium">
                                  {candidate.position} • {candidate.year} • {candidate.department}
                                </p>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center bg-blue-50 px-2 py-1 rounded-lg">
                                    <Star className="h-3 w-3 text-blue-500 mr-1" />
                                    <span className="text-xs text-blue-700 font-medium">{candidate.experience}</span>
                                  </div>
                                  <div className="flex space-x-2">
                                    {candidate.achievements.map((achievement, idx) => (
                                      <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-medium">
                                        {achievement}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center group">
                                <Vote className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                                <span className="font-semibold">Vote Now</span>
                              </button>
                            </div>
                            
                            <p className="text-gray-700 mb-6 line-clamp-3 leading-relaxed">{candidate.manifesto}</p>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 font-medium">Current Support</span>
                                <div className="flex items-center space-x-2">
                                  {getTrendIcon(candidate.trending)}
                                  <span className="font-bold text-gray-900 text-lg">
                                    {candidate.votes.toLocaleString()} votes ({candidate.percentage}%)
                                  </span>
                                </div>
                              </div>
                              <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                                    index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                    index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                    'bg-gradient-to-r from-purple-500 to-purple-600'
                                  }`}
                                  style={{ width: `${candidate.percentage}%` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Enhanced Live Results */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-green-100">
                        <BarChart2 className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Live Results</h3>
                    </div>
                    <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-700 font-bold">LIVE</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {selectedElection.candidates.map((candidate, index) => (
                      <div key={candidate.id} className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                          index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                          index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                          'bg-gradient-to-r from-purple-500 to-purple-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-bold text-gray-900">{candidate.name}</p>
                            <div className="flex items-center space-x-1">
                              {getTrendIcon(candidate.trending)}
                              <span className="text-sm font-bold text-gray-900">{candidate.percentage}%</span>
                            </div>
                          </div>
                          <div className="relative w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-1000 ${
                                index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                                index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                                'bg-gradient-to-r from-purple-500 to-purple-600'
                              }`}
                              style={{ width: `${candidate.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Election Information */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-lg font-bold text-gray-900">Election Information</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Election Period</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">Mar 1-15, 2024</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-green-100">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Eligible Voters</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{selectedElection.eligibleVoters.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Vote className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Votes Cast</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{selectedElection.totalVotes.toLocaleString()}</span>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Turnout Progress</span>
                        <span className="text-sm font-bold text-blue-700">38%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Voting Guidelines */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h3 className="text-lg font-bold text-gray-900">Voting Guidelines</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="p-1 rounded-full bg-blue-100">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
                        All registered students are eligible to vote once in each election
                      </p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-xl border border-green-100">
                      <div className="p-1 rounded-full bg-green-100">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
                        Your vote remains confidential and secure with end-to-end encryption
                      </p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="p-1 rounded-full bg-purple-100">
                        <Activity className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
                        Results are announced immediately after the election closes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionDashboard;