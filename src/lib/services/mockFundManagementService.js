// Mock data for fund management
const mockApplications = [
  {
    id: 1,
    title: 'Research Equipment Purchase',
    department: 'Computer Science',
    requestedAmount: 250000,
    submittedDate: '2024-02-15',
    status: 'pending',
    submittedBy: 'Dr. Smith',
    category: 'Equipment',
    description: 'Request for new research lab equipment including high-performance computing servers.',
    expenseBreakdown: [
      { item: 'Server Hardware', amount: 150000 },
      { item: 'Software Licenses', amount: 75000 },
      { item: 'Installation', amount: 25000 }
    ],
    attachments: [
      { name: 'Quotation.pdf', url: '#' },
      { name: 'Specifications.docx', url: '#' }
    ]
  },
  {
    id: 2,
    title: 'Conference Travel Grant',
    department: 'Physics',
    requestedAmount: 75000,
    submittedDate: '2024-02-14',
    status: 'approved',
    submittedBy: 'Dr. Johnson',
    category: 'Travel',
    description: 'International conference attendance and paper presentation.',
    expenseBreakdown: [
      { item: 'Flight Tickets', amount: 45000 },
      { item: 'Accommodation', amount: 20000 },
      { item: 'Registration', amount: 10000 }
    ],
    attachments: [
      { name: 'Conference_Invite.pdf', url: '#' },
      { name: 'Abstract.pdf', url: '#' }
    ]
  },
  {
    id: 3,
    title: 'Laboratory Supplies',
    department: 'Chemistry',
    requestedAmount: 120000,
    submittedDate: '2024-02-13',
    status: 'rejected',
    submittedBy: 'Dr. Williams',
    category: 'Supplies',
    description: 'Annual laboratory supplies and chemicals procurement.',
    expenseBreakdown: [
      { item: 'Chemicals', amount: 80000 },
      { item: 'Glassware', amount: 25000 },
      { item: 'Safety Equipment', amount: 15000 }
    ],
    attachments: [
      { name: 'Supply_List.xlsx', url: '#' },
      { name: 'Safety_Compliance.pdf', url: '#' }
    ]
  }
];

const mockStatistics = {
  totalBudget: 5000000,
  allocatedBudget: 3500000,
  remainingBudget: 1500000,
  pendingRequests: 850000,
  monthlySpending: [
    { month: 'Jan', amount: 450000 },
    { month: 'Feb', amount: 380000 },
    { month: 'Mar', amount: 420000 }
  ],
  departmentAllocation: [
    { department: 'Computer Science', amount: 1200000 },
    { department: 'Physics', amount: 800000 },
    { department: 'Chemistry', amount: 900000 }
  ]
};

export const mockFundManagementService = {
  // Get all budget applications
  async getAllApplications(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredApps = [...mockApplications];
        
        if (filters.status && filters.status !== 'all') {
          filteredApps = filteredApps.filter(app => app.status === filters.status);
        }
        
        if (filters.department && filters.department !== 'all') {
          filteredApps = filteredApps.filter(app => app.department === filters.department);
        }
        
        resolve(filteredApps);
      }, 500); // Simulate network delay
    });
  },

  // Get budget statistics
  async getBudgetStatistics(timeRange = 'month') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockStatistics);
      }, 500);
    });
  },

  // Process application approval/rejection
  async processApplication(applicationId, { isApproved, note }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const application = mockApplications.find(app => app.id === applicationId);
        if (application) {
          application.status = isApproved ? 'approved' : 'rejected';
          application.note = note;
        }
        resolve(application);
      }, 500);
    });
  }
}; 