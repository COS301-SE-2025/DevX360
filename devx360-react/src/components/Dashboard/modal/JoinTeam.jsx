import React, { useState } from 'react';
import { X, Search, Users, Lock, ArrowLeft } from 'lucide-react';
import {joinTeam, searchTeam} from "../../../services/teams";
import toast from 'react-hot-toast';


function JoinTeamModal({onCloseJoin}) {
    const [currentStep, setCurrentStep] = useState('searching'); // 'searching', 'enteringPassword', 'alreadyJoined'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    // const [successMessage, setSuccessMessage] = useState('');

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchResult({ error: 'Please enter a team name to search.' });
            return;
        }

        setIsLoading(true);
        try {
            const result = await searchTeam(searchTerm);
            console.log(result);
            setSearchResult(result);
            setErrorMessage('');
        } catch (error) {
            console.log(error);
            // setSearchResult({ error: error.message });
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTeamSelect = (team) => {
        setSelectedTeam(team);
        setCurrentStep('enteringPassword');
        setErrorMessage('');
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

    const handleKeyPress = (e, action) => {
        if (e.key === 'Enter') {
            action();
        }
    };

    const modalRef = React.useRef(null);
    const closeModal = (e) => {
        if(e.target === modalRef.current) {
            onCloseJoin();
        }
    }


    return (
        <div
            ref={modalRef} onClick={closeModal}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 40,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    maxWidth: '28rem',
                    width: '100%',
                    zIndex: 50,
                    border: '1px solid #e5e7eb',
                }}
            >
                {/* header */}
                <div style={{
                    padding: '1.5rem 1.5rem 0 1.5rem',
                    borderBottom: '1px solid #f3f4f6',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {currentStep === 'enteringPassword' && (
                                <button
                                    onClick={handleBackToSearch}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        marginRight: '0.25rem',
                                    }}
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                            <div style={{
                                backgroundColor: '#3b82f6',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {currentStep === 'searching' ? (
                                    <Search size={18} color="white" />
                                ) : (
                                    <Lock size={18} color="white" />
                                )}
                            </div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#111827',
                            }}>
                                {currentStep === 'searching' ? 'Find Team' : 'Join Team'}
                            </h2>
                        </div>
                        <button className="btn-cancel"
                                onClick={onCloseJoin}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p style={{
                        margin: 0,
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        paddingBottom: '1rem',
                    }}>
                        {currentStep === 'searching'
                            ? 'Search for the team you want to join'
                            : `Enter the password to join "${selectedTeam?.name}"`
                        }
                    </p>
                </div>

                {/* Body */}
                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                }}>
                    {/* Error Message */}
                    {errorMessage && (
                        <div style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            color: '#dc2626',
                            fontSize: '0.875rem',
                        }}>
                            {errorMessage}
                        </div>
                    )}

                    {/* Search Step */}
                    {currentStep === 'searching' && (
                        <>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem',
                                }}>
                                    Team Name
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
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
                                        onKeyPress={(e) => handleKeyPress(e, handleSearch)}
                                        placeholder="Enter team name to search"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={isLoading || !searchTerm.trim()}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            backgroundColor: '#6366f1',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: isLoading || !searchTerm.trim() ? 'not-allowed' : 'pointer',
                                            opacity: isLoading || !searchTerm.trim() ? 0.6 : 1,
                                        }}
                                    >
                                        {isLoading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            </div>


                            {/* Search Results */}
                            {searchResult && (
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '0.5rem',
                                    }}>
                                        Search Results
                                    </label>

                                    <div style={{
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                    }}>
                                        {/*{searchResults.map((team, index) => (*/}
                                        <div
                                            // key={index}
                                            onClick={() => handleTeamSelect(searchResult.team)}
                                            style={{
                                                padding: '1rem',
                                                cursor: 'pointer',
                                                transition: 'backgroundColor 0.2s',
                                            }}
                                            // onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                            // onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Users size={16}  />
                                                <div>
                                                    <div style={{ fontWeight: '500', color: '#111827' }}>
                                                        {searchResult.team.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                        {searchResult.team.members?.length || 0} members • Created by {searchResult.team.creator.name || 'Unknown'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/*))}*/}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Password Step */}
                    {currentStep === 'enteringPassword' && selectedTeam && (
                        <>
                            {/* Selected Team Info */}
                            <div style={{
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '1rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Users size={18} />
                                    <div>
                                        <div style={{ fontWeight: '500', color: '#111827' }}>
                                            {selectedTeam.name}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                            {selectedTeam.members?.length ||0} members • Created by {selectedTeam.creator.name || 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem',
                                }}>
                                    Team Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errorMessage) {
                                            setErrorMessage('');
                                        }
                                    }}
                                    onKeyPress={(e) => handleKeyPress(e, handleJoinTeam)}
                                    placeholder="Enter the team password"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '0 1.5rem 1.5rem 1.5rem',
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'flex-end',
                }}>
                    {currentStep === 'enteringPassword' && (
                        <button
                            onClick={handleJoinTeam}
                            disabled={isLoading || !password.trim()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '8px',
                                backgroundColor: isLoading || !password.trim() ? '#9ca3af' : '#6366f1',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: isLoading || !password.trim() ? 'not-allowed' : 'pointer',
                            }}
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