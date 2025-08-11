import React, {useState} from "react";
import { X, Github, Users, Lock, AlertCircle, TriangleAlert } from 'lucide-react';
import {createTeam} from "../../../services/teams";
import toast from 'react-hot-toast';


const CustomToast = () => { //place here for now
    return (
        <div style={{
            background: 'var(--bg-container)',
            color: 'var(--text)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'

        }}>
            <TriangleAlert size={16} color="var(--primary" style={{ flexShrink: 0 }} />
            <span>Team created, but repository analysis failed!</span>
        </div>
    );
};


function CreateTeamModal({onCloseCreate}) {
    const [teamName, setTeamName] = useState('');
    const [teamPassword, setTeamPassword] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const modalRef = React.useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    // const [successMessage, setSuccessMessage] = useState('');
    // const [errorMessage, setErrorMessage] = useState('');

    const [nameError, setNameError] = useState('');
    const [urlError, setUrlError] = useState('');

    const isFormValid = teamName.trim() && repoUrl.trim() && teamPassword.trim();


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


    const showCustomToast = () => {
        toast.custom(<CustomToast />,  {
            duration: 6000
        });

    };

    const clearErrors = () => {
        setNameError('');
        setUrlError('');
    }

    const handleCreateTeam = async () => {
        // Validate GitHub URL format
        if (!repoUrl.startsWith('https://github.com/')) {
            setUrlError('Please enter a valid GitHub repository URL');
            return;
        }

        const loadingToast = toast.loading('Creating team...');


        setIsLoading(true);
        clearErrors();

        try {
            await createTeam(teamName, teamPassword, repoUrl);
            toast.success(`Team "${teamName}" created successfully!`, { id: loadingToast });

            setTeamName('');
            setTeamPassword('');
            setRepoUrl('');

            onCloseCreate();

        } catch (error) {
            console.log(error);

            if (error.message.includes('exists')) {
                setNameError(error.message || 'Failed to create team');
                toast.error('Failed to create team', { id: loadingToast });
            } else if (error.message.includes('Repository')) {
                toast.dismiss(loadingToast);
                showCustomToast();                // onCloseCreate();
                onCloseCreate();
            }
        }
        finally {
            setIsLoading(false);
        }
    };


    return (
        <div ref={modalRef} onClick={closeModal} className="modal-section">

            <div
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                className="modal"
                tabIndex={-1}
            >

                {/* header */}
                <div className="modal-header" >
                    <div className="modal-header-content">
                        <div className="modal-info">
                            <div className="metric-icon"
                                style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            >
                                <Users size={18} className="social-icon" />
                            </div>
                            <h2
                                style={{
                                margin: 0,
                                fontSize: '1.25rem',
                                fontWeight: '600',
                            }}
                            >
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
                <div className="modal-body"
                >
                    {/* Team Name Field */}
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label className="form-label"
                        >
                            Team Name *
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={teamName}
                            onChange={(e) => {
                                setTeamName(e.target.value);
                                clearErrors()
                            }}
                            placeholder="Enter team name"
                        />

                        {nameError && (
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
                                        {nameError}
                                    </div>
                                </div>
                        )}

                    </div>

                    {/* GitHub Repository Field */}
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label className="form-label"
                            style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                        >
                            <Github size={16} />
                            GitHub Repository URL *
                        </label>
                        <input
                            type="url"
                            className="form-input"
                            value={repoUrl}
                            onChange={(e) => {
                                setRepoUrl(e.target.value)
                                clearErrors()
                            }}
                            placeholder="https://github.com/username/repository"
                        />

                        {urlError && (
                                <div className="error-message"
                                   style={{display: 'flex',
                                       gap: '0.25rem',
                                       alignItems: 'center',
                                       padding: '0.3rem',}}
                                >
                                    <AlertCircle size={16} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                                    <div style={{
                                        color: 'var(--secondary)',
                                        fontSize: '0.75rem',
                                        marginTop: '0.125rem',
                                    }}>
                                        {urlError}
                                    </div>
                                </div>
                        )}

                        <p
                            style={{
                            margin: '0.5rem 0 0 0',
                            fontSize: '0.75rem',
                                textAlign: 'left',
                            color: '#6b7280',
                        }}
                        >
                            This will be used to collect data for DORA metrics.
                        </p>
                    </div>

                    {/* Team Password Field */}
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label className="form-label"
                            style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                        >
                            <Lock size={16} />
                            Team Password *
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            value={teamPassword}
                            onChange={(e) => setTeamPassword(e.target.value)}
                            placeholder="Create a secure password"
                        />
                        <p style={{
                            margin: '0.5rem 0 0 0',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                        }}>
                            Team members will need this password to join and view metrics.
                        </p>
                    </div>

                    {/* Info Box */}
                    <div
                        className="info-box"
                    >
                        <AlertCircle size={16} className="info-alert-icon" />
                        <div className="info-alert-content">
                            <p
                                className="info-alert-title"
                            >
                                Getting Started
                            </p>
                            <p className="info-alert-text">
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
                        className="btn btn-secondary edit-actions-btn"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateTeam}
                        disabled={!teamName || !repoUrl || !teamPassword}
                        style={{

                            width: "auto",
                            cursor: !teamName.trim() || !repoUrl || !teamPassword.trim() ? 'not-allowed' : 'pointer',
                            opacity: !teamName.trim() || !repoUrl || !teamPassword.trim() ? 0.6 : 1,
                        }}
                        className={`btn ${!teamName.trim() || !repoUrl || !teamPassword.trim() ? 'btn-secondary' : 'btn-primary'}`}
                    >
                        {isLoading ? ( 'Creating...') : 'Create Team'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateTeamModal;