import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateAvatar, updateProfile } from '../../services/profile';
import HeaderInfo from "../common/HeaderInfo";
import {AlertCircle} from 'lucide-react';
import toast from "react-hot-toast";

function Profile() {
 const { currentUser, setCurrentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);
  // const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setEditData({
        name: currentUser.name || '',
        email: currentUser.email || '',
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
      // role: currentUser.role || '' // immutable in back-end
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
    // if (!editData.name ) { //|| !editData.email) {
    //   // alert('Name and email are required');
    //
    //
    //   return;
    // }
    try {
      setIsLoading(true);
      const result = await updateProfile(editData);
      // console.log('Profile update result:', result);

      if (result.user) {
        // setCurrentUser(result.user);
        setCurrentUser(prevUser => ({
          ...result.user,
          avatar: prevUser.avatar
        }));
        setIsEditing(false);

        // alert('Profile updated successfully!');
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      // alert(`Failed to update profile: ${error.message}`); /
      // toast.error(`${error.message}`);

        setErrorMessage(error.message);
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
    // const loadTeams = async () => {
    //   try {
    //     const userTeams = await getMyTeams();
    //     setTeams(userTeams);
    //   } catch (error) {
    //     console.error('Error loading teams:', error);
    //   }
    // };
    //
    // if (currentUser) {
    //   loadTeams();
    // }
  }, [currentUser]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith('image/')) {
      // alert('Please select a valid image file');
      toast.error('Please select a valid image file');
      return;
    }

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
      // alert('Failed to upload avatar. Please try again.');
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setIsLoading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  return (
  <>
    <header className="main-header">
      <h1>Your Profile</h1>
        <HeaderInfo currentUser={currentUser} avatar={avatar} defaultAvatar={defaultAvatar} />
    </header>
      <div style={{ display: 'flex', alignItems: 'center',  width: '60%', justifyContent: 'center', margin: '0 auto' }}>
          <div className="profile-content full-width-profile" style={{ flex: 2, width: '100%', maxWidth: '1200px', gap: '1rem' }}>
            <div className="profile-wrapper">
                  <div className="profile-left">
                      <div className="profile-avatar-container">
                          {/*added*/}
                          <div className="avatar-wrap">
                              <div className="profile-avatar">
                                  <img
                                      src={avatar}
                                      alt="Profile"
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

                              {/*add button stuff*/}
                              <button
                                  onClick={triggerFileInput}
                                  className="edit-btn btn-secondary"
                                  disabled={isLoading}
                              >
                                  {isLoading ? 'Uploading...' : 'Edit'}
                              </button>
                              {/*ADD BUTTON STUFF*/}

                              <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleAvatarChange}
                                  accept="image/*"
                                  style={{ display: 'none' }}
                              />

                          </div>
                      </div>
                      {/*<div className="field-row">*/}
                      {!isEditing ? (
                          <>
                              <div className="detail-group member-since">
                                  <label>Member Since</label>
                                  <div className="detail-value">
                                    {formatDate(currentUser?.createdAt)}
                                  </div>
                              </div>
                          </>
                      ) : (
                          <div className="detail-group member-since">
                              <label>Member Since</label>
                              <div className="detail-value">
                                {formatDate(currentUser?.createdAt)}
                              </div>
                          </div>
                      )}

                      {/*</div>*/}
                  </div>

                  <div className="profile-right">
                      {!isEditing ? (
                          // View mode
                          <>
                              <div className="field-row">
                                  <div className="detail-group">
                                      <label>Full Name</label>
                                      <div className="detail-value" >
                                        {currentUser?.name || 'Not provided'}
                                        {/*<button onClick={handleEditName} title="Edit" className="btn-cancel">*/}
                                        {/*  <Pen size={16} />*/}
                                        {/*</button>*/}
                                      </div>

                                  </div>
                              </div>
                              <div className="field-row">
                                  <div className="detail-group">
                                      <label>Username</label>
                                      <div className="detail-value">{currentUser?.githubUsername || "-"}</div>
                                  </div>
                                  <div className="detail-group">
                                      <label>Role</label>
                                      <div className="detail-value" style={{textTransform: 'capitalize'}}>{currentUser?.role}</div>
                                  </div>
                              </div>
                              <div className="field-row">
                                  <div className="detail-group">
                                      <label>Email</label>
                                      <div className="detail-value">{currentUser?.email}</div>
                                  </div>
                                  <div className="detail-group">
                                      <label>Last Login</label>
                                      <div className="detail-value">
                                        {formatDate(currentUser?.lastLogin) || 'Never'}
                                      </div>
                                  </div>
                              </div>
                          </>
                      ) : (
                          // Edit mode
                          <>
                              <div className="field-row">
                                  <div className="detail-group">
                                      <label>Full Name</label>
                                      <input
                                          type="text"
                                          name="name"
                                          value={editData.name || ''}
                                          onChange={(e) => {
                                            handleInputChange(e)
                                            errorMessage && setErrorMessage('')
                                          }}
                                          className="form-input"
                                      />
                                  </div>
                              </div>


                              <div className="field-row">
                                <div className="detail-group">
                                  <label>Username</label>
                                  <div className="detail-value">{currentUser?.githubUsername || "-"}</div>
                                </div>
                                  <div className="detail-group">
                                      <label>Role</label>
                                      <div className="detail-value" style={{textTransform: 'capitalize'}}>{currentUser?.role}</div>
                                  </div>
                              </div>

                              <div className="field-row">
                                <div className="detail-group">
                                  <label>Email</label>
                                  {/*<div className="detail-value">{currentUser?.email}</div>*/}
                                  <input
                                      type="email"
                                      name="email"
                                      value={editData.email || ''}
                                      onChange={(e) => {
                                        handleInputChange(e)
                                        errorMessage && setErrorMessage('')
                                      }}
                                      className="form-input"
                                  />
                                </div>

                                  <div className="detail-group">
                                      <label>Last Login</label>
                                      <div className="detail-value">
                                        {formatDate(currentUser?.lastLogin) || 'Never'}
                                      </div>
                                  </div>
                              </div>

                              {/*<div className="detail-group">*/}
                              {/*    <label>Member Since</label>*/}
                              {/*    <div className="detail-value">*/}
                              {/*        {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}*/}
                              {/*    </div>*/}
                              {/*</div>*/}


                          </>
                      )}
                  </div>
              </div>


            {errorMessage && (
                <div className="error-message"
                     style={{display: 'flex',
                       gap: '0.25rem',
                       alignItems: 'center',
                       padding: '0.3rem',}}
                >
                  <AlertCircle size={16} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                  <div
                      style={{
                        color: 'var(--secondary)',
                        fontSize: '0.75rem',
                        marginTop: '0.125rem',
                      }}
                  >
                    {errorMessage}
                  </div>
                </div>
            )}


              {!isEditing ? (
                  <div className="edit-actions">
                      <button
                          className="btn btn-primary edit-actions-btn"
                          onClick={handleEditProfile}
                      >
                          Edit Profile
                      </button>
                  </div>
              ) : (
                  // Action buttons for edit mode
                  <div className="edit-actions" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                      <button
                          onClick={(e) => {
                            handleCancelEdit(e)
                            errorMessage && setErrorMessage('')// Clear error message on cancel
                          }}
                          className="btn btn-secondary edit-actions-btn"
                          disabled={isLoading}
                      >
                          Cancel
                      </button>
                      <button
                          onClick={handleSaveProfile}
                          className="btn btn-primary edit-actions-btn"
                          disabled={isLoading || !editData.name || !editData.email} // Disable if name or email is empty
                          style={{
                            cursor: isLoading || !editData.name || !editData.email ? 'not-allowed' : 'pointer',
                            opacity: isLoading || !editData.name || !editData.email ? 0.6 : 1
                          }}
                      >
                          {isLoading ? (
                              <>
                                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                  Saving...
                              </>
                          ) : 'Save Changes'}
                      </button>
                  </div>
              )}
          </div>
      </div>
  </>
);
}

export default Profile;