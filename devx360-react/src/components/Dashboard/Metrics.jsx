import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, GitBranch, Clock, AlertTriangle, TrendingUp, Calendar, Users, ExternalLink, Star, GitFork, Eye, Bug, Zap, GitPullRequest, GitCommit, Loader, CheckCircle, AlertCircle, ChevronDown, Bell, X, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import HeaderInfo from "../common/HeaderInfo";

function Metrics() {
  const { currentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [parsedFeedback, setParsedFeedback] = useState({});
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(null);
  const [aiStatus, setAiStatus] = useState('checking');
  const [aiProgress, setAiProgress] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [timeRange, setTimeRange] = useState('30');
  const [environment, setEnvironment] = useState('all');
  const [expandedInsights, setExpandedInsights] = useState({});
  
  // New states for member stats popup
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberStatsLoading, setMemberStatsLoading] = useState(false);
  const [showMemberStatsModal, setShowMemberStatsModal] = useState(false);

  useEffect(() => {
    if (currentUser?.avatar) {
      const avatarUrl = currentUser.avatar.startsWith('http') 
        ? currentUser.avatar 
        : `${process.env.REACT_APP_API_URL || 'http://localhost:5500'}${currentUser.avatar}`;
      setAvatar(avatarUrl);
    } else {
      setAvatar(defaultAvatar);
    }

    if (currentUser?.teams && currentUser.teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(currentUser.teams[0].id);
    }
  }, [currentUser, selectedTeamId]);

  const fetchTeamMetrics = async (teamId = null) => {
    if (!selectedTeamId || !currentUser?.teams) {
      setError('No team assigned to user');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const targetTeamId = selectedTeamId;
      console.log('Fetching metrics for team:', targetTeamId);
      const targetTeam = currentUser.teams.find(team => team.id === targetTeamId);
      if (!targetTeam) {
        throw new Error('Selected team not found');
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';
      const response = await fetch(`${API_BASE_URL}/api/teams/${targetTeamId}?teamId=${targetTeamId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }

      const data = await response.json();
      setTeamData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
  if (!currentUser) return;

  const timer = setTimeout(() => {
    if (currentUser.teams?.length > 0) {
      setSelectedTeamId(currentUser.teams[0].id);
    }
  }, 100); // short delay so session is established

  return () => clearTimeout(timer);
}, [currentUser]);

  useEffect(() => {
    if (selectedTeamId && currentUser?.teams) {
      fetchTeamMetrics();
    }
  }, [selectedTeamId, currentUser?.teams]);

  const handleTeamChange = (e) => {
    const newTeamId = e.target.value;
    setSelectedTeamId(newTeamId);
    setAiFeedback(null);
    setParsedFeedback({});
    setAiLoading(true);
    setAiError(null);
    setAiStatus('checking');
    setAiProgress(0);
  };

  useEffect(() => {
  // Reset all component state when user changes
  setTeamData(null);
  setLoading(true);
  setError(null);
  setAiFeedback(null);
  setParsedFeedback({});
  setAiLoading(true);
  setAiError(null);
  setAiStatus('checking');
  setAiProgress(0);
  setSelectedTeamId('');
  setExpandedInsights({});
  setSelectedMember(null);
  setShowMemberStatsModal(false);

  // Set initial team for new user
  if (currentUser?.teams && currentUser.teams.length > 0) {
    setSelectedTeamId(currentUser.teams[0].id);
  } else {
    setSelectedTeamId('');
  }
}, [currentUser]); // Add currentUser as dependency

  // Check if current user is the creator of the selected team
  const isTeamCreator = () => {

    return teamData?.creator?._id === currentUser?._id;
  };

  // Handle member click
const handleMemberClick = (member) => {
  if (!member || !currentUser) return;
  
  const memberIdStr = String(member._id);
  const currentUserIdStr = String(currentUser._id);
  
  console.log('Member ID (string):', memberIdStr);
  console.log('Current User ID (string):', currentUserIdStr);
  console.log('Is Creator:', isTeamCreator());
  console.log('Is Own Profile:', memberIdStr === currentUserIdStr);
  
  // RBAC Logic:
  // - Team creators can view anyone's stats
  // - Regular members can only view their own stats
  const canViewStats = isTeamCreator() || memberIdStr === currentUserIdStr;
  
  if (!canViewStats) {
    // Show access denied message for restricted access
    alert('Access Restricted: You can only view your own stats. Team creators have access to all member stats.');
    return;
  }

  setSelectedMember(member);
  setShowMemberStatsModal(true);
  
  // The stats should already be available in teamData.memberStats[memberIdStr]
  // No need to fetch again since we get all stats from the initial team API call
};


  
  // Close member stats modal
  const closeMemberStatsModal = () => {
    setShowMemberStatsModal(false);
    setSelectedMember(null);
  };

  // Fixed AI feedback useEffect
  useEffect(() => {
    console.log('Fetching AI feedback for team:', selectedTeamId);
    if (!selectedTeamId) return;
    console.log('Checking AI feedback for team:', teamData?.team?._id);
    const teamId = selectedTeamId || teamData?.team?._id;
    let pollInterval;

    const checkAiFeedback = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';
        const response = await fetch(`${API_BASE_URL}/api/ai-review?teamId=${teamId}`, {
          credentials: 'include',
        });

        const data = await response.json();
        console.log('AI feedback response:', data);

        if (response.ok && data.status === 'completed' && data.aiFeedback) {
          // Successfully got completed analysis
          setAiFeedback(data.aiFeedback);
          console.log('AI Feedback:', data.aiFeedback);
          
          // Parse the feedback sections - improved regex to handle the format better
          const feedbackSections = {};
          const matches = [...data.aiFeedback.matchAll(/## ([^\n]+)\n([\s\S]*?)(?=\n---\n|$)/g)];
          matches.forEach(([_, title, content]) => {
            feedbackSections[title.trim()] = content.trim();
          });
          setParsedFeedback(feedbackSections);
          setAiStatus('completed');
          setAiLoading(false);
          setAiError(null);
          clearInterval(pollInterval);
        } else if (response.status === 202 || (data.status && data.status !== 'completed')) {
          // Analysis is still pending
          setAiStatus('pending');
          setAiProgress(data.progress || 50); // Use progress from response or default
          setAiLoading(false);
          setAiError(null);
          
          // Continue polling if not already polling
          if (!pollInterval) {
            pollInterval = setInterval(checkAiFeedback, 30000);
          }
        } else if (response.status === 404 || !data.aiFeedback) {
          // No analysis found yet - this might be normal for new teams
          setAiStatus('not_started');
          setAiLoading(false);
          setAiError(null);
          
          // Start polling to check if analysis gets initiated
          if (!pollInterval) {
            pollInterval = setInterval(checkAiFeedback, 60000); // Less frequent polling
          }
        } else {
          throw new Error(data.message || 'Failed to fetch AI analysis');
        }
      } catch (err) {
        console.error('AI feedback error:', err);
        setAiError(err.message);
        setAiStatus('error');
        setAiLoading(false);
        clearInterval(pollInterval);
      }
    };

    // Initial check
    checkAiFeedback();

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [teamData]);

  const getMetricStatus = (value, thresholds) => {
    if (value >= thresholds.good) return { status: 'Good', color: 'green' };
    if (value >= thresholds.fair) return { status: 'Fair', color: 'yellow' };
    return { status: 'Needs Improvement', color: 'red' };
  };

  const getDeploymentStatus = (freq) => {
    return getMetricStatus(freq, { good: 0.1, fair: 0.05 });
  };

  const getLeadTimeStatus = (days) => {
    return getMetricStatus(10 - days, { good: 8, fair: 6 });
  };

  const getCFRStatus = (rate) => {
    const numRate = parseFloat(rate) || 0;
    if (numRate <= 5) return { status: 'Good', color: 'green' };
    if (numRate <= 15) return { status: 'Fair', color: 'yellow' };
    return { status: 'Critical', color: 'red' };
  };

  const getCurrentSelection = () => {
    const teamName = selectedTeamId ? 
      currentUser?.teams.find(t => t.id === selectedTeamId)?.name || 'Unknown Team' : 
      'All Teams';
    const timeRangeText = `Last ${timeRange} days`;
    const environmentText = environment === 'all' ? 'All Environments' : 
      environment.charAt(0).toUpperCase() + environment.slice(1);
    return `${teamName} • ${timeRangeText} • ${environmentText}`;
  };

  const toggleInsight = (key) => {
    setExpandedInsights(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderAiInsight = (title, content, key) => {
    if (!content) return null;

    const isExpanded = expandedInsights[key];

    return (
      <div key={key} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden transition-all duration-200">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
          onClick={() => toggleInsight(key)}
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            <div>
              <h4 className="font-semibold text-[var(--text)] uppercase tracking-wide text-sm">{title}</h4>
              <p className="text-sm text-[var(--text-light)]">AI Analysis Complete</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-[var(--text-light)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
        
        {isExpanded && (
          <div className="px-4 pb-4">
            <div className="bg-[var(--bg-container)] rounded-lg p-4 border border-[var(--border)]">
              <div className="prose prose-sm max-w-none text-[var(--text)]">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Member Stats Modal Component
const MemberStatsModal = () => {
  if (!showMemberStatsModal || !selectedMember) return null;

  const memberIdStr = String(selectedMember._id);
  const currentUserIdStr = String(currentUser._id);
  const isCurrentUser = memberIdStr === currentUserIdStr;
  const canViewStats = isTeamCreator() || isCurrentUser;

  if (!canViewStats) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-container)] rounded-xl shadow-xl border border-[var(--border)] w-full max-w-md">
            <div className="p-6 text-center">
              <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Access Restricted</h2>
              <p className="text-[var(--text-light)] mb-4">
                You can only view your own stats. Team creators have access to all member stats.
              </p>
              <button
                onClick={closeMemberStatsModal}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Fixed stats access logic for modal
  let memberStats = null;
  if (isTeamCreator()) {
    // Team creators can access any member's stats from memberStats object
    memberStats = teamData.memberStats?.[memberIdStr];
  } else if (isCurrentUser) {
    // Regular users accessing their own stats - try both locations
    memberStats = teamData.memberStats?.[currentUserIdStr] || teamData.myStats;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[var(--bg-container)] rounded-xl shadow-xl border border-[var(--border)] w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">
                  {selectedMember.name ? selectedMember.name.charAt(0).toUpperCase() : 'M'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">
                  {selectedMember.name || 'Team Member'} 
                  {isCurrentUser && <span className="text-sm text-[var(--text-light)] ml-2">(You)</span>}
                </h2>
                <p className="text-[var(--text-light)]">{selectedMember.email || 'No email provided'}</p>
              </div>
            </div>
            <button
              onClick={closeMemberStatsModal}
              className="p-2 hover:bg-[var(--bg)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-light)]" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {memberStats ? (
              <div className="space-y-6">
                {/* GitHub Profile Info */}
                {memberStats.githubUsername && (
                  <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
                    <h3 className="font-semibold text-[var(--text)] mb-3 flex items-center">
                      <GitBranch className="w-4 h-4 mr-2" />
                      GitHub Profile
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-light)]">Username</span>
                        <span className="text-sm font-medium text-[var(--text)]">{memberStats.githubUsername}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-light)]">Activity Score</span>
                        <span className="text-sm font-medium text-[var(--text)]">{memberStats.activityScore || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-light)]">Last Activity</span>
                        <span className="text-sm font-medium text-[var(--text)]">
                          {memberStats.lastActivity ? new Date(memberStats.lastActivity).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-light)]">Data Collected</span>
                        <span className="text-sm font-medium text-[var(--text)]">
                          {memberStats.collectedAt ? new Date(memberStats.collectedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Commit Stats */}
                <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text)] mb-3 flex items-center">
                    <GitCommit className="w-4 h-4 mr-2" />
                    Commits
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[var(--text)]">{memberStats.commits?.total || 0}</div>
                      <div className="text-sm text-[var(--text-light)]">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{memberStats.commits?.recent || 0}</div>
                      <div className="text-sm text-[var(--text-light)]">Recent</div>
                    </div>
                  </div>
                </div>

                {/* Pull Requests Stats */}
                <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text)] mb-3 flex items-center">
                    <GitPullRequest className="w-4 h-4 mr-2" />
                    Pull Requests
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[var(--text)]">{memberStats.pullRequests?.total || 0}</div>
                      <div className="text-sm text-[var(--text-light)]">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{memberStats.pullRequests?.merged || 0}</div>
                      <div className="text-sm text-[var(--text-light)]">Merged</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{memberStats.pullRequests?.open || 0}</div>
                      <div className="text-sm text-[var(--text-light)]">Open</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{memberStats.pullRequests?.closed || 0}</div>
                      <div className="text-sm text-[var(--text-light)]">Closed</div>
                    </div>
                  </div>
                </div>

                {/* Issues Stats */}
                <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text)] mb-3 flex items-center">
                    <Bug className="w-4 h-4 mr-2" />
                    Issues
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[var(--text)]">{memberStats.issues?.total || 0}</div>
                      <div className="text-sm text-[var(--text-light)]">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{memberStats.issues?.open || 0}</div>
                      <div className="text-sm text-[var(--text-light)]">Open</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{memberStats.issues?.closed || 0}</div>
                      <div className="text-sm text-[var(--text-light)]">Closed</div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text)] mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-light)]">Activity Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((memberStats.activityScore || 0) / 100 * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-[var(--text)]">{memberStats.activityScore || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-light)]">PR Success Rate</span>
                      <span className="text-sm font-medium text-[var(--text)]">
                        {memberStats.pullRequests?.total > 0 
                          ? `${Math.round((memberStats.pullRequests.merged / memberStats.pullRequests.total) * 100)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-light)]">Issue Resolution Rate</span>
                      <span className="text-sm font-medium text-[var(--text)]">
                        {memberStats.issues?.total > 0 
                          ? `${Math.round((memberStats.issues.closed / memberStats.issues.total) * 100)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--text)] mb-2">No Stats Available</h3>
                <p className="text-[var(--text-light)]">
                  {isCurrentUser ? 'Your stats will appear here once you start contributing.' : 'Member stats are being collected.'}
                </p>
                {/* Debug info - remove this in production */}
                <div className="mt-4 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  <p>Debug: memberIdStr={memberIdStr}, currentUserIdStr={currentUserIdStr}</p>
                  <p>teamData.memberStats keys: {JSON.stringify(Object.keys(teamData.memberStats || {}))}</p>
                  <p>teamData.myStats available: {teamData.myStats ? 'Yes' : 'No'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

  // Render member card with access control
const renderMemberCard = (member, isCreator = false) => {
  const memberIdStr = String(member._id);
  const currentUserIdStr = String(currentUser._id);
  const isCurrentUser = memberIdStr === currentUserIdStr;
  const canViewStats = isTeamCreator() || isCurrentUser;
  
  // Fixed stats access logic:
  let memberStats = null;
  if (canViewStats) {
    if (isTeamCreator()) {
      // Creators can see all member stats from memberStats object
      memberStats = teamData.memberStats?.[memberIdStr];
    } else if (isCurrentUser) {
      // Regular users can only see their own stats
      // First try memberStats[currentUserId], then fallback to myStats
      memberStats = teamData.memberStats?.[currentUserIdStr] || teamData.myStats;
    }
  }

  return (
    <div 
      key={member._id} 
      className={`bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)] transition-all duration-200 ${
        canViewStats 
          ? 'hover:shadow-md hover:border-[var(--primary)] cursor-pointer' 
          : 'cursor-default opacity-75'
      }`}
      onClick={() => handleMemberClick(member)}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 ${
          isCreator 
            ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
            : 'bg-gradient-to-br from-blue-500 to-green-600'
        } rounded-full flex items-center justify-center flex-shrink-0 relative`}>
          <span className="text-white font-semibold text-sm">
            {member.name ? member.name.charAt(0).toUpperCase() : (isCreator ? 'C' : 'M')}
          </span>
          {!canViewStats && (
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-white opacity-80" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-[var(--text)] truncate">
              {member.name || (isCreator ? 'Team Creator' : 'Team Member')}
              {isCurrentUser && <span className="text-sm text-[var(--text-light)] ml-1">(You)</span>}
            </p>
            {canViewStats && (
              <ExternalLink className="w-3 h-3 text-[var(--text-light)]" />
            )}
          </div>
          <p className="text-sm text-[var(--text-light)] truncate">
            {member.email || 'No email provided'}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              isCreator
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            }`}>
              {isCreator ? 'Creator' : 'Member'}
            </span>
            {canViewStats && memberStats && (
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                Stats Available
              </span>
            )}
            {!canViewStats && (
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Restricted
              </span>
            )}
          </div>
          
          {canViewStats && memberStats ? (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-[var(--bg-container)] rounded p-2">
                <div className="text-sm font-semibold text-[var(--text)]">{memberStats.commits?.total || 0}</div>
                <div className="text-xs text-[var(--text-light)]">Commits</div>
              </div>
              <div className="bg-[var(--bg-container)] rounded p-2">
                <div className="text-sm font-semibold text-[var(--text)]">{memberStats.pullRequests?.total || 0}</div>
                <div className="text-xs text-[var(--text-light)]">PRs</div>
              </div>
              <div className="bg-[var(--bg-container)] rounded p-2">
                <div className="text-sm font-semibold text-[var(--text)]">{memberStats.activityScore || 0}</div>
                <div className="text-xs text-[var(--text-light)]">Score</div>
              </div>
            </div>
          ) : canViewStats && !memberStats ? (
            <div className="mt-3 text-center">
              <div className="bg-[var(--bg-container)] rounded p-2">
                <div className="text-xs text-[var(--text-light)]">Click to view stats</div>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-center">
              <div className="bg-[var(--bg-container)] rounded p-2 flex items-center justify-center space-x-2">
                <Lock className="w-4 h-4 text-red-500" />
                <div className="text-xs text-red-600 dark:text-red-400">Access Restricted</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          <span className="ml-3 text-[var(--text)]">Loading metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !teamData) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-xl font-semibold text-[var(--text)] mb-2">Error Loading Data</div>
          <div className="text-[var(--text-light)]">{error || 'No team data available'}</div>
        </div>
      </div>
    );
  }

  const currentSelectedTeam = currentUser?.teams.find(team => team.id === selectedTeamId);

  // Safe data access with fallbacks for missing DORA metrics
const doraMetrics = teamData.doraMetrics || {};
const dataSummary = doraMetrics.data_summary || {};
const repositoryInfo = teamData.repositoryInfo || {};
const deploymentFreq = doraMetrics.deployment_frequency || { perWeek: [] };
const leadTime = doraMetrics.lead_time || {};
const changeFailureRate = doraMetrics.change_failure_rate || {};
const mttr = doraMetrics.mttr || {};

  

  // Prepare chart data with safe fallbacks
  const activityData = [
    { name: 'Commits', value: dataSummary.commits_count || 0, color: '#3B82F6' },
    { name: 'PRs', value: repositoryInfo.open_pull_requests || 0, color: '#10B981' },
    { name: 'Issues', value: repositoryInfo.open_issues || 0, color: '#F59E0B' },
    { name: 'Releases', value: dataSummary.releases_count || 0, color: '#EF4444' }
  ];

const deploymentTrendData = [
  { date: 'Week 1', deployments: deploymentFreq.perWeek?.[0] || 0 },
  { date: 'Week 2', deployments: deploymentFreq.perWeek?.[1] || 0 },
  { date: 'Week 3', deployments: deploymentFreq.perWeek?.[2] || 0 },
  { date: 'Week 4', deployments: deploymentFreq.perWeek?.[3] || 0 }
];

 const contributorData = (repositoryInfo.contributors || [])
  .slice(0, 5)
  .map((contributor, index) => {
    const topContributor = repositoryInfo.contributors?.[0];
    const topContributions = topContributor?.contributions || 1; // Avoid division by zero
    
    return {
      rank: index + 1,
      name: contributor.username || 'Unknown',
      contributions: contributor.contributions || 0,
      avatar: contributor.avatar_url || defaultAvatar,
      profile: contributor.profile_url || '#',
      percentage: index === 0 ? 100 : 
        (contributor.contributions ? (contributor.contributions / topContributions) * 100 : 0)
    };
  });

  // Get metric statuses with safe fallbacks
  const deploymentStatus = getDeploymentStatus(parseFloat(deploymentFreq.frequency_per_day) || 0);
  const leadTimeStatus = getLeadTimeStatus(leadTime.average_days || 0);
  const cfrStatus = getCFRStatus(changeFailureRate.failure_rate || 0);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Member Stats Modal */}
      <MemberStatsModal />
      
      {/* Header */}
      <header className="bg-[var(--bg-container)] shadow-sm border-b border-[var(--border)] py-4 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-[var(--text)]">DevX360</h1>
              <div className="h-6 w-px bg-[var(--border)]"></div>
              <h2 className="text-lg font-medium text-[var(--text-light)]">DORA Metrics Dashboard</h2>
            </div>
            
            {/* Filter Controls */}
            <div className="flex items-center space-x-4">
              {/* Team Selection */}
              <div className="relative">
                <select
                  value={selectedTeamId}
                  onChange={handleTeamChange}
                  className="appearance-none bg-[var(--bg-container)] border border-[var(--border)] rounded-lg px-4 py-2 pr-8 text-sm font-medium text-[var(--text)] hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                >
                  {currentUser?.teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-light)] pointer-events-none" />
              </div>
              
              {/* Time Range */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none bg-[var(--bg-container)] border border-[var(--border)] rounded-lg px-4 py-2 pr-8 text-sm font-medium text-[var(--text)] hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="180">Last 6 months</option>
                  <option value="365">Last year</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-light)] pointer-events-none" />
              </div>
              
              {/* Environment */}
              <div className="relative">
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="appearance-none bg-[var(--bg-container)] border border-[var(--border)] rounded-lg px-4 py-2 pr-8 text-sm font-medium text-[var(--text)] hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                >
                  <option value="all">All Environments</option>
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-light)] pointer-events-none" />
              </div>
            </div>
            
            <HeaderInfo currentUser={currentUser} avatar={avatar} defaultAvatar={defaultAvatar} />
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Current Selection Display */}
        <section className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Showing metrics for: <span className="font-semibold">{getCurrentSelection()}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Overview - Full Width Grid */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Deployment Frequency */}
            <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden h-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <GitBranch className="w-6 h-6" />
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    deploymentStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    deploymentStatus.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {deploymentStatus.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text)] mb-1">
                  {deploymentFreq.frequency_per_day || 0}/day
                </h3>
                <p className="text-sm font-medium text-[var(--text-light)]">Deployment Frequency</p>
                <p className="text-xs text-[var(--text-light)] mt-2">
                  {deploymentFreq.total_deployments || 0} deployments in {deploymentFreq.analysis_period_days || 0} days
                </p>
              </div>
            </div>
            
            {/* Lead Time */}
            <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden h-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    leadTimeStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    leadTimeStatus.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {leadTimeStatus.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text)] mb-1">
                  {leadTime.average_days || 0} days
                </h3>
                <p className="text-sm font-medium text-[var(--text-light)]">Lead Time</p>
                <p className="text-xs text-[var(--text-light)] mt-2">
                  Range: {leadTime.min_days || 0} - {leadTime.max_days || 0} days
                </p>
              </div>
            </div>
            
            {/* Change Failure Rate */}
            <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden h-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    cfrStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    cfrStatus.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {cfrStatus.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text)] mb-1">
                  {changeFailureRate.failure_rate || '0%'}
                </h3>
                <p className="text-sm font-medium text-[var(--text-light)]">Change Failure Rate</p>
                <p className="text-xs text-[var(--text-light)] mt-2">
                  {changeFailureRate.bug_or_incident_fixes || 0} failures in {changeFailureRate.total_deployments || 0} deployments
                </p>
              </div>
            </div>
            
            {/* MTTR */}
            <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden h-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text)] mb-1">
                  {mttr.average_days || 0} days
                </h3>
                <p className="text-sm font-medium text-[var(--text-light)]">Mean Time to Recovery</p>
                <p className="text-xs text-[var(--text-light)] mt-2">
                  {mttr.total_incidents_analyzed > 0 ? (
                    `${mttr.total_incidents_analyzed} incidents analyzed`
                  ) : (
                    "No incidents analyzed"
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
     {/* Repository Overview and Activity Summary - Equal Height */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
           {/* Repository Overview */}
            <div className="lg:col-span-2">
              <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] h-full flex flex-col">
                <div className="p-6 border-b border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text)]">Repository Overview</h3>
                </div>
                <div className="flex-1 p-6 min-h-0 overflow-hidden">
                  {/* Repository Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <GitBranch className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[var(--text)] truncate">
                        {repositoryInfo.full_name || 'Repository Name'}
                      </h3>
                      <p className="text-[var(--text-light)] mt-1 text-sm line-clamp-2">
                        {repositoryInfo.description || 'Repository description'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <div className="flex items-center space-x-1 text-xs text-[var(--text-light)]">
                          <Star className="w-3 h-3" />
                          <span>{repositoryInfo.stars?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-[var(--text-light)]">
                          <GitFork className="w-3 h-3" />
                          <span>{repositoryInfo.forks?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-[var(--text-light)]">
                          <Eye className="w-3 h-3" />
                          <span>{repositoryInfo.watchers?.toLocaleString() || '0'}</span>
                        </div>
                        {repositoryInfo.url && (
                          <a
                            href={repositoryInfo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View on GitHub</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Repository Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-[var(--text)] text-xs uppercase tracking-wide">Project Info</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-[var(--text-light)]">Team</span>
                          <span className="text-xs font-medium text-[var(--text)]">{teamData.team?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-[var(--text-light)]">Language</span>
                          <span className="text-xs font-medium text-[var(--text)]">{repositoryInfo.primary_language || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-[var(--text-light)]">Default Branch</span>
                          <span className="text-xs font-medium text-[var(--text)]">{repositoryInfo.default_branch || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-[var(--text-light)]">Repository Size</span>
                          <span className="text-xs font-medium text-[var(--text)]">
                            {repositoryInfo.size ? `${(repositoryInfo.size / 1024).toFixed(1)} MB` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-[var(--text)] text-xs uppercase tracking-wide">Activity</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-[var(--text-light)]">Open Issues</span>
                          <span className="text-xs font-medium text-[var(--text)]">{repositoryInfo.open_issues || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-[var(--text-light)]">Open PRs</span>
                          <span className="text-xs font-medium text-[var(--text)]">{repositoryInfo.open_pull_requests || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-[var(--text-light)]">Contributors</span>
                          <span className="text-xs font-medium text-[var(--text)]">{repositoryInfo.total_contributors || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-[var(--text-light)]">Last Updated</span>
                          <span className="text-xs font-medium text-[var(--text)]">
                            {repositoryInfo.updated_at ? new Date(repositoryInfo.updated_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Language Breakdown */}
                  {repositoryInfo.language_breakdown && repositoryInfo.language_breakdown.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-[var(--text)] text-xs uppercase tracking-wide mb-2">Language Breakdown</h4>
                      <div className="space-y-2">
                        {repositoryInfo.language_breakdown.slice(0, 4).map((lang, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                lang.language === 'JavaScript' ? 'bg-yellow-400' :
                                lang.language === 'TypeScript' ? 'bg-blue-500' :
                                lang.language === 'Python' ? 'bg-green-500' :
                                lang.language === 'Java' ? 'bg-red-500' :
                                lang.language === 'C++' ? 'bg-blue-600' :
                                lang.language === 'C#' ? 'bg-purple-500' :
                                lang.language === 'HTML' ? 'bg-orange-500' :
                                lang.language === 'CSS' ? 'bg-blue-400' :
                                lang.language === 'Makefile' ? 'bg-gray-500' :
                                lang.language === 'CMake' ? 'bg-gray-600' :
                                'bg-gray-400'
                              }`}></div>
                              <span className="text-xs font-medium text-[var(--text)]">{lang.language}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300"
                                  style={{ width: lang.percentage }}
                                ></div>
                              </div>
                              <span className="text-xs text-[var(--text-light)] min-w-[35px] text-right">
                                {lang.percentage}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Repository Metrics Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-[var(--bg)] rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {repositoryInfo.stars?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-[var(--text-light)] mt-1">Stars</div>
                    </div>
                    <div className="bg-[var(--bg)] rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {repositoryInfo.forks?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-[var(--text-light)] mt-1">Forks</div>
                    </div>
                    <div className="bg-[var(--bg)] rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {repositoryInfo.watchers?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-[var(--text-light)] mt-1">Watchers</div>
                    </div>
                  </div>

                  {/* Repository Status */}
                  <div className="pt-3 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          repositoryInfo.is_archived ? 'bg-red-400' :
                          repositoryInfo.is_disabled ? 'bg-gray-400' :
                          'bg-green-400'
                        }`}></div>
                        <span className="text-xs text-[var(--text-light)]">
                          {repositoryInfo.is_archived ? 'Archived' :
                           repositoryInfo.is_disabled ? 'Disabled' :
                           'Active'}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-light)]">
                        Created: {repositoryInfo.created_at ? new Date(repositoryInfo.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] h-full flex flex-col">
                <div className="p-6 border-b border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text)]">Activity Summary</h3>
                </div>
                <div className="flex-1 p-6 flex flex-col">
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={activityData}
                        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#f0f0f0'} />
                        <XAxis type="number" stroke={document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'} fontSize={12} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          stroke={document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'} 
                          fontSize={12} 
                          width={80} 
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
                            borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
                          }}
                        />
                        <Bar dataKey="value">
                          {activityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {activityData.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-[var(--text-light)]">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Row - Full Width */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deployment Trends */}
            <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] h-[400px] flex flex-col">
              <div className="p-6 border-b border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text)]">Deployment Trends</h3>
              </div>
              <div className="flex-1 p-6">
                {deploymentFreq.perWeek && Array.isArray(deploymentFreq.perWeek) ? (
                  <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={deploymentTrendData}>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#f0f0f0'} />
                    <XAxis dataKey="date" stroke={document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'} fontSize={12} />
                    <YAxis stroke={document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="deployments"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                ): (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-[var(--text-light)]">No deployment data available</p>
    </div>
  </div>
)}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] h-[400px] flex flex-col">
              <div className="p-6 border-b border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text)]">Top Contributors</h3>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                {contributorData.length > 0 ? (
                  <div className="space-y-4">
                    {contributorData.map((contributor) => (
                      <div key={contributor.rank} className="grid grid-cols-[30px_40px_1fr_100px] items-center gap-4">
                        <div className="text-sm font-medium text-[var(--text-light)]">#{contributor.rank}</div>
                        <img
                          src={contributor.avatar}
                          alt={contributor.name}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            e.target.src = defaultAvatar;
                          }}
                        />
                        <div>
                          <a
                            href={contributor.profile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[var(--text)] hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {contributor.name}
                          </a>
                          <p className="text-xs text-[var(--text-light)]">{contributor.contributions} contributions</p>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${contributor.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-[var(--text-light)]">No contributor data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Team Members Section - Updated JSX */}
<section className="mb-8">
  <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)]">
    <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <h3 className="text-lg font-semibold text-[var(--text)]">Team Members</h3>
        {isTeamCreator() && (
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            Creator Access
          </span>
        )}
        {!isTeamCreator() && (
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300">
            <Users className="w-3 h-3 inline mr-1" />
            Member View
          </span>
        )}
      </div>
      {isTeamCreator() && (
        <button className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors">
          Manage Team
        </button>
      )}
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Team Creator - Always show */}
        {teamData.creator && renderMemberCard(teamData.creator, true)}

        {/* All Team Members - Show all, but limit interaction based on permissions */}
        {teamData.members && teamData.members.length > 0 ? (
          teamData.members.map((member) => renderMemberCard(member, false))
        ) : (
          // Show placeholder only if you're the creator and there are no members
          isTeamCreator() && (
            <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)] border-dashed opacity-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-light)]">No Members Yet</p>
                  <p className="text-sm text-[var(--text-light)]">Invite team members</p>
                </div>
              </div>
            </div>
          )
        )}

        {/* Add Member Placeholders - only show for creators */}
        {isTeamCreator() && Array.from({ length: Math.max(1, 3 - (teamData.members?.length || 0)) }).map((_, index) => (
          <div key={`placeholder-${index}`} className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)] border-dashed opacity-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--text-light)]">Add Member</p>
                <p className="text-sm text-[var(--text-light)]">Invite team member</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Team Stats Summary */}
      <div className="mt-6 pt-6 border-t border-[var(--border)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-[var(--bg)] rounded-lg p-4">
            <div className="text-2xl font-bold text-[var(--text)]">
              {(teamData.members?.length || 0) + (teamData.creator ? 1 : 0)}
            </div>
            <div className="text-sm text-[var(--text-light)]">Total Members</div>
          </div>
          <div className="bg-[var(--bg)] rounded-lg p-4">
            <div className="text-2xl font-bold text-[var(--text)]">
              {teamData.creator ? 1 : 0}
            </div>
            <div className="text-sm text-[var(--text-light)]">Creator</div>
          </div>
          <div className="bg-[var(--bg)] rounded-lg p-4">
            <div className="text-2xl font-bold text-[var(--text)]">
              {teamData.members?.length || 0}
            </div>
            <div className="text-sm text-[var(--text-light)]">Active Members</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
        
        {/* AI Analysis - Full Width */}
        <section className="pb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--text)]">AI Performance Analysis</h2>
            <div className="flex items-center space-x-2">
              {aiStatus === 'completed' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Analysis Complete</span>
                </>
              )}
              {aiStatus === 'pending' && (
                <>
                  <Loader className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-spin" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Analysis in Progress... {aiProgress > 0 ? `${aiProgress}%` : ''}
                  </span>
                </>
              )}
              {(aiStatus === 'checking' || aiLoading) && (
                <>
                  <Loader className="w-5 h-5 text-gray-500 dark:text-gray-400 animate-spin" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Checking for Analysis...</span>
                </>
              )}
              {aiStatus === 'not_started' && (
                <>
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Analysis Not Started</span>
                </>
              )}
              {aiStatus === 'error' && (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Error: {aiError}</span>
                </>
              )}
            </div>
          </div>

          {aiLoading ? (
            <div className="flex items-center justify-center py-12 bg-[var(--bg-container)] rounded-xl border border-[var(--border)]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
              <span className="ml-3 text-[var(--text)]">Loading AI analysis...</span>
            </div>
          ) : aiFeedback && Object.keys(parsedFeedback).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderAiInsight('DEPLOYMENT FREQUENCY', parsedFeedback['DEPLOYMENT FREQUENCY'], 'deployment')}
              {renderAiInsight('LEAD TIME FOR CHANGES', parsedFeedback['LEAD TIME FOR CHANGES'], 'leadtime')}
              {renderAiInsight('CHANGE FAILURE RATE (CFR)', parsedFeedback['CHANGE FAILURE RATE (CFR)'], 'cfr')}
              {renderAiInsight('MEAN TIME TO RECOVERY (MTTR)', parsedFeedback['MEAN TIME TO RECOVERY (MTTR)'], 'mttr')}
            </div>
          ) : aiStatus === 'not_started' ? (
            <div className="text-center py-12 bg-[var(--bg-container)] rounded-xl border border-[var(--border)]">
              <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--text)] mb-2">AI Analysis Pending</h3>
              <p className="text-[var(--text-light)] max-w-md mx-auto">
                Analysis will start automatically. This usually takes a few minutes for new teams.
              </p>
            </div>
          ) : aiStatus === 'error' ? (
            <div className="text-center py-12 bg-[var(--bg-container)] rounded-xl border border-[var(--border)]">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--text)] mb-2">Analysis Error</h3>
              <p className="text-[var(--text-light)] max-w-md mx-auto mb-4">
                {aiError || 'There was an error processing the AI analysis.'}
              </p>
              <button 
                onClick={() => {
                  setAiStatus('checking');
                  setAiLoading(true);
                  setAiError(null);
                }}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
              >
                Retry Analysis
              </button>
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--bg-container)] rounded-xl border border-[var(--border)]">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--text)] mb-2">No AI Analysis Available</h3>
              <p className="text-[var(--text-light)] max-w-md mx-auto">
                Analysis is automatically started when you create or join a team. Check back in a few minutes for insights.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Metrics;