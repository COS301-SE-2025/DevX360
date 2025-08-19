import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  GitBranch,
  TrendingUp,
  Zap,
  MoreVertical,
  Trash2,
  Search,
  Users,
  Calendar,
  Github,
  ExternalLink,
  Crown,
  Loader
} from "lucide-react";
import HeaderInfo from "../common/HeaderInfo";
import CreateTeamModal from "./modal/CreateTeam";
import JoinTeamModal from "./modal/JoinTeam";
import {getMyTeams} from "../../services/profile";
import ModalPortal from "./modal/ModalPortal";
import {deleteTeam} from "../../services/teams";
import DeleteConfirmationModal from "./modal/DeleteConfirmation";
import toast from "react-hot-toast";
import {Link} from "react-router-dom";

//=============================================================TeamInfo Component======================================
// This component displays the team information and metrics
function TeamInfo({ teams, currentUser, onDeleteTeam }) {
  const [showMenu, setShowMenu] = useState(null);

  const toggleMenu = (teamId) => {
    setShowMenu(showMenu === teamId ? null : teamId);
  };

  if (!teams || teams.length === 0) {
    return (
        <div className="w-full">
          <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No Teams Yet</h3>
            <p className="text-[var(--text-light)] mb-6 max-w-md mx-auto">
              Get started by creating a new team or joining an existing one. Teams help you track your development metrics.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors duration-200">
                Create Your First Team
              </button>
              <button className="px-6 py-3 border border-[var(--border)] text-[var(--text)] rounded-lg font-medium hover:bg-[var(--bg)] transition-colors duration-200">
                Join Existing Team
              </button>
            </div>
          </div>
        </div>
    );
  }

  const getMetricValue = (team, metricPath, fallback = 'N/A') => {
    try {
      const pathArray = metricPath.split('.');
      let value = team;

      for (const key of pathArray) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return fallback;
        }
      }
      return value !== null && value !== undefined ? value : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const getMetricStatus = (value, type) => {
    switch (type) {
      case 'deployment':
        const freq = parseFloat(value) || 0;
        if (freq >= 0.1) return { status: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
        if (freq >= 0.05) return { status: 'Good', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        return { status: 'Needs Improvement', color: 'bg-red-100 text-red-700 border-red-200' };
      case 'leadtime':
        const days = parseFloat(value) || 0;
        if (days <= 2) return { status: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
        if (days <= 7) return { status: 'Good', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        return { status: 'Needs Improvement', color: 'bg-red-100 text-red-700 border-red-200' };
      case 'cfr':
        const rate = parseFloat(value?.replace('%', '')) || 0;
        if (rate <= 5) return { status: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
        if (rate <= 15) return { status: 'Good', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        return { status: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' };
      case 'mttr':
        const mttrDays = parseFloat(value) || 0;
        if (mttrDays <= 1) return { status: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
        if (mttrDays <= 24) return { status: 'Good', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        return { status: 'Needs Improvement', color: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { status: 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  console.log(teams);

  return (
      <div className="w-full space-y-6">
        {teams.map((team, index) => (
            <div key={team.id || index} className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Team Header */}
              <div className="p-6 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text)] mb-1">{team.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-[var(--text-light)]">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{team.members?.length || 0} member{(team.members?.length || 0) !== 1 ? 's' : ''}</span>
                        </div>
                        {team.creator && (
                            <div className="flex items-center space-x-1">
                              <Crown className="w-4 h-4" />
                              <span>
                          {team.creator._id === currentUser?._id ? 'You created this team' : `Created by ${team.creator.name || 'Unknown'}`}
                        </span>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {team.creator?._id === currentUser?._id && (
                      <div className="relative">
                        <button
                            onClick={() => toggleMenu(team.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--bg)] text-[var(--text-light)] border border-[var(--border)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMenu === team.id && (
                            <div className="absolute right-0 top-10 w-44 bg-[var(--bg-container)] border border-[var(--border)] rounded-lg shadow-lg z-10 overflow-hidden">
                              <button
                                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                  onClick={() => {
                                    onDeleteTeam(team.id, team.name);
                                    setShowMenu(null);
                                  }}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Team</span>
                              </button>
                            </div>
                        )}
                      </div>
                  )}
                </div>
              </div>

              {/* DORA Metrics Grid - Smaller and more compact */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Deployment Frequency */}
                  <div className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)] hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <GitBranch className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          getMetricStatus(getMetricValue(team, 'doraMetrics.deployment_frequency.frequency_per_day', '0'), 'deployment').color
                      }`}>
                    {getMetricStatus(getMetricValue(team, 'doraMetrics.deployment_frequency.frequency_per_day', '0'), 'deployment').status}
                  </span>
                    </div>
                    <h4 className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2">Deployment Frequency</h4>
                    <p className="text-lg font-bold text-[var(--text)] mb-1">
                      {getMetricValue(team, 'doraMetrics.deployment_frequency.frequency_per_day', '0')}/day
                    </p>
                    <p className="text-xs text-[var(--text-light)]">
                      {getMetricValue(team, 'doraMetrics.deployment_frequency.total_deployments', '0') > 0 ? (
                          `${getMetricValue(team, 'doraMetrics.deployment_frequency.total_deployments', '0')} deployments`
                      ) : (
                          getMetricValue(team, 'doraMetrics.deployment_frequency.status', 'No deployments found')
                      )}
                    </p>
                  </div>

                  {/* Lead Time */}
                  <div className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)] hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-green-600" />
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          getMetricStatus(getMetricValue(team, 'doraMetrics.lead_time.average_days', '0'), 'leadtime').color
                      }`}>
                    {getMetricStatus(getMetricValue(team, 'doraMetrics.lead_time.average_days', '0'), 'leadtime').status}
                  </span>
                    </div>
                    <h4 className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2">Lead Time</h4>
                    <p className="text-lg font-bold text-[var(--text)] mb-1">
                      {getMetricValue(team, 'doraMetrics.lead_time.average_days', '0.00')} days
                    </p>
                    <p className="text-xs text-[var(--text-light)]">
                      {getMetricValue(team, 'doraMetrics.lead_time.total_prs_analyzed', '0') > 0 ? (
                          `${getMetricValue(team, 'doraMetrics.lead_time.min_days', '0.00')} - ${getMetricValue(team, 'doraMetrics.lead_time.max_days', '0.00')} days`
                      ) : (
                          getMetricValue(team, 'doraMetrics.lead_time.status', 'No pull requests analysed')
                      )}
                    </p>
                  </div>

                  {/* Change Failure Rate */}
                  <div className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)] hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          getMetricStatus(getMetricValue(team, 'doraMetrics.change_failure_rate.failure_rate', '0.00%'), 'cfr').color
                      }`}>
                    {getMetricStatus(getMetricValue(team, 'doraMetrics.change_failure_rate.failure_rate', '0.00%'), 'cfr').status}
                  </span>
                    </div>
                    <h4 className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2">Change Failure Rate</h4>
                    <p className="text-lg font-bold text-[var(--text)] mb-1">
                      {getMetricValue(team, 'doraMetrics.change_failure_rate.failure_rate', '0.00%')}
                    </p>
                    <p className="text-xs text-[var(--text-light)]">
                      {getMetricValue(team, 'doraMetrics.change_failure_rate.total_deployments', '0') > 0 ? (
                          `${getMetricValue(team, 'doraMetrics.change_failure_rate.deployment_failures', '0')} failures
                          out of ${getMetricValue(team, 'doraMetrics.change_failure_rate.total_deployments', '0')} deployments`
                      ) : (
                          getMetricValue(team, 'doraMetrics.deployment_frequency.status', 'No deployments found')
                      )}
                    </p>
                  </div>

                  {/* MTTR */}
                  <div className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)] hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          getMetricStatus(getMetricValue(team, 'doraMetrics.mttr.average_days', '0.00'), 'mttr').color
                      }`}>
                    {getMetricStatus(getMetricValue(team, 'doraMetrics.mttr.average_days', '0.00'), 'mttr').status}
                  </span>
                    </div>
                    <h4 className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2">Mean Time to Recovery</h4>
                    <p className="text-lg font-bold text-[var(--text)] mb-1">
                      {getMetricValue(team, 'doraMetrics.mttr.average_days', '0.00')} days
                    </p>
                    <p className="text-xs text-[var(--text-light)]">
                      {getMetricValue(team, 'doraMetrics.mttr.total_incidents_analyzed', '0') > 0 ? (
                          `${getMetricValue(team, 'doraMetrics.mttr.total_incidents_analyzed', '0')} incidents`
                      ) : (
                          getMetricValue(team, 'doraMetrics.mttr.status', 'No incidents analyzed')
                      )}
                    </p>
                  </div>
                </div>

                {/* Team Details Footer - More compact */}
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[var(--text-light)]" />
                      <div>
                        <p className="text-xs font-medium text-[var(--text)]">Analysis Period</p>
                        <p className="text-xs text-[var(--text-light)]">{new Date(team.doraMetrics?.analysis_period.start_date).toLocaleDateString() || 'N/A'} - {new Date(team.doraMetrics?.analysis_period.end_date).toLocaleDateString() || 'N/A'}</p>
                      </div>
                    </div>

                    {team.repositoryInfo?.url && (
                        <div className="flex items-center space-x-2">
                          <Github className="w-4 h-4 text-[var(--text-light)]" />
                          <div>
                            <p className="text-xs font-medium text-[var(--text)]">Repository</p>
                            <a
                                href={team.repositoryInfo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors flex items-center space-x-1"
                            >
                              <span>{team.repositoryInfo.full_name}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                    )}

                    <Link to={`/dashboard/metrics`} className="text-xs font-medium text-[var(--text)] hover:text-[var(--primary-dark)] transition-colors">
                      <div className="w-4 h-4 bg-[var(--primary)] rounded-full flex items-center justify-center">
                        <TrendingUp className="w-2.5 h-2.5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[var(--text)]">Performance</p>
                        <p className="text-xs text-[var(--text-light)]">View detailed metrics</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
        ))}
      </div>
  );
}

//=============================================================Team Component======================================
// This component is the main dashboard for teams, displaying team info and metrics
function Team() {
  const { currentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);

  const [teams, setTeams] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [teamToDelete, setTeamToDelete] = useState(null); // for confirmation modal
  const [isDeleting, setIsDeleting] = useState(false); // for deleting state
  const [isLoading, setIsLoading] = useState(false); // for loading state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const userTeams = await getMyTeams();
      setTeams(userTeams);
    } catch (error) {
      console.error('Error refreshing teams:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateTeam = async () => {
    try {
      await loadTeams();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error refreshing teams:', error);
      setShowCreateModal(false);
    }
  };

  const handleJoinTeam = async () => {
    try {
      await loadTeams();
      setShowJoinModal(false);
    } catch (error) {
      console.error('Error refreshing teams:', error);
      setShowJoinModal(false);
    }
  };

  const handleDeleteTeam = (teamId, teamName) => {
    setTeamToDelete({ id: teamId, name: teamName });
    setShowDeleteModal(true);
  };

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTeam(teamToDelete.name, teamToDelete.id);
      await loadTeams();
      setShowDeleteModal(false);
      setTeamToDelete(null);
      toast.success(`Team ${teamToDelete.name} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTeams = teams?.filter(team =>
      team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  useEffect(() => {
    if (currentUser?.avatar) {
      const avatarUrl = currentUser.avatar.startsWith('http')
          ? currentUser.avatar
          : `${process.env.REACT_APP_API_URL || 'http://localhost:5500'}${currentUser.avatar}`;
      setAvatar(avatarUrl);
    } else {
      setAvatar(defaultAvatar);
    }

    if (currentUser) {
      (async () => {
        await loadTeams();
      })();
    }
  }, [currentUser]);

  if (isLoading) {
    return (
        <div className="min-h-screen bg-[var(--bg)]">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-[var(--primary)] mx-auto mb-4"/>
              <p className="text-lg font-medium text-[var(--text)]">Loading teams...</p>
              <p className="text-sm text-[var(--text-light)] mt-2">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
    );
  }
  return (
      <div className="min-h-screen bg-[var(--bg)]">
        {/* Header - Full width */}
        <header className="bg-[var(--bg-container)] shadow-sm border-b border-[var(--border)] sticky top-0 z-50">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h1 className="text-2xl font-bold text-[var(--text)]">Your Teams</h1>
                <div className="h-6 w-px bg-[var(--border)]"></div>
                <p className="text-lg font-medium text-[var(--text-light)]">Manage and monitor your development teams</p>
              </div>
              <HeaderInfo currentUser={currentUser} avatar={avatar} defaultAvatar={defaultAvatar} />
            </div>
          </div>
        </header>

        {/* Main content with proper padding */}
        <main className="max-w-7xl mx-auto px-6 py-8">

          <div className="mb-8">
          {/* Controls section */}
          <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] p-6">

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Search*/}
            <div className="w-full md:w-auto md:flex-1 md:max-w-md">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-light)]" />
                <input
                    type="text"
                    placeholder="Search your teams..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--bg-container)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all duration-200"
                />
              </div>
            </div>

            {/*buttons*/}
            <div className="flex gap-4 w-full md:w-auto">
              <button
                  className="w-full md:w-auto px-6 py-3 rounded-lg font-medium text-lg cursor-pointer transition-colors duration-200 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"
                  onClick={() => setShowCreateModal(true)}
              >
                Create Team
              </button>
              <button
                  className="w-full md:w-auto px-6 py-3 rounded-lg font-medium text-lg cursor-pointer transition-colors duration-200 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"
                  onClick={() => setShowJoinModal(true)}
              >
                Join Team
              </button>
            </div>

            </div>

          </div>

          </div>

          {/* Team content - centered and constrained */}
          <div className="mb-8">
            <TeamInfo
                teams={filteredTeams}
                currentUser={currentUser}
                onDeleteTeam={handleDeleteTeam}
            />
          </div>
        </main>

        {/* Modals */}
        <ModalPortal isOpen={showCreateModal}>
          <CreateTeamModal
              onCloseCreate={() => setShowCreateModal(false)}
              onTeamCreated={handleCreateTeam}
          />
        </ModalPortal>

        <ModalPortal isOpen={showJoinModal}>
          <JoinTeamModal
              onCloseJoin={() => setShowJoinModal(false)}
              onTeamJoined={handleJoinTeam}
          />
        </ModalPortal>

        <ModalPortal isOpen={showDeleteModal}>
          <DeleteConfirmationModal
              type="team"
              name={teamToDelete?.name}
              onConfirm={confirmDeleteTeam}
              onCloseDelete={() => setShowDeleteModal(false)}
              isDeleting={isDeleting}
          />
        </ModalPortal>
      </div>
  );
}

export default Team;