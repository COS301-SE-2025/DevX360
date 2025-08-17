import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {Clock, GitBranch, TrendingUp, Zap} from "lucide-react";
import HeaderInfo from "../common/HeaderInfo";
import CreateTeamModal from "./modal/CreateTeam";
import JoinTeamModal from "./modal/JoinTeam";
import {getMyTeams} from "../../services/profile";
import ModalPortal from "./modal/ModalPortal";
// import toast from "react-hot-toast";

function TeamInfo({ teams }) {
  if (!teams || teams.length === 0) {
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
                  <span>Created by: {team.creator?.name || 'Unknown'}</span>
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
                    {/*{getMetricValue(team, 'doraMetrics.deployment_frequency.total_deployments', '0')} deployments in{' '}*/}
                    {/*{getMetricValue(team, 'doraMetrics.deployment_frequency.analysis_period_days', '30')} days*/}
                    {getMetricValue(team, 'doraMetrics.deployment_frequency.total_deployments', '0') > 0 ? (
                        `${getMetricValue(team, 'doraMetrics.deployment_frequency.total_deployments', '0')} deployments in ${getMetricValue(team, 'doraMetrics.deployment_frequency.analysis_period_days', '30')} days`
                    ) : (
                        getMetricValue(team, 'doraMetrics.deployment_frequency.status', 'No deployments found')
                    )}
                  </div>
                  </div>
                {/*</div>*/}

                <div className="metric-card">
                  <div className="metric-header">
                    <Clock className="metric-icon" />
                    <h3>Lead Time</h3>
                  </div>
                  <div className="metric-value">
                    {getMetricValue(team, 'doraMetrics.lead_time.average_days', '0.00')} days avg
                  </div>
                  <div className="metric-trend">
                    {/*Range: {getMetricValue(team, 'doraMetrics.lead_time.min_days', '0.00')} - {getMetricValue(team, 'doraMetrics.lead_time.max_days', '0.00')} days*/}
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



function Team() {
  const { currentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);

  const [teams, setTeams] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

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
            <TeamInfo teams={teams} />
        </div>

        <ModalPortal isOpen={showCreateModal}>
            <CreateTeamModal onCloseCreate={() => setShowCreateModal(false)} />
        </ModalPortal>

        <ModalPortal isOpen={showJoinModal}>
            <JoinTeamModal onCloseJoin={() => setShowJoinModal(false)} />
        </ModalPortal>
      </div>
  );
}

export default Team;