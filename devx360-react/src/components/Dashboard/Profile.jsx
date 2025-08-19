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
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="bg-[var(--bg-container)] shadow-sm border-b border-[var(--border)] sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-[var(--text)]">Your Profile</h1>
              <div className="h-6 w-px bg-[var(--border)]"></div>
              <p className="text-lg font-medium text-[var(--text-light)]">Manage your profile</p>
            </div>
            <HeaderInfo currentUser={currentUser} avatar={avatar} defaultAvatar={defaultAvatar} />
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 bg-[var(--bg-container)] rounded-xl p-8 w-full"
             style={{ boxShadow: 'var(--shadow)' }}>

          {/*profile wrapper*/}
          <div className="flex flex-row gap-20 flex-wrap w-full">
            {/*profile left*/}
            <div className="flex flex-col items-center gap-6 min-w-[120px] justify-between">
              {/*avatar container*/}
              <div className="flex flex-col items-center gap-4">
                {/*avatar wrap*/}
                <div className="relative inline-block">
                  <div className="w-[150px] h-[150px] rounded-full overflow-hidden bg-[var(--border)]">
                    <img
                      src={avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                          e.target.src = defaultAvatar;
                          e.target.onerror = null;
                      }}
                    />
                    {isLoading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                </div>

                {/*add button stuff*/}
                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-1 right-1 w-auto px-2.5 py-1.5 text-xs rounded-md min-w-[40px]
                    bg-[var(--bg-container)] text-[var(--text)] border border-[var(--border)]
                    hover:bg-[var(--border)] hover:border-[var(--gray)]
                    transition-colors duration-150"
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
                  className="hidden"
                />
                      </div>
              </div>
                {/*<div className="field-row">*/}
                <div className="flex-1">
                  <div className="mb-4">
                    <label className="block text-sm text-[var(--text-light)] mb-1">Member Since</label>
                    <div className="font-medium py-2 border-b border-[var(--border)]">
                      {formatDate(currentUser?.createdAt)}
                    </div>
                  </div>
                </div>
                {/*</div>*/}
              </div>

            {/*profile right*/}
              <div className="flex flex-col gap-6 flex-1 min-w-[300px]">
                  {!isEditing ? (
                      // View mode
                      <>
                          <div className="flex gap-8 justify-between flex-wrap">
                              <div className="flex-1 min-w-[150px] mb-4">
                                  <label className="block text-sm text-[var(--text-light)] mb-1">Full Name</label>
                                  <div className="font-medium py-2 border-b border-[var(--border)]" >
                                    {currentUser?.name || 'Not provided'}
                                    {/*<button onClick={handleEditName} title="Edit" className="btn-cancel">*/}
                                    {/*  <Pen size={16} />*/}
                                    {/*</button>*/}
                                  </div>
                              </div>
                          </div>
                          <div className="flex gap-8 justify-between flex-wrap">
                              <div className="flex-1 min-w-[150px] mb-4">
                                  <label className="block text-sm text-[var(--text-light)] mb-1">Username</label>
                                  <div className="font-medium py-2 text-[var(--gray)] italic border-b border-[var(--border)]">{currentUser?.githubUsername || 'Not connected'}</div>
                              </div>
                              <div className="flex-1 min-w-[150px] mb-4">
                                  <label className="block text-sm text-[var(--text-light)] mb-1">Role</label>
                                  <div className="font-medium py-2 border-b border-[var(--border)] capitalize">{currentUser?.role}</div>
                              </div>
                          </div>
                          <div className="flex gap-8 justify-between flex-wrap">
                              <div className="flex-1 min-w-[150px] mb-4">
                                  <label  className="block text-sm text-[var(--text-light)] mb-1">Email</label>
                                  <div className="font-medium py-2 border-b border-[var(--border)]">{currentUser?.email}</div>
                              </div>
                              <div className="flex-1 min-w-[150px] mb-4">
                                  <label className="block text-sm text-[var(--text-light)] mb-1">Last Login</label>
                                  <div className="font-medium py-2 border-b border-[var(--border)]">
                                    {formatDate(currentUser?.lastLogin) || 'Never'}
                                  </div>
                              </div>
                          </div>
                      </>
                  ) : (
                      // Edit mode
                      <>
                        <div className="flex gap-8 justify-between flex-wrap">
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">Full Name</label>
                                  <input
                                      type="text"
                                      name="name"
                                      value={editData.name || ''}
                                      onChange={(e) => {
                                        handleInputChange(e)
                                        errorMessage && setErrorMessage('')
                                      }}
                                      className="w-full max-w-full box-border p-2 border border-[var(--border)] rounded-md bg-[var(--bg-container)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                  />
                              </div>
                          </div>


                        <div className="flex gap-8 justify-between flex-wrap">
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">Username</label>
                            <div className="font-medium py-2 text-[var(--gray)] italic border-b border-[var(--border)]">{currentUser?.githubUsername || 'Not connected'}</div>
                          </div>
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">Role</label>
                            <div className="font-medium py-2 border-b border-[var(--border)] capitalize">{currentUser?.role}</div>
                          </div>
                        </div>

                        <div className="flex gap-8 justify-between flex-wrap">
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">Email</label>
                              {/*<div className="detail-value">{currentUser?.email}</div>*/}
                              <input
                                type="email"
                                name="email"
                                value={editData.email || ''}
                                onChange={(e) => {
                                  handleInputChange(e)
                                  errorMessage && setErrorMessage('')
                                }}
                                className="w-full max-w-full box-border p-2 border border-[var(--border)] rounded-md bg-[var(--bg-container)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                              />
                            </div>

                            <div className="flex-1 min-w-[150px] mb-4">
                              <label className="block text-sm text-[var(--text-light)] mb-1">Last Login</label>
                              <div className="font-medium py-2 border-b border-[var(--border)]">
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
      </main>
  </div>
);
}

export default Profile;