import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import {useAuth} from '../../context/AuthContext';
import {updateAvatar, updateProfile} from '../../services/profile';
import HeaderInfo from "../common/HeaderInfo";
import {AlertCircle, Calendar, Edit3, Github, LogIn, Mail, User, UserCog} from 'lucide-react';
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
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [githubUsernameError, setGithubUsernameError] = useState('');
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
    // setFieldErrors({});
    // setErrorMessage('');
    clearErrors();
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
    clearErrors()
    // Reset to original values
    setEditData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      githubUsername: currentUser?.githubUsername || '',
    });
  }, [currentUser?.name, currentUser?.email, currentUser?.githubUsername]);

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
    if (nameError) {
      setNameError('');
    }
    if (emailError) {
      setEmailError('');
    }
    if (githubUsernameError) {
      setGithubUsernameError('');
    }
  }, [fieldErrors, errorMessage, nameError, emailError, githubUsernameError]);

  const clearErrors = () => {
    setFieldErrors({});
    setErrorMessage('');
    setNameError('');
    setEmailError('');
    setGithubUsernameError('');
  }

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
      clearErrors();
      // setFieldErrors({});
      // setErrorMessage('');

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
          if (error?.message?.includes('Email')) {
            setEmailError(error?.message || 'Failed to update email');
          } else if (error?.message?.includes('GitHub')) {
            setGithubUsernameError(error?.message || 'Failed to update github username');
          } else {
            setErrorMessage(error?.message || 'Failed to update profile');
          }
      }
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

 /* const handleConnectGitHub = () => {
    window.location.href = `${API_BASE_URL}/api/auth/github`;
  };*/

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

        <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[var(--bg-container)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-[var(--border)] gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <UserCog className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text)]">Account Information</h2>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="flex gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors duration-200 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm sm:text-base"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-lg bg-transparent text-[var(--text)] hover:bg-[var(--bg)] transition-colors border border-[var(--border)]"
                      disabled={isLoading}
                    >
                      {/*<X size={16} />*/}
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors duration-200 min-w-[120px] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading || !editData.name || !editData.email }
                    >
                      {isLoading ? (
                        <>
                          <div className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/*Avatar Section*/}
                <div className="lg:col-span-1 flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-[var(--border)] border-4 border-[var(--bg-container)]">
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
                        aria-label="Change profile picture"
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

                  <div className="text-center mb-6">
                    <div className="text-xl font-medium text-[var(--text)] mb-2">
                      {currentUser?.name || 'User'}
                    </div>
                        {currentUser?.role && (
                          <span className="inline-block px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white rounded-full text-sm font-bold capitalize shadow-md">
                            {currentUser.role}
                          </span>
                        )}
                  </div>

                    <div className="w-full p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)] mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                          <div>
                            <div className="text-xs text-[var(--text-light)]">Member Since</div>
                            <div className="text-sm font-medium text-[var(--text)]">
                              {formatDate(currentUser?.createdAt).split(',')[0]}
                            </div>
                          </div>
                        </div>
                      </div>
                    {/*</div>*/}
                  </div>

                {/* Profile details */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/*Full Name*/}
                    <div className="min-h-[70px]">
                      <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-light)]">
                        <User size={16} />
                        Full Name {isEditing && <span className="text-red-500">*</span>}
                      </label>
                      {!isEditing ? (
                        <div className="h-[45px] px-4 py-3 bg-[var(--bg)] rounded-lg border border-[var(--border)] flex items-center">
                        <span className="text-[var(--text)]">
                          {currentUser?.name || <span className="text-[var(--text-light)] italic">Not provided</span>}
                        </span>
                          </div>
                      ) : (
                        <div>
                          <input
                            type="text"
                            name="name"
                            value={editData.name || ''}
                            onChange={handleInputChange}
                            className={getInputClassName('name')}
                            placeholder="Enter your full name"
                          />

                          {fieldErrors.name && (
                              <div className="flex gap-1 items-center px-1 py-1">
                                <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
                                <div className="text-[var(--secondary)] text-xs mt-0.5">
                                  {fieldErrors.name}
                                </div>
                              </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/*Email */}
                    <div className="min-h-[70px]">
                      <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-light)]">
                        <Mail size={16} />
                        Email Address {isEditing && <span className="text-red-500">*</span>}
                      </label>

                      {!isEditing ? (
                        <div className="h-[45px] px-4 py-3 bg-[var(--bg)] rounded-lg border border-[var(--border)] flex items-center">
                          <span className="text-[var(--text)]">{currentUser?.email}</span>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="email"
                            name="email"
                            value={editData.email || ''}
                            onChange={handleInputChange}
                            className={getInputClassName('email')}
                            placeholder="your.email@example.com"
                          />
                          {fieldErrors.email && (
                              <div className="flex gap-1 items-center px-1 py-1">
                                <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
                                <div className="text-[var(--secondary)] text-xs mt-0.5">
                                  {fieldErrors.email}
                                </div>
                              </div>
                          )}
                        </div>
                      )}

                      {emailError && (
                          <div className="flex gap-1 items-center px-1 py-1">
                            <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
                            <div className="text-[var(--secondary)] text-xs mt-0.5">
                              {emailError}
                            </div>
                          </div>
                      )}
                    </div>

                    {/*github*/}
                    <div className="min-h-[70px]">
                      <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-light)]">
                        <Github size={16} />
                        GitHub Username
                      </label>

                      {!isEditing ? (
                        <div className="h-[45px] px-4 py-3 bg-[var(--bg)] rounded-lg border border-[var(--border)] flex items-center justify-between">
                          <span className="text-[var(--text)]">
                            {currentUser?.githubUsername || <span className="text-[var(--text-light)] italic">Not connected</span>}
                          </span>

                          {currentUser?.githubUsername && (
                            <a
                              href={`https://github.com/${currentUser.githubUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors text-sm flex items-center gap-1"
                            >
                              <Github size={16} className="text-[var(--text-light)] hover:text-[var(--primary)]" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <div>
                          <input
                            type="text"
                            name="githubUsername"
                            value={editData.githubUsername || ''}
                            onChange={handleInputChange}
                            className={getInputClassName('githubUsername')}
                            placeholder="your-github-username"
                          />
                          {fieldErrors.githubUsername && (
                              <div className="flex gap-1 items-center px-1 py-1">
                                <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
                                <div className="text-[var(--secondary)] text-xs mt-0.5">
                                  {fieldErrors.githubUsername}
                                </div>
                              </div>
                          )}
                        </div>
                      )}

                      {githubUsernameError && (
                          <div className="flex gap-1 items-center px-1 py-1">
                            <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
                            <div className="text-[var(--secondary)] text-xs mt-0.5">
                              {githubUsernameError}
                            </div>
                          </div>
                      )}
                    </div>

                    {/*last login*/}
                    <div className="min-h-[70px]">
                      <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-light)]">
                        <LogIn size={16} />
                        Last Login
                      </label>
                      <div className="h-[45px] px-4 py-3 bg-[var(--bg)] rounded-lg border border-[var(--border)] flex items-center">
                        <span className="text-[var(--text-light)] text-sm">
                          {formatDate(currentUser?.lastLogin) || 'Never logged in'}
                        </span>
                      </div>
                    </div>
                  </div>

                {/* Security & Additional Information Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Security & Preferences</h3>

                  <div className="bg-[var(--bg)] p-4 rounded-lg border border-[var(--border)]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-[var(--text)] font-medium mb-1">GitHub Integration</h4>
                        <p className="text-sm text-[var(--text-light)]">
                          Connect your GitHub account to enable advanced features
                        </p>
                      </div>

                      {/*<button*/}
                      {/*  onClick={handleConnectGitHub}*/}
                      {/*  disabled={!!currentUser?.githubUsername}*/}
                      {/*  className={`px-4 py-2 rounded-lg text-sm font-medium */}
                      {/*    ${currentUser?.githubUsername*/}
                      {/*      ? 'bg-green-100 text-green-700 cursor-default'*/}
                      {/*      : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors'*/}
                      {/*  }`}*/}
                      {/*>*/}
                      <div className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 cursor-default">
                        {currentUser?.githubUsername && 'Connected'}
                      </div>

                      {/*</button>*/}
                    </div>
                  </div>

                </div>

                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}

export default Profile;