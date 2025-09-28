import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  Users,
  UserCog,
  Loader,
  Edit,
  Trash2,
  Eye,
  Search,
  Mail,
  Github,
  Ban,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Shield,
  MapPin,
  Monitor,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {getUsers, deleteUser, getTeams, getUserAvatarUrl, anomalies, getAnomalies} from "../../services/admin";
import {deleteTeam} from "../../services/teams";
import HeaderInfo from "../common/HeaderInfo";
import WarningToast from "../common/WarningToast";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "./modal/DeleteConfirmation";
import ModalPortal from "./modal/ModalPortal";
import {useNavigate} from "react-router-dom";
import {useAvatar} from "../../hooks/useAvatar";
import AdminPagination from "./Admin/Pagination";
import SecurityAnomaliesComponent from "./Admin/Anomalies";


const defaultAvatar = '/default-avatar.png';


function Admin() {
  const { currentUser } = useAuth();
  const avatarUrl = useAvatar();


  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [usersPage, setUsersPage] = useState(1);
  const [teamsPage, setTeamsPage] = useState(1);
  const [pageSize] = useState(10);
  const [usersTotal, setUsersTotal] = useState(null);
  const [teamsTotal, setTeamsTotal] = useState(null);

  const resetUsersPagination = useCallback(() => {
    setUsersPage(prev => prev === 1 ? prev : 1);
  }, []);

  const resetTeamsPagination = useCallback(() => {
    setTeamsPage(prev => prev === 1 ? prev : 1);
  }, []);

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  const [userSortField, setUserSortField] = useState('name');
  const [userSortDirection, setUserSortDirection] = useState('asc');

  const [teamSortField, setTeamSortField] = useState('name');
  const [teamSortDirection, setTeamSortDirection] = useState('asc');

  const [userToDelete, setUserToDelete] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [anomalies, setAnomalies] = useState([]);
  const [anomaliesPage, setAnomaliesPage] = useState(1);
  const [anomalySortField, setAnomalySortField] = useState('timestamp');
  const [anomalySortDirection, setAnomalySortDirection] = useState('desc');
  const [anomalyFilterType, setAnomalyFilterType] = useState('all');
  const [showFullIPs, setShowFullIPs] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // console.log(users);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersData, teamsData, anomaliesData] = await Promise.all([
        getUsers(),
        getTeams(),
        getAnomalies()
      ]);
      setUsers(usersData);
      setTeams(teamsData);
      setAnomalies(anomaliesData);

      setUsersTotal(usersData?.length ?? 0);
      setTeamsTotal(teamsData?.length ?? 0);
    } catch (err) {
      console.log('Error fetching data:', JSON.stringify(err, null, 2));
      if (err.message.includes('429')) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else if (err.message.includes('SyntaxError')) {
        setError('There was an issue processing the server response.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTeams = async (page = teamsPage) => {
    try {
      const teamsList = await getTeams()
      setTeams(teamsList);
      setTeamsTotal(teamsList?.length ?? 0);
    } catch (error) {
      console.error('Error refreshing teams:', error);
    }
  }

  const refreshUsers = async () => {
    try {
      const userList = await getUsers();
      setUsers(userList);
      setUsersTotal(userList?.length ?? 0);
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  }

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let relative;
    if (diffMin < 1) relative = 'Just now';
    else if (diffMin < 60) relative = `${diffMin} min${diffMin !== 1 ? 's' : ''} ago`;
    else if (diffHr < 24) relative = `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
    else if (diffDay < 7) relative = `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    else relative = null;

    const absolute = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return relative ? `${relative} (${absolute})` : absolute;
  };

  const handleEditUser = (userId) => toast.custom(<WarningToast message={"Implement"} />);

  const handleViewTeam = (teamId, teamName) => {
    navigate(`/dashboard/metrics`);
  };

  const handleDeleteUser = (name, userId, email) => {
    setUserToDelete({name: name, id: userId, email: email});
    setTeamToDelete(null);
    setShowDeleteModal(true);
  };

  const handleDeleteTeam = (teamId, teamName) => {
    setTeamToDelete({ id: teamId, name: teamName });
    setUserToDelete(null);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      await refreshUsers();

      toast.success(`User deleted successfully!`);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  }

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;

    // console.log('teamToDelete', teamToDelete);

    setIsDeletingTeam(true);
    try {
      await deleteTeam(teamToDelete.name, teamToDelete.id);
      await refreshTeams();

      toast.success(`Team ${teamToDelete.name} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team.');
    } finally {
      setIsDeletingTeam(false);
      setShowDeleteModal(false);
      setTeamToDelete(null);
    }
  };

  const handleUserSort = (field) => {
    if (userSortField === field) {
      setUserSortDirection(userSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortField(field);
      setUserSortDirection('asc');
    }
  };

  const handleTeamSort = (field) => {
    if (teamSortField === field) {
      setTeamSortDirection(teamSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setTeamSortField(field);
      setTeamSortDirection('asc');
    }
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let valueA, valueB;

      switch (userSortField) {
        case 'name':
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
          break;
        case 'email':
          valueA = a.email?.toLowerCase() || '';
          valueB = b.email?.toLowerCase() || '';
          break;
        case 'role':
          valueA = a.role?.toLowerCase() || '';
          valueB = b.role?.toLowerCase() || '';
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt || 0);
          valueB = new Date(b.createdAt || 0);
          break;
        case 'lastLogin':
          valueA = new Date(a.lastLogin || 0);
          valueB = new Date(b.lastLogin || 0);
          break;
        default:
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
      }

      if (userSortDirection === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  }, [users, userSortField, userSortDirection]);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      let valueA, valueB;

      switch (teamSortField) {
        case 'name':
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
          break;
        case 'creator':
          valueA = a.creator?.name?.toLowerCase() || '';
          valueB = b.creator?.name?.toLowerCase() || '';
          break;
        case 'members':
          valueA = a.members?.length || 0;
          valueB = b.members?.length || 0;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt || 0);
          valueB = new Date(b.createdAt || 0);
          break;
        default:
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
      }

      if (teamSortDirection === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  }, [teams, teamSortField, teamSortDirection]);

  const filteredUsers = useMemo(() => {
    return sortedUsers.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.githubUsername?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedUsers, searchTerm]);

  // Filter sorted teams
  const filteredTeams = useMemo(() => {
    return sortedTeams.filter(team =>
        team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedTeams, searchTerm]);

  const { pagedUsers, usersTotalPages } = useMemo(() => {
    const totalItems = filteredUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Fix pagination bounds
    const safePage = Math.min(usersPage, totalPages);
    const start = (safePage - 1) * pageSize;
    const pagedUsers = filteredUsers.slice(start, start + pageSize);

    return { pagedUsers, usersTotalPages: totalPages };
  }, [filteredUsers, usersPage, pageSize]);

  const { pagedTeams, teamsTotalPages } = useMemo(() => {
    const totalItems = filteredTeams.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Fix pagination bounds
    const safePage = Math.min(teamsPage, totalPages);
    const start = (safePage - 1) * pageSize;
    const pagedTeams = filteredTeams.slice(start, start + pageSize);

    return { pagedTeams, teamsTotalPages: totalPages };
  }, [filteredTeams, teamsPage, pageSize]);

  const sortedAnomalies = useMemo(() => {
    return [...anomalies].sort((a, b) => {
      let valueA, valueB;

      switch (anomalySortField) {
        case 'timestamp':
          valueA = new Date(a.timestamp || 0);
          valueB = new Date(b.timestamp || 0);
          break;
        case 'type':
          valueA = a.type?.toLowerCase() || '';
          valueB = b.type?.toLowerCase() || '';
          break;
        case 'email':
          valueA = a.email?.toLowerCase() || '';
          valueB = b.email?.toLowerCase() || '';
          break;
        default:
          valueA = new Date(a.timestamp || 0);
          valueB = new Date(b.timestamp || 0);
      }

      if (anomalySortDirection === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  }, [anomalies, anomalySortField, anomalySortDirection]);

  const filteredAnomalies = useMemo(() => {
    return sortedAnomalies.filter(anomaly => {
      const matchesSearch =
          (anomaly.email && anomaly.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          anomaly.ip?.includes(searchTerm) ||
          anomaly.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (anomaly.details?.reason && anomaly.details.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (anomaly.details?.endpoint && anomaly.details.endpoint.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = anomalyFilterType === 'all' || anomaly.type === anomalyFilterType;

      return matchesSearch && matchesType;
    });
  }, [sortedAnomalies, searchTerm, anomalyFilterType]);

  const { pagedAnomalies, anomaliesTotalPages } = useMemo(() => {
    const totalItems = filteredAnomalies.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const safePage = Math.min(anomaliesPage, totalPages);
    const start = (safePage - 1) * pageSize;
    const pagedAnomalies = filteredAnomalies.slice(start, start + pageSize);

    return { pagedAnomalies, anomaliesTotalPages: totalPages };
  }, [filteredAnomalies, anomaliesPage, pageSize]);

  const toggleRowExpansion = (anomalyId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(anomalyId)) {
        newSet.delete(anomalyId);
      } else {
        newSet.add(anomalyId);
      }
      return newSet;
    });
  };

  const handleAnomalySort = (field) => {
    if (anomalySortField === field) {
      setAnomalySortDirection(anomalySortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setAnomalySortField(field);
      setAnomalySortDirection('asc');
    }
  };

  const handleAnomaliesPageChange = (newPage) => {
    setAnomaliesPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAnomaliesPagination = useCallback(() => {
    setAnomaliesPage(prev => prev === 1 ? prev : 1);
  }, []);

  useEffect(() => {
    resetAnomaliesPagination();
  }, [searchTerm, anomalySortField, anomalySortDirection, anomalyFilterType, resetAnomaliesPagination]);

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'login_failure':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'brute_force':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'rate_limit':
        return <Monitor className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getAnomalyBadgeColor = (type) => {
    switch (type) {
      case 'login_failure':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'brute_force':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'rate_limit':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getEventDetails = (anomaly) => {
    switch (anomaly.type) {
      case 'login_failure':
        return anomaly.details?.reason || 'Invalid credentials';
      case 'brute_force':
        return `${anomaly.details?.attempts || 'Multiple'} failed attempts in ${anomaly.details?.timeframe || '15m'}`;
      case 'rate_limit':
        return `Rate limit exceeded on ${anomaly.details?.endpoint || 'endpoint'}`;
      default:
        return 'Security event detected';
    }
  };

  const formatDetailsForExpanded = (anomaly) => {
    switch (anomaly.type) {
      case 'login_failure':
        return `Reason: ${anomaly.details?.reason || 'Invalid credentials'}`;
      case 'brute_force':
        return `Attempts: ${anomaly.details?.attempts || 'Unknown'}\nTimeframe: ${anomaly.details?.timeframe || 'Unknown'}`;
      case 'rate_limit':
        return `Endpoint: ${anomaly.details?.endpoint || 'Unknown'}`;
      default:
        return anomaly.details ? JSON.stringify(anomaly.details, null, 2) : 'No additional details';
    }
  };

  const maskIP = (ip = false) => {
    if (showFullIPs) return ip;
    if (ip?.includes(':')) {
      return ip.split(':').slice(0, 2).join(':') + ':****:****:****:****';
    }
    return ip?.split('.').slice(0, 2).join('.') + '.***.***.';
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  console.log('anomalies', anomalies);

  useEffect(() => {
    setUsersPage(1);
    setTeamsPage(1);
  }, [searchTerm, userSortField, userSortDirection, teamSortField, teamSortDirection]);


  useEffect(() => {
    resetUsersPagination();
  }, [searchTerm, userSortField, userSortDirection, resetUsersPagination]);

  useEffect(() => {
    resetTeamsPagination();
  }, [searchTerm, teamSortField, teamSortDirection, resetTeamsPagination]);


  const handleUsersPageChange = (newPage) => {
    setUsersPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTeamsPageChange = (newPage) => {
    setTeamsPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  if (isLoading) {
    return (
        <div className="min-h-screen bg-[var(--bg)]">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-[var(--primary)] mx-auto mb-4"/>
              <p className="text-lg font-medium text-[var(--text)]">Loading admin dashboard...</p>
              <p className="text-sm text-[var(--text-light)] mt-2">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">{error}</h3>
          </div>
        </div>
    );
  }

  const SortableHeader = ({ field, currentField, direction, onClick, children }) => (
      <th
          className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg)] transition-colors"
          onClick={onClick}
      >
        <div className="flex items-center">
          {children}
          {currentField === field && (
              direction === 'asc' ?
                  <ChevronUp className="w-4 h-4 ml-1" /> :
                  <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </div>
      </th>
  );

  return (
      <div className="min-h-screen bg-[var(--bg)]">
        {/* Header */}
        <header className="bg-[var(--bg-container)] shadow-sm border-b border-[var(--border)] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h1 className="text-2xl font-bold text-[var(--text)]">Admin Dashboard</h1>
                <div className="h-6 w-px bg-[var(--border)]"></div>
                <p className="text-[var(--text-light)]">Manage users and teams</p>
              </div>
              <HeaderInfo currentUser={currentUser} avatar={avatarUrl} defaultAvatar={defaultAvatar} />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Search Section */}
          <div className="mb-8">
            <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text)] mb-1">
                    {activeTab === 'users' ? 'User Management' :
                        activeTab === 'teams' ? 'Team Management' :
                            'Security Management'}
                  </h2>
                  <p className="text-sm text-[var(--text-light)]">
                    {activeTab === 'users'
                        ? 'View and manage all registered users'
                        : activeTab === 'teams'
                            ? 'Monitor and manage development teams'
                            : 'Monitor security events and anomalies'
                    }
                  </p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-light)] w-5 h-5"/>
                  <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] p-1">
              <div className="flex">
                <button
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                        activeTab === 'users'
                            ? 'bg-[var(--primary)] text-[var(--bg)] shadow-lg '
                            : 'text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--bg)]'
                    }`}
                    onClick={() => setActiveTab('users')}
                >
                  <UserCog className="w-5 h-5"/>
                  <span>Users</span>
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {users?.length || 0}
                </span>
                </button>
                <button
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                        activeTab === 'teams'
                            ? 'bg-[var(--primary)] text-white shadow-lg'
                            : 'text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--bg)]'
                    }`}
                    onClick={() => setActiveTab('teams')}
                >
                  <Users className="w-5 h-5"/>
                  <span>Teams</span>
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
          {teams?.length || 0}
        </span>
                </button>

                <button
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                        activeTab === 'security'
                            ? 'bg-[var(--primary)] text-white shadow-lg'
                            : 'text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--bg)]'
                    }`}
                    onClick={() => setActiveTab('security')}
                >
                  <Shield className="w-5 h-5"/>
                  <span>Security</span>
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
          {anomalies?.length || 0}
        </span>
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          {activeTab === 'users' && (
              <>
                <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                      <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                        <SortableHeader
                            field="name"
                            currentField={userSortField}
                            direction={userSortDirection}
                            onClick={() => handleUserSort('name')}
                        >
                          User
                        </SortableHeader>
                        <SortableHeader
                            field="email"
                            currentField={userSortField}
                            direction={userSortDirection}
                            onClick={() => handleUserSort('email')}
                        >
                          Email
                        </SortableHeader>
                        <SortableHeader
                            field="role"
                            currentField={userSortField}
                            direction={userSortDirection}
                            onClick={() => handleUserSort('role')}
                        >
                          Role
                        </SortableHeader>
                        <SortableHeader
                            field="createdAt"
                            currentField={userSortField}
                            direction={userSortDirection}
                            onClick={() => handleUserSort('createdAt')}
                        >
                          Joined
                        </SortableHeader>
                        <SortableHeader
                            field="lastLogin"
                            currentField={userSortField}
                            direction={userSortDirection}
                            onClick={() => handleUserSort('lastLogin')}
                        >
                          Last Login
                        </SortableHeader>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Actions</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                      {pagedUsers.length > 0 ? (
                          pagedUsers.map(user => (
                              <tr key={user._id} className="hover:bg-[var(--bg)] transition-colors duration-200">
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-4">
                                    <div className="relative">
                                      <img
                                          src={getUserAvatarUrl(user._id)}
                                          alt={user.name}
                                          className="w-12 h-12 rounded-full border-2 border-[var(--border)] shadow-sm"
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-[var(--text)]">{user.name}</p>
                                      <p className="text-xs text-[var(--text-light)]">ID: {user._id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Mail className="w-4 h-4 text-[var(--text-light)]" />
                                      <span className="text-sm text-[var(--text)]">{user.email}</span>
                                    </div>
                                    {user.githubUsername && (
                                        <div className="flex items-center space-x-2">
                                          <Github className="w-4 h-4 text-[var(--text-light)]" />
                                          <a
                                              href={`https://github.com/${user.githubUsername}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                                          >
                                            {user.githubUsername}
                                          </a>
                                        </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
          <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold -ml-2 ${
                  user.role === 'admin'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : user.role === 'developer'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-green-100 text-green-700 border border-green-200'
              }`}
          >
            {user.role?.toUpperCase() || 'USER'}
          </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-[var(--text)] font-medium">{formatDate(user.createdAt)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-[var(--text)] font-medium">{formatDateTime(user.lastLogin)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                        onClick={() => {
                                          if (currentUser._id === user._id) {
                                            navigate('/dashboard/profile');
                                          } else {
                                            handleEditUser(user._id);
                                          }
                                        }}
                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                        title={currentUser._id === user._id ? "Edit your profile" : "Edit user"}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    {currentUser._id !== user._id ? (
                                        <button
                                            onClick={() => handleDeleteUser(user.name, user._id, user.email)}
                                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                                            title="Delete user"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-lg font-medium text-[var(--text)] mb-1">No users found</p>
                                  <p className="text-sm text-[var(--text-light)]">Try adjusting your search criteria</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <AdminPagination
                    currentPage={usersPage}
                    totalPages={usersTotalPages}
                    totalItems={filteredUsers.length}
                    itemsPerPage={pageSize}
                    onPageChange={handleUsersPageChange}
                />
              </>
          )}

          {/* Teams Table */}
          {activeTab === 'teams' && (
              <>
                <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                      <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                        <SortableHeader
                            field="name"
                            currentField={teamSortField}
                            direction={teamSortDirection}
                            onClick={() => handleTeamSort('name')}
                        >
                          Team
                        </SortableHeader>
                        <SortableHeader
                            field="creator"
                            currentField={teamSortField}
                            direction={teamSortDirection}
                            onClick={() => handleTeamSort('creator')}
                        >
                          Creator
                        </SortableHeader>
                        <SortableHeader
                            field="members"
                            currentField={teamSortField}
                            direction={teamSortDirection}
                            onClick={() => handleTeamSort('members')}
                        >
                          Members
                        </SortableHeader>
                        <SortableHeader
                            field="createdAt"
                            currentField={teamSortField}
                            direction={teamSortDirection}
                            onClick={() => handleTeamSort('createdAt')}
                        >
                          Created
                        </SortableHeader>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Actions</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                      {pagedTeams.length > 0 ? (
                          pagedTeams.map(team => (
                              <tr key={team._id} className="hover:bg-[var(--bg)] transition-colors duration-200">
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                      <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-[var(--text)]">{team.name}</p>
                                      <p className="text-xs text-[var(--text-light)]">Team ID: {team._id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm text-[var(--text)] font-medium">{team.creator?.name || 'Unknown'}</p>
                                  <p className="text-xs text-[var(--text-light)]">Email: {team.creator?.email || 'Unknown'}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex -space-x-2">
                                      {team.members?.slice(0, 3).map(member => (
                                          <div key={member._id} className="relative">
                                            <img
                                                src={defaultAvatar}
                                                alt={member.name}
                                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                            />
                                          </div>
                                      ))}
                                    </div>
                                    {team.members?.length > 3 && (
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-xs font-semibold text-[var(--text-light)]">
                  +{team.members.length - 3}
                </span>
                                        </div>
                                    )}
                                    <span className="text-xs text-[var(--text-light)] ml-2">
              {team.members?.length || 0} member{(team.members?.length || 0) !== 1 ? 's' : ''}
            </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-[var(--text)] font-medium">{formatDate(team.createdAt)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                        onClick={() => handleViewTeam(team._id, team.name)}
                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                        title="Go to dashboard"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTeam(team._id, team.name)}
                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                                        title="Delete team"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-lg font-medium text-[var(--text)] mb-1">No teams found</p>
                                  <p className="text-sm text-[var(--text-light)]">Try adjusting your search criteria</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <AdminPagination
                    currentPage={teamsPage}
                    totalPages={teamsTotalPages}
                    totalItems={filteredTeams.length}
                    itemsPerPage={pageSize}
                    onPageChange={handleTeamsPageChange}
                />
              </>
          )}

          {activeTab === 'security' && (
              <>
                {/* Filter Controls for Security */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4">
                    <select
                        value={anomalyFilterType}
                        onChange={(e) => setAnomalyFilterType(e.target.value)}
                        className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="all">All Types</option>
                      <option value="login_failure">Login Failures</option>
                      <option value="brute_force">Brute Force</option>
                      <option value="rate_limit">Rate Limits</option>
                    </select>
                  </div>


                  <button
                      onClick={() => setShowFullIPs(!showFullIPs)}
                      className="flex items-center space-x-2 px-3 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] text-[var(--text)]"
                      title={showFullIPs ? "Hide full IPs" : "Show full IPs"}
                  >
                    {showFullIPs ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="text-sm">IPs</span>
                  </button>
                </div>

                <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                      <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                        <SortableHeader
                            field="type"
                            currentField={anomalySortField}
                            direction={anomalySortDirection}
                            onClick={() => handleAnomalySort('type')}
                        >
                          Event
                        </SortableHeader>
                        <SortableHeader
                            field="email"
                            currentField={anomalySortField}
                            direction={anomalySortDirection}
                            onClick={() => handleAnomalySort('email')}
                        >
                          Details
                        </SortableHeader>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider">
                          Source
                        </th>
                        <SortableHeader
                            field="timestamp"
                            currentField={anomalySortField}
                            direction={anomalySortDirection}
                            onClick={() => handleAnomalySort('timestamp')}
                        >
                          Timestamp
                        </SortableHeader>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Actions</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                      {pagedAnomalies.length > 0 ? (
                        pagedAnomalies.map((anomaly) => (
                            <React.Fragment key={anomaly._id}>

                              <tr key={anomaly._id} className="hover:bg-[var(--bg)] transition-colors duration-200">
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-3">
                                    {getAnomalyIcon(anomaly.type)}
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getAnomalyBadgeColor(anomaly.type)}`}>
                    {anomaly.type.replace('_', ' ').toUpperCase()}
                  </span>
                                  </div>
                                </td>

                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <p className="text-sm text-[var(--text)] font-medium">
                                      {getEventDetails(anomaly)}
                                    </p>
                                    {anomaly.email && (
                                        <div className="flex items-center space-x-2">
                                          <Mail className="w-4 h-4 text-[var(--text-light)]" />
                                          <span className="text-sm text-[var(--text-light)]">{anomaly.email}</span>
                                        </div>
                                    )}
                                  </div>
                                </td>

                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4 text-[var(--text-light)]" />
                                    <span className="text-sm text-[var(--text)]">{maskIP(anomaly.ip)}</span>
                                  </div>
                                </td>

                                <td className="px-6 py-4">
                              <span className="text-sm text-[var(--text)] font-medium">
                                {formatDateTime(anomaly.timestamp)}
                              </span>
                                </td>

                                <td className="px-6 py-4">
                                  <button
                                      onClick={() => toggleRowExpansion(anomaly._id)}
                                      className="flex items-center space-x-1 text-[var(--primary)] hover:text-[var(--primary-dark)] text-sm"
                                  >
                                    {expandedRows.has(anomaly._id) ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                    <span>Details</span>
                                  </button>
                                </td>
                              </tr>

                              {expandedRows.has(anomaly._id) && (
                                  <tr>
                                    <td colSpan="5" className="px-6 py-4 bg-[var(--bg)]">
                                      <div className="space-y-3">
                                        <div>
                                          <h4 className="text-sm font-medium text-[var(--text)] mb-2">User Agent</h4>
                                          <p className="text-sm text-[var(--text-light)] font-mono bg-[var(--bg-container)] p-2 rounded border border-[var(--border)]">
                                            {anomaly.userAgent || 'Not available'}
                                          </p>
                                        </div>

                                        {anomaly.details && (
                                            <div>
                                              <h4 className="text-sm font-medium text-[var(--text)] mb-2">Event Details</h4>
                                              {/*<div className="text-sm text-[var(--text-light)] bg-[var(--bg-container)] p-2 rounded border border-[var(--border)]">*/}
                                              {/*  {JSON.stringify(anomaly.details, null, 2)}*/}
                                              {/*</div>*/}
                                              <pre className="text-sm text-[var(--text-light)] bg-[var(--bg-container)] p-2 rounded border border-[var(--border)] whitespace-pre-wrap">
                                              {formatDetailsForExpanded(anomaly)}
                                              </pre>
                                            </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                              )}
                            </React.Fragment>

                          ))
                      ) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <Shield className="w-16 h-16 text-green-500" />
                                <div>
                                  <p className="text-lg font-medium text-[var(--text)] mb-1">No security anomalies</p>
                                  <p className="text-sm text-[var(--text-light)]">
                                    {searchTerm || anomalyFilterType !== 'all' ? 'Try adjusting your search criteria' : 'Your system is secure'}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <AdminPagination
                    currentPage={anomaliesPage}
                    totalPages={anomaliesTotalPages}
                    totalItems={filteredAnomalies.length}
                    itemsPerPage={pageSize}
                    onPageChange={handleAnomaliesPageChange}
                />
              </>
          )}

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text)]">{users?.length || 0}</p>
                  <p className="text-sm text-[var(--text-light)]">Total User{(users?.length || 0) !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text)]">{teams?.length || 0}</p>
                  <p className="text-sm text-[var(--text-light)]">Total Team{(teams?.length || 0) !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text)]">
                    {users?.filter(u => u.role === 'admin')?.length || 0}
                  </p>
                  <p className="text-sm text-[var(--text-light)]">Administrator{(users?.filter(u => u.role === 'admin')?.length || 0) !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <ModalPortal isOpen={showDeleteModal}>
          {teamToDelete ? (
              <DeleteConfirmationModal
                  type="team"
                  name={teamToDelete?.name}
                  onConfirm={confirmDeleteTeam}
                  onCloseDelete={() => {
                    setShowDeleteModal(false)
                    setTeamToDelete(null)
                  }}
                  isDeleting={isDeletingTeam}
              />
          ) : (
              <DeleteConfirmationModal
                  type="user"
                  name={userToDelete?.name}
                  userId={userToDelete?.id}
                  email={userToDelete?.email}
                  onConfirm={confirmDeleteUser}
                  onCloseDelete={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                  }}
                  isDeleting={isDeleting}
              />
          )}
        </ModalPortal>
      </div>
  );
}

export default Admin;
