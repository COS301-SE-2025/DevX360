import React, {useState} from "react";
import { X, Github, Users, Lock, AlertCircle, TriangleAlert } from 'lucide-react';
import {createTeam} from "../../../services/teams";
import toast from 'react-hot-toast';

const CustomToast = () => { //place here for now
    return (
        <div style={{ background: '#333', color: '#fff', padding: '16px', borderRadius: '8px' }}>
            <TriangleAlert size={16} color="#fff" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <span>This is a custom toast!</span>
        </div>
    );
};


function CreateTeamModal({onCloseCreate}) {
    const [teamName, setTeamName] = useState('');
    const [teamPassword, setTeamPassword] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const modalRef = React.useRef(null);

    // const [isLoading, setIsLoading] = useState(false);
    // const [successMessage, setSuccessMessage] = useState('');
    // const [errorMessage, setErrorMessage] = useState('');

    const [nameError, setNameError] = useState('');
    const [urlError, setUrlError] = useState('');


    const closeModal = (e) => {
        if(e.target === modalRef.current) {
            onCloseCreate();
        }
    }

    const showCustomToast = () => {
        toast.custom(<CustomToast />);
    };

    const handleCreateTeam = async () => {
        // if (!teamName || !teamPassword || !repoUrl) {
        //     setErrorMessage('Please fill in all fields');
        //     return;
        // }

        // Validate GitHub URL format
        if (!repoUrl.startsWith('https://github.com/')) {
            setUrlError('Please enter a valid GitHub repository URL');
            return;
        }

        const loadingToast = toast.loading('Creating team...');


        // setIsLoading(true);
        // setErrorMessage('');
        setNameError('');
        setUrlError('');

        try {
            const result = await createTeam(teamName, teamPassword, repoUrl);
            console.log(result);
            // setSuccessMessage(`Team "${teamName}" created successfully!`);
            toast.success(`Team "${teamName}" created successfully!`, { id: loadingToast });
            // setTimeout(() => {
            //     toast.success(`Team "${teamName}" created successfully!`, { id: loadingToast });
            // }, 0);

            setTeamName('');
            setTeamPassword('');
            setRepoUrl('');

            onCloseCreate();
            // Clear success message after 5 seconds
            // setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            console.log(error);
            // setErrorMessage(error.message || 'Failed to create team');

            if (error.message.includes('exists')) {
                setNameError(error.message || 'Failed to create team');
                toast.error('Failed to create team', { id: loadingToast });
            }

            if (error.message.includes('Repository')) {
                // setUrlError(error.message || 'Repository analysis failed.');
                // toast.success(`Team "${teamName}" created!`, { id: loadingToast });
                // toast.error("Repository connection failed - check accessibility", {
                //     duration: 6000
                // });

                // toast.custom(
                //     "Team created, but repository connection failed - check accessibility", {
                //     duration: 6000,
                //     style: {
                //         backgroundColor: '#f87171',
                //         color: 'white',
                //         padding: '1rem',
                //         borderRadius: '8px',
                //         fontSize: '0.875rem',
                //     },
                //     iconTheme: {
                //         primary: '#ef4444',
                //         secondary: '#fff',
                //     },
                // }
                // )

                showCustomToast();
                onCloseCreate();
            }
        }
        // finally {
        //     setIsLoading(false);
        // }
    };


    return (
        <div ref={modalRef} onClick={closeModal} style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',

            flexDirection: 'column',
        }}>
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
                            <div style={{
                                // backgroundColor: '#3b82f6',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Users size={18} color="black" />
                            </div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#111827',
                            }}>
                                Create New Team
                            </h2>
                        </div>
                        <button className="btn-cancel"
                                aria-label="Close"
                                onClick={onCloseCreate}
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
                        Set up a new team to start tracking DORA metrics and developer performance.
                    </p>
                </div>

                {/* body */}
                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                }}>
                    {/* Team Name Field */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem',
                        }}>
                            Team Name *
                        </label>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => {
                                setTeamName(e.target.value);
                                if (nameError) {
                                    setNameError('');
                                }
                            }}
                            placeholder="Enter team name"
                        />

                        {nameError && (
                            <>
                                <div className="error-message" style={{display: 'flex',
                                    gap: '0.25rem',
                                    alignItems: 'center',
                                    padding: '0.3rem',}} >
                                    <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                                    <div style={{
                                        color: '#ef4444',
                                        fontSize: '0.75rem',
                                        marginTop: '0.125rem',
                                    }}>
                                        {nameError}
                                    </div>
                                </div>

                            </>
                        )}

                    </div>

                    {/* GitHub Repository Field */}
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem',
                        }}>
                            <Github size={16} />
                            GitHub Repository URL *
                        </label>
                        <input
                            type="url"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            placeholder="https://github.com/username/repository"
                        />

                        {urlError && (
                            <>
                                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                                <div style={{
                                    color: '#ef4444',
                                    fontSize: '0.75rem',
                                    marginTop: '0.125rem',
                                }}>
                                    {urlError}
                                </div>
                            </>
                        )}

                        <p style={{
                            margin: '0.25rem 0 0 0',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                        }}>
                            This will be used to collect data for DORA metrics.
                        </p>
                    </div>

                    {/* Team Password Field */}
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem',
                        }}>
                            <Lock size={16} />
                            Team Password *
                        </label>
                        <input
                            type="password"
                            value={teamPassword}
                            onChange={(e) => setTeamPassword(e.target.value)}
                            placeholder="Create a secure password"
                        />
                        <p style={{
                            margin: '0.25rem 0 0 0',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                        }}>
                            Team members will need this password to join and view metrics.
                        </p>
                    </div>

                    {/* Info Box */}
                    <div style={{
                        backgroundColor: '#818cf8',
                        border: '1px solid #dbeafe',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        display: 'flex',
                        gap: '0.5rem',
                    }}>
                        <AlertCircle size={16} color="white" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                        <div>
                            <p style={{
                                margin: '0 0 0.25rem 0',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: 'white',
                            }}>
                                Getting Started
                            </p>
                            <p style={{
                                margin: 0,
                                fontSize: '0.75rem',
                                color: 'white',
                                lineHeight: '1.4',
                            }}>
                                Once created, your team will start collecting DORA metrics automatically.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '0 1.5rem 1.5rem 1.5rem',
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'flex-end',
                }}>
                    <button
                        onClick={onCloseCreate}
                        style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!teamName || !repoUrl || !teamPassword}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: teamName && repoUrl && teamPassword ? '#6366f1' : '#9ca3af',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: teamName && repoUrl && teamPassword ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (teamName && repoUrl && teamPassword) {
                                e.target.style.backgroundColor = '#4f46e5';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (teamName && repoUrl && teamPassword) {
                                e.target.style.backgroundColor = '#6366f1';
                            }
                        }}

                        onClick={handleCreateTeam}
                    >
                        Create Team
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateTeamModal;