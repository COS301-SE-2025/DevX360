<<<<<<< HEAD
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {X, Search, Users, Lock, ArrowLeft, AlertCircle} from 'lucide-react';
import {checkMembership, joinTeam, searchTeams} from "../../../services/teams";
import toast from 'react-hot-toast';


function JoinTeamModal({onCloseJoin, onTeamJoined}) {
  const [currentStep, setCurrentStep] = useState('searching'); // 'searching', 'enteringPassword', 'alreadyJoined'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  // const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = async () => {
    if (isLoading) {
      return;
    }

    if (!searchTerm.trim()) {
      // setSearchResult({ error: 'Please enter a team name to search.' });
      setErrorMessage('Please enter a team name to search.');
      setSearchResult([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await searchTeams(searchTerm);
      console.log(result);
      setSearchResult(result || []);

      result.length === 0 ? setErrorMessage('No teams found.') : setErrorMessage('');
      // setErrorMessage('');
    } catch (error) {
      console.log(error);
      // setSearchResult({ error: error.message });
      setErrorMessage(error.message);
      setSearchResult([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamSelect = async (team) => {
    if (isLoading) {
      return;
    }

    setSelectedTeam(team);
    // setCurrentStep('enteringPassword');
    setErrorMessage('');
    setIsLoading(true);

    try {
      const isMember = await checkMembership(team._id);

      console.log(isMember);

      if (isMember) {
        toast.success(`Already joined "${team.name}".`);
        onCloseJoin();
        navigate(`/dashboard/metrics`);
      } else {
        setCurrentStep('enteringPassword');
      }
    } catch (error) {
      console.error('Error checking membership:', error);
      setErrorMessage('Failed to check team membership. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!password.trim()) {
      setErrorMessage('Please enter the team password.');
      return;
    }

    const loadingToast = toast.loading('Joining team...');
    setIsLoading(true);
    setErrorMessage('');

    try {
      const joinedTeam = await joinTeam(selectedTeam.name, password);

      console.log("joined team", joinedTeam);

      setTimeout(() => {
        toast.success(`Successfully joined "${selectedTeam.name}"!`, { id: loadingToast });
        // onCloseJoin(); callback will do this

        onTeamJoined();
      }, 0);
      // onJoinSuccess?.(selectedTeam.name);

    } catch (error) {
      console.log(error);
      setErrorMessage(error.message || 'Failed to join team');

      toast.error('Something went wrong.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setCurrentStep('searching');
    setSelectedTeam(null);
    setPassword('');
    setErrorMessage('');
  };

  const modalRef = React.useRef(null);
  const closeModal = (e) => {
    if(e.target === modalRef.current) {
      onCloseJoin();
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (currentStep === 'searching' && searchTerm.trim()) {
        handleSearch().catch(console.error);
      } else if (currentStep === 'enteringPassword' && password.trim()) {
        handleJoinTeam().catch(console.error);
      }
    }
  }

  return (
    <div
      ref={modalRef} onClick={closeModal}
      className="fixed inset-0 z-[10000] bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex justify-center items-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg-container)] rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] w-full max-w-[28rem] z-[10001] border border-[var(--border)]"
      >
        {/* header */}
        <div className="px-6 pt-6 pb-0 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {currentStep === 'enteringPassword' && (
                <button
                  onClick={handleBackToSearch}
                  className="bg-transparent border-none rounded-md p-2 cursor-pointer text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <div className="w-8 h-8 flex items-center justify-center">
                {currentStep === 'searching' ? (
                    <Search size={18} className="text-[var(--primary)]" />
                ) : (
                    <Lock size={18} className="text-[var(--primary)]" />
                )}
              </div>
              <h2 className="text-lg font-medium text-[var(--text)]">
                {currentStep === 'searching' ? 'Find a Team' : 'Join a Team'}
              </h2>
            </div>
            <button className="bg-transparent border-none rounded-md p-2 cursor-pointer text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all mr-1"
              onClick={onCloseJoin}
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-[var(--text-light)] mb-0 pb-4 text-left ml-1">
            {currentStep === 'searching'
              ? 'Search for the team you want to join'
              : `Enter the password to join "${selectedTeam?.name}"`
            }
          </p>
        </div>

        {/* body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Error Message */}
          {errorMessage && (
            <div className="flex gap-1 items-center px-1 py-1">
              <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
              <div className="text-[var(--secondary)] mt-0.5">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Search Step */}
          {currentStep === 'searching' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Team Name
                </label>
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    className="flex-1 min-w-0 px-3 py-2 bg-[var(--bg-container)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if(searchResult) {
                        setSearchResult(null);
                      }
                      if (errorMessage) {
                        setErrorMessage('');
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter team name to search"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isLoading || !searchTerm.trim()}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      isLoading || !searchTerm.trim()
                        ? 'bg-[var(--border)] text-[var(--text-light)] cursor-not-allowed'
                        : 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white'
                      }`}
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>


              {/* Search Results */}
              {searchResult && searchResult.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Search Results ({searchResult.length} team{searchResult.length > 1 ? 's' : ''} found)
                  </label>

                  <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-container)] max-h-[300px] overflow-y-auto">
                    {searchResult.map((team, index) => (
                      <div
                        key={team._id || index}
                        onClick={() => handleTeamSelect(team)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-[var(--bg)] ${
                            index < searchResult.length - 1 ? 'border-b border-[var(--border)]' : ''
                        }`}
                      >
                        <div
                            className="flex items-center gap-3">
                          <div className="bg-[var(--border)] rounded-full p-2 flex items-center justify-center">
                            <Users size={16} className="text-[var(--text-light)]" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-[var(--text)] mb-1">
                              {team.name}
                            </div>
                            <div className="text-xs text-[var(--text-light)]">
                              {team.members?.length || 0} members • Created by {team.creator?.name || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </div>

                    ))}

                  </div>
                </div>
              )}
            </>
          )}

          {/* Password Step */}
          {currentStep === 'enteringPassword' && selectedTeam && (
            <>
              {/* Selected Team Info */}
              <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg)]">
                <div
                    className="p-4 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[var(--border)] rounded-full p-2 flex items-center justify-center">
                      <Users size={16} className="text-[var(--text-light)]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[var(--text)] mb-1">
                        {selectedTeam.name}
                      </div>
                      <div className="text-xs text-[var(--text-light)]">
                        {selectedTeam.members?.length || 0} members • Created by {searchResult.creator?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Team Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-[var(--bg-container)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) {
                      setErrorMessage('');
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter the team password"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          {currentStep === 'enteringPassword' && (
          <button
            onClick={handleJoinTeam}
            disabled={isLoading || !password.trim()}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isLoading || !password.trim()
                ? 'bg-[var(--border)] text-[var(--text-light)] cursor-not-allowed'
                : 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white'
            }`}
            >
              {isLoading ? 'Joining...' : 'Join Team'}
              </button>
          )}
        </div>
      </div>
    </div>
  );
}

=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {X, Search, Users, Lock, ArrowLeft, AlertCircle} from 'lucide-react';
import {checkMembership, joinTeam, searchTeams} from "../../../services/teams";
import toast from 'react-hot-toast';


function JoinTeamModal({onCloseJoin, onTeamJoined, setIsJoiningTeam}) {
  const [currentStep, setCurrentStep] = useState('searching'); // 'searching', 'enteringPassword', 'alreadyJoined'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  // const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = async () => {
    if (isLoading) {
      return;
    }

    if (!searchTerm.trim()) {
      // setSearchResult({ error: 'Please enter a team name to search.' });
      setErrorMessage('Please enter a team name to search.');
      setSearchResult([]);
      return;
    }

    setIsLoading(true);
    setIsJoiningTeam(true);
    try {
      const result = await searchTeams(searchTerm);
      console.log(result);
      setSearchResult(result || []);

      result.length === 0 ? setErrorMessage('No teams found.') : setErrorMessage('');
      // setErrorMessage('');
    } catch (error) {
      console.log(error);
      // setSearchResult({ error: error.message });
      setErrorMessage(error.message);
      setSearchResult([]);
    } finally {
      setIsLoading(false);
      setIsJoiningTeam(false);
    }
  };

  const handleTeamSelect = async (team) => {
    if (isLoading) {
      return;
    }

    setSelectedTeam(team);
    // setCurrentStep('enteringPassword');
    setErrorMessage('');
    setIsLoading(true);

    try {
      const isMember = await checkMembership(team._id);

      console.log(isMember);

      if (isMember) {
        toast.success(`Already joined "${team.name}".`);
        onCloseJoin();
        navigate(`/dashboard/metrics`);
      } else {
        setCurrentStep('enteringPassword');
      }
    } catch (error) {
      console.error('Error checking membership:', error);
      setErrorMessage('Failed to check team membership. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!password.trim()) {
      setErrorMessage('Please enter the team password.');
      return;
    }

    const loadingToast = toast.loading('Joining team...');
    setIsLoading(true);
    setErrorMessage('');

    try {
      const joinedTeam = await joinTeam(selectedTeam.name, password);

      console.log("joined team", joinedTeam);

      setTimeout(() => {
        toast.success(`Successfully joined "${selectedTeam.name}"!`, { id: loadingToast });
        // onCloseJoin(); callback will do this

        onTeamJoined();
      }, 0);
      // onJoinSuccess?.(selectedTeam.name);

    } catch (error) {
      console.log(error);
      setErrorMessage(error.message || 'Failed to join team');

      toast.error('Something went wrong.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setCurrentStep('searching');
    setSelectedTeam(null);
    setPassword('');
    setErrorMessage('');
  };

  const modalRef = React.useRef(null);
  const closeModal = (e) => {
    if(e.target === modalRef.current) {
      onCloseJoin();
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (currentStep === 'searching' && searchTerm.trim()) {
        handleSearch().catch(console.error);
      } else if (currentStep === 'enteringPassword' && password.trim()) {
        handleJoinTeam().catch(console.error);
      }
    }
  }

  return (
    <div
      ref={modalRef} onClick={closeModal}
      className="fixed inset-0 z-[10000] bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex justify-center items-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg-container)] rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] w-full max-w-[28rem] z-[10001] border border-[var(--border)]"
      >
        {/* header */}
        <div className="px-6 pt-6 pb-0 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {currentStep === 'enteringPassword' && (
                <button
                  onClick={handleBackToSearch}
                  className="bg-transparent border-none rounded-md p-2 cursor-pointer text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <div className="w-8 h-8 flex items-center justify-center">
                {currentStep === 'searching' ? (
                    <Search size={18} className="text-[var(--primary)]" />
                ) : (
                    <Lock size={18} className="text-[var(--primary)]" />
                )}
              </div>
              <h2 className="text-lg font-medium text-[var(--text)]">
                {currentStep === 'searching' ? 'Find a Team' : 'Join a Team'}
              </h2>
            </div>
            <button className="bg-transparent border-none rounded-md p-2 cursor-pointer text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all mr-1"
              onClick={onCloseJoin}
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-[var(--text-light)] mb-0 pb-4 text-left ml-1">
            {currentStep === 'searching'
              ? 'Search for the team you want to join'
              : `Enter the password to join "${selectedTeam?.name}"`
            }
          </p>
        </div>

        {/* body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Error Message */}
          {errorMessage && (
            <div className="flex gap-1 items-center px-1 py-1">
              <AlertCircle size={16} className="text-[var(--secondary)] flex-shrink-0 mt-0.5" />
              <div className="text-[var(--secondary)] mt-0.5">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Search Step */}
          {currentStep === 'searching' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Team Name
                </label>
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    className="flex-1 min-w-0 px-3 py-2 bg-[var(--bg-container)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if(searchResult) {
                        setSearchResult(null);
                      }
                      if (errorMessage) {
                        setErrorMessage('');
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter team name to search"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isLoading || !searchTerm.trim()}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      isLoading || !searchTerm.trim()
                        ? 'bg-[var(--border)] text-[var(--text-light)] cursor-not-allowed'
                        : 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white'
                      }`}
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>


              {/* Search Results */}
              {searchResult && searchResult.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Search Results ({searchResult.length} team{searchResult.length > 1 ? 's' : ''} found)
                  </label>

                  <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-container)] max-h-[300px] overflow-y-auto">
                    {searchResult.map((team, index) => (
                      <div
                        key={team._id || index}
                        onClick={() => handleTeamSelect(team)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-[var(--bg)] ${
                            index < searchResult.length - 1 ? 'border-b border-[var(--border)]' : ''
                        }`}
                      >
                        <div
                            className="flex items-center gap-3">
                          <div className="bg-[var(--border)] rounded-full p-2 flex items-center justify-center">
                            <Users size={16} className="text-[var(--text-light)]" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-[var(--text)] mb-1">
                              {team.name}
                            </div>
                            <div className="text-xs text-[var(--text-light)]">
                              {team.members?.length || 0} members • Created by {team.creator?.name || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </div>

                    ))}

                  </div>
                </div>
              )}
            </>
          )}

          {/* Password Step */}
          {currentStep === 'enteringPassword' && selectedTeam && (
            <>
              {/* Selected Team Info */}
              <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg)]">
                <div
                    className="p-4 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[var(--border)] rounded-full p-2 flex items-center justify-center">
                      <Users size={16} className="text-[var(--text-light)]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[var(--text)] mb-1">
                        {selectedTeam.name}
                      </div>
                      <div className="text-xs text-[var(--text-light)]">
                        {selectedTeam.members?.length || 0} members • Created by {searchResult.creator?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Team Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-[var(--bg-container)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) {
                      setErrorMessage('');
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter the team password"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          {currentStep === 'enteringPassword' && (
          <button
            onClick={handleJoinTeam}
            disabled={isLoading || !password.trim()}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isLoading || !password.trim()
                ? 'bg-[var(--border)] text-[var(--text-light)] cursor-not-allowed'
                : 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white'
            }`}
            >
              {isLoading ? 'Joining...' : 'Join Team'}
              </button>
          )}
        </div>
      </div>
    </div>
  );
}

>>>>>>> dev
export default JoinTeamModal;