import React, {useState, useEffect, useMemo, useCallback} from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Loader,
  SortAsc,
  SortDesc,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Search
} from "lucide-react";
import HeaderInfo from "../common/HeaderInfo";
import CreateTeamModal from "./modal/CreateTeam";
import JoinTeamModal from "./modal/JoinTeam";
import {getMyTeams} from "../../services/profile";
import ModalPortal from "./modal/ModalPortal";
import {deleteTeam} from "../../services/teams";
import DeleteConfirmationModal from "./modal/DeleteConfirmation";
import toast from "react-hot-toast";
import TeamInfo from './Team/TeamInfo';



// Pagination config
const TEAMS_PER_PAGE = 6;


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // Call parent retry function if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    // Handle async errors passed as props (existing functionality)
    if (this.props.error) {
      return (
          <div className="w-full">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load teams</h3>
              <p className="text-red-600 mb-6 max-w-md mx-auto">
                {this.props.error.message || 'Failed to load teams. Please check your connection and try again.'}
              </p>
              <button
                  onClick={this.props.onRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
      );
    }

    // Handle React render errors
    if (this.state.hasError) {
      return (
          <div className="w-full">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
              <p className="text-red-600 mb-6 max-w-md mx-auto">
                {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                    onClick={this.handleRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>

                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Refresh Page
                </button>
              </div>

              {/* Development mode error details */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm font-medium text-red-700 mb-2">
                      Technical Details (Development Only)
                    </summary>
                    <pre className="text-xs bg-red-100 p-4 rounded border overflow-auto max-h-40">
                  {this.state.error && this.state.error.toString()}
                      {this.state.errorInfo.componentStack}
                </pre>
                  </details>
              )}
            </div>
          </div>
      );
    }

    return this.props.children;
  }
}

//=============================================================FilterPill Component======================================
const FilterPill = ({ isActive, onClick, label }) => {
  return (
      <button
          onClick={onClick}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors duration-200 border ${
              isActive
                  ? 'bg-[var(--primary)]/10 text-[var(--primary-dark)] border-[var(--primary)]'
                  : 'bg-[var(--bg)] text-[var(--text-light)] border-[var(--border)] hover:bg-[var(--bg-container)]'
          }`}
      >
        {label}
      </button>
  );
};


//=============================================================Pagination Component======================================
const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-[var(--bg-container)] rounded-xl border border-[var(--border)]">
        <div className="text-sm text-[var(--text-light)]">
          Showing <span className="font-medium text-[var(--text)]">{startItem}</span> to{' '}
          <span className="font-medium text-[var(--text)]">{endItem}</span> of{' '}
          <span className="font-medium text-[var(--text)]">{totalItems}</span> teams
        </div>

        <div className="flex items-center gap-1">
          <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-light)] hover:bg-[var(--bg-container)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((page, index) => (
              <button
                  key={index}
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  disabled={page === '...'}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      page === currentPage
                          ? 'bg-[var(--primary)] text-white'
                          : page === '...'
                              ? 'text-[var(--text-light)] cursor-default'
                              : 'border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--bg-container)]'
                  }`}
              >
                {page}
              </button>
          ))}

          <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-light)] hover:bg-[var(--bg-container)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
  );
};

