import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  PieChart,
  BarChart2,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  Download,
  Plus,
  Filter,
  Send,
  FileText,
  Upload,
  X,
  CheckCircle,
  User,
  Mail,
  GraduationCap,
  Search,
  ChevronDown
} from 'lucide-react';

// Mock data for the budget dashboard
const mockBudgetData = {
  totalBudget: 5000,
  spent: 3250,
  remaining: 1750,
  categories: [
    { name: 'Books & Supplies', allocated: 1500, spent: 1200 },
    { name: 'Food & Dining', allocated: 1200, spent: 800 },
    { name: 'Transportation', allocated: 800, spent: 600 },
    { name: 'Entertainment', allocated: 500, spent: 300 },
    { name: 'Miscellaneous', allocated: 1000, spent: 350 }
  ],
  recentTransactions: [
    {
      id: 1,
      description: 'Computer Science Textbook',
      amount: 150,
      category: 'Books & Supplies',
      date: '2024-03-10'
    },
    {
      id: 2,
      description: 'Campus Cafeteria',
      amount: 25,
      category: 'Food & Dining',
      date: '2024-03-09'
    },
    {
      id: 3,
      description: 'Bus Pass - Monthly',
      amount: 60,
      category: 'Transportation',
      date: '2024-03-08'
    },
    {
      id: 4,
      description: 'Movie Night',
      amount: 35,
      category: 'Entertainment',
      date: '2024-03-07'
    },
    {
      id: 5,
      description: 'Lab Supplies',
      amount: 80,
      category: 'Books & Supplies',
      date: '2024-03-06'
    },
    {
      id: 6,
      description: 'Coffee Shop',
      amount: 15,
      category: 'Food & Dining',
      date: '2024-03-05'
    }
  ],
  monthlySpending: [
    { month: 'Jan', amount: 850 },
    { month: 'Feb', amount: 920 },
    { month: 'Mar', amount: 780 },
    { month: 'Apr', amount: 650 },
    { month: 'May', amount: 900 }
  ]
};

const BudgetApplicationForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    email: '',
    department: '',
    year: '',
    budgetCategory: '',
    requestedAmount: '',
    purpose: '',
    justification: '',
    duration: '',
    expectedOutcomes: '',
    attachments: []
  });

  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = [
    'Books & Supplies',
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Research Materials',
    'Project Expenses',
    'Emergency Fund',
    'Equipment',
    'Software/Technology',
    'Miscellaneous'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles]
    }));
  };

  const removeAttachment = (id) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(file => file.id !== id)
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        onSubmit(formData);
        onClose();
        setSubmitSuccess(false);
        setFormData({
          studentName: '',
          studentId: '',
          email: '',
          department: '',
          year: '',
          budgetCategory: '',
          requestedAmount: '',
          purpose: '',
          justification: '',
          duration: '',
          expectedOutcomes: '',
          attachments: []
        });
      }, 2000);
    }, 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Apply for Budget</h2>
              <p className="text-gray-600 mt-1">Submit a budget request to faculty for approval</p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {submitSuccess ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted Successfully!</h3>
            <p className="text-gray-600">Your budget request has been sent to faculty for review. You'll receive a notification once it's been processed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Student Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Arts & Sciences">Arts & Sciences</option>
                    <option value="Medicine">Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Budget Request Details */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget Request Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="budgetCategory"
                    value={formData.budgetCategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requested Amount</label>
                  <input
                    type="number"
                    name="requestedAmount"
                    value={formData.requestedAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose/Title</label>
                  <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of what the budget is for"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Duration</option>
                    <option value="One-time">One-time</option>
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detailed Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Justification</label>
                  <textarea
                    name="justification"
                    value={formData.justification}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Explain why this budget is necessary and how it will benefit your studies..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Outcomes</label>
                  <textarea
                    name="expectedOutcomes"
                    value={formData.expectedOutcomes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the expected outcomes and benefits..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Supporting Documents
              </h3>
              <div
                className={`border-2 border-dashed p-6 rounded-lg text-center transition-colors ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop files here, or click to select</p>
                <p className="text-sm text-gray-500">Support for invoices, receipts, quotations (PDF, JPG, PNG)</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="mt-2"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>
              
              {formData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.attachments.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAttachment(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Budget = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('all');

  // Calculate percentage spent
  const percentageSpent = (mockBudgetData.spent / mockBudgetData.totalBudget) * 100;

  // Function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Function to get status color based on percentage
  const getStatusColor = (spent, allocated) => {
    const percentage = (spent / allocated) * 100;
    if (percentage >= 90) return 'bg-red-100 text-red-800 border-red-200';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const handleBudgetSubmit = (formData) => {
    console.log('Budget application submitted:', formData);
    // Here you would typically send the data to your backend
    // For demo purposes, we'll just log it
  };

  // Filter transactions based on selected category
  const filteredTransactions = transactionFilter === 'all' 
    ? mockBudgetData.recentTransactions 
    : mockBudgetData.recentTransactions.filter(t => t.category === transactionFilter);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Budget Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track and manage your student expenses
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
              <Button 
                onClick={() => setShowBudgetForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <GraduationCap className="h-4 w-4" />
                Apply for Budget
              </Button>
            </div>
          </div>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Total Budget</h3>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(mockBudgetData.totalBudget)}
            </div>
            <div className="text-sm text-gray-500">Academic Year 2024-25</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Spent</h3>
              <BarChart2 className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(mockBudgetData.spent)}
            </div>
            <Progress value={percentageSpent} className="h-2" />
            <div className="text-sm text-gray-500 mt-2">{percentageSpent.toFixed(1)}% of total budget</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Remaining</h3>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(mockBudgetData.remaining)}
            </div>
            <div className="text-sm text-gray-500">Available to spend</div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Spending Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium">Monthly Spending</h3>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
                <div className="h-64 flex items-end justify-between gap-2">
                  {mockBudgetData.monthlySpending.map((month) => (
                    <div key={month.month} className="flex flex-col items-center">
                      <div 
                        className="w-12 bg-blue-500 rounded-t"
                        style={{ 
                          height: `${(month.amount / 1000) * 200}px`,
                          backgroundColor: `hsl(${220 + (month.amount / 10)}, 70%, 60%)`
                        }}
                      />
                      <div className="mt-2 text-sm text-gray-600">{month.month}</div>
                      <div className="text-xs text-gray-500">${month.amount}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Category Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-6">Category Distribution</h3>
                <div className="space-y-4">
                  {mockBudgetData.categories.map((category) => (
                    <div key={category.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{category.name}</span>
                        <Badge className={getStatusColor(category.spent, category.allocated)}>
                          {((category.spent / category.allocated) * 100).toFixed(0)}% Used
                        </Badge>
                      </div>
                      <Progress 
                        value={(category.spent / category.allocated) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Spent: {formatCurrency(category.spent)}</span>
                        <span>Allocated: {formatCurrency(category.allocated)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Recent Transactions</h3>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('transactions')}>
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {mockBudgetData.recentTransactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start">
                      <div className="ml-4">
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline">{transaction.category}</Badge>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{transaction.date}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-lg font-medium text-gray-900">
                      -{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Budget Categories</h3>
                <Button>Add Category</Button>
              </div>
              <div className="space-y-6">
                {mockBudgetData.categories.map((category) => (
                  <div key={category.name} className="border-b pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium">{category.name}</h4>
                      <Badge className={getStatusColor(category.spent, category.allocated)}>
                        {((category.spent / category.allocated) * 100).toFixed(0)}% Used
                      </Badge>
                    </div>
                    <Progress 
                      value={(category.spent / category.allocated) * 100} 
                      className="h-3 mb-4"
                    />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Allocated</p>
                        <p className="font-medium">{formatCurrency(category.allocated)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Spent</p>
                        <p className="font-medium">{formatCurrency(category.spent)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Remaining</p>
                        <p className="font-medium">
                          {formatCurrency(category.allocated - category.spent)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">All Transactions</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <select
                      value={transactionFilter}
                      onChange={(e) => setTransactionFilter(e.target.value)}
                      className="border rounded-md px-2 py-1"
                    >
                      <option value="all">All Categories</option>
                      {mockBudgetData.categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline">{transaction.category}</Badge>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{transaction.date}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-lg font-medium text-gray-900">
                      -{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Budget Analysis</h3>
                <Button variant="outline" size="sm">Last 6 Months</Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Spending Insights</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Your spending in Books & Supplies is 80% of the allocated budget
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-800">
                        You've saved 15% more this month compared to last month
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Monthly Comparison</h4>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {mockBudgetData.monthlySpending.map((month) => (
                      <div key={month.month} className="flex flex-col items-center">
                        <div 
                          className="w-12 bg-purple-500 rounded-t"
                          style={{ 
                            height: `${(month.amount / 1000) * 200}px`,
                            backgroundColor: `hsl(${280 + (month.amount / 10)}, 70%, 60%)`
                          }}
                        />
                        <div className="mt-2 text-sm text-gray-600">{month.month}</div>
                        <div className="text-xs text-gray-500">${month.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Budget Application Form Modal */}
      <BudgetApplicationForm
        isOpen={showBudgetForm}
        onClose={() => setShowBudgetForm(false)}
        onSubmit={handleBudgetSubmit}
      />
    </div>
  );
};

export default Budget;