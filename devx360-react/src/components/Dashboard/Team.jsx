import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {Clock, GitBranch, TrendingUp, Zap, MoreVertical, Trash2} from "lucide-react";
import HeaderInfo from "../common/HeaderInfo";
import CreateTeamModal from "./modal/CreateTeam";
import JoinTeamModal from "./modal/JoinTeam";
import {getMyTeams} from "../../services/profile";
import ModalPortal from "./modal/ModalPortal";
import {deleteTeam} from "../../services/teams";
import DeleteTeamModal from "./modal/DeleteTeam";
import toast from "react-hot-toast";

//=============================================================TeamInfo Component======================================
// This component displays the team information and metrics
function TeamInfo(/*{ teams }*/ { teams, currentUser, onDeleteTeam }) {
  const [showMenu, setShowMenu] = useState(null);

  const toggleMenu = (teamId) => {
    setShowMenu(showMenu === teamId ? null : teamId);
  };

  // console.log("Current User", currentUser);

  // Close menu when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = () => setShowMenu(null);
  //   if (showMenu) {
  //     document.addEventListener('click', handleClickOutside);
  //     return () => document.removeEventListener('click', handleClickOutside);
  //   }
  // }, [showMenu]);

  if (!teams || teams.length === 0) { //TODO style better
    return (
        <div className="team-container">
          <p>No teams available.</p>
        </div>
    );
  }

  console.log("Teams", teams);

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

  return (
    <div className="team-container">
      {/*// <div className="metrics-grid" style={{ marginTop: "1rem" }}>*/}
      {teams.map((team, index) => (
        <div key={team.id || index} className="team-card">
          <div className="team-header">
            <div className="team-basic-info">
              <h3 className="team-name">{team.name}</h3>
              <p className="team-members">
                {team.members?.length || 0} {(team.members?.length || 0) === 1 ? 'member' : 'members'}
              </p>
            </div>
            <div className="team-creator">
              {team.creator?._id === currentUser?._id ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  <span>You created this team</span>
                  <button className="btn-cancel"
                          onClick={() => toggleMenu(team.id)}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {showMenu === team.id && (
                    <div className="team-menu-dropdown">
                      <button
                        className="team-menu-item"
                        onClick={() => onDeleteTeam(team.id, team.name)}
                        style={{
                          color: '#dc2626'
                        }}
                      >
                        <Trash2 size={16} />
                        Delete Team
                      </button>
                    </div>
                  )}
                </div>
              ) : (
              <span>Created by: {team.creator?.name || 'Unknown'}</span>
                  )}
            </div>
          </div>

          <div className="team-metrics">
            <div className="metric-card">
              <div className="metric-header">
                <GitBranch className="metric-icon" />
                <h3>Deployment Frequency</h3>
              </div>
              <div className="metric-value">
                {getMetricValue(team, 'doraMetrics.deployment_frequency.frequency_per_day', '0')}/day
              </div>
              <div className="metric-trend">
                {getMetricValue(team, 'doraMetrics.deployment_frequency.total_deployments', '0') > 0 ? (
                    `${getMetricValue(team, 'doraMetrics.deployment_frequency.total_deployments', '0')} deployments in ${getMetricValue(team, 'doraMetrics.deployment_frequency.analysis_period_days', '30')} days`
                ) : (
                    getMetricValue(team, 'doraMetrics.deployment_frequency.status', 'No deployments found')
                )}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <Clock className="metric-icon" />
                <h3>Lead Time</h3>
              </div>
              <div className="metric-value">
                {getMetricValue(team, 'doraMetrics.lead_time.average_days', '0.00')} days avg
              </div>
              <div className="metric-trend">
                 {getMetricValue(team, 'doraMetrics.lead_time.total_prs_analyzed', '0') > 0 ? (
                    `Range: ${getMetricValue(team, 'doraMetrics.lead_time.min_days', '0.00')} - ${getMetricValue(team, 'doraMetrics.lead_time.max_days', '0.00')} days`
                ) : (
                    getMetricValue(team, 'doraMetrics.lead_time.status', 'No merged pull requests found')
                )}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <TrendingUp className="metric-icon" />
                <h3>Change Failure Rate</h3>
              </div>
              <div className="metric-value" style={{ color: "#10B981" }}>
                {getMetricValue(team, 'doraMetrics.change_failure_rate.failure_rate', '0.00%')}
              </div>
              <div className="metric-trend">
                {getMetricValue(team, 'doraMetrics.change_failure_rate.total_deployments', '0') > 0 ? (
                    `${getMetricValue(team, 'doraMetrics.change_failure_rate.deployment_failures', '0')} failures in ${getMetricValue(team, 'doraMetrics.change_failure_rate.total_deployments', '0')} deployments`
                ) : (
                    getMetricValue(team, 'doraMetrics.deployment_frequency.status', 'No deployments found')
                )}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <Zap className="metric-icon" />
                <h3>MTTR</h3>
              </div>
              <div className="metric-value">
                {getMetricValue(team, 'doraMetrics.mttr.average_days', '0.00')} days
              </div>
              <div className="metric-trend">
                {getMetricValue(team, 'doraMetrics.mttr.total_incidents_analyzed', '0') > 0 ? (
                    `Range: ${getMetricValue(team, 'doraMetrics.mttr.min_days', '0.00')} - ${getMetricValue(team, 'doraMetrics.mttr.max_days', '0.00')} days`
                ) : (
                    getMetricValue(team, 'doraMetrics.mttr.status', 'No incidents analyzed')
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}


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
  const [isDeleting, setIsDeleting] = useState(false); // for loading state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCreateTeam = async () => {
    try {
      const userTeams = await getMyTeams();
      setTeams(userTeams);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error refreshing teams:', error);
      setShowCreateModal(false);
    }
  };

  const handleJoinTeam = async () => {
    try {
      const userTeams = await getMyTeams();
      setTeams(userTeams);
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
      await deleteTeam(teamToDelete.name); //might need to change to id?

      // Remove from local state
      setTeams(teams.filter(team => team.id !== teamToDelete.id));
      setShowDeleteModal(false);
      setTeamToDelete(null);

      // console.log('Team deleted successfully:', teamToDelete.name);
      toast.success(`Team ${teamToDelete.name} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting team:', error);
      // alert('Failed to delete team: ' + error.message);
      toast.error('Failed to delete team.'); //error.message?
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (currentUser?.avatar) {
      const avatarUrl = currentUser.avatar.startsWith('http')
        ? currentUser.avatar
        : `${process.env.REACT_APP_API_URL || 'http://localhost:5500'}${currentUser.avatar}`;
      setAvatar(avatarUrl);
    } else {
      setAvatar(defaultAvatar);
    }

      // Load teams
      const loadTeams = async () => {
        try {
          const userTeams = await getMyTeams();
          setTeams(userTeams);
        } catch (error) {
          console.error('Error loading teams:', error);
        }
      };

      if (currentUser) {
        // loadTeams();
        // console.log(teams);

        (async () => {
            await loadTeams();
        })();
      }
  }, [currentUser]);

  return (
    <div>
      <header className="main-header">
        <h1>Your Teams</h1>
        <HeaderInfo currentUser={currentUser} avatar={avatar} defaultAvatar={defaultAvatar} />
      </header>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        <button className="btn btn-primary edit-actions-btn"  onClick={() => setShowCreateModal(true)}>
          Create Team
        </button>
        <button className="btn btn-primary edit-actions-btn" onClick={() => setShowJoinModal(true)}>
          Join Team
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TeamInfo
          teams={teams}
          currentUser={currentUser}
          onDeleteTeam={handleDeleteTeam}
        />
      </div>

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
        <DeleteTeamModal
          teamName={teamToDelete?.name} //or id?
          onConfirm={confirmDeleteTeam}
          onCloseDelete={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      </ModalPortal>
    </div>
  );
}

export default Team;