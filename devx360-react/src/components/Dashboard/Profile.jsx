import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import {useAuth} from '../../context/AuthContext';
import {updateAvatar, updateProfile} from '../../services/profile';
import HeaderInfo from "../common/HeaderInfo";
import {AlertCircle} from 'lucide-react';
import toast from "react-hot-toast";

const defaultAvatar = '/default-avatar.png';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return defaultAvatar;
  if (avatarPath.startsWith('http')) return avatarPath;

  // Handle double slash issue
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

function Profile() {
  const { currentUser, setCurrentUser } = useAuth();
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    githubUsername: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const fileReaderRef = useRef(null);

  // Memoize avatar URL calculation
  const avatarUrl = useMemo(() => {
    return currentUser?.avatar ? getFullAvatarUrl(currentUser.avatar) : defaultAvatar;
  }, [currentUser?.avatar]);

  useEffect(() => {
    if (currentUser) {
      setEditData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        githubUsername: currentUser.githubUsername || '',
      });
    }
  }, [currentUser]);

  // Set avatar URL when currentUser changes
  useEffect(() => {
    setAvatar(avatarUrl);
  }, [avatarUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }
    };
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setFieldErrors({});
    setErrorMessage('');
  };

  const validateForm = () => {
    const errors = {};

    const trimmedName = editData.name?.trim();
    const trimmedEmail = editData.email?.trim();
    const trimmedGithub = editData.githubUsername?.trim();

    if (!trimmedName) {
      errors.name = 'Name is required';
    }

    if (!trimmedEmail) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Invalid email format';
    }

    if (trimmedGithub && !/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(trimmedGithub)) {
      errors.githubUsername = 'Invalid GitHub username format';
    }

    return errors;
  };

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setFieldErrors({});
    setErrorMessage('');
    // Reset to original values
    setEditData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      githubUsername: currentUser?.githubUsername || '',
    });
  }, [currentUser]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  }, [fieldErrors, errorMessage]);

  const handleSaveProfile = async () => {
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setFieldErrors({});
      setErrorMessage('');

      // Trim data before sending
      const trimmedData = {
        name: editData.name?.trim(),
        email: editData.email?.trim(),
        githubUsername: editData.githubUsername?.trim() || null,
      };

      const result = await updateProfile(trimmedData, {
        signal: abortControllerRef.current.signal
      });

      if (result.user) {
        setCurrentUser(prevUser => ({
          ...result.user,
          avatar: prevUser.avatar
        }));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        setErrorMessage('Profile updated but server returned unexpected response.');
        toast.success('Profile updated');
      }
    } catch (error) {
      if (error.name === 'AbortError') return;

      console.error('Profile update failed:', error);

      // Handle field-specific errors
      if (error.field && error.message) {
        setFieldErrors({ [error.field]: error.message });
      } else {
        setErrorMessage(error?.message || 'Failed to update profile');
      }
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleConnectGitHub = () => {
    window.location.href = `${API_BASE_URL}/api/auth/github`;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsLoading(true);
    const previousAvatar = avatar;

    try {
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }

      fileReaderRef.current = new FileReader();
      fileReaderRef.current.onload = (event) => {
        setAvatar(event.target.result);
      };
      fileReaderRef.current.onerror = () => {
        toast.error('Failed to read image file');
        setAvatar(previousAvatar);
      };
      fileReaderRef.current.readAsDataURL(file);

      // Upload to server
      const result = await updateAvatar(file, currentUser);

      if (result.avatarUrl) {
        const fullAvatarUrl = getFullAvatarUrl(result.avatarUrl);
        setAvatar(fullAvatarUrl);

        // Update the auth context with the new avatar
        setCurrentUser(prev => ({
          ...prev,
          avatar: result.avatarUrl
        }));

        toast.success('Avatar updated successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);

      // Revert to previous avatar on error
      setAvatar(previousAvatar);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setIsLoading(false);
      fileReaderRef.current = null;

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ', ' + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  // Helper function to get input error styling
  const getInputClassName = (fieldName) => {
    const baseClass = "w-full max-w-full box-border p-2 border rounded-md bg-[var(--bg-container)] text-[var(--text)] focus:outline-none transition-colors";
    const errorClass = "border-red-500 focus:ring-2 focus:ring-red-500";
    const normalClass = "border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]";

    return `${baseClass} ${fieldErrors[fieldName] ? errorClass : normalClass}`;
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

              <div className="flex flex-row gap-20 flex-wrap w-full">
                {/* Profile left */}
                <div className="flex flex-col items-center gap-6 min-w-[120px] justify-between">
                  <div className="flex flex-col items-center gap-4">
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

                      <button
                          onClick={triggerFileInput}
                          className="absolute bottom-2 right-2 w-auto px-2.5 py-1.5 text-xs rounded-md min-w-[40px]
                        bg-[var(--bg-container)] text-[var(--text)] border border-[var(--border)]
                        hover:bg-[var(--border)] hover:border-[var(--gray)]
                        transition-colors duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isLoading}
                      >
                        {isLoading ? 'Uploading...' : 'Edit'}
                      </button>

                      <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarChange}
                          accept="image/*"
                          className="hidden"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-4">
                      <label className="block text-sm text-[var(--text-light)] mb-1">Member Since</label>
                      <div className="text-sm font-mono py-2 border-b border-[var(--border)] text-[var(--text-light)]">
                        {formatDate(currentUser?.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile right */}
                <div className="flex flex-col gap-6 flex-1 min-w-[300px]">
                  {!isEditing ? (
                      // View mode
                      <>
                        <div className="flex gap-8 justify-between flex-wrap">
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">Full Name</label>
                            <div className="font-medium py-2 border-b border-[var(--border)]">
                              {currentUser?.name || <span className="text-[var(--text-light)] italic">Not provided</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-8 justify-between flex-wrap">
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">GitHub Username</label>
                            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                              <div className="font-medium text-[var(--text-light)] italic">
                                {currentUser?.githubUsername || 'Not connected'}
                              </div>
                              <button
                                  onClick={
                                    !currentUser?.githubUsername
                                        ? handleConnectGitHub
                                        : () => window.open(`https://github.com/${currentUser.githubUsername}`, '_blank')
                                  }
                                  className="w-5 h-5 flex items-center justify-center rounded text-[var(--text-light)] hover:text-[var(--primary)] hover:bg-[var(--border)] transition-colors"
                                  title={
                                    !currentUser?.githubUsername
                                        ? "Connect GitHub account"
                                        : "View GitHub profile"
                                  }
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">Role</label>
                            <div className="font-medium py-2 border-b border-[var(--border)] capitalize">{currentUser?.role}</div>
                          </div>
                        </div>

                        <div className="flex gap-8 justify-between flex-wrap">
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">Email</label>
                            <div className="font-medium py-2 border-b border-[var(--border)]">{currentUser?.email}</div>
                          </div>
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">Last Login</label>
                            <div className="text-sm font-mono py-2 border-b border-[var(--border)] text-[var(--text-light)]">
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
                            <label className="block text-sm text-[var(--text-light)] mb-1">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={editData.name || ''}
                                onChange={handleInputChange}
                                className={getInputClassName('name')}
                                placeholder="Enter your full name"
                            />
                            {fieldErrors.name && (
                                <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-8 justify-between flex-wrap">
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">GitHub Username</label>
                            <input
                                type="text"
                                name="githubUsername"
                                value={editData.githubUsername || ''}
                                onChange={handleInputChange}
                                className={getInputClassName('githubUsername')}
                                placeholder="your-github-username"
                            />
                            {fieldErrors.githubUsername && (
                                <p className="text-red-500 text-sm mt-1">{fieldErrors.githubUsername}</p>
                            )}
                          </div>
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">Role</label>
                            <div className="font-medium py-2 border-b border-[var(--border)] capitalize">{currentUser?.role}</div>
                          </div>
                        </div>

                        <div className="flex gap-8 justify-between flex-wrap">
                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={editData.email || ''}
                                onChange={handleInputChange}
                                className={getInputClassName('email')}
                                placeholder="your.email@example.com"
                            />
                            {fieldErrors.email && (
                                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                            )}
                          </div>

                          <div className="flex-1 min-w-[150px] mb-4">
                            <label className="block text-sm text-[var(--text-light)] mb-1">Last Login</label>
                            <div className="text-sm font-mono py-2 border-b border-[var(--border)] text-[var(--text-light)]">
                              {formatDate(currentUser?.lastLogin) || 'Never'}
                            </div>
                          </div>
                        </div>
                      </>
                  )}
                </div>
              </div>

              {/* General error message */}
              {errorMessage && (
                  <div className="flex items-center gap-1 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                    <div className="text-red-700 text-sm">
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
                  <div className="edit-actions" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleCancelEdit}
                        className="btn btn-secondary edit-actions-btn"
                        disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleSaveProfile}
                        className="btn btn-primary edit-actions-btn"
                        disabled={isLoading}
                        style={{
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          opacity: isLoading ? 0.6 : 1
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