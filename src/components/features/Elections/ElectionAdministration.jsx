import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  CalendarPlus,
  Edit3,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  Award,
  TrendingUp,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ElectionAdministration = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [elections, setElections] = useState([]);
  const [showNewElectionModal, setShowNewElectionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    eligibleYears: [],
    positions: []
  });

  // Simulated data - replace with actual API calls
  useEffect(() => {
    // Fetch applications
    setApplications([
      {
        id: 1,
        name: 'Sarah Johnson',
        studentId: 'ST12345',
        position: 'Student Council President',
        email: 'sarah.j@college.edu',
        status: 'pending',
        appliedDate: '2024-03-01',
        manifesto: 'Building a more inclusive campus...',
        experience: '2 years as Class Representative'
      },
      // Add more sample applications
    ]);

    // Fetch elections
    setElections([
      {
        id: 1,
        title: 'Student Council Election 2024',
        status: 'upcoming',
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        totalCandidates: 12,
        totalVoters: 0,
        positions: ['President', 'Vice President', 'Secretary']
      },
      // Add more sample elections
    ]);
  }, []);

  const handleApplicationAction = (applicationId, action) => {
    setApplications(applications.map(app => {
      if (app.id === applicationId) {
        return { ...app, status: action };
      }
      return app;
    }));
    // In real application, make API call to update status
  };

  const handleCreateElection = (e) => {
    e.preventDefault();
    // Add validation and API call
    setElections([...elections, { ...newElection, id: elections.length + 1, status: 'upcoming' }]);
    setShowNewElectionModal(false);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Award className="mr-3 text-blue-600" size={32} />
              Election Administration
            </h1>
            <p className="mt-2 text-gray-600">Manage election applications and schedules efficiently</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Applications</p>
                  <h3 className="text-2xl font-bold text-gray-900">{applications.length}</h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Active Elections</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {elections.filter(e => e.status === 'active').length}
                  </h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Upcoming Elections</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {elections.filter(e => e.status === 'upcoming').length}
                  </h3>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <nav className="flex space-x-8 p-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('applications')}
                className={`${
                  activeTab === 'applications'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } flex items-center px-4 py-2 font-medium text-sm transition-all duration-200`}
              >
                <ClipboardList className="h-5 w-5 mr-2" />
                Candidate Applications
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('elections')}
                className={`${
                  activeTab === 'elections'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } flex items-center px-4 py-2 font-medium text-sm transition-all duration-200`}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Election Management
              </motion.button>
            </nav>
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'applications' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search applications..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applied Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredApplications.map((application) => (
                          <tr key={application.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{application.name}</div>
                                  <div className="text-sm text-gray-500">{application.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{application.position}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{application.appliedDate}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${application.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                  application.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'}`}
                              >
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {application.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleApplicationAction(application.id, 'approved')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleApplicationAction(application.id, 'rejected')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </motion.button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'elections' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Election Schedule</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowNewElectionModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <CalendarPlus className="h-5 w-5 mr-2" />
                      Schedule New Election
                    </motion.button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {elections.map((election) => (
                      <motion.div
                        key={election.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-900">{election.title}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                              ${election.status === 'active' ? 'bg-green-100 text-green-800' : 
                                election.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                                'bg-yellow-100 text-yellow-800'}`}
                            >
                              {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                            </span>
                          </div>

                          <div className="mt-4 space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{election.startDate} - {election.endDate}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              <span>{election.totalCandidates} Candidates</span>
                            </div>
                          </div>

                          <div className="mt-6 flex space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowScheduleModal(true)}
                              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Edit Schedule
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                            >
                              View Details
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* New Election Modal */}
      <AnimatePresence>
        {showNewElectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-2xl w-full m-4"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <CalendarPlus className="h-6 w-6 mr-2 text-blue-600" />
                Schedule New Election
              </h2>
              <form onSubmit={handleCreateElection} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Election Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={newElection.title}
                    onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                    placeholder="Enter election title"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={newElection.startDate}
                      onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={newElection.endDate}
                      onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows="4"
                    value={newElection.description}
                    onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                    placeholder="Enter election description"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Eligible Years
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
                      <label key={year} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={newElection.eligibleYears.includes(year)}
                          onChange={(e) => {
                            const years = e.target.checked
                              ? [...newElection.eligibleYears, year]
                              : newElection.eligibleYears.filter(y => y !== year);
                            setNewElection({ ...newElection, eligibleYears: years });
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{year}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowNewElectionModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Election
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-2xl w-full m-4"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-blue-600" />
                Edit Election Schedule
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors">
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElectionAdministration; 