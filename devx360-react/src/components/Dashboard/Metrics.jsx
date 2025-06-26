import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Activity, GitBranch, Clock, AlertTriangle, TrendingUp, Calendar, Users, ExternalLink } from 'lucide-react';

function Metrics() {
  const { currentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repoMatch, setRepoMatch] = useState(false);

  useEffect(() => {
    if (currentUser?.avatar) {
      const avatarUrl = currentUser.avatar.startsWith('http') 
        ? currentUser.avatar 
        : `${process.env.REACT_APP_API_URL || 'http://localhost:5500'}${currentUser.avatar}`;
      setAvatar(avatarUrl);
    } else {
      setAvatar(defaultAvatar);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchTeamMetrics = async () => {
      if (currentUser.teams === null) {
        setError('No team assigned to user');
        setLoading(false);
        return;
      }

      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';
        const response = await fetch(`${API_BASE_URL}/api/teams/${currentUser.teams[0].name}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch team data');
        }

        const data = await response.json();
        setTeamData(data);
        
        // Check if repository URLs match
        if (data.team?.repoUrl && data.doraMetrics?.repository?.url) {
          setRepoMatch(data.team.repoUrl === data.doraMetrics.repository.url);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTeamMetrics();
  }, [currentUser]);

  const getStatusColor = (status) => {
    if (status.includes('Elite') || status.includes('High')) return '#10b981';
    if (status.includes('Medium')) return '#f59e0b';
    if (status.includes('Low')) return '#ef4444';
    return '#6b7280';
  };

  const getDeploymentFrequencyStatus = (frequency) => {
    const freq = parseFloat(frequency);
    if (freq >= 1) return 'Elite';
    if (freq >= 0.14) return 'High';
    if (freq >= 0.04) return 'Medium';
    return 'Low';
  };

  const getLeadTimeStatus = (days) => {
    const avgDays = parseFloat(days);
    if (avgDays <= 1) return 'Elite';
    if (avgDays <= 7) return 'High';
    if (avgDays <= 30) return 'Medium';
    return 'Low';
  };

  const getMTTRStatus = (days) => {
    const avgDays = parseFloat(days);
    if (avgDays <= 1) return 'Elite';
    if (avgDays <= 7) return 'High';
    if (avgDays <= 30) return 'Medium';
    return 'Low';
  };

  const getChangeFailureRateStatus = (rate) => {
    const percentage = parseFloat(rate.replace('%', ''));
    if (percentage <= 15) return 'Elite';
    if (percentage <= 20) return 'High';
    if (percentage <= 30) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg lg:text-2xl font-bold text-gray-900">DORA Metrics</h1>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="block text-sm font-medium text-gray-900">{currentUser?.name}</span>
              <span className="block text-xs text-gray-500">{currentUser?.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </header>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg text-gray-600">Loading metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg lg:text-2xl font-bold text-gray-900">DORA Metrics</h1>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="block text-sm font-medium text-gray-900">{currentUser?.name}</span>
              <span className="block text-xs text-gray-500">{currentUser?.role}</span>
            </div>
          </div>
        </header>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Metrics</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { team, doraMetrics, lastUpdated } = teamData;

  // Prepare chart data
  const performanceData = [
    { 
      metric: 'Deployment Frequency', 
      score: getDeploymentFrequencyStatus(doraMetrics.deployment_frequency.frequency_per_day) === 'Elite' ? 4 : 
             getDeploymentFrequencyStatus(doraMetrics.deployment_frequency.frequency_per_day) === 'High' ? 3 :
             getDeploymentFrequencyStatus(doraMetrics.deployment_frequency.frequency_per_day) === 'Medium' ? 2 : 1,
      status: getDeploymentFrequencyStatus(doraMetrics.deployment_frequency.frequency_per_day),
      fill: getStatusColor(getDeploymentFrequencyStatus(doraMetrics.deployment_frequency.frequency_per_day))
    },
    { 
      metric: 'Lead Time', 
      score: getLeadTimeStatus(doraMetrics.lead_time.average_days) === 'Elite' ? 4 : 
             getLeadTimeStatus(doraMetrics.lead_time.average_days) === 'High' ? 3 :
             getLeadTimeStatus(doraMetrics.lead_time.average_days) === 'Medium' ? 2 : 1,
      status: getLeadTimeStatus(doraMetrics.lead_time.average_days),
      fill: getStatusColor(getLeadTimeStatus(doraMetrics.lead_time.average_days))
    },
    { 
      metric: 'MTTR', 
      score: doraMetrics.mttr.total_incidents_analyzed === 0 ? 4 : 
             getMTTRStatus(doraMetrics.mttr.average_days) === 'Elite' ? 4 : 
             getMTTRStatus(doraMetrics.mttr.average_days) === 'High' ? 3 :
             getMTTRStatus(doraMetrics.mttr.average_days) === 'Medium' ? 2 : 1,
      status: doraMetrics.mttr.total_incidents_analyzed === 0 ? 'No Issues' : getMTTRStatus(doraMetrics.mttr.average_days),
      fill: doraMetrics.mttr.total_incidents_analyzed === 0 ? '#10b981' : getStatusColor(getMTTRStatus(doraMetrics.mttr.average_days))
    },
    { 
      metric: 'Change Failure Rate', 
      score: getChangeFailureRateStatus(doraMetrics.change_failure_rate.failure_rate) === 'Elite' ? 4 : 
             getChangeFailureRateStatus(doraMetrics.change_failure_rate.failure_rate) === 'High' ? 3 :
             getChangeFailureRateStatus(doraMetrics.change_failure_rate.failure_rate) === 'Medium' ? 2 : 1,
      status: getChangeFailureRateStatus(doraMetrics.change_failure_rate.failure_rate),
      fill: getStatusColor(getChangeFailureRateStatus(doraMetrics.change_failure_rate.failure_rate))
    }
  ];

  // Pie chart data for repository analysis
  const repositoryData = [
    { name: 'Releases', value: doraMetrics.data_summary.releases_count, fill: '#8b5cf6' },
    { name: 'Commits', value: doraMetrics.data_summary.commits_count, fill: '#3b82f6' },
    { name: 'Pull Requests', value: doraMetrics.data_summary.pull_requests_count || 1, fill: '#10b981' },
    { name: 'Issues', value: doraMetrics.data_summary.issues_count, fill: '#f59e0b' },
    { name: 'Tags', value: doraMetrics.data_summary.tags_count, fill: '#ef4444' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">DORA Metrics</h1>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="block text-sm font-medium text-gray-900">{currentUser?.name}</span>
            <span className="block text-xs text-gray-500">{currentUser?.role}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Team Info Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">{team.name}</h2>
            </div>
            <span className="text-sm text-gray-500">
              Updated: {new Date(lastUpdated).toLocaleDateString()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Repository</p>
              <div className="flex items-center space-x-2">
                <a 
                  href={doraMetrics.repository.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                >
                  <span>{doraMetrics.repository.full_name}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                {repoMatch && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="font-medium">{team.members.length} members</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Created by</p>
              <p className="font-medium">{team.creator.name}</p>
            </div>
          </div>
        </div>

        {/* DORA Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Deployment Frequency */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Deployment Frequency</h3>
              </div>
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${getStatusColor(getDeploymentFrequencyStatus(doraMetrics.deployment_frequency.frequency_per_day))}20`,
                  color: getStatusColor(getDeploymentFrequencyStatus(doraMetrics.deployment_frequency.frequency_per_day))
                }}
              >
                {getDeploymentFrequencyStatus(doraMetrics.deployment_frequency.frequency_per_day)}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                {doraMetrics.deployment_frequency.frequency_per_day}/day
              </p>
              <p className="text-sm text-gray-600">
                {doraMetrics.deployment_frequency.total_deployments} deployments in {doraMetrics.deployment_frequency.time_span_days} days
              </p>
            </div>
          </div>

          {/* Lead Time */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Lead Time</h3>
              </div>
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${getStatusColor(getLeadTimeStatus(doraMetrics.lead_time.average_days))}20`,
                  color: getStatusColor(getLeadTimeStatus(doraMetrics.lead_time.average_days))
                }}
              >
                {getLeadTimeStatus(doraMetrics.lead_time.average_days)}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                {parseFloat(doraMetrics.lead_time.average_days).toFixed(1)} days
              </p>
              <p className="text-sm text-gray-600">
                Range: {parseFloat(doraMetrics.lead_time.min_days).toFixed(1)} - {parseFloat(doraMetrics.lead_time.max_days).toFixed(1)} days
              </p>
            </div>
          </div>

          {/* MTTR */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900 text-sm">MTTR</h3>
              </div>
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${doraMetrics.mttr.total_incidents_analyzed === 0 ? '#10b981' : getStatusColor(getMTTRStatus(doraMetrics.mttr.average_days))}20`,
                  color: doraMetrics.mttr.total_incidents_analyzed === 0 ? '#10b981' : getStatusColor(getMTTRStatus(doraMetrics.mttr.average_days))
                }}
              >
                {doraMetrics.mttr.total_incidents_analyzed === 0 ? 'No Issues' : getMTTRStatus(doraMetrics.mttr.average_days)}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                {doraMetrics.mttr.average_days} days
              </p>
              <p className="text-sm text-gray-600">
                {doraMetrics.mttr.total_incidents_analyzed} incidents analyzed
              </p>
            </div>
          </div>

          {/* Change Failure Rate */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Change Failure Rate</h3>
              </div>
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${getStatusColor(getChangeFailureRateStatus(doraMetrics.change_failure_rate.failure_rate))}20`,
                  color: getStatusColor(getChangeFailureRateStatus(doraMetrics.change_failure_rate.failure_rate))
                }}
              >
                {getChangeFailureRateStatus(doraMetrics.change_failure_rate.failure_rate)}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                {doraMetrics.change_failure_rate.failure_rate}
              </p>
              <p className="text-sm text-gray-600">
                {doraMetrics.change_failure_rate.bug_or_incident_fixes} failures in {doraMetrics.change_failure_rate.total_deployments} deployments
              </p>
            </div>
          </div>
        </div>

        {/* Repository Analysis and Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Repository Analysis Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-purple-500" />
              <span>Repository Analysis Summary</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{doraMetrics.data_summary.releases_count}</p>
                <p className="text-sm text-gray-600">Releases</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{doraMetrics.data_summary.commits_count}</p>
                <p className="text-sm text-gray-600">Commits</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{doraMetrics.data_summary.pull_requests_count}</p>
                <p className="text-sm text-gray-600">Pull Requests</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{doraMetrics.data_summary.issues_count}</p>
                <p className="text-sm text-gray-600">Issues</p>
              </div>
            </div>
          </div>

          {/* Repository Data Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Repository Data Distribution</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={repositoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {repositoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {repositoryData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.fill }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Overview Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">DORA Metrics Performance</h3>
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="metric" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 4]} 
                  tickFormatter={(value) => ['', 'Low', 'Medium', 'High', 'Elite'][value] || ''} 
                />
                <Tooltip 
                  formatter={(value, name, props) => [props.payload.status, 'Performance Level']}
                  labelFormatter={(label) => `Metric: ${label}`}
                />
                <Bar 
                  dataKey="score" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Metrics;