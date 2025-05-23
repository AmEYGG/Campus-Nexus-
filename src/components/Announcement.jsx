import { useState, useEffect } from 'react';
import { Send, Bell, Calendar, BookOpen, Users, Award, BarChart2, AlertTriangle, Bookmark, Check, X, Plus, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { database } from '../config/firebase';
import { ref, push, set, onValue, serverTimestamp } from 'firebase/database';
import { toast } from 'react-hot-toast';

export default function Announcement() {
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [urgency, setUrgency] = useState('normal');
  const [date, setDate] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // List of announcements
  const [announcements, setAnnouncements] = useState([]);

  // Fetch announcements from Firebase
  useEffect(() => {
    const announcementsRef = ref(database, 'announcements');
    const unsubscribe = onValue(announcementsRef, (snapshot) => {
      if (snapshot.exists()) {
        const announcementsData = [];
        snapshot.forEach((childSnapshot) => {
          announcementsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        // Sort by date in descending order
        announcementsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAnnouncements(announcementsData);
      }
    });

    return () => unsubscribe();
  }, []);

  // Current date for the dashboard
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Set up the date field to default to today
  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    setDate(currentDate);
  }, []);

  // Chart data for announcements by category
  const categoryData = [
    { name: 'Academic', value: 12 },
    { name: 'Events', value: 8 },
    { name: 'Research', value: 5 },
    { name: 'General', value: 10 },
    { name: 'Meetings', value: 7 },
  ];
  
  // Chart data for announcements over time
  const timelineData = [
    { name: 'May 13', count: 3 },
    { name: 'May 14', count: 2 },
    { name: 'May 15', count: 4 },
    { name: 'May 16', count: 1 },
    { name: 'May 17', count: 5 },
    { name: 'May 18', count: 2 },
    { name: 'May 19', count: 3 },
  ];
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];
  
  // Submit handler
  const handleSubmit = async () => {
    if (!title || !content || !category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const announcementsRef = ref(database, 'announcements');
      const newAnnouncementRef = push(announcementsRef);
      
      const newAnnouncement = {
        title,
        content,
        category,
        urgency,
        date,
        views: 0,
        createdAt: serverTimestamp(),
        attachmentName: attachmentName || null
      };
      
      await set(newAnnouncementRef, newAnnouncement);
      
      toast.success('Announcement created successfully!');
      
      // Reset form
      setTitle('');
      setContent('');
      setCategory('general');
      setUrgency('normal');
      setAttachmentName('');
      setShowPreview(false);
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement. Please try again.');
    }
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachmentName(e.target.files[0].name);
    }
  };
  
  // Get the appropriate icon for each category
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'academic':
        return <BookOpen className="text-blue-500" />;
      case 'event':
        return <Calendar className="text-green-500" />;
      case 'meeting':
        return <Users className="text-purple-500" />;
      case 'research':
        return <Award className="text-amber-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };
  
  // Get the appropriate style for each urgency level
  const getUrgencyStyle = (urg) => {
    switch (urg) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const AnnouncementCard = ({ announcement }) => {
    const readCount = announcement.readCount || 0;
    const totalViews = announcement.views || 0;

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-indigo-500">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{announcement.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span>{new Date(announcement.date).toLocaleDateString()}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${getUrgencyStyle(announcement.urgency)}`}>
                {announcement.urgency.charAt(0).toUpperCase() + announcement.urgency.slice(1)}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-gray-400" />
                <span>{readCount} reads</span>
              </div>
            </div>
            <p className="mt-2 text-gray-600">{announcement.content}</p>
            {announcement.attachmentName && (
              <div className="mt-2 flex items-center text-sm text-indigo-600">
                <Bookmark className="h-4 w-4 mr-1" />
                {announcement.attachmentName}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className={`p-2 rounded-full ${getCategoryStyle(announcement.category)}`}>
              {getCategoryIcon(announcement.category)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100';
      case 'event':
        return 'bg-green-100';
      case 'meeting':
        return 'bg-purple-100';
      case 'research':
        return 'bg-amber-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Faculty Announcement Dashboard</h1>
          <div className="text-sm">{today}</div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Announcement Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Send className="mr-2 text-indigo-600" size={20} />
                Create New Announcement
              </h2>
              
              <div>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Announcement Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      id="category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="general">General</option>
                      <option value="academic">Academic</option>
                      <option value="event">Event</option>
                      <option value="meeting">Meeting</option>
                      <option value="research">Research</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                      Urgency Level
                    </label>
                    <select
                      id="urgency"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Announcement Content*
                  </label>
                  <textarea
                    id="content"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Publication Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                      Attachment (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="attachment"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="attachment"
                        className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50"
                      >
                        <Plus size={16} className="mr-2" />
                        <span className="text-gray-500 text-sm truncate">
                          {attachmentName || "Choose a file"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                  
                  <button
                    type="button"
                    className="px-6 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleSubmit}
                  >
                    Publish Announcement
                  </button>
                </div>
              </div>
            </div>
            
            {/* Preview Card (conditionally shown) */}
            {showPreview && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                <h3 className="text-lg font-semibold">Preview:</h3>
                <div className="mt-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {getCategoryIcon(category)}
                      <h3 className="text-lg font-medium ml-2">{title || "Announcement Title"}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyStyle(urgency)}`}>
                      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{content || "Announcement content will appear here."}</p>
                  <div className="mt-4 text-sm text-gray-500">
                    {date && `To be published on: ${new Date(date).toLocaleDateString()}`}
                    {attachmentName && (
                      <div className="mt-2 flex items-center">
                        <Bookmark size={14} className="mr-1" />
                        <span>Attachment: {attachmentName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Recent Announcements */}
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="mr-2 text-indigo-600" size={20} />
                    Recent Announcements
                  </div>
                  <div className="text-sm font-normal text-gray-500 flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    Total Views: {announcements.reduce((sum, ann) => sum + (ann.readCount || 0), 0)}
                  </div>
                </h2>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Dashboard Statistics */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart2 className="mr-2 text-indigo-600" size={20} />
                Dashboard Summary
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-gray-500">Total Announcements</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-gray-500">This Week</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">540</div>
                  <div className="text-sm text-gray-500">Total Views</div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">3</div>
                  <div className="text-sm text-gray-500">Urgent</div>
                </div>
              </div>
            </div>
            
            {/* Category Distribution Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Categories Distribution</h2>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} announcements`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Timeline Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Announcements Timeline</h2>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} announcements`, 'Count']} />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Pending Tasks */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="mr-2 text-amber-500" size={20} />
                Action Required
              </h2>
              
              <ul className="space-y-3">
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <Check className="text-green-500 mr-2" size={16} />
                    <span>Review student event announcement</span>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Due Today</span>
                </li>
                
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <X className="text-red-500 mr-2" size={16} />
                    <span>Update department meeting schedule</span>
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Overdue</span>
                </li>
                
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <Check className="text-green-500 mr-2" size={16} />
                    <span>Announce research symposium</span>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Tomorrow</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}