//=============================================================Sort Button Component======================================
const SortButton = ({ currentSort, sortKey, setSortBy, label }) => {
  const isActive = currentSort.startsWith(sortKey);
  const isAsc = isActive && currentSort.endsWith('_asc');

  const handleClick = () => {
    if (isActive) {
      setSortBy(`${sortKey}_${isAsc ? 'desc' : 'asc'}`);
    } else {
      setSortBy(`${sortKey}_asc`);
    }
  };

  return (
      <button
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors duration-200 border ${
              isActive
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]'
                  : 'bg-[var(--bg)] text-[var(--text-light)] border-[var(--border)] hover:bg-[var(--bg-container)]'
          }`}
      >
        <span>{label}</span>
        {isActive && (isAsc ? <SortAsc size={14} /> : <SortDesc size={14} />)}
      </button>
  );
};


function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const normalizeTeamData = (rawTeam) => {
  return {
    id: rawTeam.id,
    name: rawTeam.name || 'Unnamed Team',
    creator: rawTeam.creator || {_id: null, name: 'Unknown'},
    members: rawTeam.members || [],
    repositoryInfo: rawTeam.repositoryInfo || null,
    doraMetrics: {
      analysis_period: rawTeam.doraMetrics?.analysis_period || {
        start_date: null,
        end_date: null
      },
      deployment_frequency: rawTeam.doraMetrics?.deployment_frequency || {
        frequency_per_day: '0',
        total_deployments: '0',
        status: 'No deployments found'
      },
      lead_time: rawTeam.doraMetrics?.lead_time || {
        average_days: '0.00',
        min_days: '0.00',
        max_days: '0.00',
        total_prs_analyzed: '0',
        status: 'No pull requests analysed'
      },
      change_failure_rate: rawTeam.doraMetrics?.change_failure_rate || {
        failure_rate: '0.00%',
        deployment_failures: '0',
        total_deployments: '0'
      },
      mttr: rawTeam.doraMetrics?.mttr || {
        average_days: '0.00',
        total_incidents_analyzed: '0',
        status: 'No incidents analyzed'
      }
    }
  };
}

//=============================================================Team Component======================================
function Team() {
  const { currentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);

  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [teamToDelete, setTeamToDelete] = useState(null);
  // const [isDeleting, setIsDeleting] = useState(false);
  const [deletingTeamIds, setDeletingTeamIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search states
  // const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [filterOwnership, setFilterOwnership] = useState('all');

  const [searchInput, setSearchInput] = useState(''); // What user types
  const debouncedSearchTerm = useDebounce(searchInput, 300); // Actual search after 300ms delay

  const resetPagination = useCallback(() => {
    setCurrentPage(prev => prev === 1 ? prev : 1);
  }, []);

  const loadTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userTeams = await getMyTeams();
      const normalizedTeams = userTeams.map(normalizeTeamData);
      setTeams(normalizedTeams);
      resetPagination();
    } catch (error) {
      console.error('Error loading teams:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [resetPagination]);

  const handleCreateTeam = async () => {
    try {
      await loadTeams();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error refreshing teams:', error);
      setShowCreateModal(false);
    }
  };

  const handleJoinTeam = async () => {
    try {
      await loadTeams();
      setShowJoinModal(false);
    } catch (error) {
      console.error('Error refreshing teams:', error);
      setShowJoinModal(false);
    }
  };

  const handleDeleteTeam = (teamId, teamName) => {
    setTeamToDelete({ id: teamId, name: teamName });
    setShowDeleteModal(true);
  };

  const confirmDeleteTeam = async () => {
    if (!teamToDelete || deletingTeamIds.has(teamToDelete)) return;

    // setIsDeleting(true);
    setDeletingTeamIds(prev => new Set([...prev, teamToDelete.id]));
    try {
      await deleteTeam(teamToDelete.name, teamToDelete.id);
      await loadTeams();
      setShowDeleteModal(false);
      setTeamToDelete(null);
      toast.success(`Team ${teamToDelete.name} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team.');
    } finally {
      setDeletingTeamIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(teamToDelete.id);
        return newSet;
      });
      // setIsDeleting(false);
    }
  };

  const { paginatedTeams, totalPages, totalItems, filteredTeams } = useMemo(() => {
    console.log('Recalculating filtered teams...'); // You'll see this in console when it recalculates

    if (!teams || teams.length === 0) {
      return { paginatedTeams: [], totalPages: 0, totalItems: 0, filteredTeams: [] };
    }

    let filtered = teams.filter(team => {
      // USE debouncedSearchTerm here instead of searchTerm
      const matchesSearch = team.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          team.creator?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      let matchesOwnership = true;
      if (filterOwnership === 'owned') {
        matchesOwnership = team.creator?._id === currentUser?._id;
      } else if (filterOwnership === 'joined') {
        matchesOwnership = team.creator?._id !== currentUser?._id;
      }

      return matchesSearch && matchesOwnership;
    });

    // Sort teams
    filtered.sort((a, b) => {
      const [sortProperty, sortOrder] = sortBy.split('_');
      const modifier = sortOrder === 'desc' ? -1 : 1;

      switch (sortProperty) {
        case 'members':
          return ((a.members?.length || 0) - (b.members?.length || 0)) * modifier;
        default: // 'name'
          return (a.name || '').localeCompare(b.name || '') * modifier;
      }
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / TEAMS_PER_PAGE);

    // Get current page items
    const startIndex = (currentPage - 1) * TEAMS_PER_PAGE;
    const endIndex = startIndex + TEAMS_PER_PAGE;
    const paginatedTeams = filtered.slice(startIndex, endIndex);

    return { paginatedTeams, totalPages, totalItems, filteredTeams: filtered };
  }, [teams, debouncedSearchTerm, sortBy, filterOwnership, currentUser?._id, currentPage]);

  const clearFilters = () => {
    setSearchInput('');
    setSortBy('name_asc');
    setFilterOwnership('all');
    resetPagination();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const hasActiveFilters = searchTerm || sortBy !== 'name_asc' || filterOwnership !== 'all';
  const hasActiveFilters = debouncedSearchTerm || sortBy !== 'name_asc' || filterOwnership !== 'all';

  useEffect(() => {
    resetPagination();
  }, [debouncedSearchTerm, sortBy, filterOwnership, resetPagination]);

  useEffect(() => {
    if (currentUser?.avatar) {
      const avatarUrl = currentUser.avatar.startsWith('http')
          ? currentUser.avatar
          : `${process.env.REACT_APP_API_URL || 'http://localhost:5500'}${currentUser.avatar}`;
      setAvatar(avatarUrl);
    } else {
      setAvatar(defaultAvatar);
    }

    if (currentUser) {
      loadTeams()
    }
  }, [currentUser, loadTeams]);


  if (isLoading) {
    return (
        <div className="min-h-screen bg-[var(--bg)]">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-[var(--primary)] mx-auto mb-4"/>
              <p className="text-lg font-medium text-[var(--text)]">Loading teams...</p>
              <p className="text-sm text-[var(--text-light)] mt-2">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[var(--bg)]">
        {/* Header - Full width */}
        <header className="bg-[var(--bg-container)] shadow-sm border-b border-[var(--border)] sticky top-0 z-50">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-[var(--text)]">Your Teams</h1>
                <div className="h-6 w-px bg-[var(--border)]"></div>
                <p className="text-base text-[var(--text-light)]">Manage and monitor your development teams</p>
              </div>
              <HeaderInfo currentUser={currentUser} avatar={avatar} defaultAvatar={defaultAvatar} />
            </div>
          </div>
        </header>

        {/* Main content with proper padding */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <ErrorBoundary error={error} onRetry={() => loadTeams()}>
            <div className="mb-8">
              {/* Advanced Filter & Search Bar */}
              <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] p-6">
                <div className="flex flex-col gap-4">
                  {/* Top Row: Search and Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="w-full sm:flex-1 sm:max-w-md">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-light)]" />
                        <input
                            type="text"
                            placeholder="Search teams by name or creator..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--bg-container)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                          className="flex-1 sm:flex-none px-5 py-3 rounded-lg font-medium cursor-pointer transition-colors duration-200 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm sm:text-base"
                          onClick={() => setShowCreateModal(true)}
                      >
                        Create Team
                      </button>
                      <button
                          className="flex-1 sm:flex-none px-5 py-3 rounded-lg font-medium cursor-pointer transition-colors duration-200 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm sm:text-base"
                          onClick={() => setShowJoinModal(true)}
                      >
                        Join Team
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: Filter Pill Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Sort By Pill Buttons */}
                    <span className="text-sm font-medium text-[var(--text-light)] mr-1">Sort by:</span>

                    <SortButton
                        currentSort={sortBy}
                        sortKey="name"
                        setSortBy={setSortBy}
                        label="Name"
                    />
                    <SortButton
                        currentSort={sortBy}
                        sortKey="members"
                        setSortBy={setSortBy}
                        label="Members"
                    />

                    {/* Divider */}
                    <div className="h-4 w-px bg-[var(--border)]"></div>

                    {/* Filter By Pill Buttons */}
                    <span className="text-sm font-medium text-[var(--text-light)] mr-1">Show:</span>
                    <FilterPill
                        isActive={filterOwnership === 'all'}
                        onClick={() => setFilterOwnership('all')}
                        label="All Teams"
                    />
                    <FilterPill
                        isActive={filterOwnership === 'owned'}
                        onClick={() => setFilterOwnership('owned')}
                        label="My Teams"
                    />
                    <FilterPill
                        isActive={filterOwnership === 'joined'}
                        onClick={() => setFilterOwnership('joined')}
                        label="Joined"
                    />

                    {/* Clear Filters Button (Conditional) */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 text-[var(--text-light)] hover:bg-red-50 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                          Clear All
                        </button>
                    )}
                  </div>
                  {totalItems > 0 && totalPages > 0 && (
                      <div className="mt-3 pt-3 border-t border-[var(--border)]">
                        <p className="text-sm text-[var(--text-light)] ml-auto">
                          Showing <span className="font-medium text-[var(--text)]">{(currentPage - 1) * TEAMS_PER_PAGE + 1}</span> to{' '}
                          <span className="font-medium text-[var(--text)]">{Math.min(currentPage * TEAMS_PER_PAGE, totalItems)}</span> of{' '}
                          <span className="font-medium text-[var(--text)]">{totalItems}</span> teams
                          {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                        </p>
                      </div>
                  )}


                </div>
              </div>
            </div>

            {/* Team content */}
            <div className="mb-8">
              <TeamInfo
                  teams={paginatedTeams}
                  currentUser={currentUser}
                  onDeleteTeam={handleDeleteTeam}
                  deletingTeamIds={deletingTeamIds}
              />
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={TEAMS_PER_PAGE}
                onPageChange={handlePageChange}
            />
          </ErrorBoundary>
        </main>

        {/* Modals */}
        <ModalPortal isOpen={showCreateModal}>
          <CreateTeamModal
              onCloseCreate={() => setShowCreateModal(false)}
              onTeamCreated={handleCreateTeam}
          />
        </ModalPortal>

        <ModalPortal isOpen={showJoinModal}>
          <JoinTeamModal
              onCloseJoin={() => setShowJoinModal(false)}
              onTeamJoined={handleJoinTeam}
          />
        </ModalPortal>

        <ModalPortal isOpen={showDeleteModal}>
          <DeleteConfirmationModal
              type="team"
              name={teamToDelete?.name}
              onConfirm={confirmDeleteTeam}
              onCloseDelete={() => setShowDeleteModal(false)}
              isDeleting={deletingTeamIds.has(teamToDelete?.id)}
          />
        </ModalPortal>
      </div>
  );
}

export default Team;