import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, GitBranch, Clock, AlertTriangle, TrendingUp, Calendar, Users, ExternalLink, Star, GitFork, Eye, Bug, Zap, GitPullRequest, GitCommit, Loader, CheckCircle, AlertCircle, ChevronDown, Bell } from 'lucide-react';
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
    if (!Array.isArray(currentUser?.teams) || currentUser.teams.length === 0) {
      setError('No team assigned to user');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const targetTeamId = teamId || selectedTeamId || currentUser.teams[0].id;
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
  const deploymentFreq = doraMetrics.deployment_frequency || {};
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
    { date: 'Week 1', deployments: 0, lead_time: 0 },
    { date: 'Week 2', deployments: deploymentFreq.total_deployments || 0, lead_time: leadTime.average_days || 0 },
    { date: 'Week 3', deployments: 0, lead_time: 0 },
    { date: 'Week 4', deployments: 0, lead_time: 0 }
  ];

  const contributorData = (repositoryInfo.contributors || [])
    .slice(0, 5)
    .map((contributor, index) => ({
      rank: index + 1,
      name: contributor.username || 'Unknown',
      contributions: contributor.contributions || 0,
      avatar: contributor.avatar_url || defaultAvatar,
      profile: contributor.profile_url || '#',
      percentage: index === 0 && repositoryInfo.contributors && repositoryInfo.contributors[0] ? 
        100 : 
        (contributor.contributions && repositoryInfo.contributors && repositoryInfo.contributors[0] ? 
          (contributor.contributions / repositoryInfo.contributors[0].contributions) * 100 : 
          0)
    }));

    

  // Get metric statuses with safe fallbacks
  const deploymentStatus = getDeploymentStatus(parseFloat(deploymentFreq.frequency_per_day) || 0);
  const leadTimeStatus = getLeadTimeStatus(leadTime.average_days || 0);
  const cfrStatus = getCFRStatus(changeFailureRate.failure_rate || 0);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
            {/* Repository Overview */}
            <div className="lg:col-span-2">
              <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] h-full flex flex-col">
                <div className="p-6 border-b border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text)]">Repository Overview</h3>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="flex items-start space-x-6 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <GitBranch className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-[var(--text)] truncate">
                        {repositoryInfo.full_name || 'Repository Name'}
                      </h3>
                      <p className="text-[var(--text-light)] mt-1">
                        {repositoryInfo.description || 'Repository description'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center space-x-1 text-sm text-[var(--text-light)]">
                          <Star className="w-4 h-4" />
                          <span>{repositoryInfo.stars?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-[var(--text-light)]">
                          <GitFork className="w-4 h-4" />
                          <span>{repositoryInfo.forks?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-[var(--text-light)]">
                          <Eye className="w-4 h-4" />
                          <span>{repositoryInfo.watchers?.toLocaleString() || 'N/A'}</span>
                        </div>
                        {repositoryInfo.url && (
                          <a
                            href={repositoryInfo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View on GitHub</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-light)]">Team</span>
                        <span className="text-sm font-medium text-[var(--text)]">{teamData.team?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-light)]">Language</span>
                        <span className="text-sm font-medium text-[var(--text)]">{repositoryInfo.primary_language || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-light)]">Default Branch</span>
                        <span className="text-sm font-medium text-[var(--text)]">{repositoryInfo.default_branch || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-light)]">Open Issues</span>
                        <span className="text-sm font-medium text-[var(--text)]">{repositoryInfo.open_issues || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-light)]">Open PRs</span>
                        <span className="text-sm font-medium text-[var(--text)]">{repositoryInfo.open_pull_requests || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--text-light)]">Created</span>
                        <span className="text-sm font-medium text-[var(--text)]">
                          {repositoryInfo.created_at ? new Date(repositoryInfo.created_at).toLocaleDateString() : 'N/A'}
                        </span>
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

       {/* Team Members - Full Width */}
        <section className="mb-8">
          <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)]">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text)]">Team Members</h3>
              <button className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors">
                Manage Team
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Team Creator */}
                {teamData.creator && (
                  <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)] hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {teamData.creator.name ? teamData.creator.name.charAt(0).toUpperCase() : 'C'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text)] truncate">
                          {teamData.creator.name || 'Team Creator'}
                        </p>
                        <p className="text-sm text-[var(--text-light)] truncate">
                          {teamData.creator.email || 'No email provided'}
                        </p>
                        <span className="inline-block px-2 py-1 text-xs rounded-full mt-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          Creator
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Members */}
                {teamData.members && teamData.members.length > 0 ? (
                  teamData.members.map((member, index) => (
                    <div key={member._id || index} className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)] hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--text)] truncate">
                            {member.name || 'Team Member'}
                          </p>
                          <p className="text-sm text-[var(--text-light)] truncate">
                            {member.email || 'No email provided'}
                          </p>
                          <span className="inline-block px-2 py-1 text-xs rounded-full mt-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            Member
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Show placeholder if no members (excluding creator)
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
                )}

                {/* Add Member Placeholders - only show a few if there are existing members */}
                {Array.from({ length: Math.max(2, 4 - (teamData.members?.length || 0) - 1) }).map((_, index) => (
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