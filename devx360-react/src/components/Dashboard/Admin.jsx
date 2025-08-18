import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers } from "../../services/misc";
import HeaderInfo from "../common/HeaderInfo";
import { Users, UserCog, Loader, Edit, Trash2, Eye, Search } from 'lucide-react';
import WarningToast from "../common/WarningToast";
import toast from "react-hot-toast";

// Mock teams data
const mockTeams = [
  {
    _id: '1',
    name: 'Frontend Team',
    creator: { name: 'John Doe' },
    members: [
      { _id: 'u1', name: 'Alice Johnson', avatar: null },
      { _id: 'u2', name: 'Bob Smith', avatar: null },
      { _id: 'u3', name: 'Carol Davis', avatar: null }
    ],
    repoUrl: 'https://github.com/company/frontend-app',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    _id: '2',
    name: 'Backend API Team',
    creator: { name: 'Jane Smith' },
    members: [
      { _id: 'u4', name: 'David Wilson', avatar: null },
      { _id: 'u5', name: 'Eva Brown', avatar: null }
    ],
    repoUrl: 'https://github.com/company/backend-api',
    createdAt: '2024-02-20T14:45:00Z'
  },
  {
    _id: '3',
    name: 'DevOps Team',
    creator: { name: 'Mike Johnson' },
    members: [
      { _id: 'u6', name: 'Frank Miller', avatar: null },
      { _id: 'u7', name: 'Grace Lee', avatar: null },
      { _id: 'u8', name: 'Henry Kim', avatar: null },
      { _id: 'u9', name: 'Iris Chen', avatar: null }
    ],
    repoUrl: null,
    createdAt: '2024-03-10T09:15:00Z'
  }
];

function Admin() {
  const { currentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentUser?.avatar) {
      const avatarUrl = currentUser.avatar.startsWith('http')
          ? currentUser.avatar
          : `${process.env.REACT_APP_API_URL || 'http://localhost:5500'}${currentUser.avatar}`;
      setAvatar(avatarUrl);
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const usersData = await getUsers();
        setUsers(usersData);
        setTeams(mockTeams);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return defaultAvatar;
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5500";
    return avatarPath.startsWith("http") ? avatarPath : `${baseUrl}/uploads/${avatarPath}`;
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  const handleEditUser = (userId) => toast.custom(<WarningToast message={"Implement"} />);
  const handleDeleteUser = (userId) => toast.custom(<WarningToast message={"Implement"} />);
  const handleViewTeam = (teamId) => toast.custom(<WarningToast message={"Implement"} />);
  const handleDeleteTeam = (teamId) => toast.custom(<WarningToast message={"Implement"} />);

  const filteredUsers = users?.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.githubUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredTeams = teams?.filter(team =>
      team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-md">
          <Loader className="w-10 h-10 animate-spin text-indigo-600 mb-2"/>
          <p className="text-gray-500 dark:text-gray-300">Loading data...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-700 text-center">
          {error}
        </div>
    );
  }

  return (
      <div className="max-w-[1200px] mx-auto p-6 min-h-[calc(100vh-80px)] font-inter">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
          <HeaderInfo currentUser={currentUser} avatar={avatar} defaultAvatar={defaultAvatar} />
        </header>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 mb-4 rounded-t-xl bg-white dark:bg-slate-800 shadow">
          <button
              className={`flex-1 py-2 text-center font-medium transition ${activeTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}
              onClick={() => setActiveTab('users')}
          >
            <UserCog className="inline w-5 h-5 mr-1"/>
            Users ({users?.length || 0})
          </button>
          <button
              className={`flex-1 py-2 text-center font-medium transition ${activeTab === 'teams' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}
              onClick={() => setActiveTab('teams')}
          >
            <Users className="inline w-5 h-5 mr-1"/>
            Teams ({teams?.length || 0})
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
            <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Users Table */}
        {activeTab === 'users' && (
            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                <tr>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Name</th>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Email</th>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">GitHub</th>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Role</th>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Member Since</th>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Last Login</th>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                      <td className="p-3 flex items-center gap-2">
                        <img src={getAvatarUrl(user.avatar)} alt={user.name} className="w-9 h-9 rounded-full border border-gray-200 dark:border-slate-600"/>
                        {user.name}
                      </td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        {user.githubUsername ? (
                            <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{user.githubUsername}</a>
                        ) : <span className="text-gray-400 italic">-</span>}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300' :
                                user.role === 'developer' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300' :
                                    'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300'
                        }`}>{user.role}</span>
                      </td>
                      <td className="p-3 text-gray-500 text-sm">{formatDate(user.createdAt)}</td>
                      <td className="p-3 text-gray-500 text-sm">{formatDate(user.lastLogin)}</td>
                      <td className="p-3 flex gap-2">
                        <button onClick={() => handleEditUser(user._id)} className="p-1 rounded hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-700 dark:hover:text-indigo-200 transition"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteUser(user._id)} className="p-1 rounded hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-700 dark:hover:text-red-200 transition"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                )) : (
                    <tr>
                      <td colSpan="7" className="text-center p-6 text-gray-400 italic dark:text-gray-300">No users found</td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
        )}

        {/* Teams Table */}
        {activeTab === 'teams' && (
            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                <tr>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Team Name</th>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Created By</th>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Members</th>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Repository</th>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Created Date</th>
                  <th className="p-3 font-medium text-gray-700 dark:text-slate-200">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredTeams.length > 0 ? filteredTeams.map(team => (
                    <tr key={team._id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                      <td className="p-3 text-indigo-600 font-semibold">{team.name}</td>
                      <td className="p-3">{team.creator?.name || 'Unknown'}</td>
                      <td className="p-3 flex items-center gap-2">
                        {team.members?.slice(0,3).map(member => (
                            <img key={member._id} src={member.avatar || defaultAvatar} alt={member.name} className="w-6 h-6 rounded-full border border-white dark:border-slate-800"/>
                        ))}
                        {team.members?.length > 3 && <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">+{team.members.length - 3}</span>}
                      </td>
                      <td className="p-3">
                        {team.repoUrl ? (
                            <a href={team.repoUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{team.repoUrl.split('github.com/')[1]}</a>
                        ) : <span className="text-gray-400 italic dark:text-gray-300">-</span>}
                      </td>
                      <td className="p-3 text-gray-500 text-sm">{formatDate(team.createdAt)}</td>
                      <td className="p-3 flex gap-2">
                        <button onClick={() => handleViewTeam(team._id)} className="p-1 rounded bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center"><Eye className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteTeam(team._id)} className="p-1 rounded bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                )) : (
                    <tr>
                      <td colSpan="6" className="text-center p-6 text-gray-400 italic dark:text-gray-300">No teams found</td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
        )}
      </div>
  );
}

export default Admin;
