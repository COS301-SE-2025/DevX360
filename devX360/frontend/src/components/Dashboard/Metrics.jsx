import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
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
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  GitBranch,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Users,
  ExternalLink,
  Star,
  GitFork,
  Eye,
  Bug,
  Zap,
  GitPullRequest,
  GitCommit,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

function Metrics() {
  const { currentUser } = useAuth();
  const defaultAvatar = "/default-avatar.png";
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [parsedFeedback, setParsedFeedback] = useState({});
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(null);
  const [aiStatus, setAiStatus] = useState("checking");
  const [aiProgress, setAiProgress] = useState(0);

  useEffect(() => {
    if (currentUser?.avatar) {
      const avatarUrl = currentUser.avatar.startsWith("http")
        ? currentUser.avatar
        : `${process.env.REACT_APP_API_URL || "http://localhost:5500"}${
            currentUser.avatar
          }`;
      setAvatar(avatarUrl);
    } else {
      setAvatar(defaultAvatar);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchTeamMetrics = async () => {
      if (
        !Array.isArray(currentUser?.teams) ||
        currentUser.teams.length === 0
      ) {
        setError("No team assigned to user");
        setLoading(false);
        return;
      }

      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_URL || "http://localhost:5500";
        const response = await fetch(
          `${API_BASE_URL}/api/teams/${currentUser.teams[0].name}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch team data");
        }

        const data = await response.json();
        setTeamData(data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTeamMetrics();
  }, [currentUser, currentUser?.teams]);

  useEffect(() => {
    if (!teamData?.team?._id) return;

    const teamId = teamData.team._id;
    let pollInterval;

    const checkAiFeedback = async () => {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_URL || "http://localhost:5500";
        const response = await fetch(
          `${API_BASE_URL}/api/ai-review?teamId=${teamId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check AI feedback status");
        }

        const data = await response.json();

        if (response.status === 200) {
          setAiFeedback(data.aiFeedback);
          const feedbackSections = {};
          const matches = [
            ...data.aiFeedback.matchAll(/## ([^\n]+)\n([\s\S]*?)(?=##|$)/g),
          ];
          matches.forEach(([_, title, content]) => {
            feedbackSections[title.trim()] = content.trim();
          });
          setParsedFeedback(feedbackSections);
          console.log(data.status);
          setAiStatus("completed");
          console.log(data.aiFeedback);
          setAiLoading(false);
          clearInterval(pollInterval);
        } else if (response.status === 202) {
          setAiStatus("pending");
          console.log(data.status);

          setAiProgress(data.status);
          setAiLoading(false);

          if (!pollInterval) {
            pollInterval = setInterval(checkAiFeedback, 30000);
          }
        }
      } catch (err) {
        setAiError(err.message);
        setAiStatus("error");
        setAiLoading(false);
        clearInterval(pollInterval);
      }
    };

    checkAiFeedback();

    return () => {
      clearInterval(pollInterval);
    };
  }, [teamData]);

  const renderAiStatus = () => {
    switch (aiStatus) {
      case "checking":
        return (
          <div className="status-indicator checking">
            <Loader className="icon spin" />
            <span>Checking for AI analysis...</span>
          </div>
        );
      case "pending":
        return (
          <div className="status-indicator processing">
            <Loader className="icon spin" />
            <span>Analysis in progress... {aiProgress}%</span>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${aiProgress}%` }}
              ></div>
            </div>
          </div>
        );
      case "completed":
        return (
          <div className="status-indicator completed">
            <CheckCircle className="icon" />
            <span>Analysis completed</span>
          </div>
        );
      case "error":
        return (
          <div className="status-indicator error">
            <AlertCircle className="icon" />
            <span>Error: {aiError}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const renderFeedbackSection = (title, content) => {
    if (!content) return null;

    return (
      <div className="metric-section" key={title}>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <div className="prose max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p>Loading metrics...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!teamData) {
    return <div className="error-message">No team data available</div>;
  }

  const contributorData = teamData.repositoryInfo.contributors
    .slice(0, 5)
    .map((contributor) => ({
      name: contributor.username,
      contributions: contributor.contributions,
      avatar: contributor.avatar_url,
      profile: contributor.profile_url,
    }));

  const activityData = [
    { name: "PRs", value: teamData.repositoryInfo.open_pull_requests },
    { name: "Commits", value: teamData.doraMetrics.data_summary.commits_count },
    {
      name: "Releases",
      value: teamData.doraMetrics.data_summary.releases_count,
    },
  ];

  const deploymentFrequencyData = [
    {
      period: "Current",
      frequency: parseFloat(
        teamData.doraMetrics.deployment_frequency.frequency_per_day
      ),
    },
    {
      period: "Target",
      frequency: 1.0,
    },
  ];

  // const leadTimeComparisonData = [
  //   {
  //     type: 'Current',
  //     days: parseFloat(teamData.doraMetrics.lead_time.average_days)
  //   },
  //   {
  //     type: 'Elite',
  //     days: 1.0
  //   }
  // ];

  const contributorActivityData = contributorData.map((contributor) => ({
    name: contributor.name,
    contributions: contributor.contributions,
    prs: Math.floor(contributor.contributions / 3),
  }));

  return (
    <>
      <header className="main-header">
        <h1>DORA Metrics Dashboard</h1>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{currentUser?.name}</span>
            <span className="user-role">{currentUser?.role}</span>
          </div>
          <div className="user-avatar">
            <img
              src={avatar}
              alt="User Avatar"
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
          </div>
        </div>
      </header>

      <div className="metrics-container">
        {/* Repository Overview - Cleaner Layout */}
        <div className="metric-card-wide compact-overview">
          <div className="metric-header">
            <h3>Repository Overview</h3>
          </div>
          <div className="overview-grid">
            {/* Team Column */}
            <div className="overview-group">
              <h4 className="overview-group-title">Team</h4>
              <div className="overview-item">
                <span className="overview-label">Name</span>
                <span className="overview-value">{teamData.team.name}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Created By</span>
                <span className="overview-value">
                  {teamData.team.creator?.name || "Unknown"}
                </span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Members</span>
                <span className="overview-value">
                  {teamData.team.members.length}
                </span>
              </div>
            </div>

            {/* Repository Column */}
            <div className="overview-group">
              <h4 className="overview-group-title">Repository</h4>
              <div className="overview-item">
                <span className="overview-label">Name</span>
                <a
                  href={teamData.repositoryInfo.url}
                  className="overview-value link"
                >
                  {teamData.repositoryInfo.full_name}
                </a>
              </div>
              <div className="overview-item">
                <span className="overview-label">Language</span>
                <span className="overview-value">
                  {teamData.repositoryInfo.primary_language || "N/A"}
                </span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Branch</span>
                <span className="overview-value">
                  {teamData.repositoryInfo.default_branch}
                </span>
              </div>
            </div>

            {/* Stats Column */}
            <div className="overview-group">
              <h4 className="overview-group-title">Stats</h4>
              <div className="overview-item">
                <Star size={16} className="overview-icon" />
                <span className="overview-value">
                  {teamData.repositoryInfo.stars?.toLocaleString() || "N/A"}
                </span>
              </div>
              <div className="overview-item">
                <GitFork size={16} className="overview-icon" />
                <span className="overview-value">
                  {teamData.repositoryInfo.forks?.toLocaleString() || "N/A"}
                </span>
              </div>
              <div className="overview-item">
                <Eye size={16} className="overview-icon" />
                <span className="overview-value">
                  {teamData.repositoryInfo.watchers?.toLocaleString() || "N/A"}
                </span>
              </div>
            </div>

            {/* Dates Column */}
            <div className="overview-group">
              <h4 className="overview-group-title">Dates</h4>
              <div className="overview-item">
                <span className="overview-label">Created</span>
                <span className="overview-value">
                  {new Date(
                    teamData.repositoryInfo.created_at
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Updated</span>
                <span className="overview-value">
                  {new Date(
                    teamData.repositoryInfo.updated_at
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Pushed</span>
                <span className="overview-value">
                  {new Date(
                    teamData.repositoryInfo.pushed_at
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="metrics-grid" style={{ marginTop: "1rem" }}>
          <div className="metric-card">
            <div className="metric-header">
              <GitBranch className="metric-icon" />
              <h3>Deployment Frequency</h3>
            </div>
            <div className="metric-value">
              {teamData.doraMetrics.deployment_frequency.frequency_per_day}/day
            </div>
            <div className="metric-trend">
              {teamData.doraMetrics.deployment_frequency.total_deployments}{" "}
              deployments in{" "}
              {teamData.doraMetrics.deployment_frequency.analysis_period_days}{" "}
              days
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <Clock className="metric-icon" />
              <h3>Lead Time</h3>
            </div>
            <div className="metric-value">
              {teamData.doraMetrics.lead_time.average_days} days avg
            </div>
            <div className="metric-trend">
              Range: {teamData.doraMetrics.lead_time.min_days} -{" "}
              {teamData.doraMetrics.lead_time.max_days} days
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <TrendingUp className="metric-icon" />
              <h3>Change Failure Rate</h3>
            </div>
            <div className="metric-value" style={{ color: "#10B981" }}>
              {teamData.doraMetrics.change_failure_rate.failure_rate}
            </div>
            <div className="metric-trend">
              {teamData.doraMetrics.change_failure_rate.bug_or_incident_fixes}{" "}
              failures in{" "}
              {teamData.doraMetrics.change_failure_rate.total_deployments}{" "}
              deployments
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <Zap className="metric-icon" />
              <h3>MTTR</h3>
            </div>
            <div className="metric-value">
              {teamData.doraMetrics.mttr.average_days || 0} days
            </div>
            <div className="metric-trend">
              {teamData.doraMetrics.mttr.total_incidents_analyzed > 0
                ? `Range: ${teamData.doraMetrics.mttr.min_days} - ${teamData.doraMetrics.mttr.max_days} days`
                : "No incidents analyzed"}
            </div>
          </div>
        </div>

        <div className="metrics-grid" style={{ marginTop: "1rem" }}>
          <div className="metric-card">
            <div className="metric-header">
              <Calendar className="metric-icon" />
              <h3>Repository Timeline</h3>
            </div>
            <div className="timeline-container">
              <div className="timeline-event">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-date">
                    {new Date(
                      teamData.repositoryInfo.created_at
                    ).toLocaleDateString()}
                  </span>
                  <span className="timeline-label">Created</span>
                </div>
              </div>
              <div className="timeline-event">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-date">
                    {new Date(
                      teamData.repositoryInfo.pushed_at
                    ).toLocaleDateString()}
                  </span>
                  <span className="timeline-label">Last Push</span>
                </div>
              </div>
              <div className="timeline-event">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-date">
                    {new Date(
                      teamData.repositoryInfo.updated_at
                    ).toLocaleDateString()}
                  </span>
                  <span className="timeline-label">Last Updated</span>
                </div>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <Activity className="metric-icon" />
              <h3>Repository Activity</h3>
            </div>
            <div className="summary-grid">
              <div className="summary-item">
                <span>Pull Requests</span>
                <span>{teamData.repositoryInfo.open_pull_requests}</span>
              </div>
              <div className="summary-item">
                <span>Commits</span>
                <span>{teamData.doraMetrics.data_summary.commits_count}</span>
              </div>
              <div className="summary-item">
                <span>Releases</span>
                <span>{teamData.doraMetrics.data_summary.releases_count}</span>
              </div>
            </div>
            <div style={{ height: "200px", marginTop: "1rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <Users className="metric-icon" />
              <h3>Top Contributors</h3>
            </div>
            <div className="contributors-list">
              {contributorData.map((contributor, index) => (
                <div key={index} className="contributor-item">
                  <div className="contributor-rank">{index + 1}</div>
                  <img
                    src={contributor.avatar}
                    alt={contributor.name}
                    className="contributor-avatar"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                  <div className="contributor-info">
                    <a
                      href={contributor.profile}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {contributor.name}
                    </a>
                    <span>{contributor.contributions} contributions</span>
                  </div>
                </div>
              ))}
            </div>
            <h6>
              *Top contributors based on default branch commits (all-time)
            </h6>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="ai-analysis-section">
          <h2>AI Performance Analysis</h2>

          {renderAiStatus()}

          {aiError && <div className="error-message">{aiError}</div>}

          {aiLoading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
              <p>Loading AI analysis...</p>
            </div>
          ) : aiFeedback ? (
            <div className="analysis-results">
              <div className="feedback-container">
                {renderFeedbackSection(
                  "Deployment Frequency",
                  parsedFeedback["Deployment Frequency"]
                )}
                {renderFeedbackSection(
                  "Lead Time for Changes",
                  parsedFeedback["Lead Time for Changes"]
                )}
                {renderFeedbackSection(
                  "Change Failure Rate",
                  parsedFeedback["Change Failure Rate (CFR)"]
                )}
                {renderFeedbackSection(
                  "Mean Time to Recovery",
                  parsedFeedback["Mean Time to Recovery (MTTR)"]
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>
                No AI analysis available yet. Analysis is automatically started
                when you create or join a team.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Metrics;
