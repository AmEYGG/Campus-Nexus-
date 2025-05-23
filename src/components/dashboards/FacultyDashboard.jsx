import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Link is imported but not used, consider removing if not needed.
import { firebaseAuthService } from '../../services/firebaseAuth.service';
import { getDatabase, ref, get, query, orderByChild, equalTo } from 'firebase/database';
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
  UserCheck, Clock, Settings, Building, PieChart as PieChartIcon, // Renamed to avoid conflict
  LineChart as LineChartIcon, // Renamed to avoid conflict
  MessageSquare, ChevronDown, Eye,
  Loader2, ArrowUp, ArrowDown // Added ArrowUp, ArrowDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line,
  AreaChart, Area, RadialBarChart, RadialBar, Legend
} from 'recharts';

// --- Mock Data (as provided in the original snippet) ---
// Note: In a real application, this data would likely come from the `dashboardData` state
// which is fetched in useEffect. The current JSX directly uses these mock arrays.
const electionDataMock = [
  { name: 'Student Council', votes: 1245, eligible: 2500, turnout: 49.8 },
  { name: 'Class Reps', votes: 892, eligible: 1500, turnout: 59.5 },
  { name: 'Dept. Heads', votes: 156, eligible: 200, turnout: 78.0 },
  { name: 'Faculty Senate', votes: 89, eligible: 120, turnout: 74.2 }
];

const fundingTrendsMock = [
  { month: 'Jan', allocated: 125000, spent: 98000, pending: 45000 },
  { month: 'Feb', allocated: 135000, spent: 112000, pending: 38000 },
  { month: 'Mar', allocated: 142000, spent: 125000, pending: 42000 },
  { month: 'Apr', allocated: 155000, spent: 138000, pending: 35000 },
  { month: 'May', allocated: 148000, spent: 142000, pending: 28000 }
];

const departmentBudgetsMock = [
  { name: 'Computer Science', budget: 450000, spent: 380000, remaining: 70000 },
  { name: 'Mathematics', budget: 320000, spent: 285000, remaining: 35000 },
  { name: 'Physics', budget: 290000, spent: 240000, remaining: 50000 },
  { name: 'Chemistry', budget: 380000, spent: 350000, remaining: 30000 },
  { name: 'Biology', budget: 410000, spent: 375000, remaining: 35000 }
];

const facilityUtilizationMock = [
  { facility: 'Auditorium', utilization: 85, bookings: 24, capacity: 500 },
  { facility: 'Comp. Labs', utilization: 72, bookings: 156, capacity: 40 },
  { facility: 'Sports Complex', utilization: 68, bookings: 45, capacity: 200 },
  { facility: 'Library Halls', utilization: 91, bookings: 89, capacity: 150 },
  { facility: 'Seminar Rooms', utilization: 78, bookings: 234, capacity: 30 }
];

const applicationStatsMock = [
  { category: 'Budget Req.', pending: 12, approved: 18, rejected: 3 },
  { category: 'Event Apps', pending: 8, approved: 22, rejected: 1 },
  { category: 'Facility Book.', pending: 15, approved: 89, rejected: 4 },
  { category: 'Research Prop.', pending: 6, approved: 14, rejected: 2 }
];

const feedbackMetricsMock = [
  { category: 'Course Quality', score: 4.2, responses: 1240 },
  { category: 'Faculty Support', score: 4.5, responses: 980 },
  { category: 'Infrastructure', score: 3.8, responses: 1150 },
  { category: 'Administration', score: 4.1, responses: 890 }
];
// --- End of Mock Data ---


const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']; // Blue, Green, Amber, Red, Purple, Cyan

// Custom Recharts Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-3 shadow-lg rounded-lg border border-gray-200/50">
        <p className="label text-sm font-bold text-gray-800 mb-1">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color || entry.stroke }} className="text-xs flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color || entry.stroke }}></span>
            {`${entry.name}: ${entry.value.toLocaleString()}${entry.unit || ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MetricCard = ({ title, value, subtitle, icon, color, trend }) => (
  <Card className={`rounded-xl shadow-lg border-l-4 border-${color}-500 flex flex-col items-center justify-center text-center h-full transition-all duration-300 hover:shadow-xl hover:scale-105 transform`}> 
    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
      <div className="flex flex-col items-center justify-center mb-2">
        <div className={`p-3 rounded-full bg-${color}-100 mb-3 flex items-center justify-center shadow-sm`}>{icon}</div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-extrabold text-gray-800 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {trend !== undefined && (
        <div className="flex items-center justify-center mt-2">
          {trend >= 0 ? <ArrowUp className="h-4 w-4 mr-0.5 text-green-600" /> : <ArrowDown className="h-4 w-4 mr-0.5 text-red-600" />}
          <span className={`text-sm font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}% vs last period
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

const FacultyDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  
  // Note: This dashboardData state is fetched but not fully utilized by the current tab components,
  // which predominantly use hardcoded mock data. This should be reconciled in a production app.
  const [dashboardData, setDashboardData] = useState({
    courseData: [],
    studentStats: [],
    departmentStats: {},
    researchData: [],
    feedbackMetrics: [],
    budgetData: []
  });

  useEffect(() => {
    const isMounted = { current: true };
    const database = getDatabase();

    const fetchUserData = async () => {
      try {
        const currentUser = await firebaseAuthService.getCurrentUser();
        if (!currentUser || !isMounted.current) {
          if(isMounted.current) setIsLoading(false);
          return;
        }

        const userProfile = currentUser.userProfile;
        if (!userProfile) {
          console.error('No user profile found');
          if(isMounted.current) setIsLoading(false);
          return;
        }
        
        const name = `${userProfile.title || 'Prof.'} ${userProfile.firstname} ${userProfile.lastname}`;
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'F';


        setUserData({
          name: name,
          initials: initials,
          title: userProfile.academicTitle || 'Faculty Member',
          department: userProfile.department || 'Not Assigned',
          email: userProfile.email,
          avatar: userProfile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
          facultyId: userProfile.facultyID
        });

        // --- Data Fetching (simplified for brevity in this UI-focused enhancement) ---
        // In a real scenario, ensure robust error handling and data presence checks for each fetch
        const facultyId = userProfile.facultyID;
        if (!facultyId) {
            console.warn("Faculty ID not found, cannot fetch specific data.");
            if(isMounted.current) setIsLoading(false);
            return;
        }

        // Example of fetching and processing one data type (adapt for others)
        const courseRef = query(ref(database, 'courses'), orderByChild('facultyId'), equalTo(facultyId));
        const courseSnapshot = await get(courseRef);
        const fetchedCourseData = courseSnapshot.exists() 
          ? Object.values(courseSnapshot.val())
          : [];

        // ... (fetch other data: studentStats, departmentStats, researchData, feedbackMetrics, budgetData) ...
        
        // For now, we'll use the mock data for the UI, so processing isn't critical here
        // but in a real app, you'd process the fetched data:
        const processedData = {
          courseData: processCourseData(fetchedCourseData), // This specific one is processed
          studentStats: [], // Replace with processed fetched student data
          departmentStats: {}, // Replace with processed fetched department data
          researchData: [], // Replace with processed fetched research data
          feedbackMetrics: feedbackMetricsMock, // Using mock for UI example
          budgetData: [] // Replace with processed fetched budget data
        };

        if (isMounted.current) {
          setDashboardData(processedData);
        }

      } catch (error) {
        console.error('Error fetching faculty data:', error);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
    return () => { isMounted.current = false; };
  }, []);

  // --- Data processing helper functions (used if integrating fetched data) ---
  const processCourseData = (data) => {
    if (!data || data.length === 0) return [{ name: 'No Courses', students: 0, rating: 0, attendance: 0 }];
    return data.map(course => ({
      name: course.courseName || 'Unnamed Course',
      students: course.enrolledStudents || 0,
      rating: course.averageRating || 0,
      attendance: course.averageAttendance || 0
    }));
  };
  // ... other process functions (processStudentData, processDepartmentData, etc.) would go here ...


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-700 text-lg font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center p-8 bg-white shadow-xl rounded-lg">
          <Users className="h-16 w-16 mx-auto text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">User Data Not Available</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            We couldn't load your profile. Please try logging out and back in. If the issue persists, contact support.
          </p>
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => firebaseAuthService.logout()}>
            Logout and Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Quick Action Button Component
  const QuickActionButton = ({ icon, label, action = () => {} }) => (
    <Button 
      variant="outline" 
      className="h-24 flex flex-col items-center justify-center gap-2 p-3 text-center
                 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700
                 focus:ring-2 focus:ring-blue-300 focus:ring-offset-1
                 transition-all duration-200 ease-in-out transform hover:scale-105"
      onClick={action}
    >
      {React.cloneElement(icon, { className: "h-7 w-7" })}
      <span className="text-xs sm:text-sm font-medium">{label}</span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-4 md:p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-blue-200 shadow-md">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="bg-blue-500 text-white font-semibold text-2xl">{userData.initials}</AvatarFallback>
                </Avatar>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {userData.name}
                </h1>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-600 mt-1.5 text-sm">
                  <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-blue-500" />{userData.title}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5"><Building className="h-4 w-4 text-green-500" />{userData.department}</span>
                </div>
                 <p className="text-xs text-gray-500 mt-1">{userData.email}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                >
                  <option value="daily">Daily View</option>
                  <option value="weekly">Weekly View</option>
                  <option value="monthly">Monthly View</option>
                  <option value="yearly">Yearly View</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 transition-all w-full sm:w-auto py-2.5">
                <Eye className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard title="Active Elections" value="4" subtitle="2 ending this week" icon={<Vote className="h-7 w-7 text-blue-600" />} color="blue" trend={12}/>
          <MetricCard title="Department Budget" value="$1.85M" subtitle="$142K available" icon={<DollarSign className="h-7 w-7 text-green-600" />} color="green" trend={5.2}/>
          <MetricCard title="My Courses" value={dashboardData.courseData.length > 0 && dashboardData.courseData[0].name !== 'No Courses' ? dashboardData.courseData.length : 0} subtitle="Currently Taught" icon={<Award className="h-7 w-7 text-purple-600" />} color="purple" trend={2}/>
          <MetricCard title="Student Feedback" value="4.2/5" subtitle="Overall Rating" icon={<MessageSquare className="h-7 w-7 text-amber-600" />} color="amber" trend={-1}/>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="elections" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:w-auto lg:inline-flex bg-white rounded-lg p-1 border shadow-sm">
            {[
              { value: "elections", label: "Elections", icon: Vote, color: "blue" },
              { value: "funds", label: "Funds", icon: DollarSign, color: "green" },
              { value: "facilities", label: "Facilities", icon: Building, color: "purple" },
              { value: "applications", label: "Applications", icon: FileText, color: "amber" },
              { value: "feedback", label: "Feedback", icon: MessageSquare, color: "rose" },
              { value: "analytics", label: "Analytics", icon: BarChart3, color: "cyan" },
            ].map(tab => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className={`data-[state=active]:bg-${tab.color}-100 data-[state=active]:text-${tab.color}-700 data-[state=active]:shadow-md 
                            text-gray-600 hover:bg-gray-100 hover:text-gray-800
                            flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm rounded-md transition-all duration-200 ease-in-out`}
              >
                <tab.icon className={`h-4 w-4 mr-1.5 text-${tab.color}-600`} />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Elections Tab */}
          <TabsContent value="elections" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Vote className="h-5 w-5 text-blue-600" />Election Turnout</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={electionDataMock} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} unit="%" />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(230, 240, 255, 0.5)'}} />
                      <Bar dataKey="turnout" name="Turnout" unit="%" fill={COLORS[0]} radius={[4, 4, 0, 0]} barSize={35} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-blue-600" />Vote Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie data={electionDataMock} dataKey="votes" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} >
                        {electionDataMock.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{fontSize: "12px"}}/>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
             {/* ... (Election details cards - styling can be improved if needed) ... */}
          </TabsContent>

          {/* Fund Management Tab */}
          <TabsContent value="funds" className="mt-6 space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><LineChartIcon className="h-5 w-5 text-green-600" />Budget Trends</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={fundingTrendsMock} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} tickFormatter={(value) => `$${value/1000}k`}/>
                      <Tooltip content={<CustomTooltip />} unit="$" />
                      <Area type="monotone" dataKey="allocated" name="Allocated" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.3} strokeWidth={2} />
                      <Area type="monotone" dataKey="spent" name="Spent" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.3} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5 text-green-600" />Department Budget Status</CardTitle></CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto pr-2">
                  <div className="space-y-4">
                    {departmentBudgetsMock.map((dept, index) => (
                      <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-medium text-sm text-gray-800">{dept.name}</span>
                          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            ${dept.remaining.toLocaleString()} Left
                          </span>
                        </div>
                        <Progress value={(dept.spent / dept.budget) * 100} className="h-2.5 rounded-full" indicatorClassName="bg-green-500 rounded-full" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                          <span>${dept.spent.toLocaleString()} Spent</span>
                          <span>Total: ${dept.budget.toLocaleString()}</span>
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
              <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building className="h-5 w-5 text-purple-600" />Facility Utilization</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={facilityUtilizationMock} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" domain={[0, 100]} fontSize={12} unit="%" />
                      <YAxis dataKey="facility" type="category" width={100} fontSize={12} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(240, 230, 255, 0.5)'}} />
                      <Bar dataKey="utilization" name="Utilization" unit="%" fill={COLORS[4]} radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-5 w-5 text-purple-600" />Booking Statistics</CardTitle></CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto pr-2">
                  <div className="space-y-3">
                    {facilityUtilizationMock.map((facility, index) => (
                      <div key={index} className="flex items-center justify-between p-3.5 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                        <div>
                          <h3 className="font-medium text-sm text-gray-800">{facility.facility}</h3>
                          <p className="text-xs text-gray-600">
                            {facility.bookings} bookings • Capacity: {facility.capacity}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-purple-600">
                            {facility.utilization}%
                          </div>
                          <div className="text-xs text-purple-500">Utilization</div>
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
              <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-5 w-5 text-amber-600" />Application Status</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={applicationStatsMock} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{fontSize: "12px"}}/>
                      <Bar dataKey="pending" name="Pending" stackId="a" fill={COLORS[2]} radius={[4,4,0,0]} />
                      <Bar dataKey="approved" name="Approved" stackId="a" fill={COLORS[1]} />
                      <Bar dataKey="rejected" name="Rejected" stackId="a" fill={COLORS[3]} radius={[0,0,4,4]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-5 w-5 text-amber-600" />Approval Rate</CardTitle></CardHeader>
                <CardContent className="flex justify-center items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={20} data={applicationStatsMock.map(s => ({...s, fill: COLORS[1]}))} startAngle={90} endAngle={-270}>
                      <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff', fontSize: '11px' }} background={{fill: '#f9fafb'}} clockWise dataKey="approved" />
                      <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: "12px"}} formatter={(value, entry) => entry.payload.category} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-5 w-5 text-rose-600" />Feedback Scores</CardTitle></CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto pr-2">
                  <div className="space-y-4">
                    {feedbackMetricsMock.map((metric, index) => (
                      <div key={index} className="p-3.5 border border-gray-200 rounded-lg bg-rose-50/50">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-medium text-sm text-gray-800">{metric.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-rose-600">
                              {metric.score}/5.0
                            </span>
                            <Badge variant="outline" className="text-xs bg-white border-rose-200 text-rose-700">{metric.responses} responses</Badge>
                          </div>
                        </div>
                        <Progress value={(metric.score / 5) * 100} className="h-2.5 rounded-full" indicatorClassName="bg-rose-500 rounded-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-5 w-5 text-rose-600" />Satisfaction Trends</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={feedbackMetricsMock.map(m => ({name: m.category, score: m.score}))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis domain={[0, 5]} fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="score" stroke={COLORS[3]} strokeWidth={2.5} dot={{ r: 5, strokeWidth: 2, fill: COLORS[3] }} activeDot={{ r: 7 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* ... Analytics content from original, can be styled similarly ... */}
            <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5 text-cyan-600" />System Analytics Overview</CardTitle></CardHeader>
              <CardContent>
                  <p className="text-center text-gray-500 py-10">Detailed system analytics would be displayed here.</p>
                  {/* Placeholder for more detailed analytics UI */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
           <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
              <Settings className="h-6 w-6 text-blue-600" />
              Quick Actions
            </CardTitle>
             <p className="text-sm text-gray-500">Common administrative tasks.</p>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <QuickActionButton icon={<Vote />} label="Create Election" />
              <QuickActionButton icon={<DollarSign />} label="Budget Request" />
              <QuickActionButton icon={<Calendar />} label="Book Facility" />
              <QuickActionButton icon={<FileText />} label="Submit Application" />
              <QuickActionButton icon={<MessageSquare />} label="Send Feedback" />
              <QuickActionButton icon={<BarChart3 />} label="Generate Report" />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
              <Bell className="h-6 w-6 text-blue-600" />
              Recent Notifications
            </CardTitle>
             <p className="text-sm text-gray-500">Key updates and alerts.</p>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-3">
              {[
                {id:1, title: "Election Reminder", msg: "Student Council election ends in 24 hours", time: "2h ago", color: "blue", icon: Vote},
                {id:2, title: "Budget Approved", msg: "Your department budget has been approved for Q2", time: "5h ago", color: "green", icon: DollarSign},
                {id:3, title: "Application Pending", msg: "3 research proposals require your review", time: "1d ago", color: "amber", icon: FileText},
              ].map(notif => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3.5 p-3.5 border-l-4 border-${notif.color}-500 bg-${notif.color}-50 rounded-r-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <div className={`p-2.5 bg-${notif.color}-100 rounded-full mt-0.5`}>
                    <notif.icon className={`h-5 w-5 text-${notif.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm text-${notif.color}-800`}>{notif.title}</p>
                    <p className={`text-xs text-${notif.color}-700`}>{notif.msg}</p>
                    <p className={`text-xs text-${notif.color}-500 mt-1`}>{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm">
                <Bell className="h-4 w-4 mr-2" />
                View All Notifications
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-2 border-gray-200 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-sm">
                Faculty Dashboard © {new Date().getFullYear()}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                 {' | '} System Status: <span className="text-green-600 font-medium">Operational</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="text-gray-600 hover:bg-gray-100 hover:border-gray-400"><Settings className="h-4 w-4 mr-1.5" />Settings</Button>
              <Button variant="outline" size="sm" className="text-gray-600 hover:bg-gray-100 hover:border-gray-400"><FileText className="h-4 w-4 mr-1.5" />Export</Button>
              <Button variant="outline" size="sm" className="text-gray-600 hover:bg-gray-100 hover:border-gray-400"><MessageSquare className="h-4 w-4 mr-1.5" />Support</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;