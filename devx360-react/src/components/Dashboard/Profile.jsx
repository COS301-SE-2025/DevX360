import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateAvatar, getMyTeams } from '../../services/profile';

function Profile() {
  const { currentUser, setCurrentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png'; // Make sure this path is correct
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  

  useEffect(() => {
    // Set avatar when currentUser changes
    if (currentUser?.avatar) {
      setAvatar(currentUser.avatar.startsWith('http') 
        ? currentUser.avatar 
        : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${currentUser.avatar}`);
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
      loadTeams();
    }

    return () => {
      // Cleanup if needed
    };
  }, [currentUser]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('avatar', file);
      const result = await updateAvatar(formData);
      
      // Update user data with new avatar
      const updatedUser = { 
        ...currentUser, 
        avatar: result.avatarUrl 
      };
      setCurrentUser(updatedUser);
      
      alert('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(`Failed to upload avatar: ${error.message}`);
      // Revert to previous avatar
      setAvatar(currentUser?.avatar ? 
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${currentUser.avatar}` 
        : defaultAvatar);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (!currentUser) {
    return <div>Loading user data...</div>;
  }

  return (
    <>
      <header className="main-header">
        <h1>Your Profile</h1>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{currentUser?.name}</span>
            <span className="user-role">{currentUser?.role}</span>
          </div>
          <div className="user-avatar">
            <img src={avatar} alt="User Avatar" />
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '15rem', alignItems: 'flex-start', width: '100%', justifyContent: 'center' }}>
        <div className="profile-content full-width-profile" style={{ flex: 2, width: '100%', maxWidth: '1200px' }}>
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              <img src={avatar} alt="Profile Picture" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button 
        onClick={triggerFileInput} 
        className="btn btn-secondary"
        disabled={isLoading}
      >
        {isLoading ? 'Uploading...' : 'Change Photo'}
      </button>
            <button className="btn btn-secondary">
              Edit Profile
            </button>
          </div>

          <div className="profile-details">
            <div className="detail-group">
              <label>Full Name</label>
              <div className="detail-value">{currentUser?.name}</div>
            </div>
            <div className="detail-group">
              <label>Email</label>
              <div className="detail-value">{currentUser?.email}</div>
            </div>
            <div className="detail-group">
              <label>Role</label>
              <div className="detail-value">{currentUser?.role}</div>
            </div>
            <div className="detail-group">
              <label>Member Since</label>
              <div className="detail-value">
                {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="detail-group">
              <label>Last Login</label>
              <div className="detail-value">
                {currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
        <div className="teams-box" style={{ width: '260px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Your Teams</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {teams.length > 0 ? (
              teams.map(team => (
                <li key={team._id} style={{ marginBottom: '0.5rem' }}>
                  <a href="#">{team.name}</a>
                </li>
              ))
            ) : (
              <li>No teams yet.</li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Profile;