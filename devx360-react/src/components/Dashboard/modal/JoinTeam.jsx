import React, { useState } from 'react';
import {X, Search, Users, Lock, ArrowLeft, AlertCircle} from 'lucide-react';
import {checkMembership, joinTeam, searchTeams} from "../../../services/teams";
import toast from 'react-hot-toast';


function JoinTeamModal({onCloseJoin}) {
    const [currentStep, setCurrentStep] = useState('searching'); // 'searching', 'enteringPassword', 'alreadyJoined'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
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
                //change to redirect TODO
                onCloseJoin();
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
            await joinTeam(selectedTeam.name, password);
            // toast.success(`Successfully joined team "${selectedTeam.name}"!`, { id: loadingToast });

            setTimeout(() => {
                // toast.success(`Team "${teamName}" created successfully!`, { id: loadingToast });
                toast.success(`Successfully joined "${selectedTeam.name}"!`, { id: loadingToast });
                onCloseJoin();
            }, 0);
            // onJoinSuccess?.(selectedTeam.name);
            //add toast

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
            className="modal-section"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="modal"
            >
                {/* header */}
                <div className="modal-header">
                    <div className="modal-header-content">
                        <div className="modal-info">
                            {currentStep === 'enteringPassword' && (
                                <button
                                    onClick={handleBackToSearch}
                                    className="btn-cancel"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                            <div className="metric-icon"
                                style={{display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                {currentStep === 'searching' ? (
                                    <Search size={18} className="social-icon" />
                                ) : (
                                    <Lock size={18} className="social-icon" />
                                )}
                            </div>
                            <h2 className="metric-title">
                                {currentStep === 'searching' ? 'Find a Team' : 'Join a Team'}
                            </h2>
                        </div>
                        <button className="btn-cancel"
                                onClick={onCloseJoin}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="tagline" style={{margin: 0, paddingBottom: '1rem', textAlign: 'left', marginLeft: '0.3em'}}>
                        {currentStep === 'searching'
                            ? 'Search for the team you want to join'
                            : `Enter the password to join "${selectedTeam?.name}"`
                        }
                    </p>
                </div>



                {/* Body */}
                <div className="modal-body">
                    {/* Error Message */}
                    {errorMessage && (
                            <div className="error-message"
                                 style={{display: 'flex',
                                     gap: '0.25rem',
                                     alignItems: 'center',
                                     padding: '0.3rem',
                                 }}
                            >
                                <AlertCircle size={16} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                                <div style={{
                                    color: 'var(--secondary)',
                                    // fontSize: '0.75rem',
                                    marginTop: '0.125rem',
                                }}>
                                    {errorMessage}
                                </div>
                            </div>
                    )}

                    {/* Search Step */}
                    {currentStep === 'searching' && (
                        <>
                            <div>
                                <label className="form-label">
                                    Team Name
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}
                                    className="search-input-group"
                                >
                                    <input
                                        type="text"
                                        className="form-input"
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
                                        // onKeyPress={(e) => handleKeyPress(e, handleSearch)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Enter team name to search"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={isLoading || !searchTerm.trim()}
                                        style={{
                                        //     padding: '0.75rem 1rem',
                                        //     backgroundColor: '#6366f1',
                                        //     color: 'white',
                                        //     border: 'none',
                                        //     borderRadius: '8px',
                                            width: "auto",
                                            cursor: isLoading || !searchTerm.trim() ? 'not-allowed' : 'pointer',
                                            opacity: isLoading || !searchTerm.trim() ? 0.6 : 1,
                                        }}

                                        className={`btn ${isLoading || !searchTerm.trim() ? 'btn-secondary' : 'btn-primary'}`}
                                    >
                                        {isLoading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            </div>


                            {/* Search Results */}
                            {searchResult && searchResult.length > 0 && (
                                <div className="form-group">
                                    <label className="form-label">
                                        Search Results ({searchResult.length} team{searchResult.length > 1 ? 's' : ''} found)
                                    </label>

                                    <div className="search-results-container" style={{
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        backgroundColor: 'var(--bg-container)',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                    }}>
                                        {searchResult.map((team, index) => (
                                         <div
                                                key={team._id || index}
                                                onClick={() => handleTeamSelect(team)}
                                                style={{
                                                    padding: '1rem',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s ease',
                                                    borderBottom: index < searchResult.length - 1 ? '1px solid var(--border)' : 'none'
                                                }}
                                                className="team-search-item"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'var(--bg)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                         >
                                             <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px'
                                                }}>
                                                <div style={{
                                                    backgroundColor: 'var(--border)',
                                                    borderRadius: '50%',
                                                    padding: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Users size={16} color="var(--text-light)" />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontWeight: '500',
                                                        color: 'var(--text)',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {/*{searchResult.team.name}*/}
                                                        {team.name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--text-light)'
                                                    }}>
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
                            <div className="search-results-container" style={{
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: 'var(--bg)'
                            }}>
                                <div
                                    // onClick={() => handleTeamSelect(searchResult.team)}
                                    style={{
                                        padding: '1rem',
                                        transition: 'background-color 0.2s ease',
                                        borderRadius: '8px'
                                    }}
                                    className="team-search-item"
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            backgroundColor: 'var(--border)',
                                            borderRadius: '50%',
                                            padding: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Users size={16} color="var(--text-light)" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: '500',
                                                color: 'var(--text)',
                                                marginBottom: '4px'
                                            }}>
                                                {selectedTeam.name}
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-light)'
                                            }}>
                                                {selectedTeam.members?.length || 0} members • Created by {searchResult.creator?.name || 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Password Input */}
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                    }}>
                                    Team Password
                                </label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errorMessage) {
                                            setErrorMessage('');
                                        }
                                    }}
                                    // onKeyPress={(e) => handleKeyPress(e, handleJoinTeam)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter the team password"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                    padding: '0 1.5rem 1.5rem 1.5rem',
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'flex-end',
                }}

                    // className="edit-actions"
                >
                    {currentStep === 'enteringPassword' && (
                        <button
                            onClick={handleJoinTeam}
                            disabled={isLoading || !password.trim()}
                            style={{

                                width: "auto",
                                cursor: isLoading || !password.trim() ? 'not-allowed' : 'pointer',
                                opacity: isLoading || !password.trim() ? 0.6 : 1,
                            }}
                            className={`btn ${isLoading || !password.trim() ? 'btn-secondary' : 'btn-primary'}`}
                        >
                            {isLoading ? 'Joining...' : 'Join Team'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JoinTeamModal;