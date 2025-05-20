import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Download,
  Filter,
  Search,
  Calendar,
  BarChart2,
  PieChart,
  RefreshCw,
  Loader2,
  Users,
  Clock,
  Target,
  Eye,
  Edit3,
  ArrowUp,
  ArrowDown,
  Bell,
  Settings
} from 'lucide-react';

// Mock data for demonstration
const mockStatistics = {
  totalBudget: 5000000,
  spentBudget: 3500000,
  pendingRequests: 12,
  approvedThisMonth: 18,
  rejectedThisMonth: 3,
  departments: [
    { name: 'IT', allocation: 1500000, spent: 1200000 },
    { name: 'Marketing', allocation: 1000000, spent: 850000 },
    { name: 'HR', allocation: 800000, spent: 600000 },
    { name: 'Operations', allocation: 700000, spent: 500000 }
  ]
};

const mockApplications = [
  {
    id: 1,
    title: "New Laptop Procurement",
    department: "IT",
    submittedBy: "John Doe",
    requestedAmount: 250000,
    category: "Equipment",
    status: "pending",
    submittedDate: "2024-02-15",
    description: "Need to procure 10 new laptops for the development team",
    priority: "high",
    expenseBreakdown: [
      { item: "Laptops (10x)", amount: 200000 },
      { item: "Setup & Installation", amount: 30000 },
      { item: "Software Licenses", amount: 20000 }
    ],
    attachments: [
      { name: "quotation.pdf", url: "#" },
      { name: "specifications.docx", url: "#" }
    ]
  },
  {
    id: 2,
    title: "Marketing Campaign Budget",
    department: "Marketing",
    submittedBy: "Jane Smith",
    requestedAmount: 500000,
    category: "Campaign",
    status: "approved",
    submittedDate: "2024-02-14",
    description: "Q2 digital marketing campaign across multiple platforms",
    priority: "medium",
    expenseBreakdown: [
      { item: "Ad Spend", amount: 350000 },
      { item: "Creative Development", amount: 100000 },
      { item: "Analytics Tools", amount: 50000 }
    ],
    attachments: [
      { name: "campaign-brief.pdf", url: "#" }
    ]
  },
  {
    id: 3,
    title: "Office Renovation",
    department: "Operations",
    submittedBy: "Mike Johnson",
    requestedAmount: 800000,
    category: "Infrastructure",
    status: "rejected",
    submittedDate: "2024-02-13",
    description: "Renovation of the main office space",
    priority: "low",
    expenseBreakdown: [
      { item: "Construction", amount: 600000 },
      { item: "Furniture", amount: 150000 },
      { item: "Decor & Fixtures", amount: 50000 }
    ],
    attachments: [
      { name: "renovation-plan.pdf", url: "#" },
      { name: "contractor-quotes.xlsx", url: "#" }
    ]
  }
];

const FundManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [dateRange, setDateRange] = useState('week');
  const [showStats, setShowStats] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState(mockApplications);
  const [statistics, setStatistics] = useState(mockStatistics);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');

  // Simulated data fetching
  const fetchData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle application approval/rejection
  const handleApproval = async (applicationId, isApproved) => {
    if (!approvalNote) {
      alert('Please add a note for your decision');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setApplications(applications.map(app =>
      app.id === applicationId
        ? { ...app, status: isApproved ? 'approved' : 'rejected' }
        : app
    ));

    setSelectedApplication(null);
    setApprovalNote('');
    setIsSubmitting(false);
  };

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterBy === 'all' || app.status === filterBy || app.priority === filterBy;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.submittedDate) - new Date(a.submittedDate);
      if (sortBy === 'amount') return b.requestedAmount - a.requestedAmount;
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  const StatCard = ({ title, value, icon: Icon, color, trend, description }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg border border-white/10`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
          {description && (
            <p className="text-white/60 text-xs mt-1">{description}</p>
          )}
        </div>
        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-3">
          {trend > 0 ? (
            <ArrowUp className="h-4 w-4 text-green-300 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-300 mr-1" />
          )}
          <span className="text-white/70 text-sm">
            {Math.abs(trend)}% from last month
          </span>
        </div>
      )}
    </motion.div>
  );

  const ApplicationCard = ({ application, onClick }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer"
      onClick={() => onClick(application)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {application.title}
            </h3>
            <p className="text-sm text-gray-500">{application.department}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              application.status === 'approved'
                ? 'bg-green-100 text-green-800'
                : application.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              application.priority === 'high'
                ? 'bg-red-50 text-red-700'
                : application.priority === 'medium'
                ? 'bg-yellow-50 text-yellow-700'
                : 'bg-blue-50 text-blue-700'
            }`}>
              {application.priority}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 text-green-500" />
            ₹{application.requestedAmount.toLocaleString()}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            {application.submittedDate}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 text-purple-500" />
            {application.submittedBy}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="w-4 h-4 mr-2 text-orange-500" />
            {application.attachments.length} files
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {application.description}
        </p>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Category: {application.category}</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const DashboardView = () => (
    <div className="space-y-8">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Budget"
          value={`₹${(statistics.totalBudget / 100000).toFixed(1)}L`}
          icon={DollarSign}
          color="from-blue-500 to-blue-600"
          trend={12.5}
          description="Annual allocation"
        />
        <StatCard
          title="Spent"
          value={`₹${(statistics.spentBudget / 100000).toFixed(1)}L`}
          icon={TrendingUp}
          color="from-green-500 to-green-600"
          trend={8.3}
          description={`${((statistics.spentBudget / statistics.totalBudget) * 100).toFixed(1)}% utilized`}
        />
        <StatCard
          title="Pending"
          value={statistics.pendingRequests}
          icon={Clock}
          color="from-yellow-500 to-orange-500"
          trend={-5.2}
          description="Awaiting approval"
        />
        <StatCard
          title="Approved"
          value={statistics.approvedThisMonth}
          icon={CheckCircle}
          color="from-purple-500 to-purple-600"
          trend={15.7}
          description="This month"
        />
      </div>

      {/* Department Budget Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Department Budget Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statistics.departments.map((dept, index) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{dept.name}</h4>
                <span className="text-sm text-gray-500">
                  {((dept.spent / dept.allocation) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>₹{(dept.spent / 100000).toFixed(1)}L spent</span>
                  <span>₹{(dept.allocation / 100000).toFixed(1)}L allocated</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(dept.spent / dept.allocation) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Applications</h3>
          <button
            onClick={() => setActiveTab('applications')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        <div className="space-y-4">
          {applications.slice(0, 3).map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setSelectedApplication(app)}
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{app.title}</h4>
                <p className="text-sm text-gray-500">{app.department} • {app.submittedDate}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹{app.requestedAmount.toLocaleString()}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  app.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : app.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {app.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const ApplicationsView = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {['all', 'pending', 'approved', 'rejected'].map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterBy(filter)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filterBy === filter
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="priority">Sort by Priority</option>
          </select>

          {/* View Mode */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : ''
              }`}
            >
              <BarChart2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-white shadow-sm' : ''
              }`}
            >
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}
        >
          <AnimatePresence mode="popLayout">
            {filteredApplications.map(application => (
              <ApplicationCard
                key={application.id}
                application={application}
                onClick={setSelectedApplication}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fund Management</h1>
              <p className="mt-1 text-gray-600">
                Manage budget requests, track allocations, and monitor expenses
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-5 w-5 mr-2" />
                )}
                Refresh
              </motion.button>
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
              { id: 'applications', label: 'Applications', icon: FileText }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' ? <DashboardView /> : <ApplicationsView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Application Details Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedApplication.title}
                    </h2>
                    <p className="text-gray-600 mt-1">{selectedApplication.department}</p>
                  </div>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Status and Amount */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-600 font-medium">Requested Amount</p>
                    <p className="text-2xl font-bold text-blue-900">
                      ₹{selectedApplication.requestedAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 font-medium">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                      selectedApplication.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : selectedApplication.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </span>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-purple-600 font-medium">Priority</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                      selectedApplication.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : selectedApplication.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedApplication.priority}
                    </span>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Submitted By</p>
                      <p className="font-medium text-gray-900">{selectedApplication.submittedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">{selectedApplication.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submission Date</p>
                      <p className="font-medium text-gray-900">{selectedApplication.submittedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium text-gray-900">{selectedApplication.department}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedApplication.description}</p>
                </div>

                {/* Expense Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {selectedApplication.expenseBreakdown.map((expense, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex justify-between items-center p-4 ${
                          index !== selectedApplication.expenseBreakdown.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <span className="text-gray-700 font-medium">{expense.item}</span>
                        <span className="text-lg font-semibold text-gray-900">
                          ₹{expense.amount.toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                    <div className="bg-gray-50 p-4 border-t-2 border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-blue-600">
                          ₹{selectedApplication.requestedAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApplication.attachments.map((attachment, index) => (
                      <motion.a
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        href={attachment.url}
                        className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 hover:border-blue-300 group"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-gray-500">Click to download</p>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </motion.a>
                    ))}
                  </div>
                </div>

                {/* Approval Actions */}
                {selectedApplication.status === 'pending' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Decision</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Approval Note *
                        </label>
                        <textarea
                          value={approvalNote}
                          onChange={(e) => setApprovalNote(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Add a detailed note explaining your decision. Include any conditions, feedback, or next steps..."
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApproval(selectedApplication.id, true)}
                          disabled={isSubmitting || !approvalNote.trim()}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-600 hover:to-green-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-5 w-5 mr-2" />
                          )}
                          Approve Request
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApproval(selectedApplication.id, false)}
                          disabled={isSubmitting || !approvalNote.trim()}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-medium hover:from-red-600 hover:to-red-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 mr-2" />
                          )}
                          Reject Request
                        </motion.button>
                      </div>
                      {!approvalNote.trim() && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Please provide a note before making a decision
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Status History (for approved/rejected items) */}
                {selectedApplication.status !== 'pending' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          selectedApplication.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {selectedApplication.status === 'approved' ? 'Approved' : 'Rejected'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Decision made by Admin • {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Submitted</p>
                          <p className="text-sm text-gray-500">
                            By {selectedApplication.submittedBy} • {selectedApplication.submittedDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-8 right-8 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => {
            // Add new application functionality
            console.log('Add new application');
          }}
        >
          <Target className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Toast Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {/* Toast notifications would be rendered here */}
      </div>
    </div>
  );
};

export default FundManagement;