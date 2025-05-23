import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card'; // Assuming path is correct
import { firebaseAuthService } from '../../services/firebaseAuth.service';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import toast from 'react-hot-toast';
import {
  Users, Building, DollarSign, Activity, Settings, Shield, FileText, Bell,
  AlertTriangle, CheckCircle, AlertCircle, Plus, Trash2, Search, UserPlus,
  Server, Database, Network, Cpu, HardDrive, Clock, BarChart3, TrendingUp,
  UserCheck, Filter, MoreVertical, RefreshCw, Loader2, ChevronDown, Mail,
  Key, Eye, EyeOff, Save, X, Calendar, User, Award, Edit
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
// Removed: import { getDatabase, ref, get } from 'firebase/database';
// If you need to fetch specific DB data not covered by userProfile, re-add and use it.

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [adminData, setAdminData] = useState(null);
  
  const [newUser, setNewUser] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'student',
    department: '', status: 'active'
  });
  
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  
  useEffect(() => {
    const isMounted = { current: true };
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await firebaseAuthService.getCurrentUser();
        if (!currentUser || !isMounted.current) {
            if(isMounted.current) setIsLoading(false);
            return;
        }

        const userProfile = currentUser.userProfile;
        if (!userProfile) {
          console.error('No user profile found for current admin.');
          toast.error("Admin profile not found.");
          if(isMounted.current) setIsLoading(false);
          return;
        }

        setAdminData({
          name: `${userProfile.firstname || 'Admin'} ${userProfile.lastname || 'User'}`,
          title: userProfile.adminTitle || 'System Administrator',
          department: userProfile.department || 'IT Administration',
          email: currentUser.email,
          avatar: userProfile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.firstname || 'A')}+${encodeURIComponent(userProfile.lastname || 'U')}&background=random&color=fff`
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error("Failed to load admin data.");
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    };

    fetchAdminData();
    return () => { isMounted.current = false; };
  }, []);

  // Mock User data - Replace with Firebase integration
  const [users, setUsers] = useState([
    { id: 'user001', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: 'student', department: 'Computer Science', status: 'active', lastLogin: '2 hours ago' },
    { id: 'user002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', role: 'faculty', department: 'Mathematics', status: 'active', lastLogin: '1 day ago' },
    { id: 'user003', firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@example.com', role: 'staff', department: 'Administration', status: 'inactive', lastLogin: '5 days ago' },
    { id: 'user004', firstName: 'Emily', lastName: 'Williams', email: 'emily.w@example.com', role: 'student', department: 'Biology', status: 'pending', lastLogin: '3 hours ago' },
    { id: 'user005', firstName: 'Michael', lastName: 'Brown', email: 'michael.b@example.com', role: 'admin', department: 'IT', status: 'active', lastLogin: '10 minutes ago' },
    { id: 'user006', firstName: 'Sarah', lastName: 'Davis', email: 'sarah.d@example.com', role: 'faculty', department: 'Physics', status: 'suspended', lastLogin: '1 week ago' },
  ]);

  // --- Constants for UI and Mock Data ---
  const systemStats = {
    totalUsers: 2500, activeUsers: 1850, departments: 12, budgetUtilized: 75,
    systemLoad: 42, cpuUsage: 45, memoryUsage: 62, storageUsage: 38,
    networkUsage: 28, uptime: '99.8%', responseTime: '1.2s'
  };
  const userManagementData = {
    totalUsers: 2500, activeUsers: 1850, newUsersThisMonth: 120, pendingApprovals: 15,
    userRoles: { students: 1800, faculty: 450, staff: 200, admin: 50 }
  };
  const performanceData = [
    { name: 'Mon', cpu: 45, memory: 62, storage: 38, network: 25 }, { name: 'Tue', cpu: 52, memory: 65, storage: 40, network: 30 },
    { name: 'Wed', cpu: 48, memory: 63, storage: 39, network: 28 }, { name: 'Thu', cpu: 55, memory: 68, storage: 42, network: 33 },
    { name: 'Fri', cpu: 42, memory: 60, storage: 37, network: 26 }, { name: 'Sat', cpu: 38, memory: 58, storage: 35, network: 22 },
    { name: 'Sun', cpu: 35, memory: 55, storage: 34, network: 20 }
  ];
  const userActivityData = [
    { name: 'Mon', active: 1850, new: 25, inactive: 650 }, { name: 'Tue', active: 1900, new: 30, inactive: 600 },
    { name: 'Wed', active: 1880, new: 28, inactive: 620 }, { name: 'Thu', active: 1920, new: 35, inactive: 580 },
    { name: 'Fri', active: 1950, new: 40, inactive: 550 }, { name: 'Sat', active: 1800, new: 15, inactive: 700 },
    { name: 'Sun', active: 1750, new: 10, inactive: 750 }
  ];
  const userRoleData = [
    { name: 'Students', value: 1800, color: '#3B82F6' }, { name: 'Faculty', value: 450, color: '#10B981' },
    { name: 'Staff', value: 200, color: '#F59E0B' }, { name: 'Admin', value: 50, color: '#8B5CF6' }
  ];
  const departmentData = [
    { name: 'Comp. Sci.', users: 640 }, { name: 'Math', users: 420 }, { name: 'Biology', users: 380 },
    { name: 'Physics', users: 290 }, { name: 'Chemistry', users: 260 }, { name: 'Literature', users: 240 },
    { name: 'Engineering', users: 270 }
  ];
  const allDepartments = useMemo(() => [
    ...new Set([...departmentData.map(d => d.name), 'Administration', 'IT', 'General Studies', 'Arts & Humanities'])
  ].sort(), [departmentData]);

  const systemAlerts = [
    { id: 1, title: 'Server Load High', description: 'Main application server experiencing higher than normal load', severity: 'high', time: '2 hours ago' },
    { id: 2, title: 'Storage Space Low', description: 'File storage capacity reaching 80% threshold', severity: 'medium', time: '3 hours ago' },
    { id: 3, title: 'Backup Completed', description: 'Daily system backup completed successfully', severity: 'low', time: '1 day ago' },
    { id: 4, title: 'Failed Login Attempts', description: 'Multiple failed login attempts detected from IP 192.168.1.34', severity: 'high', time: '30 minutes ago' },
    { id: 5, title: 'Software Updates Available', description: '3 security patches available for installation', severity: 'medium', time: '5 hours ago' }
  ];
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // --- Event Handlers ---
  const filteredUsers = useMemo(() => users.filter(user =>
    `${user.firstName} ${user.lastName} ${user.email} ${user.role} ${user.department}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  ), [users, searchQuery]);

  const handleAddUserSubmit = async (e) => { // Renamed for clarity with form submission
    e.preventDefault();
    // Basic validation (can be expanded with a library like Zod)
    if (!newUser.firstName || !newUser.lastName || !newUser.email || (!userToEdit && !newUser.password)) {
      toast.error("Please fill all required fields.");
      return;
    }
    
    // Simulate API call
    setIsLoading(true); 
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    if (userToEdit) {
      setUsers(users.map(u => u.id === userToEdit.id ? { ...userToEdit, ...newUser, password: newUser.password || u.password } : u));
      toast.success(`${newUser.firstName} ${newUser.lastName}'s details updated.`);
    } else {
      const newUserWithId = { ...newUser, id: `user${Date.now()}`, lastLogin: 'Never' }; // Use more unique ID
      setUsers([...users, newUserWithId]);
      toast.success(`${newUser.firstName} ${newUser.lastName} added successfully.`);
    }
    
    setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'student', department: '', status: 'active' });
    setShowAddUserDialog(false);
    setUserToEdit(null);
    setIsLoading(false);
  };

  const handleEditUserClick = (user) => { // Renamed for clarity
    setUserToEdit(user);
    setNewUser({
      firstName: user.firstName, lastName: user.lastName, email: user.email,
      password: '', role: user.role, department: user.department, status: user.status
    });
    setShowAddUserDialog(true);
  };
  
  const handleDeleteUserConfirm = async () => { // Renamed for clarity
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (userToDelete) {
      setUsers(users.filter(user => user.id !== userToDelete.id));
      toast.success(`${userToDelete.firstName} ${userToDelete.lastName} deleted.`, { icon: <Trash2 className="text-red-500" /> });
      setUserToDelete(null);
    } else if (selectedUsers.length > 0) {
      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      toast.success(`${selectedUsers.length} users deleted.`, { icon: <Trash2 className="text-red-500" /> });
      setSelectedUsers([]);
    }
    setShowDeleteUserDialog(false);
    setIsLoading(false);
  };
  
  const handleBulkSelect = (checked) => {
    setSelectedUsers(checked ? filteredUsers.map(user => user.id) : []);
  };
  
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate data fetch
    setSelectedUsers([]); 
    setRefreshing(false);
    setIsLoading(false);
    toast.success("Dashboard data refreshed!");
  };

  // --- UI Helper Functions ---
  const getSeverityColorClasses = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-700';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'low': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  const getRoleBadgeClasses = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'faculty': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'staff': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'student': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderAdminProfile = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-600">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-purple-200 shadow-md">
            <AvatarImage src={adminData?.avatar} alt={adminData?.name} />
            <AvatarFallback className="bg-purple-500 text-white font-semibold text-2xl">
              {adminData?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {adminData?.name || 'Administrator'}
            </h1>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-600 mt-1.5 text-sm">
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-purple-500" />{adminData?.title || 'Admin'}</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5"><Building className="h-4 w-4 text-blue-500" />{adminData?.department || 'IT'}</span>
            </div>
             <p className="text-xs text-gray-500 mt-1">{adminData?.email}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto pt-2 md:pt-0">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 py-2.5 px-4 text-sm shadow-sm">
            <Server className="h-4 w-4 mr-2" /> System Status: Operational
          </Badge>
          <Button variant="outline" size="default" className="text-gray-700 hover:bg-gray-100 shadow-sm" onClick={handleRefresh} disabled={refreshing || isLoading}>
            {refreshing || isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
            <Settings className="h-4 w-4 mr-2" /> System Settings
          </Button>
        </div>
      </div>
    </div>
  );
  
  if (isLoading && !refreshing) { // Show full page loader only on initial load
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-[100]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <p className="text-lg font-medium text-gray-700">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-4 md:p-6 lg:p-8 space-y-6 ${refreshing ? 'opacity-75 pointer-events-none' : ''}`}>
      {renderAdminProfile()}

      <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 bg-white rounded-lg p-1 border shadow-sm">
          {[
            { value: "overview", label: "Overview", Icon: BarChart3, color: "blue" },
            { value: "users", label: "Users", Icon: Users, color: "purple" },
            { value: "system", label: "System Health", Icon: Cpu, color: "green" },
            { value: "alerts", label: "Alerts", Icon: Bell, color: "red" },
          ].map(tab => (
            <TabsTrigger 
              key={tab.value} value={tab.value}
              className={`data-[state=active]:bg-${tab.color}-100 data-[state=active]:text-${tab.color}-700 data-[state=active]:shadow-md 
                          text-gray-600 hover:bg-gray-100 hover:text-gray-800
                          flex-1 sm:flex-none px-3 py-2.5 text-xs sm:text-sm rounded-md transition-all duration-200 ease-in-out flex items-center justify-center gap-2`}
            > <tab.Icon className={`h-4 w-4 text-${tab.color}-600`} /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric Cards for Overview */}
            {[
              { title: "Total Users", value: systemStats.totalUsers.toLocaleString(), trendText: `+${userManagementData.newUsersThisMonth} this month`, Icon: Users, color: "blue" },
              { title: "System Uptime", value: systemStats.uptime, trendText: "Excellent performance", Icon: Server, color: "green" },
              { title: "Active Users", value: systemStats.activeUsers.toLocaleString(), trendText: `${Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100)}% active rate`, Icon: UserCheck, color: "purple" },
              { title: "System Load", value: `${systemStats.systemLoad}%`, trendText: systemStats.systemLoad > 70 ? 'High load' : 'Normal', Icon: Activity, color: "amber" },
            ].map(stat => (
              <Card key={stat.title} className={`border-l-4 border-${stat.color}-500 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                      <p className={`text-xs text-${stat.color}-600 mt-1.5 flex items-center`}>
                        <TrendingUp className="h-3.5 w-3.5 mr-1" /> {stat.trendText}
                      </p>
                    </div>
                    <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                      <stat.Icon className={`h-7 w-7 sm:h-8 sm:w-8 text-${stat.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Charts for Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader><CardTitle className="flex items-center gap-2 text-gray-700 text-base"><Users className="h-5 w-5 text-blue-600" />User Activity Trends</CardTitle></CardHeader>
              <CardContent className="p-4 sm:p-6 h-80"><ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userActivityData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs><linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.7}/><stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/></linearGradient><linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.7}/><stop offset="95%" stopColor={COLORS[1]} stopOpacity={0.1}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-40" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} />
                  <Tooltip wrapperClassName="text-xs rounded-md shadow-lg" contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e0e0e0'}}/>
                  <Legend wrapperStyle={{fontSize: '12px'}} /><Area type="monotone" dataKey="active" stroke={COLORS[0]} fill="url(#colorActive)" name="Active Users" strokeWidth={2} /><Area type="monotone" dataKey="new" stroke={COLORS[1]} fill="url(#colorNew)" name="New Users" strokeWidth={2} />
                </AreaChart></ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader><CardTitle className="flex items-center gap-2 text-gray-700 text-base"><Activity className="h-5 w-5 text-green-600" />System Performance</CardTitle></CardHeader>
              <CardContent className="p-4 sm:p-6 h-80"><ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-40" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} unit="%" />
                  <Tooltip wrapperClassName="text-xs rounded-md shadow-lg" contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e0e0e0'}}/>
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                  <Line type="monotone" dataKey="cpu" stroke={COLORS[0]} name="CPU" strokeWidth={2.5} dot={{r:3}} activeDot={{r:5}} />
                  <Line type="monotone" dataKey="memory" stroke={COLORS[1]} name="Memory" strokeWidth={2.5} dot={{r:3}} activeDot={{r:5}} />
                </LineChart></ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader><CardTitle className="flex items-center gap-2 text-gray-700 text-base"><Award className="h-5 w-5 text-purple-600" />User Role Distribution</CardTitle></CardHeader>
              <CardContent className="p-4 sm:p-6 h-80 flex items-center justify-center"><ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={userRoleData} cx="50%" cy="50%" labelLine={false} outerRadius={100} innerRadius={60} dataKey="value" nameKey="name" label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`} fontSize={11}>
                  {userRoleData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />))}</Pie>
                  <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} layout="horizontal" verticalAlign="bottom" align="center"/>
                  <Tooltip wrapperClassName="text-xs rounded-md shadow-lg" contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e0e0e0'}}/>
                </PieChart></ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader><CardTitle className="flex items-center gap-2 text-gray-700 text-base"><Building className="h-5 w-5 text-teal-600" />Users by Department</CardTitle></CardHeader>
              <CardContent className="p-4 sm:p-6 h-80"><ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="opacity-40" />
                  <XAxis type="number" fontSize={12} /><YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip wrapperClassName="text-xs rounded-md shadow-lg" contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e0e0e0'}}/>
                  <Bar dataKey="users" barSize={18} radius={[0, 4, 4, 0]}>{departmentData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Bar>
                </BarChart></ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Management Tab Content */}
        <TabsContent value="users" className="mt-0">
          <Card className="shadow-xl overflow-hidden">
            <CardHeader className="border-b bg-gray-50/50 p-4 sm:p-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="flex items-center gap-2.5 text-lg text-gray-800">
                  <Users className="h-6 w-6 text-purple-600" /> Manage Users ({filteredUsers.length})
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-grow md:flex-grow-0 md:w-72">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input placeholder="Search users..." className="pl-10 pr-4 py-2.5 w-full text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Dialog open={showAddUserDialog} onOpenChange={(isOpen) => { setShowAddUserDialog(isOpen); if (!isOpen) { setUserToEdit(null); setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'student', department: '', status: 'active' }); }}}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm w-full md:w-auto">
                        <UserPlus className="h-4 w-4 mr-2" /> {userToEdit ? 'Update User' : 'Add User'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg p-0">
                      <DialogHeader className="p-6 border-b"><DialogTitle className="text-xl font-semibold text-gray-800">{userToEdit ? 'Edit User Details' : 'Add New User'}</DialogTitle></DialogHeader>
                      <form onSubmit={handleAddUserSubmit} className="p-6 max-h-[70vh] overflow-y-auto"><div className="grid gap-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" placeholder="John" required value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} className="mt-1.5" /></div>
                          <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" placeholder="Doe" required value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} className="mt-1.5" /></div>
                        </div>
                        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="john.doe@example.com" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="mt-1.5" /></div>
                        <div><Label htmlFor="password">Password {userToEdit && <span className="text-xs text-gray-500">(Leave blank to keep current)</span>}</Label>
                          <div className="relative mt-1.5"><Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required={!userToEdit} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="pr-10" />
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full w-10 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div><Label htmlFor="role">Role</Label>
                            <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select role" /></SelectTrigger>
                              <SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="faculty">Faculty</SelectItem><SelectItem value="staff">Staff</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div><Label htmlFor="department">Department</Label>
                            <Select value={newUser.department} onValueChange={(value) => setNewUser({...newUser, department: value})}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select department" /></SelectTrigger>
                              <SelectContent>{allDepartments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div><Label>Account Status</Label>
                          <RadioGroup value={newUser.status} onValueChange={(value) => setNewUser({...newUser, status: value})} className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                            {['active', 'inactive', 'pending', 'suspended'].map(sVal => (<div key={sVal} className="flex items-center space-x-2"><RadioGroupItem value={sVal} id={`status-${sVal}`} /><Label htmlFor={`status-${sVal}`} className="font-normal cursor-pointer">{sVal.charAt(0).toUpperCase() + sVal.slice(1)}</Label></div>))}
                          </RadioGroup>
                        </div>
                      </div>
                      <DialogFooter className="mt-6 pt-6 border-t"><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading} >
                          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2" />}
                          {userToEdit ? 'Save Changes' : 'Add User'}
                        </Button>
                      </DialogFooter></form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-450px)] xl:h-[calc(100vh-400px)] min-h-[350px]">
                <Table className="min-w-full">
                  <TableHeader className="sticky top-0 bg-gray-100 z-10 shadow-sm">
                    <TableRow><TableHead className="w-12 px-4"><Checkbox checked={(filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length) || (selectedUsers.length > 0 && selectedUsers.length === users.length && searchQuery === '')} onCheckedChange={handleBulkSelect} disabled={filteredUsers.length === 0} aria-label="Select all" /></TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">User</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]">Email</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Role</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Status</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (filteredUsers.map(user => (
                      <TableRow key={user.id} className="hover:bg-purple-50/30 transition-colors duration-150" data-state={selectedUsers.includes(user.id) ? "selected" : ""}>
                        <TableCell className="px-4"><Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => handleUserSelect(user.id)} aria-label={`Select ${user.firstName}`} /></TableCell>
                        <TableCell className="py-3 px-4"><div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shadow-sm"><AvatarImage src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random&color=fff`} /><AvatarFallback className="bg-gray-200 text-gray-600 text-xs">{user.firstName[0]}{user.lastName[0]}</AvatarFallback></Avatar>
                          <div><div className="font-medium text-sm text-gray-800">{user.firstName} {user.lastName}</div><div className="text-xs text-gray-500">ID: {user.id}</div></div>
                        </div></TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-600">{user.email}</TableCell>
                        <TableCell className="py-3 px-4 text-center"><Badge variant="outline" className={`${getRoleBadgeClasses(user.role)} px-2.5 py-1 text-xs font-medium rounded-full`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge></TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-600">{user.department}</TableCell>
                        <TableCell className="py-3 px-4 text-center"><Badge variant="outline" className={`${getStatusBadgeClasses(user.status)} px-2.5 py-1 text-xs font-medium rounded-full`}>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</Badge></TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-500">{user.lastLogin}</TableCell>
                        <TableCell className="py-3 px-4 text-right"><div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md" onClick={() => handleEditUserClick(user)}><Edit className="h-4 w-4" /><span className="sr-only">Edit</span></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md" onClick={() => { setUserToDelete(user); setShowDeleteUserDialog(true); }}><Trash2 className="h-4 w-4" /><span className="sr-only">Delete</span></Button>
                        </div></TableCell>
                      </TableRow>
                    ))) : (
                      <TableRow><TableCell colSpan={8} className="h-40 text-center text-gray-500">
                        <Search className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                        <p className="font-medium">No users found.</p>
                        <p className="text-sm">Try adjusting your search query or add new users.</p>
                      </TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
              {selectedUsers.length > 0 && (
                <CardFooter className="p-3 border-t bg-gray-50 flex items-center justify-between sticky bottom-0 z-10 shadow-sm">
                  <p className="text-sm text-gray-600"><span className="font-semibold text-purple-600">{selectedUsers.length}</span> user(s) selected</p>
                  <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => {setUserToDelete(null); setShowDeleteUserDialog(true);}}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Selected ({selectedUsers.length})
                  </Button>
                </CardFooter>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab Content */}
        <TabsContent value="system" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* System Health Cards */}
                {[
                    { title: 'CPU Usage', value: systemStats.cpuUsage, Icon: Cpu, color: "red", unit:"%" },
                    { title: 'Memory Usage', value: systemStats.memoryUsage, Icon: HardDrive, color: "amber", unit:"%"  },
                    { title: 'Storage Usage', value: systemStats.storageUsage, Icon: Database, color: "green", unit:"%"  },
                    { title: 'Network Usage', value: systemStats.networkUsage, Icon: Network, color: "blue", unit:"%"  },
                    { title: 'System Uptime', value: systemStats.uptime, Icon: Clock, color: "teal", unit:"" },
                    { title: 'Avg. Response', value: systemStats.responseTime, Icon: Activity, color: "indigo", unit:"" },
                ].map(stat => (
                <Card key={stat.title} className={`shadow-lg border-l-4 border-${stat.color}-500 hover:shadow-xl transition-shadow`}>
                    <CardHeader className="pb-2"><CardTitle className={`text-sm font-medium text-gray-500 flex items-center`}><stat.Icon className={`h-4 w-4 mr-2 text-${stat.color}-600`} />{stat.title}</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-800">{stat.value}{stat.unit}</div>
                        {stat.unit === "%" && <Progress value={stat.value} className={`h-1.5 mt-2 bg-${stat.color}-100`} indicatorClassName={`bg-${stat.color}-500`} />}
                    </CardContent>
                </Card>
                ))}
            </div>
            <Card className="shadow-xl md:col-span-2 lg:col-span-3">
                <CardHeader><CardTitle className="flex items-center gap-2 text-gray-700 text-base"><BarChart3 className="h-5 w-5 text-indigo-600" />Weekly Resource Utilization</CardTitle></CardHeader>
                <CardContent className="p-4 sm:p-6 h-96"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-40" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} label={{ value: '% Usage', angle: -90, position: 'insideLeft', offset: 0, style:{fontSize:'12px'}}} />
                        <Tooltip wrapperClassName="text-xs rounded-md shadow-lg" contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e0e0e0'}}/>
                        <Legend wrapperStyle={{fontSize: '12px'}} />
                        <Line type="monotone" dataKey="cpu" stroke={COLORS[0]} name="CPU" strokeWidth={2.5} dot={{r:3}} activeDot={{r:5}} />
                        <Line type="monotone" dataKey="memory" stroke={COLORS[1]} name="Memory" strokeWidth={2.5} dot={{r:3}} activeDot={{r:5}} />
                        <Line type="monotone" dataKey="storage" stroke={COLORS[2]} name="Storage" strokeWidth={2.5} dot={{r:3}} activeDot={{r:5}} />
                        <Line type="monotone" dataKey="network" stroke={COLORS[4]} name="Network" strokeWidth={2.5} dot={{r:3}} activeDot={{r:5}} />
                    </LineChart></ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Alerts & Logs Tab Content */}
        <TabsContent value="alerts" className="mt-0">
          <Card className="shadow-xl">
            <CardHeader className="border-b bg-gray-50/50 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="flex items-center gap-2.5 text-lg text-gray-800"><Bell className="h-6 w-6 text-red-600" /> System Alerts ({systemAlerts.length})</CardTitle>
                <Button variant="outline" size="sm" className="text-gray-700 hover:bg-gray-100 shadow-sm"><Filter className="h-4 w-4 mr-2" />Filter Alerts</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
                {systemAlerts.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {systemAlerts.sort((a, b) => { // Basic sort for demo, use proper date objects if available
                        const timeA = parseInt(a.time.split(' ')[0]);
                        const timeB = parseInt(b.time.split(' ')[0]);
                        if (a.time.includes('minute')) return timeB - timeA; // Sort minutes first
                        if (a.time.includes('hour') && b.time.includes('hour')) return timeB - timeA;
                        return 0; // Fallback
                    }).map((alert) => (
                      <li key={alert.id} className={`p-4 sm:p-5 hover:bg-opacity-50 transition-colors ${getSeverityColorClasses(alert.severity)}`}>
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <div className="flex-shrink-0 pt-0.5">
                            {alert.severity === 'high' && <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />}
                            {alert.severity === 'medium' && <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />}
                            {alert.severity === 'low' && <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <h4 className="text-sm sm:text-base font-semibold">{alert.title}</h4>
                              <p className="text-xs text-gray-500 mt-0.5 sm:mt-0 shrink-0 sm:ml-2">{alert.time}</p>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{alert.description}</p>
                          </div>
                          <Badge variant="outline" className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full border-current ${getSeverityColorClasses(alert.severity)}`}>
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-10 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                    <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
                    <p className="font-medium text-xl">All Systems Clear!</p>
                    <p className="text-sm">No active alerts or critical notifications.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            {systemAlerts.length > 0 && (<CardFooter className="border-t p-3 flex justify-end bg-gray-50 shadow-sm">
              <Button variant="outline" size="sm" className="text-gray-700 hover:bg-gray-100">View Full Log</Button>
            </CardFooter>)}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-6 border-b"><DialogTitle className="text-xl font-semibold text-gray-800 flex items-center"><AlertTriangle className="h-6 w-6 mr-2.5 text-red-500"/>Confirm Deletion</DialogTitle></DialogHeader>
          <div className="p-6"><p className="text-sm text-gray-600">
            Are you sure you want to delete {userToDelete ? <span className="font-medium text-gray-800">{userToDelete.firstName} {userToDelete.lastName}</span> : <span className="font-medium text-gray-800">{selectedUsers.length} selected user(s)</span>}? This action is irreversible.
          </p></div>
          <DialogFooter className="p-6 border-t bg-gray-50">
            <Button variant="outline" className="hover:bg-gray-100" onClick={() => setShowDeleteUserDialog(false)} disabled={isLoading}>Cancel</Button>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={handleDeleteUserConfirm} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Trash2 className="h-4 w-4 mr-2" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;