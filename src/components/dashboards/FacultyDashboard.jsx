import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Calendar, FileText, Users, Bell, BarChart3, 
  TrendingUp, Activity, Vote, Award, DollarSign,
  UserCheck, Clock, Settings, Building, PieChart,
  LineChart, MessageSquare, ChevronDown, Eye
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line,
  AreaChart, Area, RadialBarChart, RadialBar, Legend
} from 'recharts';

// Enhanced mock data for analytics
const electionData = [
  { name: 'Student Council', votes: 1245, eligible: 2500, turnout: 49.8 },
  { name: 'Class Representatives', votes: 892, eligible: 1500, turnout: 59.5 },
  { name: 'Department Heads', votes: 156, eligible: 200, turnout: 78.0 },
  { name: 'Faculty Senate', votes: 89, eligible: 120, turnout: 74.2 }
];

const fundingTrends = [
  { month: 'Jan', allocated: 125000, spent: 98000, pending: 45000 },
  { month: 'Feb', allocated: 135000, spent: 112000, pending: 38000 },
  { month: 'Mar', allocated: 142000, spent: 125000, pending: 42000 },
  { month: 'Apr', allocated: 155000, spent: 138000, pending: 35000 },
  { month: 'May', allocated: 148000, spent: 142000, pending: 28000 }
];

const departmentBudgets = [
  { name: 'Computer Science', budget: 450000, spent: 380000, remaining: 70000 },
  { name: 'Mathematics', budget: 320000, spent: 285000, remaining: 35000 },
  { name: 'Physics', budget: 290000, spent: 240000, remaining: 50000 },
  { name: 'Chemistry', budget: 380000, spent: 350000, remaining: 30000 },
  { name: 'Biology', budget: 410000, spent: 375000, remaining: 35000 }
];

const facilityUtilization = [
  { facility: 'Main Auditorium', utilization: 85, bookings: 24, capacity: 500 },
  { facility: 'Computer Labs', utilization: 72, bookings: 156, capacity: 40 },
  { facility: 'Sports Complex', utilization: 68, bookings: 45, capacity: 200 },
  { facility: 'Library Halls', utilization: 91, bookings: 89, capacity: 150 },
  { facility: 'Seminar Rooms', utilization: 78, bookings: 234, capacity: 30 }
];

const applicationStats = [
  { category: 'Budget Requests', pending: 12, approved: 18, rejected: 3 },
  { category: 'Event Applications', pending: 8, approved: 22, rejected: 1 },
  { category: 'Facility Bookings', pending: 15, approved: 89, rejected: 4 },
  { category: 'Research Proposals', pending: 6, approved: 14, rejected: 2 }
];

