import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { searchTeam, createTeam, joinTeam } from '../../services/teams';
import HeaderInfo from "../common/HeaderInfo";

function Team() {
  const { currentUser, setCurrentUser } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);

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

    //==============================================Handle Joining A Team function==============================
  //Uses the input data from the form then uses the searchTeam function in the team.jsx which then makes the neccessary requests in order for a user to search a team
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResult({ error: 'Please enter a team name to search.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await searchTeam(searchTerm);
      setSearchResult(result);
      setErrorMessage('');
    } catch (error) {
      setSearchResult({ error: error.message });
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  //==============================================Handle Joining A Team function==============================
  //Uses the input data from the form then uses the createTeam function in the team.jsx which then makes the neccessary requests in order for a user to creat a team
  const handleCreateTeam = async () => {
    if (!teamName || !teamPassword || !repoUrl) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    // Validate GitHub URL format
    if (!repoUrl.startsWith('https://github.com/')) {
      setErrorMessage('Please enter a valid GitHub repository URL');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await createTeam(teamName, teamPassword, repoUrl);
      setSuccessMessage(`Team "${teamName}" created successfully!`);
      setShowCreateForm(false);
      setTeamName('');
      setTeamPassword('');
      setRepoUrl('');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  //==============================================Handle Joining A Team function==============================
  //Takes in 2 parameters which are used to call the joinTeam() function in team.jsx which then makes the neccessary requests in order for a user to join a team
  const handleJoinTeam = async (name, password) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await joinTeam(name, password);
      setSuccessMessage(`Joined team "${name}" successfully!`);
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to join team');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="main-header">
        <h1>Team Management</h1>
        {/*<div className="user-profile">*/}
        {/*  <div className="user-info">*/}
        {/*    <span className="user-name">{currentUser?.name}</span>*/}
        {/*    <span className="user-role">{currentUser?.role}</span>*/}
        {/*  </div>*/}
        {/*  <div className="user-avatar">*/}
        {/*    <img */}
        {/*      src={avatar} */}
        {/*      alt="User Avatar" */}
        {/*      onError={(e) => {*/}
        {/*        e.target.src = defaultAvatar;*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</div>*/}

        <HeaderInfo currentUser={currentUser} avatar={avatar} defaultAvatar={defaultAvatar} />
      </header>

      <div className="dashboard-section active">
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        <div className="team-management">
          <div className="team-search">
            <h2>Find a Team</h2>
            <div className="search-controls">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter team name"
                className="form-input"
              />
              <button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResult?.error && (
              <div className="error-message">{searchResult.error}</div>
            )}

            {searchResult?.team && (
              <div className="team-result">
                <h3>{searchResult.team.name}</h3>
                <p>Created by: {searchResult.team.creator?.name || 'Unknown'}</p>
                <p>Repository: {searchResult.team.repoUrl || 'Not specified'}</p>
                <p>Members: {searchResult.team.members?.length || 0}</p>
                <button
                  onClick={() => {
                    const password = prompt('Enter team password:');
                    if (password) {
                      handleJoinTeam(searchResult.team.name, password);
                    }
                  }}
                  disabled={isLoading}
                  className="btn btn-secondary"
                >
                  {isLoading ? 'Joining...' : 'Join Team'}
                </button>
              </div>
            )}
          </div>

          <div className="team-create">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                Create New Team
              </button>
            ) : (
              <div className="create-form">
                <div className="form-header">
                  <h2>Create New Team</h2>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setErrorMessage('');
                    }}
                    className="btn btn-icon"
                  >
                    ×
                  </button>
                </div>
                
                <div className="form-group">
                  <label>Team Name</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>GitHub Repository URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Team Password</label>
                  <input
                    type="password"
                    value={teamPassword}
                    onChange={(e) => setTeamPassword(e.target.value)}
                    placeholder="Create a password for the team"
                    className="form-input"
                  />
                </div>
                <button
                  onClick={handleCreateTeam}
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Team;