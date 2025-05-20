import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Calendar, FileText, Users, Bell, BarChart3, Vote, DollarSign, ClipboardList, 
  MessageSquare, PlusCircle, PieChart, ChevronDown, X, CheckCircle, 
  ArrowRight, Book, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar, Legend
} from 'recharts';

// Enhanced data with more records and details
const electionData = [
  { name: 'Student Council', votes: 1245, eligible: 2500, turnout: 49.8 },
  { name: 'Class Representatives', votes: 892, eligible: 1500, turnout: 59.5 },
  { name: 'Department Heads', votes: 156, eligible: 200, turnout: 78.0 },
  { name: 'Faculty Senate', votes: 89, eligible: 120, turnout: 74.2 },
  { name: 'Club Presidents', votes: 342, eligible: 570, turnout: 60.0 }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Enhanced mock data with extra details and improved presentation
const budgetTrends = [
  { month: 'Jan', requested: 12000, approved: 10000, allocated: 9500 },
  { month: 'Feb', requested: 15000, approved: 12000, allocated: 11800 },
  { month: 'Mar', requested: 18000, approved: 17000, allocated: 16500 },
  { month: 'Apr', requested: 14000, approved: 13000, allocated: 12800 },
  { month: 'May', requested: 20000, approved: 18000, allocated: 17500 },
  { month: 'Jun', requested: 22000, approved: 19000, allocated: 18700 }
];

const facilityUsage = [
  { facility: 'Auditorium', usage: 85, capacity: 500, events: 12 },
  { facility: 'Labs', usage: 72, capacity: 120, events: 26 },
  { facility: 'Sports Fields', usage: 68, capacity: 200, events: 18 },
  { facility: 'Library', usage: 91, capacity: 300, events: 31 },
  { facility: 'Seminar Rooms', usage: 78, capacity: 150, events: 22 },
  { facility: 'Student Center', usage: 88, capacity: 350, events: 29 }
];

const applicationStats = [
  { type: 'Scholarship', pending: 8, approved: 32, rejected: 5 },
  { type: 'Event Proposal', pending: 6, approved: 18, rejected: 2 },
  { type: 'Research Grant', pending: 12, approved: 15, rejected: 4 },
  { type: 'Club Formation', pending: 3, approved: 7, rejected: 1 },
  { type: 'Travel Request', pending: 5, approved: 9, rejected: 3 }
];

const feedbackMetrics = [
  { category: 'Course Content', score: 4.2, responses: 215 },
  { category: 'Faculty Teaching', score: 4.5, responses: 198 },
  { category: 'Infrastructure', score: 3.8, responses: 176 },
  { category: 'Administration', score: 4.1, responses: 142 },
  { category: 'Student Services', score: 4.3, responses: 189 },
  { category: 'Campus Life', score: 4.7, responses: 205 }
];

const reportData = [
  { name: 'Jan', academic: 12, administrative: 8, facilities: 5 },
  { name: 'Feb', academic: 15, administrative: 10, facilities: 7 },
  { name: 'Mar', academic: 9, administrative: 6, facilities: 3 },
  { name: 'Apr', academic: 18, administrative: 12, facilities: 9 },
  { name: 'May', academic: 14, administrative: 9, facilities: 6 },
  { name: 'Jun', academic: 20, administrative: 15, facilities: 11 }
];

// Quick action types map to their corresponding visuals
const actionToVisualMap = {
  'election': 'election',
  'budget': 'budget',
  'facility': 'facility',
  'application': 'application',
  'feedback': 'feedback',
  'report': 'report'
};

const StudentDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedVisual, setSelectedVisual] = useState('');
  const [activeAction, setActiveAction] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setUserData({
        name: 'Alex Johnson',
        title: 'Undergraduate Student',
        department: 'Computer Science',
        year: '3rd Year',
        studentId: 'STU123456',
        avatar: '/api/placeholder/150/150'
      });
      
      // Initialize notifications
      setNotifications([
        {
          id: 1,
          type: 'election',
          title: 'Election Reminder',
          message: 'Student Council election ends in 24 hours',
          time: '2 hours ago',
          icon: <Vote className="h-4 w-4 text-blue-600" />,
          color: 'blue'
        },
        {
          id: 2,
          type: 'budget',
          title: 'Budget Approved',
          message: 'Your department budget has been approved for Q2',
          time: '9 hours ago',
          icon: <DollarSign className="h-4 w-4 text-green-600" />,
          color: 'green'
        },
        {
          id: 3,
          type: 'application',
          title: 'Application Pending',
          message: '3 research proposals require your review',
          time: '1 day ago',
          icon: <FileText className="h-4 w-4 text-amber-600" />,
          color: 'amber'
        },
        {
          id: 4,
          type: 'facility',
          title: 'Facility Maintenance',
          message: 'Computer Lab 3 scheduled for maintenance this weekend',
          time: '2 days ago',
          icon: <Calendar className="h-4 w-4 text-purple-600" />,
          color: 'purple'
        },
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickAction = (actionType) => {
    setActiveAction(actionType);
    setSelectedVisual(actionToVisualMap[actionType]);
    setTimeout(() => {
      document.getElementById('visuals-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const handleSubmitAction = () => {
    // Show success notification
    const message = `Your ${activeAction} has been submitted successfully!`;
    setNotificationMessage(message);
    setShowNotification(true);
    
    // Auto hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
    
    // Add new notification to the list
    const newNotification = {
      id: notifications.length + 1,
      type: activeAction,
      title: `New ${activeAction}`,
      message: `Your ${activeAction} request has been submitted and is pending review`,
      time: 'Just now',
      icon: actionToVisualMap[activeAction],
      color: getColorForAction(activeAction)
    };
    
    setNotifications([newNotification, ...notifications]);
  };
  
  const getColorForAction = (action) => {
    switch(action) {
      case 'election': return 'blue';
      case 'budget': return 'green';
      case 'facility': return 'purple';
      case 'application': return 'amber';
      case 'feedback': return 'rose';
      case 'report': return 'cyan';
      default: return 'gray';
    }
  };

  const handleNotificationClick = (type) => {
    setSelectedVisual(type);
    
    // Auto scroll to visuals section
    setTimeout(() => {
      document.getElementById('visuals-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const MetricCard = ({ title, value, subtitle, icon, color, trend }) => (
    <Card className={`rounded-xl shadow-md border-l-4 border-${color}-500 flex flex-col items-center justify-center text-center h-full transition-all duration-300 hover:shadow-lg hover:scale-105`}> 
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center justify-center mb-2">
          <div className={`p-3 rounded-full bg-${color}-100 mb-2 flex items-center justify-center`}>{icon}</div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {trend !== undefined && (
          <div className="flex items-center justify-center mt-2">
            <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              {trend > 0 ? <ArrowRight className="h-3 w-3 rotate-90" /> : <ArrowRight className="h-3 w-3 -rotate-90" />}
              {trend > 0 ? '+' : ''}{trend}% vs last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border-l-4 border-green-500 p-4 rounded shadow-lg flex items-start max-w-md animate-in slide-in-from-right">
          <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-green-800">Success!</h4>
            <p className="text-sm text-green-700">{notificationMessage}</p>
          </div>
          <button onClick={() => setShowNotification(false)} className="text-green-600 hover:text-green-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-600 transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              {isLoading ? (
                <Skeleton className="h-16 w-16 rounded-full" />
              ) : (
                <Avatar className="h-16 w-16 border-2 border-blue-200 ring-2 ring-blue-100 ring-offset-2">
                  <AvatarImage src={userData?.avatar} alt={userData?.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">AJ</AvatarFallback>
                </Avatar>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Skeleton className="h-9 w-48" /> : userData?.name}
                </h1>
                <div className="flex flex-wrap gap-2 text-gray-600 mt-1">
                  {isLoading ? (
                    <Skeleton className="h-5 w-40" />
                  ) : (
                    <>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {userData?.title}
                      </span>
                      <span>•</span>
                      <span>{userData?.department}</span>
                      <span>•</span>
                      <span>{userData?.year}</span>
                      <span>•</span>
                      <span>ID: {userData?.studentId}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">View:</span>
                <div className="relative">
                  <select 
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 transition-all">
                <FileText className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          <MetricCard
            title="Active Elections"
            value="2"
            subtitle="1 ending this week"
            icon={<Vote className="h-6 w-6 text-blue-600" />}
            color="blue"
            trend={12}
          />
          <MetricCard
            title="Total Budget"
            value="$1.85M"
            subtitle="$15K available"
            icon={<DollarSign className="h-6 w-6 text-green-600" />}
            color="green"
            trend={5.2}
          />
          <MetricCard
            title="Pending Applications"
            value="9"
            subtitle="Requiring review"
            icon={<ClipboardList className="h-6 w-6 text-amber-600" />}
            color="amber"
            trend={8}
          />
          <MetricCard
            title="Feedbacks"
            value="41"
            subtitle="New this month"
            icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
            color="purple"
            trend={4}
          />
        </div>

        {/* Quick Actions - Enhanced with hover effects and transitions */}
        <Card className="shadow-sm transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button 
                variant="outline" 
                className={`h-24 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:border-blue-300 ${activeAction === 'election' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' : ''}`}
                onClick={() => handleQuickAction('election')}
              >
                <Vote className={`h-8 w-8 ${activeAction === 'election' ? 'text-blue-600' : 'text-gray-600'} transition-colors`} />
                <span className="text-sm font-medium">Create Election</span>
              </Button>
              <Button 
                variant="outline" 
                className={`h-24 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:bg-green-50 hover:border-green-300 ${activeAction === 'budget' ? 'bg-green-50 border-green-500 ring-2 ring-green-200' : ''}`}
                onClick={() => handleQuickAction('budget')}
              >
                <DollarSign className={`h-8 w-8 ${activeAction === 'budget' ? 'text-green-600' : 'text-gray-600'} transition-colors`} />
                <span className="text-sm font-medium">Budget Request</span>
              </Button>
              <Button 
                variant="outline" 
                className={`h-24 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:bg-purple-50 hover:border-purple-300 ${activeAction === 'facility' ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200' : ''}`}
                onClick={() => handleQuickAction('facility')}
              >
                <Calendar className={`h-8 w-8 ${activeAction === 'facility' ? 'text-purple-600' : 'text-gray-600'} transition-colors`} />
                <span className="text-sm font-medium">Book Facility</span>
              </Button>
              <Button 
                variant="outline" 
                className={`h-24 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:bg-amber-50 hover:border-amber-300 ${activeAction === 'application' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200' : ''}`}
                onClick={() => handleQuickAction('application')}
              >
                <FileText className={`h-8 w-8 ${activeAction === 'application' ? 'text-amber-600' : 'text-gray-600'} transition-colors`} />
                <span className="text-sm font-medium">Submit Application</span>
              </Button>
              <Button 
                variant="outline" 
                className={`h-24 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:bg-rose-50 hover:border-rose-300 ${activeAction === 'feedback' ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-200' : ''}`}
                onClick={() => handleQuickAction('feedback')}
              >
                <MessageSquare className={`h-8 w-8 ${activeAction === 'feedback' ? 'text-rose-600' : 'text-gray-600'} transition-colors`} />
                <span className="text-sm font-medium">Send Feedback</span>
              </Button>
              <Button 
                variant="outline" 
                className={`h-24 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:bg-cyan-50 hover:border-cyan-300 ${activeAction === 'report' ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-200' : ''}`}
                onClick={() => handleQuickAction('report')}
              >
                <BarChart3 className={`h-8 w-8 ${activeAction === 'report' ? 'text-cyan-600' : 'text-gray-600'} transition-colors`} />
                <span className="text-sm font-medium">Generate Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Visuals & Analytics */}
        <div id="visuals-section" className="bg-white rounded-xl shadow-sm p-6 mt-6 transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              {selectedVisual && activeAction ? (
                <>
                  {actionToVisualMap[activeAction]}
                  {activeAction.charAt(0).toUpperCase() + activeAction.slice(1)}
                </>
              ) : (
                <>
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Interactive Visuals & Analytics
                </>
              )}
            </h2>
            {selectedVisual && (
              <Badge className={`bg-${getColorForAction(activeAction)}-100 text-${getColorForAction(activeAction)}-800 hover:bg-${getColorForAction(activeAction)}-200 transition-colors`}>
                {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} View
              </Badge>
            )}
          </div>
          
          {!selectedVisual && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="p-6 bg-blue-50 rounded-full mb-4">
                <PlusCircle className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Quick Action</h3>
              <p className="text-gray-600 max-w-md">
                Click on any quick action above to view detailed analytics and take action on that category.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedVisual === 'election' && (
              <>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Vote className="h-5 w-5 text-blue-600" />
                      Election Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={electionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="turnout" name="Turnout %" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                          {electionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-600" />
                      Vote Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <RechartsPieChart>
                        <Pie
                          data={electionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="votes"
                        >
                          {electionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
                      {electionData.map((item, idx) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                          <span className={`inline-block w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 ml-auto">{item.votes}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {selectedVisual === 'budget' && (
              <>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Budget Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={budgetTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="requested" name="Requested" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="approved" name="Approved" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="allocated" name="Allocated" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-green-600" />
                      Budget Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Academic Programs</span>
                          <span className="text-sm font-medium text-green-600">45%</span>
                        </div>
                        <Progress value={45} className="h-2 bg-green-100" indicatorClassName="bg-green-500" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Research Projects</span>
                          <span className="text-sm font-medium text-blue-600">25%</span>
                        </div>
                        <Progress value={25} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Student Activities</span>
                          <span className="text-sm font-medium text-amber-600">20%</span>
                        </div>
                        <Progress value={20} className="h-2 bg-amber-100" indicatorClassName="bg-amber-500" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Administrative</span>
                          <span className="text-sm font-medium text-purple-600">10%</span>
                        </div>
                        <Progress value={10} className="h-2 bg-purple-100" indicatorClassName="bg-purple-500" />
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-700">Available Budget</span>
                        <span className="font-bold text-green-600">$15,200</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {selectedVisual === 'facility' && (
              <>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Facility Booking Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={facilityUsage} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="facility" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="usage" name="Usage %" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                          {facilityUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Upcoming Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-purple-50 rounded-lg gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Book className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Auditorium</p>
                          <p className="text-xs text-gray-500">Tomorrow, 2:00 PM - 4:00 PM</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>
                      </div>
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Book className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Computer Lab 2</p>
                          <p className="text-xs text-gray-500">May 22, 10:00 AM - 12:00 PM</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Pending</Badge>
                      </div>
                      <div className="flex items-center p-3 bg-amber-50 rounded-lg gap-3">
                        <div className="bg-amber-100 p-2 rounded-full">
                          <Book className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Seminar Room 3</p>
                          <p className="text-xs text-gray-500">May 25, 1:00 PM - 3:00 PM</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {selectedVisual === 'application' && (
              <>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-600" />
                      Application Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={applicationStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="pending" name="Pending" fill="#F59E0B" />
                        <Bar dataKey="approved" name="Approved" fill="#10B981" />
                        <Bar dataKey="rejected" name="Rejected" fill="#EF4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-600" />
                      Recent Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-amber-50 rounded-lg gap-3">
                        <div className="bg-amber-100 p-2 rounded-full">
                          <Award className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Tech Innovation Scholarship</p>
                          <p className="text-xs text-gray-500">Submitted on May 12, 2025</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Under Review</Badge>
                      </div>
                      <div className="flex items-center p-3 bg-green-50 rounded-lg gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Award className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Study Abroad Program</p>
                          <p className="text-xs text-gray-500">Submitted on April 29, 2025</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>
                      </div>
                      <div className="flex items-center p-3 bg-purple-50 rounded-lg gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Award className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Research Grant - AI Ethics</p>
                          <p className="text-xs text-gray-500">Submitted on May 5, 2025</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Under Review</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {selectedVisual === 'feedback' && (
              <>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-rose-600" />
                      Feedback Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={feedbackMetrics}>
                        <RadialBar 
                          minAngle={15} 
                          label={{ position: 'insideStart', fill: '#fff' }} 
                          background 
                          clockWise 
                          dataKey="score" 
                        >
                          {feedbackMetrics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </RadialBar>
                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                        <Tooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-rose-600" />
                      Recent Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-rose-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-rose-900">Computer Science 301</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={`text-${star <= 4 ? 'amber' : 'gray'}-400`}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-rose-700 mt-1">
                          "The course materials were excellent, but more practical exercises would be helpful."
                        </p>
                        <p className="text-xs text-gray-500 mt-2">May 15, 2025</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-blue-900">Library Services</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={`text-${star <= 5 ? 'amber' : 'gray'}-400`}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          "The extended hours during finals week were greatly appreciated!"
                        </p>
                        <p className="text-xs text-gray-500 mt-2">May 10, 2025</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-green-900">Campus Food Services</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={`text-${star <= 3 ? 'amber' : 'gray'}-400`}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          "More vegetarian options would be nice in the main cafeteria."
                        </p>
                        <p className="text-xs text-gray-500 mt-2">May 8, 2025</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {selectedVisual === 'report' && (
              <>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-cyan-600" />
                      Report Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={reportData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="academic" name="Academic" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="administrative" name="Administrative" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="facilities" name="Facilities" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-cyan-600" />
                      Report Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-cyan-50 hover:border-cyan-200 transition-colors cursor-pointer">
                        <div className="bg-cyan-100 p-2 mr-3 rounded-full">
                          <FileText className="h-4 w-4 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Academic Progress Report</p>
                          <p className="text-xs text-gray-500">Summarizes course performance and academic achievements</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-cyan-600 border-cyan-200 hover:bg-cyan-100">
                          Use
                        </Button>
                      </div>
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-cyan-50 hover:border-cyan-200 transition-colors cursor-pointer">
                        <div className="bg-cyan-100 p-2 mr-3 rounded-full">
                          <FileText className="h-4 w-4 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Budget Expenditure Report</p>
                          <p className="text-xs text-gray-500">Tracks spending and budget allocation</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-cyan-600 border-cyan-200 hover:bg-cyan-100">
                          Use
                        </Button>
                      </div>
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-cyan-50 hover:border-cyan-200 transition-colors cursor-pointer">
                        <div className="bg-cyan-100 p-2 mr-3 rounded-full">
                          <FileText className="h-4 w-4 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Event Attendance Report</p>
                          <p className="text-xs text-gray-500">Analyzes participation and engagement metrics</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-cyan-600 border-cyan-200 hover:bg-cyan-100">
                          Use
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Notifications */}
        <Card className="shadow-sm transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-600" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 border-l-4 border-l-${notification.color}-500 bg-${notification.color}-50 rounded-r-lg cursor-pointer transition-all hover:bg-${notification.color}-100 hover:translate-x-1`}
                  onClick={() => handleNotificationClick(notification.type)}
                >
                  <div className={`p-2 bg-${notification.color}-100 rounded-full`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-${notification.color}-900`}>{notification.title}</p>
                    <p className={`text-sm text-${notification.color}-700`}>{notification.message}</p>
                    <p className={`text-xs text-${notification.color}-600 mt-1`}>{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                <Bell className="h-4 w-4 mr-2" />
                View All Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;