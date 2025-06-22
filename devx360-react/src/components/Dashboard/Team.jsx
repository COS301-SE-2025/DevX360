import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { searchTeam, createTeam, joinTeam } from '../../services/teams';

//===========================================================Team Component Function======================================
// Handles team management including searching, creating, and joining teams
function Team() {
  const { currentUser } = useAuth();
  const [setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ setSearchResult] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);

  // Update avatar when currentUser changes
  useEffect(() => {
    setAvatar(currentUser?.avatar ? 
      `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${currentUser.avatar}` 
      : defaultAvatar);
  }, [currentUser]);

  // Search for a team by name
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResult({ error: 'Please enter a team name to search.' });
      return;
    }

    try {
      const result = await searchTeam(searchTerm);
      setSearchResult(result);
    } catch (error) {
      setSearchResult({ error: error.message });
    }
  };

  // Create a new team
  const handleCreateTeam = async () => {
    if (!teamName || !teamPassword) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await createTeam(teamName, teamPassword);
      alert('Team created successfully!');
      setShowCreateForm(false);
      setTeamName('');
      setTeamPassword('');
    } catch (error) {
      alert(`Failed to create team: ${error.message}`);
    }
  };

  // Join an existing team
  const handleJoinTeam = async (name, password) => {
    try {
      await joinTeam(name, password);
      alert(`Joined team ${name} successfully!`);
    } catch (error) {
      alert(`Failed to join team: ${error.message}`);
    }
  };

  return (
    <>
      <header className="main-header">
        <h1>Team Management</h1>
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

      <div className="dashboard-section active">
        {/* Team management UI would go here */}
      </div>
    </>
  );
}

export default Team;