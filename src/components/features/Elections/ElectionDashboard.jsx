import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users,
  Vote,
  BarChart2,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  PieChart,
  Building,
  FileText,
  Settings,
  LogOut,
  Book,
  Calendar,
  Trophy,
  Star,
  Award,
  TrendingUp,
  Activity,
  Shield,
  Medal,
  Plus,
  Loader2,
  Bell,
  ChevronRight
} from 'lucide-react';
import CandidateApplicationForm from './CandidateApplicationForm';
import { getDatabase, ref, onValue, push, query, orderByChild, equalTo, set, get, update } from 'firebase/database';
import { firebaseAuthService } from '../../../services/firebaseAuth.service';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

const ElectionDashboard = () => {
  const [activeElection, setActiveElection] = useState('student-council-2024');
  const [timeRemaining, setTimeRemaining] = useState({ days: 3, hours: 14, minutes: 32 });
  const [liveUpdate, setLiveUpdate] = useState(true);
  const navigate = useNavigate();
  const [isCandidateFormOpen, setIsCandidateFormOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [user, setUser] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [rawCandidates, setRawCandidates] = useState([]);
  const [rawVotes, setRawVotes] = useState({});
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await firebaseAuthService.getCurrentUser();
        if (currentUser && currentUser.userProfile) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!activeElection) return;

    setIsLoadingCandidates(true);
    const database = getDatabase();
    const approvedCandidatesQuery = query(
      ref(database, 'election_candidates'),
      orderByChild('status'),
      equalTo('approved')
    );

    const unsubscribeCandidates = onValue(approvedCandidatesQuery, (snapshot) => {
      const data = snapshot.val();
      const loadedCandidates = [];
      if (data) {
        for (const key in data) {
          loadedCandidates.push({
            id: key,
            ...data[key],
          });
        }
      }
      setRawCandidates(loadedCandidates);
    }, (error) => {
      console.error('Error fetching approved candidates:', error);
      toast({ title: 'Error', description: 'Failed to load candidates.', variant: 'destructive' });
      setIsLoadingCandidates(false);
    });

    const votesRef = ref(database, `votes/${activeElection}`);
    const unsubscribeVotes = onValue(votesRef, (snapshot) => {
      const data = snapshot.val();
      setRawVotes(data || {});
    }, (error) => {
      console.error('Error fetching votes:', error);
      toast({ title: 'Error', description: 'Failed to load vote data.', variant: 'destructive' });
      setIsLoadingCandidates(false);
    });

    return () => {
      unsubscribeCandidates();
      unsubscribeVotes();
    };
  }, [activeElection]);

  useEffect(() => {
    if (rawCandidates.length > 0 || Object.keys(rawVotes).length > 0) {
      const processedCandidates = rawCandidates.map(candidate => ({
        ...candidate,
        votes: 0,
        percentage: 0,
        trending: 'up'
      }));
      let totalVotes = 0;

      for (const userId in rawVotes) {
        const vote = rawVotes[userId];
        if (vote && vote.candidateId) {
          const candidate = processedCandidates.find(c => c.id === vote.candidateId);
          if (candidate) {
            candidate.votes = (candidate.votes || 0) + 1;
            totalVotes++;
          }
        }
      }

      processedCandidates.forEach(candidate => {
        candidate.percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
      });

      processedCandidates.sort((a, b) => b.votes - a.votes);

      setCandidates(processedCandidates);
      setIsLoadingCandidates(false);
    } else if (rawCandidates.length === 0 && Object.keys(rawVotes).length === 0 && !isLoadingCandidates) {
      setCandidates([]);
      setIsLoadingCandidates(false);
    }
  }, [rawCandidates, rawVotes]);

  useEffect(() => {
    if (!user || !activeElection) {
      setHasVoted(false);
      setNotifications([]);
      setIsLoadingNotifications(false);
      return;
    }

    const database = getDatabase();
    const userId = user.authUser.uid;

    // Check vote status
    const userVoteRef = ref(database, `votes/${activeElection}/${userId}`);
    const unsubscribeVoteCheck = onValue(userVoteRef, (snapshot) => {
      setHasVoted(snapshot.exists());
    }, (error) => {
      console.error('Error checking user vote status:', error);
    });

    // Fetch notifications
    setIsLoadingNotifications(true);
    const userNotificationsRef = ref(database, `users/${userId}/notifications`);
    const unsubscribeNotifications = onValue(userNotificationsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedNotifications = [];
      if (data) {
        Object.entries(data).forEach(([key, notification]) => {
          loadedNotifications.push({
            id: key,
            ...notification
          });
        });
        // Sort notifications by timestamp, newest first
        loadedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
      setNotifications(loadedNotifications);
      setIsLoadingNotifications(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      setIsLoadingNotifications(false);
    });

    return () => {
      unsubscribeVoteCheck();
      unsubscribeNotifications();
    };
  }, [user, activeElection]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1 };
        if (prev.hours > 0) return { ...prev, minutes: 59, hours: prev.hours - 1 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59 };
        clearInterval(interval);
        return { days: 0, hours: 0, minutes: 0 };
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;    const database = getDatabase();
    const notificationsRef = ref(database, `users/${user.authUser.uid}/notifications`);
    const unsubscribeNotificationsDisplay = onValue(notificationsRef, (snapshot) => {
      const notificationsData = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const notification = {
            id: child.key,
            ...child.val(),
            read: child.val().read || false
          };
          // Only include election-related notifications
          if (notification.type === 'election' || 
              notification.category === 'election' ||
              notification.type === 'vote_confirmation' ||
              notification.type === 'election_application_status') {
            notificationsData.push(notification);
          }
        });
      }
      
      // Sort notifications by date, most recent first
      notificationsData.sort((a, b) => {
        const dateA = new Date(b.timestamp || b.createdAt || 0);
        const dateB = new Date(a.timestamp || a.createdAt || 0);
        return dateA - dateB;
      });
      
      setNotifications(notificationsData);
      setUnreadNotifications(notificationsData.filter(n => !n.read).length);
    });

    return () => unsubscribeNotificationsDisplay();
  }, [user]);

  const handleLogout = () => {
    firebaseAuthService.logout();
  };

  const handleCloseCandidateForm = () => {
    setIsCandidateFormOpen(false);
  };

  const handleVote = async (candidateId) => {
    if (!user?.authUser?.uid) {
      toast.error('Please log in to vote');
      return;
    }

    if (hasVoted) {
      toast.error('You have already voted in this election');
      return;
    }

    const database = getDatabase();
    const userId = user.authUser.uid;
    const voteRef = ref(database, `votes/${activeElection}/${userId}`);
    const userNotificationsRef = ref(database, `users/${userId}/notifications`);

    try {
      const voteSnapshot = await get(voteRef);
      if (voteSnapshot.exists()) {
        toast.error('You have already cast your vote');
        return;
      }

      const candidate = candidates.find(c => c.id === candidateId);
      const candidateName = candidate ? candidate.name : 'the selected candidate';

      // Record vote
      await set(voteRef, {
        candidateId,
        timestamp: new Date().toISOString()
      });

      // Create notification
      await push(userNotificationsRef, {
        type: 'vote_confirmation',
        message: `You have successfully voted for ${candidateName}!`,
        timestamp: new Date().toISOString(),
        read: false
      });

      toast.success('Vote successfully cast!');
      setHasVoted(true);
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote. Please try again.');
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
  };

  const totalVotesCast = candidates.reduce((sum, candidate) => sum + (candidate.votes || 0), 0);
  const eligibleVoters = 1200;
  const turnoutPercentage = eligibleVoters > 0 ? Math.round((totalVotesCast / eligibleVoters) * 100) : 0;

  const electionInfo = {
    period: 'Mar 1-15, 2024',
    eligibleVoters: eligibleVoters,
    votesCast: totalVotesCast,
    turnoutPercentage: turnoutPercentage
  };

  const votingGuidelines = [
    { id: 1, text: 'All registered students are eligible to vote once in each election', icon: <AlertCircle className="h-4 w-4 text-blue-600" /> },
    { id: 2, text: 'Your vote remains confidential and secure with end-to-end encryption', icon: <Shield className="h-4 w-4 text-green-600" /> },
    { id: 3, text: 'Results are announced immediately after the election closes', icon: <Activity className="h-4 w-4 text-purple-600" /> },
  ];

  const electionPositions = [
    { value: 'President', label: 'President' },
    { value: 'Vice President', label: 'Vice President' },
    { value: 'Secretary', label: 'Secretary' },
    { value: 'Treasurer', label: 'Treasurer' },
    { value: 'Student Representative', label: 'Student Representative' },
    { value: 'Other', label: 'Other (Please specify)' },
  ];

  const markNotificationAsRead = async (notificationId) => {
    if (!user || !notificationId) return;
      try {
      const database = getDatabase();
      const notificationRef = ref(database, `users/${user.authUser.uid}/notifications/${notificationId}`);
      await update(notificationRef, { read: true });
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Could not update notification status');
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const database = getDatabase();
      const updates = {};      notifications.forEach(notification => {
        if (!notification.read) {
          updates[`users/${user.authUser.uid}/notifications/${notification.id}/read`] = true;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Could not update notifications');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-white opacity-5 rounded-full"></div>
        <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
        
        <div className="relative px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start md:items-center">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Live Results
                  </span>
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Student Elections 2024
                </h1>
                <p className="text-blue-100 text-xl font-medium">Your voice shapes our future</p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Real-time updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Secure voting</span>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-4 flex flex-col items-end">
                <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-4xl font-bold">{electionInfo.turnoutPercentage}%</div>
                  <div className="text-blue-100 text-sm font-medium">Voter Turnout</div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full" style={{ width: `${electionInfo.turnoutPercentage}%` }}></div>
                  </div>
                </div>
                {/* Fixed: Always show button for demo, remove conditional rendering */}
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg"
                  onClick={() => setIsCandidateFormOpen(true)}
                >
                  <Plus className="h-5 w-5" />
                  <span>Apply to be a Candidate</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 -mt-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100">
                  <Clock className="h-7 w-7 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Time Remaining</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-gray-900">{timeRemaining.days}</span>
                  <span className="text-sm text-gray-600">d</span>
                  <span className="text-2xl font-bold text-gray-700">{timeRemaining.hours}</span>
                  <span className="text-sm text-gray-600">h</span>
                  <span className="text-xl font-bold text-gray-600">{timeRemaining.minutes}</span>
                  <span className="text-sm text-gray-600">m</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100">
                  <Users className="h-7 w-7 text-blue-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Votes</p>
                <p className="text-3xl font-bold text-gray-900">{electionInfo.votesCast.toLocaleString()}</p>
                <p className="text-sm text-green-600 font-medium">+23 in last hour</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-violet-100">
                  <BarChart2 className="h-7 w-7 text-purple-600" />
                </div>
                <Medal className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Candidates</p>
                <p className="text-3xl font-bold text-gray-900">{candidates.length}</p>
                <p className="text-sm text-purple-600 font-medium">Presidential race</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100">
                  <Trophy className="h-7 w-7 text-yellow-600" />
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-yellow-600 font-bold">LIVE</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Current Leader</p>
                <p className="text-lg font-bold text-gray-900">{candidates.length > 0 ? candidates[0].name : 'N/A'}</p>
                <p className="text-sm text-yellow-600 font-medium">{candidates.length > 0 ? `${candidates[0].percentage}% support` : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Vote className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Presidential Candidates</h2>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                        {hasVoted ? (
                          <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-700" />
                            <span className="text-sm text-green-700 font-semibold">Vote Cast</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-700 font-semibold">Voting Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {isLoadingCandidates ? (
                     <div className="p-8 text-center">
                       <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                       <p className="mt-4 text-lg text-gray-600">Loading candidates...</p>
                     </div>
                  ) : candidates.length > 0 ? (
                    <div className="space-y-8">
                      {candidates.map((candidate, index) => (
                        <div key={candidate.id} className="group relative border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300">
                          <div className="absolute -top-3 -left-3 z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                              'bg-gradient-to-r from-orange-400 to-orange-600'
                            }`}>
                              {index + 1}
                            </div>
                          </div>

                          <div className="flex items-start space-x-6">
                            <div className="relative">
                              <img
                                src={candidate.image || `/api/placeholder/150/150?text=${candidate.name.split(' ')[0][0]}${candidate.name.split(' ')[1][0]}`}
                                alt={candidate.name}
                                className="w-28 h-28 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-lg">
                                {getTrendIcon(candidate.trending)}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                                  {index === 0 && (
                                    <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                                      <Trophy className="h-3 w-3 text-yellow-600 mr-1" />
                                      <span className="text-xs font-bold text-yellow-700">LEADING</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-gray-600 font-medium">
                                  {candidate.position} • {candidate.year} • {candidate.department}
                                </p>
                                <div className="flex items-center space-x-4">
                                  {candidate.experience && (
                                    <div className="flex items-center bg-blue-50 px-2 py-1 rounded-lg">
                                      <Star className="h-3 w-3 text-blue-500 mr-1" />
                                      <span className="text-xs text-blue-700 font-medium">{candidate.experience}</span>
                                    </div>
                                  )}
                                  {candidate.achievements && candidate.achievements.length > 0 && (
                                    <div className="flex space-x-2">
                                      {candidate.achievements.map((achievement, idx) => (
                                        <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-medium">
                                          {achievement}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="ml-6 flex-shrink-0">
                                <Button
                                  className={`${
                                    hasVoted && candidate.id === rawVotes[user?.authUser?.uid]?.candidateId
                                      ? 'bg-green-600 hover:bg-green-700'
                                      : 'bg-blue-600 hover:bg-blue-700'
                                  } text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg min-w-[120px]`}
                                  onClick={() => handleVote(candidate.id)}
                                  disabled={!user?.authUser?.uid || hasVoted}
                                >
                                  <div className="flex items-center space-x-2">
                                    {hasVoted ? (
                                      candidate.id === rawVotes[user?.authUser?.uid]?.candidateId ? (
                                        <>
                                          <CheckCircle className="h-5 w-5" />
                                          <span>Voted</span>
                                        </>
                                      ) : (
                                        <>
                                          <Vote className="h-5 w-5" />
                                          <span>Already Voted</span>
                                        </>
                                      )
                                    ) : (
                                      <>
                                        <Vote className="h-5 w-5" />
                                        <span>Vote Now</span>
                                      </>
                                    )}
                                  </div>
                                </Button>
                              </div>
                            </div>
                              
                              <p className="text-gray-700 mb-6 line-clamp-3 leading-relaxed">{candidate.manifesto}</p>
                              
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 font-medium">Current Support</span>
                                  <div className="flex items-center space-x-2">
                                    {getTrendIcon(candidate.trending)}
                                    <span className="font-bold text-gray-900 text-lg">
                                      {(candidate.votes || 0).toLocaleString()} votes ({candidate.percentage || 0}%)
                                    </span>
                                  </div>
                                </div>
                                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                  <div
                                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                                      index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                      index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                      'bg-gradient-to-r from-purple-500 to-purple-600'
                                    }`}
                                    style={{ width: `${candidate.percentage || 0}%` }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                     <div className="p-8 text-center text-gray-500">
                       <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                       <p className="font-medium text-lg">No Candidates Approved Yet</p>
                       <p className="text-sm">Check back later to see the list of approved candidates for this election.</p>
                     </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-green-100">
                        <BarChart2 className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Live Results</h3>
                    </div>
                    <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-700 font-bold">LIVE</span>
                    </div>
                  </div>
                </div>
                {isLoadingCandidates ? (
                   <div className="p-4 text-center">
                     <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                     <p className="mt-2 text-gray-600">Loading results...</p>
                   </div>
                ) : candidates.length > 0 ? (
                  <div className="p-4">
                    <div className="space-y-4">
                      {candidates.map((candidate, index) => (
                        <div key={candidate.id} className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                            index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            'bg-gradient-to-r from-purple-500 to-purple-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-bold text-gray-900">{candidate.name}</p>
                              <div className="flex items-center space-x-1">
                                {getTrendIcon(candidate.trending)}
                                <span className="text-sm font-bold text-gray-900">{candidate.percentage || 0}%</span>
                              </div>
                            </div>
                            <div className="relative w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                  index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                  index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                  'bg-gradient-to-r from-purple-500 to-purple-600'
                                }`}
                                style={{ width: `${candidate.percentage || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                   <div className="p-4 text-center text-gray-500">
                      <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Live results will appear here once candidates are approved.</p>
                   </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-lg font-bold text-gray-900">Election Information</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Election Period</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{electionInfo.period}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-green-100">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Eligible Voters</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{electionInfo.eligibleVoters.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Vote className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Votes Cast</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{electionInfo.votesCast.toLocaleString()}</span>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Turnout Progress</span>
                        <span className="text-sm font-bold text-blue-700">{electionInfo.turnoutPercentage}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: `${electionInfo.turnoutPercentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-yellow-600"/>
                    Your Notifications
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </h3>
                </div>
                {isLoadingNotifications ? (
                   <div className="p-4 text-center">
                     <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                     <p className="mt-2 text-gray-600">Loading notifications...</p>
                   </div>
                ) : notifications.length > 0 ? (
                  <div className="p-4 space-y-3">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-xl border ${
                          notification.type === 'vote_confirmation' ? 'bg-green-50 border-green-100' :
                          notification.type === 'election_application_status' && notification.status === 'approved' ? 'bg-blue-50 border-blue-100' :
                          notification.type === 'election_application_status' && notification.status === 'rejected' ? 'bg-red-50 border-red-100' :
                          'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center">
                          {notification.type === 'vote_confirmation' && <CheckCircle className="h-5 w-5 mr-2 text-green-600"/>}
                          {notification.type === 'election_application_status' && notification.status === 'approved' && 
                            <CheckCircle className="h-5 w-5 mr-2 text-blue-600"/>}
                          {notification.type === 'election_application_status' && notification.status === 'rejected' && 
                            <AlertCircle className="h-5 w-5 mr-2 text-red-600"/>}
                          <p className="text-sm font-medium text-gray-800 flex-1">{notification.message}</p>
                          {!notification.read && (
                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="p-4 text-center text-gray-500">
                      <Bell className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">You have no notifications.</p>
                   </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h3 className="text-lg font-bold text-gray-900">Voting Guidelines</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {votingGuidelines.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex-shrink-0 p-1 rounded-full bg-blue-100">
                          {item.icon}
                        </div>
                        <p className="text-sm text-gray-700 font-medium flex-1">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCandidateFormOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <CandidateApplicationForm onClose={handleCloseCandidateForm} electionPositions={electionPositions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionDashboard;