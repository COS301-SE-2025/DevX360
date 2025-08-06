import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {Clock, GitBranch, TrendingUp, Zap} from "lucide-react";
import HeaderInfo from "../common/HeaderInfo";
import CreateTeamModal from "./modal/CreateTeam";
import JoinTeamModal from "./modal/JoinTeam";
import {getMyTeams} from "../../services/profile";
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

  return (
      // <div className="team-container">
      //     <div className="team-info">
      //         <table >
      //             <tbody>
      //                <tr>
      //                    <td>Team 1</td>
      //                    <td>Created by: Some User</td>
      //                </tr>
      //                <tr>
      //                    <td>10 Members</td>
      //                </tr>
      //             </tbody>
      //         </table>
      //     </div>
      //
      //     <div className="metrics-container">
      //         <h2>Metrics</h2>
      //         <div className="metrics">
      //             <div className="metric-card">
      //                 <h3>Deployment Frequency</h3>
      //                 <p>Weekly Average: 5</p>
      //             </div>
      //             <div className="metric-card">
      //                 <h3>Lead Time for Changes</h3>
      //                 <p>Average: 2 days</p>
      //             </div>
      //             <div className="metric-card">
      //                 <h3>Change Failure Rate</h3>
      //                 <p>Current: 10%</p>
      //             </div>
      //             <div className="metric-card">
      //                 <h3>Time to Restore Service</h3>
      //                 <p>Average: 30 minutes</p>
      //             </div>
      //         </div>
      //     </div>
      //
      //
      // </div>

      <div className="team-container">
        {/*// <div className="metrics-grid" style={{ marginTop: "1rem" }}>*/}
        {teams.map((team, index) => (
            <div key={team._id || index} className="team-card">
              <div className="team-header">
                <div className="team-basic-info">
                  <h3 className="team-name">{team.name}</h3>
                  <p className="team-members">n Members</p>
                </div>
                <div className="team-creator">
                  <span>Created by: {'Some User'}</span>
                </div>
              </div>

              <div className="team-metrics">
                {/*<div className="metric-card">*/}
                {/*    <div className="metric-header">*/}
                {/*        <GitBranch className="metric-icon" />*/}
                {/*        <h3>Deployment Frequency</h3>*/}
                {/*    </div>*/}
                {/*    <div className="metric-value">*/}
                {/*        {'0'}/day*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*<div className="metric-card">*/}
                {/*    <div className="metric-header">*/}
                {/*        <Clock className="metric-icon" />*/}
                {/*        <h3>Lead Time</h3>*/}
                {/*    </div>*/}
                {/*    <div className="metric-value">*/}
                {/*        <strong>{'0.01'} days</strong>*/}
                {/*        <br />*/}
                {/*        <small>avg</small>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*<div className="metric-card">*/}
                {/*    <div className="metric-header">*/}
                {/*        <TrendingUp className="metric-icon" />*/}
                {/*        <h3>Change Failure Rate</h3>*/}
                {/*    </div>*/}
                {/*    <div className="metric-value success">*/}
                {/*        {'100.00%'}*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*<div className="metric-card">*/}
                {/*    <div className="metric-header">*/}
                {/*        <Zap className="metric-icon" />*/}
                {/*        <h3>MTTR</h3>*/}
                {/*    </div>*/}
                {/*    <div className="metric-value">*/}
                {/*        {'0.87'} days*/}
                {/*    </div>*/}
                {/*</div>*/}




                <div className="metric-card">
                  <div className="metric-header">
                    <GitBranch className="metric-icon" />
                    <h3>Deployment Frequency</h3>
                  </div>
                  <div className="metric-value">
                    {/*{teamData.doraMetrics.deployment_frequency.frequency_per_day}/day*/}
                    0
                  </div>
                  <div className="metric-trend">
                    {/*{teamData.doraMetrics.deployment_frequency.total_deployments}{" "}*/} 0
                    deployments in{" "}
                    {/*{teamData.doraMetrics.deployment_frequency.analysis_period_days}{" "}*/} 0
                    days
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <Clock className="metric-icon" />
                    <h3>Lead Time</h3>
                  </div>
                  <div className="metric-value">
                    {/*{teamData.doraMetrics.lead_time.average_days} days avg*/} 0 days avg
                  </div>
                  <div className="metric-trend">
                    {/*Range: {teamData.doraMetrics.lead_time.min_days} -{" "} */}
                    Range: 0
                    {/*{teamData.doraMetrics.lead_time.max_days} days*/} days
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <TrendingUp className="metric-icon" />
                    <h3>Change Failure Rate</h3>
                  </div>
                  <div className="metric-value" style={{ color: "#10B981" }}>
                    {/*{teamData.doraMetrics.change_failure_rate.failure_rate}*/} 0%
                  </div>
                  <div className="metric-trend">
                    {/*{teamData.doraMetrics.change_failure_rate.bug_or_incident_fixes}{" "}*/} 0
                    failures in{" "}
                    {/*{teamData.doraMetrics.change_failure_rate.total_deployments}{" "}*/} 0
                    deployments
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <Zap className="metric-icon" />
                    <h3>MTTR</h3>
                  </div>
                  <div className="metric-value">
                    {/*{teamData.doraMetrics.mttr.average_days || 0} days*/} 0 days
                  </div>
                  <div className="metric-trend">
                    Range: 0.00 - 14.30 days
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
        {/*<div className="teams-box" style={{ width: '260px' }}>*/}
        {/*    <h2 style={{ marginBottom: '1rem' }}>Your Teams</h2>*/}
        {/*    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>*/}
        {/*        {teams.length > 0 ? (*/}
        {/*            teams.map(team => (*/}
        {/*                <li key={team._id} style={{ marginBottom: '0.5rem' }}>*/}
        {/*                    <a href="#">{team.name}</a>*/}
        {/*                </li>*/}
        {/*            ))*/}
        {/*        ) : (*/}
        {/*            <li>No teams yet.</li>*/}
        {/*        )}*/}
        {/*    </ul>*/}
        {/*</div>*/}

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




        {showCreateModal && <CreateTeamModal onCloseCreate={() => setShowCreateModal(false)} />}

        {showJoinModal && <JoinTeamModal onCloseJoin={() => setShowJoinModal(false)} />}

      </div>
  );
}

export default Team;