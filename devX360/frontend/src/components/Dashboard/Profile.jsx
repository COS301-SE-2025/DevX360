import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateAvatar, getMyTeams, updateProfile } from '../../services/profile';

function Profile() {
 const { currentUser, setCurrentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setEditData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        role: currentUser.role || ''
      });
    }
  }, [currentUser]);

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values
    setEditData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      role: currentUser.role || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
      if (!editData.name || !editData.email) {
    alert('Name and email are required');
    return;
  }
    try {
      setIsLoading(true);
      const result = await updateProfile(editData);
      
      if (result.user) {
        setCurrentUser(result.user);
        setIsEditing(false);
        
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentUser?.avatar) {
      // Handle both full URLs and backend paths
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
      loadTeams();
    }
  }, [currentUser]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    setIsLoading(true);
    
    try {
      // Show preview immediately for better UX
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const result = await updateAvatar(file, currentUser);
      
      // Handle response - server returns avatarUrl
      if (result.avatarUrl) {
        console.log('Avatar upload result:', result);
        const fullAvatarUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5500'}${result.avatarUrl}`;
        setAvatar(fullAvatarUrl);
        
        // Update the auth context with the new avatar
        setCurrentUser(prev => ({ 
          ...prev, 
          avatar: result.avatarUrl // Store the relative path as returned by server
        }));
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      // Revert to previous avatar on error
      if (currentUser?.avatar) {
        const revertUrl = currentUser.avatar.startsWith('http') 
          ? currentUser.avatar 
          : `${process.env.REACT_APP_API_URL || 'http://localhost:5500'}${currentUser.avatar}`;
        setAvatar(revertUrl);
      } else {
        setAvatar(defaultAvatar);
      }
      
      // Show error message to user (you might want to add a toast notification here)
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setIsLoading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
          <img 
            src={avatar} 
            alt="User Avatar" 
            onError={(e) => {
              e.target.src = defaultAvatar;
              e.target.onerror = null;
            }}
          />
        </div>
      </div>
    </header>
    <div style={{ display: 'flex', gap: '15rem', alignItems: 'flex-start', width: '100%', justifyContent: 'center' }}>
      <div className="profile-content full-width-profile" style={{ flex: 2, width: '100%', maxWidth: '1200px' }}>
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            <img 
              src={avatar} 
              alt="Profile Picture" 
              onError={(e) => {
                e.target.src = defaultAvatar;
                e.target.onerror = null;
              }}
            />
            {isLoading && (
              <div className="avatar-loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
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
          <button 
            className="btn btn-secondary" 
            onClick={handleEditProfile}
            disabled={isEditing}
          >
            {isEditing ? 'Editing...' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-details">
          {!isEditing ? (
            // View mode
            <>
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
            </>
          ) : (
            // Edit mode
            <>
              <div className="detail-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="detail-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="detail-group">
                <label>Role</label>
                <input
                  type="text"
                  name="role"
                  value={editData.role}
                  onChange={handleInputChange}
                  className="form-input"
                />
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
              
              {/* Action buttons for edit mode */}
              <div className="edit-actions" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
             <button 
  onClick={handleSaveProfile} 
  className="btn btn-primary"
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Saving...
    </>
  ) : 'Save Changes'}
</button>
                <button 
                  onClick={handleCancelEdit} 
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
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