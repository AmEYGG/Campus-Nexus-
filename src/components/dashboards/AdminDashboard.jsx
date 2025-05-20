import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
// Switch is not used, Textarea is not used. Removed.
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from '../ui/use-toast';
import {
  Users,
  Building,
  DollarSign, // Not explicitly used in final code, but related to budget. Keep for context.
  Activity,
  Settings,
  Shield, // Not explicitly used. Can be removed or kept for future security features.
  FileText, // Not explicitly used.
  Bell,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Plus, // Used in Add User button, but UserPlus is more specific.
  Trash2,
  Search,
  UserPlus,
  UserMinus, // Not explicitly used. Trash2 for delete.
  Server,
  Database,
  Network,
  Cpu,
  HardDrive,
  Clock,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserX, // Not explicitly used. Could be for deactivate.
  Filter,
  MoreVertical,
  RefreshCw,
  Loader2,
  ChevronDown, // Not explicitly used, but common for dropdowns.
  Mail, // Used in Add User form context (email icon not explicitly shown but relevant).
  Phone, // Not used.
  Key, // Used for password context.
  Eye,
  EyeOff,
  Save,
  X, // Used for DialogClose.
  Calendar, // Not used.
  User, // General user icon.
  Award,
  Edit // Added for edit user button
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  
  // Form states
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    status: 'active'
  });
  
  const [userToEdit, setUserToEdit] = useState(null); // For editing user
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Mock users data
  const [users, setUsers] = useState([
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: 'student', department: 'Computer Science', status: 'active', lastLogin: '2 hours ago' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', role: 'faculty', department: 'Mathematics', status: 'active', lastLogin: '1 day ago' },
    { id: 3, firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@example.com', role: 'staff', department: 'Administration', status: 'inactive', lastLogin: '5 days ago' },
    { id: 4, firstName: 'Emily', lastName: 'Williams', email: 'emily.w@example.com', role: 'student', department: 'Biology', status: 'active', lastLogin: '3 hours ago' },
    { id: 5, firstName: 'Michael', lastName: 'Brown', email: 'michael.b@example.com', role: 'admin', department: 'IT', status: 'active', lastLogin: '10 minutes ago' },
  ]);

  // Enhanced system stats
  const systemStats = {
    totalUsers: 2500,
    activeUsers: 1850,
    departments: 12,
    budgetUtilized: 75,
    systemLoad: 42,
    cpuUsage: 45,
    memoryUsage: 62,
    storageUsage: 38,
    networkUsage: 28,
    uptime: '99.8%',
    responseTime: '1.2s'
  };

  // User management data
  const userManagementData = {
    totalUsers: 2500,
    activeUsers: 1850,
    newUsersThisMonth: 120,
    pendingApprovals: 15,
    userRoles: {
      students: 1800,
      faculty: 450,
      staff: 200,
      admin: 50
    }
  };

  // System performance data with added data points
  const performanceData = [
    { name: 'Mon', cpu: 45, memory: 62, storage: 38, network: 25 },
    { name: 'Tue', cpu: 52, memory: 65, storage: 40, network: 30 },
    { name: 'Wed', cpu: 48, memory: 63, storage: 39, network: 28 },
    { name: 'Thu', cpu: 55, memory: 68, storage: 42, network: 33 },
    { name: 'Fri', cpu: 42, memory: 60, storage: 37, network: 26 },
    { name: 'Sat', cpu: 38, memory: 58, storage: 35, network: 22 },
    { name: 'Sun', cpu: 35, memory: 55, storage: 34, network: 20 }
  ];

  // User activity data
  const userActivityData = [
    { name: 'Mon', active: 1850, new: 25, inactive: 650 },
    { name: 'Tue', active: 1900, new: 30, inactive: 600 },
    { name: 'Wed', active: 1880, new: 28, inactive: 620 },
    { name: 'Thu', active: 1920, new: 35, inactive: 580 },
    { name: 'Fri', active: 1950, new: 40, inactive: 550 },
    { name: 'Sat', active: 1800, new: 15, inactive: 700 },
    { name: 'Sun', active: 1750, new: 10, inactive: 750 }
  ];

  // User Role Distribution data
  const userRoleData = [
    { name: 'Students', value: 1800, color: '#3B82F6' },
    { name: 'Faculty', value: 450, color: '#10B981' },
    { name: 'Staff', value: 200, color: '#F59E0B' },
    { name: 'Admin', value: 50, color: '#8B5CF6' }
  ];

  // Department distribution data
  const departmentData = [
    { name: 'Computer Science', users: 640 },
    { name: 'Mathematics', users: 420 },
    { name: 'Biology', users: 380 },
    { name: 'Physics', users: 290 },
    { name: 'Chemistry', users: 260 },
    { name: 'Literature', users: 240 },
    { name: 'Engineering', users: 270 }
  ];
  
  const allDepartments = [
    ...new Set([
      ...departmentData.map(d => d.name), 
      'Administration', 
      'IT',
    ])
  ].sort();


  const systemAlerts = [
    { id: 1, title: 'Server Load High', description: 'Main application server experiencing higher than normal load', severity: 'high', time: '2 hours ago' },
    { id: 2, title: 'Storage Space Low', description: 'File storage capacity reaching 80% threshold', severity: 'medium', time: '3 hours ago' },
    { id: 3, title: 'Backup Completed', description: 'Daily system backup completed successfully', severity: 'low', time: '1 day ago' },
    { id: 4, title: 'Failed Login Attempts', description: 'Multiple failed login attempts detected from IP 192.168.1.34', severity: 'high', time: '30 minutes ago' },
    { id: 5, title: 'Software Updates Available', description: '3 security patches available for installation', severity: 'medium', time: '5 hours ago' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName} ${user.email} ${user.role} ${user.department}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (e) => {
    e.preventDefault();
    const id = userToEdit ? userToEdit.id : users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    if (userToEdit) {
      // Update existing user
      setUsers(users.map(u => u.id === userToEdit.id ? { ...userToEdit, ...newUser, password: newUser.password || u.password } : u)); // Keep old password if not changed
      toast({ title: "User Updated", description: `${newUser.firstName} ${newUser.lastName}'s details have been updated.` });
    } else {
      // Add new user
      const newUserWithId = { ...newUser, id, lastLogin: 'Never' };
      setUsers([...users, newUserWithId]);
      toast({ title: "User Added", description: `${newUser.firstName} ${newUser.lastName} has been added successfully.` });
    }
    
    setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'student', department: '', status: 'active' });
    setShowAddUserDialog(false);
    setUserToEdit(null);
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setNewUser({ // Pre-fill form, but not password for editing
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '', // Password field should be empty for editing, or show "********" and only update if changed
      role: user.role,
      department: user.department,
      status: user.status
    });
    setShowAddUserDialog(true);
  };
  
  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(user => user.id !== userToDelete.id));
      toast({ title: "User Deleted", description: `${userToDelete.firstName} ${userToDelete.lastName} has been deleted.`, variant: "destructive" });
      setUserToDelete(null);
    } else if (selectedUsers.length > 0) {
      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      toast({ title: "Users Deleted", description: `${selectedUsers.length} users have been deleted.`, variant: "destructive" });
      setSelectedUsers([]);
    }
    setShowDeleteUserDialog(false);
  };
  
  const handleBulkSelect = (checked) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };
  
  const handleUserSelect = (userId) => {
    setSelectedUsers(prevSelected => 
      prevSelected.includes(userId) 
        ? prevSelected.filter(id => id !== userId) 
        : [...prevSelected, userId]
    );
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    setIsLoading(true); // Show main loader as well
    setTimeout(() => {
      // Simulate fetching new data for users or other parts
      // For example, re-fetch users (here just resetting selection)
      setSelectedUsers([]); 
      setRefreshing(false);
      setIsLoading(false);
      toast({ title: "Data Refreshed", description: "Dashboard data has been updated." });
    }, 1500);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border border-red-200 text-red-700';
      case 'medium': return 'bg-yellow-50 border border-yellow-200 text-yellow-700';
      case 'low': return 'bg-green-50 border border-green-200 text-green-700';
      default: return 'bg-gray-50 border border-gray-200 text-gray-700';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'faculty': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-amber-100 text-amber-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 p-6 bg-gray-50 min-h-screen ${isLoading && !refreshing ? 'opacity-50 pointer-events-none' : ''}`}>
      {isLoading && !refreshing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700">Loading Dashboard...</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Control Panel</h1>
            <p className="mt-1 text-sm text-gray-500">Central hub for system monitoring and user management.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 py-2 text-sm">
              <Server className="h-4 w-4 mr-2" />
              System Status: Operational
            </Badge>
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-gray-700 hover:bg-gray-100" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Data
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-gray-700 hover:bg-gray-100">
              <Settings className="h-4 w-4" />
              Global Settings
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-gray-600 py-2.5">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-gray-600 py-2.5">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-gray-600 py-2.5">
            <Cpu className="h-4 w-4 mr-2" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-gray-600 py-2.5">
            <Bell className="h-4 w-4 mr-2" />
            Alerts & Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overview Cards - Re-styled for better visual hierarchy */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{systemStats.totalUsers.toLocaleString()}</h3>
                    <p className="text-xs text-blue-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +{userManagementData.newUsersThisMonth} this month
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{systemStats.uptime}</h3>
                    <p className="text-xs text-green-600 mt-1">
                      <Activity className="h-3 w-3 inline mr-1" />
                      Excellent performance
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Server className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{systemStats.activeUsers.toLocaleString()}</h3>
                    <p className="text-xs text-purple-600 mt-1">
                      <UserCheck className="h-3 w-3 inline mr-1" />
                      {Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100)}% active rate
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <UserCheck className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Load</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{systemStats.systemLoad}%</h3>
                    <p className="text-xs text-amber-600 mt-1">
                      <Activity className="h-3 w-3 inline mr-1" />
                      {systemStats.systemLoad > 70 ? 'High load' : 'Normal operation'}
                    </p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Cpu className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-md">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Users className="h-5 w-5 text-blue-600" />
                  User Activity Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userActivityData}>
                      <defs>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="active" stroke="#3B82F6" fillOpacity={1} fill="url(#colorActive)" name="Active Users" />
                      <Area type="monotone" dataKey="new" stroke="#10B981" fillOpacity={1} fill="url(#colorNew)" name="New Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Activity className="h-5 w-5 text-green-600" />
                  System Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} name="CPU %" activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} name="Memory %" activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="storage" stroke="#F59E0B" strokeWidth={2} name="Storage %" activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="network" stroke="#8B5CF6" strokeWidth={2} name="Network %" activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Award className="h-5 w-5 text-indigo-600" />
                  User Role Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={110}
                        innerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Building className="h-5 w-5 text-teal-600" />
                  Users by Department
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="users" barSize={20} radius={[0, 4, 4, 0]}>
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          <Card className="shadow-md">
            <CardHeader className="border-b border-gray-200 py-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Users className="h-6 w-6 text-blue-600" />
                  Manage Users ({filteredUsers.length})
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, role..."
                      className="pl-9 w-full md:w-72"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Dialog open={showAddUserDialog} onOpenChange={(isOpen) => {
                      setShowAddUserDialog(isOpen);
                      if (!isOpen) setUserToEdit(null); // Reset edit state on close
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <UserPlus className="h-4 w-4 mr-2" />
                        {userToEdit ? 'Update User' : 'Add New User'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-xl">{userToEdit ? 'Edit User Details' : 'Add New User'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddUser}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input id="firstName" placeholder="John" required value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input id="lastName" placeholder="Doe" required value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="john.doe@example.com" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">Password {userToEdit && '(Leave blank to keep current)'}</Label>
                            <div className="relative">
                              <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required={!userToEdit} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="pr-10" />
                              <button type="button" className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor="role">User Role</Label>
                              <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="faculty">Faculty</SelectItem>
                                  <SelectItem value="staff">Staff</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor="department">Department</Label>
                              <Select value={newUser.department} onValueChange={(value) => setNewUser({...newUser, department: value})}>
                                <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                                <SelectContent>
                                  {allDepartments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor="status">Account Status</Label>
                            <RadioGroup value={newUser.status} onValueChange={(value) => setNewUser({...newUser, status: value})} className="flex space-x-4 pt-1">
                              {['active', 'inactive', 'pending', 'suspended'].map(statusVal => (
                                <div key={statusVal} className="flex items-center space-x-2">
                                  <RadioGroupItem value={statusVal} id={statusVal} />
                                  <Label htmlFor={statusVal} className="cursor-pointer font-normal">{statusVal.charAt(0).toUpperCase() + statusVal.slice(1)}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </div>
                        <DialogFooter className="mt-2">
                           <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                           </DialogClose>
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Save className="h-4 w-4 mr-2" />
                            {userToEdit ? 'Save Changes' : 'Add User'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-420px)] min-h-[300px]"> {/* Adjust height dynamically */}
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow>
                      <TableHead className="w-[50px] px-4">
                        <Checkbox 
                          checked={(filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length) || (selectedUsers.length > 0 && selectedUsers.length === users.length && searchQuery === '')}
                          onCheckedChange={handleBulkSelect}
                          disabled={filteredUsers.length === 0}
                          aria-label="Select all users"
                        />
                      </TableHead>
                      <TableHead className="min-w-[180px]">Name</TableHead>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell className="px-4">
                            <Checkbox 
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => handleUserSelect(user.id)}
                              aria-label={`Select user ${user.firstName} ${user.lastName}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName} ${user.lastName}&backgroundColor=3B82F6,10B981,F59E0B,8B5CF6&textColor=ffffff`} />
                                <AvatarFallback className="bg-gray-200 text-gray-600">{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                                <div className="text-xs text-gray-500">{user.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${getRoleColor(user.role)} border-transparent font-medium`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">{user.department}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${getStatusColor(user.status)} border-transparent font-medium`}>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">{user.lastLogin}</TableCell>
                          <TableCell className="text-right pr-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit User</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => { setUserToDelete(user); setShowDeleteUserDialog(true); }}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete User</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                          <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          No users found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
              {selectedUsers.length > 0 && (
                <CardFooter className="p-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                  <p className="text-sm text-gray-600">{selectedUsers.length} user(s) selected</p>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteUserDialog(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedUsers.length})
                  </Button>
                </CardFooter>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Server className="h-5 w-5 text-blue-600" /> System Stability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">System Uptime</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700">{systemStats.uptime}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Avg. Response Time</span>
                  <span className="text-sm font-semibold text-gray-800">{systemStats.responseTime}</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">Overall System Load</span>
                    <span className="text-sm font-semibold text-gray-800">{systemStats.systemLoad}%</span>
                  </div>
                  <Progress value={systemStats.systemLoad} className="h-2 [&>div]:bg-blue-500" />
                </div>
              </CardContent>
            </Card>
        
            {[
              { title: 'CPU Usage', value: systemStats.cpuUsage, Icon: Cpu, color: '#EF4444', bgColor: 'bg-red-500' },
              { title: 'Memory Usage', value: systemStats.memoryUsage, Icon: HardDrive, color: '#F59E0B', bgColor: 'bg-amber-500' },
            ].map(stat => (
              <Card key={stat.title} className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <stat.Icon className={`h-5 w-5`} style={{color: stat.color}} /> {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative h-32 w-32 mx-auto mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[{ name: 'Usage', value: stat.value }, { name: 'Free', value: 100 - stat.value }]}
                          cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value" paddingAngle={3}
                        >
                          <Cell fill={stat.color} />
                          <Cell fill="#E5E7EB" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">{stat.value}%</span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500">Current {stat.title.toLowerCase().replace(' usage', '')} utilization</p>
                </CardContent>
              </Card>
            ))}

            <Card className="shadow-md">
              <CardHeader><CardTitle className="flex items-center gap-2 text-gray-700"><Database className="h-5 w-5 text-green-600" /> Storage</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-2">
                <p className="text-sm font-medium text-gray-600">Disk Space Used</p>
                <Progress value={systemStats.storageUsage} className="h-3 [&>div]:bg-green-500" />
                <p className="text-right text-sm font-semibold text-gray-800">{systemStats.storageUsage}% Used</p>
                <p className="text-xs text-gray-500">Total Capacity: 5TB (SSD Array)</p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader><CardTitle className="flex items-center gap-2 text-gray-700"><Network className="h-5 w-5 text-purple-600" /> Network</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-2">
                <p className="text-sm font-medium text-gray-600">Current Throughput</p>
                <Progress value={systemStats.networkUsage} className="h-3 [&>div]:bg-purple-500" />
                <p className="text-right text-sm font-semibold text-gray-800">{systemStats.networkUsage}% of Max</p>
                <p className="text-xs text-gray-500">Interface: eth0 @ 10 Gbps</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Weekly Resource Utilization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: '% Usage', angle: -90, position: 'insideLeft', offset: -5 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cpu" stroke="#EF4444" name="CPU" strokeWidth={2} dot={{r:3}} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="memory" stroke="#F59E0B" name="Memory" strokeWidth={2} dot={{r:3}} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="storage" stroke="#10B981" name="Storage" strokeWidth={2} dot={{r:3}} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="network" stroke="#3B82F6" name="Network" strokeWidth={2} dot={{r:3}} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-0">
          <Card className="shadow-md">
            <CardHeader className="border-b border-gray-200 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Bell className="h-6 w-6 text-red-600" /> System Alerts & Notifications ({systemAlerts.length})
                </CardTitle>
                <Button variant="outline" size="sm" className="text-gray-700 hover:bg-gray-100">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Alerts
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-350px)] min-h-[400px]">
                {systemAlerts.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {systemAlerts.sort((a, b) => new Date('1970/01/01 ' + b.time.replace(' ago', '')) - new Date('1970/01/01 ' + a.time.replace(' ago', ''))).map((alert) => ( // Simple sort for demo
                      <li key={alert.id} className={`p-4 hover:bg-gray-100 transition-colors ${getSeverityColor(alert.severity)}`}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 pt-0.5">
                            {alert.severity === 'high' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                            {alert.severity === 'medium' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                            {alert.severity === 'low' && <CheckCircle className="h-5 w-5 text-green-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-semibold">{alert.title}</h4>
                              <p className="text-xs text-gray-500 shrink-0 ml-2">{alert.time}</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 truncate">{alert.description}</p>
                          </div>
                          <Badge variant="outline" className={`ml-2 text-xs font-medium ${getSeverityColor(alert.severity)} border-current`}>
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-10 text-center text-gray-500">
                    <CheckCircle className="h-16 w-16 mx-auto text-green-400 mb-3" />
                    <p className="font-medium text-lg">All Clear!</p>
                    <p className="text-sm">No active alerts or critical notifications at this time.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            {systemAlerts.length > 0 && (
                <CardFooter className="border-t p-3 flex justify-end bg-gray-50">
                    <Button variant="outline" size="sm" className="text-gray-700 hover:bg-gray-100">View Full Log</Button>
                </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete {userToDelete ? `user ${userToDelete.firstName} ${userToDelete.lastName}` : `${selectedUsers.length} selected user(s)`}? 
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteUserDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;