const feedbackMetrics = [
  { category: 'Course Quality', score: 4.2, responses: 1240 },
  { category: 'Faculty Support', score: 4.5, responses: 980 },
  { category: 'Infrastructure', score: 3.8, responses: 1150 },
  { category: 'Administration', score: 4.1, responses: 890 }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const FacultyDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setUserData({
        name: 'Prof. Robert Smith',
        title: 'Associate Professor & Department Head',
        department: 'Computer Science',
        email: 'r.smith@university.edu',
        avatar: '/api/placeholder/150/150'
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const MetricCard = ({ title, value, subtitle, icon, color, trend }) => (
    <Card className={`rounded-xl shadow-md border-l-4 border-l-${color}-500 flex flex-col items-center justify-center text-center h-full`}> 
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center justify-center mb-2">
          <div className={`p-3 rounded-full bg-${color}-100 mb-2 flex items-center justify-center`}>{icon}</div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <div className="flex items-center justify-center mt-2">
            <TrendingUp className={`h-4 w-4 mr-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>{trend > 0 ? '+' : ''}{trend}% vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-t-blue-600">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              {isLoading ? (
                <Skeleton className="h-16 w-16 rounded-full" />
              ) : (
                <Avatar className="h-16 w-16 border-2 border-blue-200">
                  <AvatarImage src={userData?.avatar} alt={userData?.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">RS</AvatarFallback>
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
                        <Building className="h-4 w-4" />
                        {userData?.title}
                      </span>
                      <span>•</span>
                      <span>{userData?.department}</span>
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
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Eye className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          <MetricCard
            title="Active Elections"
            value="4"
            subtitle="2 ending this week"
            icon={<Vote className="h-6 w-6 text-blue-600" />}
            color="blue"
            trend={12}
          />
          <MetricCard
            title="Total Budget"
            value="$1.85M"
            subtitle="$142K available"
            icon={<DollarSign className="h-6 w-6 text-green-600" />}
            color="green"
            trend={5.2}
          />
          <MetricCard
            title="Facility Bookings"
            value="247"
            subtitle="This month"
            icon={<Calendar className="h-6 w-6 text-purple-600" />}
            color="purple"
            trend={-3}
          />
          <MetricCard
            title="Pending Applications"
            value="41"
            subtitle="Requiring review"
            icon={<FileText className="h-6 w-6 text-amber-600" />}
            color="amber"
            trend={8}
          />
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="elections" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex bg-white rounded-lg border shadow-sm">
            <TabsTrigger value="elections" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Vote className="h-4 w-4 mr-2" />
              Elections
            </TabsTrigger>
            <TabsTrigger value="funds" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <DollarSign className="h-4 w-4 mr-2" />
              Fund Management
            </TabsTrigger>
            <TabsTrigger value="facilities" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              <Building className="h-4 w-4 mr-2" />
              Facilities
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
              <FileText className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Elections Tab */}
          <TabsContent value="elections" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Vote className="h-5 w-5 text-blue-600" />
                    Election Turnout by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={electionData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="turnout" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    Vote Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={electionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {electionData.map((election, index) => (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{election.name}</h3>
                      <Badge variant={election.turnout > 60 ? "default" : "secondary"}>
                        {election.turnout > 60 ? "Active" : "Low Turnout"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Votes Cast</span>
                        <span className="font-medium">{election.votes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Eligible Voters</span>
                        <span className="font-medium">{election.eligible.toLocaleString()}</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Turnout</span>
                          <span className="text-sm font-medium">{election.turnout}%</span>
                        </div>
                        <Progress value={election.turnout} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Fund Management Tab */}
          <TabsContent value="funds" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-green-600" />
                    Budget Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={fundingTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="allocated" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="spent" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Department Budget Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentBudgets.map((dept, index) => (
                      <div key={index} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{dept.name}</span>
                          <span className="text-sm text-gray-600">
                            ${dept.remaining.toLocaleString()} remaining
                          </span>
                        </div>
                        <Progress 
                          value={(dept.spent / dept.budget) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>${dept.spent.toLocaleString()} spent</span>
                          <span>${dept.budget.toLocaleString()} total</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Facilities Tab */}
          <TabsContent value="facilities" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-600" />
                    Facility Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={facilityUtilization} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="facility" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="utilization" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Booking Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {facilityUtilization.map((facility, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium">{facility.facility}</h3>
                          <p className="text-sm text-gray-600">
                            {facility.bookings} bookings • Capacity: {facility.capacity}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600">
                            {facility.utilization}%
                          </div>
                          <div className="text-xs text-gray-500">Utilization</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-600" />
                    Application Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={applicationStats}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="pending" fill="#F59E0B" />
                      <Bar dataKey="approved" fill="#10B981" />
                      <Bar dataKey="rejected" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-600" />
                    Processing Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={applicationStats}>
                      <RadialBar 
                        minAngle={15} 
                        label={{ position: 'insideStart', fill: '#fff' }} 
                        background 
                        clockWise 
                        dataKey="approved" 
                        fill="#10B981"
                      />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-rose-600" />
                    Feedback Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedbackMetrics.map((metric, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{metric.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-rose-600">
                              {metric.score}/5.0
                            </span>
                            <Badge variant="outline">{metric.responses} responses</Badge>
                          </div>
                        </div>
                        <Progress value={(metric.score / 5) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-rose-600" />
                    Satisfaction Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={feedbackMetrics}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#EC4899" 
                        strokeWidth={3}
                        dot={{ fill: '#EC4899', strokeWidth: 2, r: 6 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">12,847</p>
                      <p className="text-xs text-green-600">+12% from last month</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">System Uptime</p>
                      <p className="text-2xl font-bold">99.8%</p>
                      <p className="text-xs text-green-600">Excellent performance</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Sessions</p>
                      <p className="text-2xl font-bold">2,146</p>
                      <p className="text-xs text-purple-600">Peak: 3,200</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-l-4 border-l-amber-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                      <p className="text-2xl font-bold">1.2s</p>
                      <p className="text-xs text-amber-600">Target: &lt; 2s</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-600" />
                  Comprehensive System Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Resource Usage</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">CPU Usage</span>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Memory Usage</span>
                          <span className="text-sm font-medium">62%</span>
                        </div>
                        <Progress value={62} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                        <span className="text-sm">Storage Usage</span>
                          <span className="text-sm font-medium">38%</span>
                        </div>
                        <Progress value={38} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Network I/O</span>
                          <span className="text-sm font-medium">71%</span>
                        </div>
                        <Progress value={71} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Election Results Published</p>
                          <p className="text-xs text-gray-600">Student Council Election completed</p>
                        </div>
                        <span className="text-xs text-gray-500">2 min ago</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Budget Approved</p>
                          <p className="text-xs text-gray-600">Computer Science Department Q2 budget</p>
                        </div>
                        <span className="text-xs text-gray-500">1 hour ago</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Facility Booking</p>
                          <p className="text-xs text-gray-600">Main Auditorium reserved for conference</p>
                        </div>
                        <span className="text-xs text-gray-500">3 hours ago</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Application Processed</p>
                          <p className="text-xs text-gray-600">Research grant proposal approved</p>
                        </div>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Vote className="h-6 w-6" />
                <span className="text-sm">Create Election</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">Budget Request</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Book Facility</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">Submit Application</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">Send Feedback</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Generate Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-600" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded-r-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Vote className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Election Reminder</p>
                  <p className="text-sm text-blue-700">Student Council election ends in 24 hours</p>
                  <p className="text-xs text-blue-600 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border-l-4 border-l-green-500 bg-green-50 rounded-r-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-900">Budget Approved</p>
                  <p className="text-sm text-green-700">Your department budget has been approved for Q2</p>
                  <p className="text-xs text-green-600 mt-1">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border-l-4 border-l-amber-500 bg-amber-50 rounded-r-lg">
                <div className="p-2 bg-amber-100 rounded-full">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-amber-900">Application Pending</p>
                  <p className="text-sm text-amber-700">3 research proposals require your review</p>
                  <p className="text-xs text-amber-600 mt-1">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border-l-4 border-l-purple-500 bg-purple-50 rounded-r-lg">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Building className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-purple-900">Facility Maintenance</p>
                  <p className="text-sm text-purple-700">Computer Lab 3 scheduled for maintenance this weekend</p>
                  <p className="text-xs text-purple-600 mt-1">2 days ago</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                <Bell className="h-4 w-4 mr-2" />
                View All Notifications
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-t-gray-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-sm">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                System Status: <span className="text-green-600 font-medium">All Systems Operational</span>
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;