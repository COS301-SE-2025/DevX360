import React, {useState} from "react";
import { X, Github, Users, Lock, AlertCircle } from 'lucide-react';
import {createTeam} from "../../../services/teams";
import toast from 'react-hot-toast';

function CreateTeamModal({onCloseCreate, onTeamCreated, setIsCreatingTeam}) {
  const [teamName, setTeamName] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const modalRef = React.useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isFormValid = teamName.trim() && repoUrl.trim() && teamPassword.trim() && teamPassword.length >= 6;

  const closeModal = (e) => {
    if(e.target === modalRef.current) {
      onCloseCreate();
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isFormValid && !isLoading) {
      e.preventDefault();
      handleCreateTeam().catch(console.error);
    }
  };

  const clearErrors = () => {
    setNameError('');
    setUrlError('');
    setPasswordError('');
  }

  const validatePassword = (password) => {
    if (password.length > 0 && password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  }

  const handleCreateTeam = async () => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

    // Validate GitHub URL format
    if (!repoUrl.startsWith('https://github.com/')) {
      setUrlError('Please enter a valid GitHub repository URL');
      return;
    }

    // Validate password
    if (!validatePassword(teamPassword)) {
      return;
    }

    const loadingToast = toast.loading('Creating team...');

    setIsLoading(true);
    setIsCreatingTeam(true);
    clearErrors();

    try {
      const createdTeam = await createTeam(teamName, teamPassword, repoUrl);
      // console.log("createdTEam", createdTeam);
      toast.success(`Team "${teamName}" created successfully!`, { id: loadingToast });

      setTeamName('');
      setTeamPassword('');
      setRepoUrl('');

      // onCloseCreate(); callback will close modal
      onTeamCreated();

    } catch (error) {
      console.error('Error creating team:', error);

      if (error.needsGitHubAuth) {
        toast.error(error.message, { id: loadingToast });

        // Show a confirmation dialog
        const shouldConnect = window.confirm(
            `${error.message}\n\n${error.hasSuggestions}\n\nWould you like to connect your GitHub account now?`
        );

        if (shouldConnect && error.githubAuthUrl) {
          window.location.href = `${API_BASE_URL}${error.githubAuthUrl}`;
        }
        return;
      }

      if (error.message.includes('exists')) {
        setNameError(error.message || 'Failed to create team');
        toast.error('Failed to create team', { id: loadingToast });
      } else if (error.message.includes('Repository')) {
        toast.dismiss(loadingToast);
        setUrlError(error.message || 'Failed to create team');
      } else {
        toast.error(error.message || 'Failed to create team', { id: loadingToast });
      }
    }
    finally {
      setIsLoading(false);
      setIsCreatingTeam(false);
    }
  };

  return (
      <div
          ref={modalRef}
          onClick={closeModal}
          className="fixed inset-0 z-[10000] bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex justify-center items-center p-4"
      >
        <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="bg-[var(--bg-container)] rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] w-full max-w-[28rem] z-[10001] border border-[var(--border)]"
            tabIndex={-1}
        >
          {/* header */}
          <div className="px-6 pt-6 pb-0 border-b border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Users size={18} className="text-[var(--primary)]" />
                </div>
                <h2 className="text-lg font-medium text-[var(--text)] m-0">
                  Create Team
                </h2>
              </div>
              <button
                  className="bg-transparent border-none rounded-md p-2 cursor-pointer text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all"
                  aria-label="Close"
                  onClick={onCloseCreate}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-[var(--text-light)] mb-0 pb-4">
              Set up a new team to start tracking DORA metrics and developer performance.
            </p>
          </div>

          {/* body */}
          <div className="p-6 flex flex-col gap-5">

            {/* Team Name Field */}
            <div className="mb-1">
              <label className="block text-sm font-medium text-[var(--text)]">
                Team Name *
              </label>
              <input
                  type="text"
                  className="w-full px-3 py-2 bg-[var(--bg-container)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
                  value={teamName}
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    clearErrors()
                  }}
                  placeholder="Enter team name"
              />

              {nameError && (
                  <div className="flex gap-1 items-center px-1 py-1">
                    <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
                    <div className="text-[var(--secondary)] text-xs mt-0.5">
                      {nameError}
                    </div>
                  </div>
              )}
            </div>

            {/* GitHub Repository Field */}
            <div className="mb-1">
              <label className=" text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Github size={16} className="text-[var(--primary)]" />
                GitHub Repository URL *
              </label>
              <input
                  type="url"
                  className="w-full px-3 py-2 bg-[var(--bg-container)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value)
                    clearErrors()
                  }}
                  placeholder="https://github.com/username/repository"
              />

              {urlError && (
                  <div className="flex gap-1 items-center px-1 py-1">
                    <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
                    <div className="text-[var(--secondary)] text-xs mt-0.5">
                      {urlError}
                    </div>
                  </div>
              )}

              <p className="text-xs text-[var(--text-light)] mt-2 text-left">
                This will be used to collect data for DORA metrics and AI analysis.
              </p>
            </div>

            {/* Team Password Field */}
            <div className="mb-1">
              <label className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Lock size={16} className="text-[var(--primary)]" />
                Team Password *
              </label>
              <input
                  type="password"
                  className="w-full px-3 py-2 bg-[var(--bg-container)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
                  value={teamPassword}
                  onChange={(e) => {
                    setTeamPassword(e.target.value);
                    if (e.target.value.length > 0) {
                      validatePassword(e.target.value);
                    } else {
                      setPasswordError('');
                    }
                  }}
                  placeholder="Create a secure password"
              />

              {passwordError && (
                  <div className="flex gap-1 items-center px-1 py-1">
                    <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
                    <div className="text-[var(--secondary)] text-xs mt-0.5">
                      {passwordError}
                    </div>
                  </div>
              )}

              <p className="text-xs text-[var(--text-light)] mt-2">
                Team members will need this password to join and view metrics. Must be at least 6 characters long.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-3 flex gap-3">
              <AlertCircle size={16} className="text-[var(--primary)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[var(--text)] mb-1">
                  Getting Started
                </p>
                <p className="text-xs text-[var(--text-light)]">
                  Once created, your team will start collecting DORA metrics and AI-powered insights automatically.
                </p>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="px-6 pb-6 flex gap-3 justify-end">
            <button
                onClick={onCloseCreate}
                className="px-4 py-2 rounded-lg bg-transparent text-[var(--text)] hover:bg-[var(--bg)] transition-colors border border-[var(--border)]"
            >
              Cancel
            </button>
            <button
                onClick={handleCreateTeam}
                disabled={isLoading || !teamName || !repoUrl || !teamPassword || teamPassword.length < 6}
                className={`px-4 py-2 rounded-lg transition-colors ${
                    isLoading || !teamName.trim() || !repoUrl || !teamPassword.trim() || teamPassword.length < 6
                        ? 'bg-[var(--border)] text-[var(--text-light)] cursor-not-allowed'
                        : 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white'
                }`}
            >
              {isLoading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </div>
      </div>
  );
}

export default CreateTeamModal;