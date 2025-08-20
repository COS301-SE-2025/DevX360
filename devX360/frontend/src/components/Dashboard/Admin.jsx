import React, {useState, useEffect, useMemo} from 'react';
import { Users, UserCog, Loader, Edit, Trash2, Eye, Search, Calendar, Mail, Github, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUsers, deleteUser, getTeams } from "../../services/admin";
import {deleteTeam} from "../../services/teams";
import HeaderInfo from "../common/HeaderInfo";
import WarningToast from "../common/WarningToast";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "./modal/DeleteConfirmation";
import ModalPortal from "./modal/ModalPortal";
import {useNavigate} from "react-router-dom";

function Admin() {
  const { currentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  const [userToDelete, setUserToDelete] = useState(null); // for confirmation modal
  const [teamToDelete, setTeamToDelete] = useState(null); // for confirmation modal
  const [isDeleting, setIsDeleting] = useState(false); // for loading state
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  console.log(users);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const usersData = await getUsers();
      const teamsData = await getTeams();
      // console.log("teamsData", teamsData); //debugging
      setUsers(usersData);
      setTeams(teamsData);
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

  const refreshTeams = async () => {
    try {
      const userTeams = await getTeams()
      setTeams(userTeams);
    } catch (error) {
      console.error('Error refreshing teams:', error);
    }
  }

  const refreshUsers = async () => {
    try {
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  }



  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return defaultAvatar;

    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5500";
    return avatarPath.startsWith("http") ? avatarPath : `${baseUrl}/uploads/${avatarPath}`;
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

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

    console.log('teamToDelete', teamToDelete);

    setIsDeletingTeam(true);
    try {
      await deleteTeam(teamToDelete.name, teamToDelete.id);
      await refreshTeams();

      // console.log('Team deleted successfully:', teamToDelete.name);
      toast.success(`Team ${teamToDelete.name} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting team:', error);
      // alert('Failed to delete team: ' + error.message);
      toast.error('Failed to delete team.'); //error.message?
    } finally {
      setIsDeletingTeam(false);
      setShowDeleteModal(false);
      setTeamToDelete(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users?.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.githubUsername?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [users, searchTerm]);

  const filteredTeams = useMemo(() => {
    return teams?.filter(team =>
        team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [teams, searchTerm]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log(currentUser);
    if (currentUser?.avatar) {
      const avatarUrl = currentUser.avatar.startsWith('http')
          ? currentUser.avatar
          : `${process.env.REACT_APP_API_URL || 'http://localhost:5500'}${currentUser.avatar}`;
      setAvatar(avatarUrl);
    }
  }, [currentUser]);

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
              <HeaderInfo currentUser={currentUser} avatar={avatar} defaultAvatar={defaultAvatar} />
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
                    {activeTab === 'users' ? 'User Management' : 'Team Management'}
                  </h2>
                  <p className="text-sm text-[var(--text-light)]">
                    {activeTab === 'users'
                        ? 'View and manage all registered users'
                        : 'Monitor and manage development teams'
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
              </div>
            </div>
          </div>


          {/* Users Table */}
          {activeTab === 'users' && (
              <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                    <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Activity</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <tr key={user._id} className="hover:bg-[var(--bg)] transition-colors duration-200">
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-4">
                                  <div className="relative">
                                    <img
                                        src={getAvatarUrl(user.avatar)}
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
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Calendar className="w-4 h-4 text-[var(--text-light)]" />
                                    <span className="text-[var(--text-light)]">Joined:</span>
                                    <span className="text-[var(--text)] font-medium">{formatDate(user.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <div className="w-4 h-4 flex items-center justify-center"></div>
                                    <span className="text-[var(--text-light)]">Last seen:</span>
                                    <span className="text-[var(--text)] font-medium">{formatDate(user.lastLogin)}</span>
                                  </div>
                                </div>
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
                          <td colSpan="5" className="px-6 py-16 text-center">
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
          )}

          {/* Teams Table */}
          {activeTab === 'teams' && (
              <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                    <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Team</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Creator</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Members</th>
                      {/*<th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Repository</th>*/}
                      {/*<th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Created</th>*/}
                      <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                    {filteredTeams.length > 0 ? (
                        filteredTeams.map(team => (
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
                          <td colSpan="6" className="px-6 py-16 text-center">
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
              name={teamToDelete?.name} //or id?
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