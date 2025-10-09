import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {updateAvatar, updateProfile} from '../../services/profile';
import HeaderInfo from "../common/HeaderInfo";
import {AlertCircle, Calendar, Edit3, Github, LogIn, Mail, User, UserCog} from 'lucide-react';
import toast from "react-hot-toast";

function GitHubConnectionStatus({ currentUser, onConnect, isConnecting, refreshTrigger }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

  const checkStatus = useCallback(async () => {
    if (!currentUser?.githubUsername) {
      setStatus(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/github-status`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('github status:', data);
        setStatus(data);
      } else {
        setStatus({ needsReauth: true });
      }
    } catch (error) {
      console.error('Failed to check GitHub status:', error);
      setStatus({ needsReauth: true });
    } finally {
      setLoading(false);
    }
  }, [currentUser.githubUsername]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus, refreshTrigger]);

  if (loading) {
    return (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[var(--text-light)]">
            <div className="w-4 h-4 border-2 border-[var(--text-light)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Checking GitHub status...</span>
          </div>
        </div>
    );
  }

  if (!currentUser?.githubUsername) {
    return (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-[var(--text-light)] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-[var(--text)] mb-1">
              GitHub Not Connected
            </h4>
            <p className="text-sm text-[var(--text-light)] mb-3">
              Connect your GitHub account to access private repositories and enable advanced features.
            </p>
            <button
                onClick={onConnect}
                disabled={isConnecting}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
            >
              <Github size={16} />
              {isConnecting ? 'Connecting...' : 'Connect GitHub'}
            </button>
          </div>
        </div>
    );
  }

  if (status?.needsReauth) {
    return (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-[var(--text)] mb-1">
              GitHub Connection Expired
            </h4>
            <p className="text-sm text-[var(--text-light)] mb-3">
              Your GitHub connection has expired. Reconnect to continue accessing private repositories.
            </p>
            <button
                onClick={onConnect}
                disabled={isConnecting}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[var(--secondary)] text-white hover:opacity-90 transition-colors disabled:opacity-50"
            >
              <Github size={16} />
              {isConnecting ? 'Reconnecting...' : 'Reconnect GitHub'}
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-[var(--text)] mb-1">
            GitHub Connected
          </h4>
          <p className="text-sm text-[var(--text-light)]">
            Connected as <span className="font-medium text-[var(--text)]">{currentUser.githubUsername}</span>
            {status?.hasPrivateAccess && ' • Private repository access enabled'}
          </p>
        </div>
      </div>
  );
}


function Profile() {
 const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

  const { currentUser, setCurrentUser, avatarUrl } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [isConnectingGitHub, setIsConnectingGitHub] = useState(false);
  const [githubStatusKey, setGithubStatusKey] = useState(0);
  const [formState, setFormState] = useState({
    data: {
      name: '',
      email: '',
      githubUsername: ''
    },
    errors: {},
    touched: {},
    isValid: false,
    isDirty: false
  });


  const fileInputRef = useRef(null);
  const fileReaderRef = useRef(null);


  useEffect(() => {

    const handleGitHubConnection = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tempToken = urlParams.get('temp_token');
      const connected = urlParams.get('connected');
      const error = urlParams.get('error');

      // Handle success message
      if (connected === 'true') {
        toast.success('GitHub account connected successfully!');
        setGithubStatusKey(prev => prev + 1);
        // Clean up URL
        window.history.replaceState({}, document.title, '/dashboard/profile');
        return;
      }

      // Handle error message
      if (error) {
        toast.error(decodeURIComponent(error));

        // Clean up URL
        window.history.replaceState({}, document.title, '/dashboard/profile');
        return;
      }

      // Handle temp token (complete the connection)
      if (tempToken) {
        try {
          setIsConnectingGitHub(true);
          const response = await fetch(`${API_BASE_URL}/profile/connect-github`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ tempToken })
          });

          if (response.ok) {
            const data = await response.json();
            // Update user context with new GitHub info

            console.log('curr user:', currentUser);
            setCurrentUser(prevUser => ({
              ...prevUser,
              githubUsername: data.user.githubUsername,
              githubId: data.user.githubId,
              githubScopes: data.user.githubScopes,
              githubTokenValid: true
            }));
            // console.log('updated user', currentUser);

            toast.success('GitHub account connected successfully!');
            window.history.replaceState({}, document.title, '/dashboard/profile');

            setGithubStatusKey(prev => prev + 1);
          } else {
            const errorData = await response.json();
            toast.error(errorData.message || 'Failed to connect GitHub account');
            window.history.replaceState({}, document.title, '/dashboard/profile');
          }
        } catch (error) {
          console.error('GitHub connection error:', error);
          toast.error('Failed to connect GitHub account');
          window.history.replaceState({}, document.title, '/dashboard/profile');
        } finally {
          setIsConnectingGitHub(false);
        }
      }
    };

    handleGitHubConnection();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
    setFormState(prev => ({
      ...prev,
      errors: {},
      touched: {},
      // Keep the current data and isValid state
    }));
  };

  const validateForm = useCallback((data) => {
    const errors = {};
    const trimmedName = data.name?.trim();
    const trimmedEmail = data.email?.trim();
    const trimmedGithub = data.githubUsername?.trim();

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
  }, []);

  useEffect(() => {
    if (currentUser) {
      const initialData = {
        name: currentUser.name || '',
        email: currentUser.email || '',
        githubUsername: currentUser.githubUsername || ''
      };

      const errors = validateForm(initialData);

      setFormState({
        data: initialData,
        errors,
        touched: {},
        isValid: Object.keys(errors).length === 0,
        isDirty: false
      });
    }
  }, [currentUser, validateForm]);

// Real-time validation when data changes
  useEffect(() => {
    if (isEditing) {
      const errors = validateForm(formState.data);
      const isValid = Object.keys(errors).length === 0;

      setFormState(prev => ({
        ...prev,
        errors,
        isValid
      }));
    }
  }, [formState.data, isEditing, validateForm]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);

    const initialData = {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      githubUsername: currentUser?.githubUsername || ''
    };

    setFormState(prev => ({
      ...prev,
      data: initialData,
      errors: {},
      touched: {},
      isDirty: false
    }));
  }, [currentUser?.name, currentUser?.email, currentUser?.githubUsername]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [name]: value },
      touched: { ...prev.touched, [name]: true },
      isDirty: true
    }));
  }, []);


  const handleSaveProfile = async () => {
    // Mark all fields as touched to show validation errors
    const allTouched = Object.keys(formState.data).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    const errors = validateForm(formState.data);
    const isValid = Object.keys(errors).length === 0;

    setFormState(prev => ({ ...prev, touched: allTouched }));

    // Check if form is valid
    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);

      const trimmedData = {
        name: formState.data.name?.trim(),
        email: formState.data.email?.trim(),
        githubUsername: formState.data.githubUsername?.trim() || null,
      };

      const result = await updateProfile(trimmedData);

      if (result.user) {
        setCurrentUser(prevUser => ({
          ...result.user,
          avatarUrl: prevUser.avatarUrl // Preserve current avatar
        }));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {

        // Handle 204 or responses without user payload
        setCurrentUser(prevUser => ({
          ...prevUser,
          ...trimmedData,
          avatarUrl: prevUser.avatarUrl
        }));

        setIsEditing(false);
        toast.success(result?.message || 'Profile updated successfully!');
      }
      // Reset form state to clean
      setFormState(prev => ({ ...prev, isDirty: false }));

    } catch (error) {
      console.error('Profile update failed:', error);

      const errorMessage = error?.message || 'Failed to update profile';

      // Handle field-specific errors based on message content
      if ((errorMessage.toLowerCase().includes('email already in use') ||
          errorMessage.toLowerCase().includes('email')) /*&& errorMessage.toLowerCase().includes('another account')*/  ) {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, email: errorMessage },
          touched: { ...prev.touched, email: true },
          isValid: false
        }));
      } else if ((errorMessage.toLowerCase().includes('github username') ||
          errorMessage.toLowerCase().includes('github')) /*&& errorMessage.toLowerCase().includes('another account')*/ ) {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, githubUsername: errorMessage },
          touched: { ...prev.touched, githubUsername: true },
          isValid: false
        }));
      } else if (errorMessage.toLowerCase().includes('github id') ||
          errorMessage.toLowerCase().includes('github id already linked')) {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, githubUsername: errorMessage },
          touched: { ...prev.touched, githubUsername: true },
          isValid: false
        }));
      } else if (errorMessage.toLowerCase().includes('name')) {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, name: errorMessage },
          touched: { ...prev.touched, name: true },
          isValid: false
        }));
      } else if (errorMessage.toLowerCase().includes('password')) {
        // In case you add password changes later
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, password: errorMessage },
          touched: { ...prev.touched, password: true },
          isValid: false
        }));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };



  const handleConnectGitHub = () => {

    setIsConnectingGitHub(true);
    setTimeout(() => {
      window.location.href = `${API_BASE_URL}/api/auth/github?flow=connect&returnTo=/dashboard/profile`;
    }, 100);
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

    setIsLoadingAvatar(true);

    try {
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }

      // Show preview immediately
      fileReaderRef.current = new FileReader();
      fileReaderRef.current.onload = (event) => {
        setPreviewAvatar(event.target.result);
      };
      fileReaderRef.current.onerror = () => {
        toast.error('Failed to read image file');
        setPreviewAvatar(null);
      };
      fileReaderRef.current.readAsDataURL(file);

      // Upload to server
      const result = await updateAvatar(file);

      if (result.avatarUrl) {
        // Clear preview and update user
        setPreviewAvatar(null);

        setCurrentUser(prev => ({
          ...prev,
          avatarUrl: result.avatarUrl
        }));

        toast.success('Avatar updated successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);

      // Clear preview on error
      setPreviewAvatar(null);
      toast.error(error.message || 'Failed to upload avatar. Please try again.');
    } finally {
      setIsLoadingAvatar(false);
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
    const hasError = formState.touched[fieldName] && formState.errors[fieldName];
    const errorClass = "border-red-500 focus:ring-2 focus:ring-red-500";
    const normalClass = "border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]";

    return `${baseClass} ${hasError ? errorClass : normalClass}`;
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
              <HeaderInfo />
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
                          disabled={isLoading || !formState.isValid || !formState.isDirty}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                        {/*{isLoading ? (
                        <>
                          <div className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          Save Changes
                        </>
                      )}*/}
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
                          src={avatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                      />
                      {isLoadingAvatar && (
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
                        disabled={isLoadingAvatar}
                        aria-label="Change profile picture"
                    >
                      {isLoadingAvatar ? 'Uploading...' : 'Edit'}
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
                                value={formState.data.name || ''}
                                onChange={handleInputChange}
                                className={getInputClassName('name')}
                                placeholder="Enter your full name"
                            />
                          </div>
                      )}

                      {formState.touched.name && formState.errors.name && (
                          <div className="flex gap-1 items-center px-1 py-1">
                            <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
                            <div className="text-[var(--secondary)] text-xs mt-0.5">
                              {formState.errors.name}
                            </div>
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
                                value={formState.data.email || ''}
                                onChange={handleInputChange}
                                className={getInputClassName('email')}
                                placeholder="your.email@example.com"
                            />
                          </div>
                      )}

                      {formState.touched.email && formState.errors.email && (
                          <div className="flex gap-1 items-center px-1 py-1">
                            <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
                            <div className="text-[var(--secondary)] text-xs mt-0.5">
                              {formState.errors.email}
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
                                value={formState.data.githubUsername || ''}
                                onChange={handleInputChange}
                                className={getInputClassName('githubUsername')}
                                placeholder="your-github-username"
                            />
                          </div>
                      )}

                      {formState.touched.githubUsername && formState.errors.githubUsername && (
                          <div className="flex gap-1 items-center px-1 py-1">
                            <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
                            <div className="text-[var(--secondary)] text-xs mt-0.5">
                              {formState.errors.githubUsername}
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
                          {formatDate(currentUser?.lastLogin)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security & Additional Information Section */}
                  {/*<div className="mt-8">
                    <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Security & Preferences</h3>

                    <div className="bg-[var(--bg)] p-4 rounded-lg border border-[var(--border)]">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-[var(--text)] font-medium mb-1">GitHub Integration</h4>
                          <p className="text-sm text-[var(--text-light)]">
                            Connect your GitHub account to enable advanced features
                          </p>
                        </div>

                        {currentUser?.githubUsername ? (
                            <div className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 cursor-default">
                              Connected
                            </div>
                        ) : (
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleConnectGitHub}
                                disabled={isConnectingGitHub}
                            >
                              <Github size={16} />
                              {isConnectingGitHub ? 'Connecting...' : 'Connect GitHub'}
                            </button>
                        )}

                        </button>
                      </div>
                    </div>

                  </div>*/}

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Security & Preferences</h3>

                    <GitHubConnectionStatus
                        currentUser={currentUser}
                        onConnect={handleConnectGitHub}
                        isConnecting={isConnectingGitHub}
                        refreshTrigger={githubStatusKey}
                    />
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