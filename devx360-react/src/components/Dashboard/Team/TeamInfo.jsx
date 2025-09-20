import React, { useState, useEffect, useMemo, useRef, useCallback  } from 'react';
import {
  Clock,
  GitBranch,
  TrendingUp,
  Zap,
  MoreVertical,
  Trash2,
  Users,
  Calendar,
  Github,
  ExternalLink,
  Crown,
  Loader
} from "lucide-react";
import {Link} from "react-router-dom";
import {formatDate} from '../../../utils/dateUtils';





//=============================================================Loading Overlay Component======================================
const LoadingOverlay = ({ isVisible, message = "Loading...", variant = "default" }) => {
  if (!isVisible) return null;

  const variants = {
    default: {
      bg: "bg-[var(--bg-container)]/80",
      spinner: "text-[var(--primary)]",
      text: "text-[var(--text)]"
    },
    destructive: {
      bg: "bg-red-50/90",
      spinner: "text-red-600",
      text: "text-red-800"
    }
  };

  const variantStyles = variants[variant] || variants.default;

  return (
      <div className={`absolute inset-0 ${variantStyles.bg} backdrop-blur-sm flex items-center justify-center z-10 rounded-xl`}>
        <div className="text-center p-4">
          <Loader className={`w-8 h-8 animate-spin ${variantStyles.spinner} mx-auto mb-3`}/>
          <p className={`text-sm font-medium ${variantStyles.text}`}>{message}</p>
        </div>
      </div>
  );
};


// Custom hook for dropdown menu management
const useDropdownMenu = () => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef(new Map());

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId) {
        const menuElement = menuRefs.current.get(openMenuId);
        const buttonElement = document.querySelector(`[data-menu-button="${openMenuId}"]`);

        if (menuElement && !menuElement.contains(event.target) &&
            buttonElement && !buttonElement.contains(event.target)) {
          setOpenMenuId(null);
        }
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && openMenuId) {
        setOpenMenuId(null);
        // Return focus to the button that opened the menu
        const buttonElement = document.querySelector(`[data-menu-button="${openMenuId}"]`);
        if (buttonElement) {
          buttonElement.focus();
        }
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [openMenuId]);

  const toggleMenu = useCallback((menuId, isDisabled = false) => {
    if (isDisabled) return;
    setOpenMenuId(current => current === menuId ? null : menuId);
  }, []);

  const closeMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  const isMenuOpen = useCallback((menuId) => {
    return openMenuId === menuId;
  }, [openMenuId]);

  const registerMenuRef = useCallback((menuId, element) => {
    if (element) {
      menuRefs.current.set(menuId, element);
    } else {
      menuRefs.current.delete(menuId);
    }
  }, []);

  return {
    toggleMenu,
    closeMenu,
    isMenuOpen,
    registerMenuRef,
    openMenuId
  };
};

const getMetricValue = (team, metricPath, fallback = 'N/A') => {
  try {
    const pathArray = metricPath.split('.');
    let value = team;

    for (const key of pathArray) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }
    return value !== null && value !== undefined ? value : fallback;
  } catch (error) {
    return fallback;
  }
};

const parseNumericValue = (value, hasPercentage = false) => {
  if (value === null || value === undefined) return NaN;

  const stringValue = String(value);

  const cleaned = hasPercentage
      ? stringValue.replace(/%/g, '')
      : stringValue.replace(/\s/g, '');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};


//=============================================================TeamInfo Component======================================
function TeamInfo({ teams, currentUser, onDeleteTeam, deletingTeamIds }) {
  const { toggleMenu, closeMenu, isMenuOpen, registerMenuRef } = useDropdownMenu();

  const getMetricStatusMemoized = useMemo(() => {
    // Create a cache that persists between renders
    const cache = new Map();

    return (value, type) => {
      const key = `${value}-${type}`;
      if (cache.has(key)) {
        return cache.get(key);
      }

      let result;
      switch (type) {
        case 'deployment':
          const freq = parseNumericValue(value);
          if (freq >= 0.1) result = { status: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
          else if (freq >= 0.05) result = { status: 'Good', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
          else result = { status: 'Needs Improvement', color: 'bg-red-100 text-red-700 border-red-200' };
          break;
        case 'leadtime':
          const days = parseNumericValue(value);
          if (days <= 2) result = { status: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
          else if (days <= 7) result = { status: 'Good', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
          else result = { status: 'Needs Improvement', color: 'bg-red-100 text-red-700 border-red-200' };
          break;
        case 'cfr':
          const rate = parseNumericValue(value, true);
          if (rate <= 5) result = { status: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
          else if (rate <= 15) result = { status: 'Good', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
          else result = { status: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' };
          break;
        case 'mttr':
          const mttrDays = parseNumericValue(value);
          if (mttrDays <= 1) result = { status: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
          else if (mttrDays <= 24) result = { status: 'Good', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
          else result = { status: 'Needs Improvement', color: 'bg-red-100 text-red-700 border-red-200' };
          break;
        default:
          result = { status: 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-200' };
      }

      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }

      cache.set(key, result);
      return result;
    };
  }, []);


  // Close all menus when teams change (e.g., after filtering)
  useEffect(() => {
    closeMenu();
  }, [teams, closeMenu]);

  // Close menu if the team being shown is deleted
  useEffect(() => {
    if (deletingTeamIds.size > 0) {
      closeMenu();
    }
  }, [deletingTeamIds, closeMenu]);

  if (!teams || teams.length === 0) {
    return (
        <div className="w-full">
          <div className="bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No Teams Found</h3>
            <p className="text-[var(--text-light)] mb-6 max-w-md mx-auto">
              No teams match your current search and filter criteria. Try adjusting your filters or create a new team.
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="w-full space-y-6">
        {teams.map((team, index) => {
          const isDeleting = deletingTeamIds.has(team.id);
          const menuId = `team-menu-${team.id}`;

          return (
              <div
                  key={team.id || index}
                  className={`bg-[var(--bg-container)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden hover:shadow-lg transition-all duration-300 relative ${
                      isDeleting ? 'pointer-events-none' : ''
                  }`}
              >
                <LoadingOverlay
                    isVisible={isDeleting}
                    message="Deleting team..."
                    variant="destructive"
                />

                {/* Team Header */}
                <div className="p-6 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md transition-opacity duration-200 ${
                          isDeleting ? 'opacity-50' : ''
                      }`}>
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold text-[var(--text)] mb-1 transition-opacity duration-200 ${
                            isDeleting ? 'opacity-50' : ''
                        }`}>
                          {team.name}
                        </h3>
                        <div className={`flex items-center space-x-4 text-sm text-[var(--text-light)] transition-opacity duration-200 ${
                            isDeleting ? 'opacity-50' : ''
                        }`}>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{team.members?.length || 0} member{(team.members?.length || 0) !== 1 ? 's' : ''}</span>
                          </div>
                          {team.creator && (
                              <div className="flex items-center space-x-1">
                                <Crown className="w-4 h-4" />
                                <span>
                            {team.creator._id === currentUser?._id ? 'You created this team' : `Created by ${team.creator.name || 'Unknown'}`}
                          </span>
                              </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {team.creator?._id === currentUser?._id && (
                        <div className="relative">
                          <button
                              data-menu-button={menuId}
                              onClick={() => toggleMenu(menuId, isDeleting)}
                              disabled={isDeleting}
                              aria-expanded={isMenuOpen(menuId)}
                              aria-haspopup="menu"
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--bg)] text-[var(--text-light)] border border-[var(--border)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isDeleting ? 'opacity-50' : ''
                              }`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen(menuId) && !isDeleting && (
                              <div
                                  ref={(el) => registerMenuRef(menuId, el)}
                                  className="absolute right-0 top-10 w-44 bg-[var(--bg-container)] border border-[var(--border)] rounded-lg shadow-lg z-20 overflow-hidden"
                                  role="menu"
                                  aria-labelledby={`menu-button-${menuId}`}
                              >
                                <button
                                    role="menuitem"
                                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 text-left"
                                    onClick={() => {
                                      onDeleteTeam(team.id, team.name);
                                      closeMenu();
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onDeleteTeam(team.id, team.name);
                                        closeMenu();
                                      }
                                    }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete Team</span>
                                </button>
                              </div>
                          )}
                        </div>
                    )}
                  </div>
                </div>

                {/* DORA Metrics Grid */}
                <div className={`p-6 transition-opacity duration-200 ${isDeleting ? 'opacity-50' : ''}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Deployment Frequency */}
                    <div
                        className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)] hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <GitBranch className="w-4 h-4 text-blue-600"/>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            getMetricStatusMemoized(getMetricValue(team, 'doraMetrics.deployment_frequency.frequency_per_day', '0'), 'deployment').color
                        }`}>
                    {getMetricStatusMemoized(getMetricValue(team, 'doraMetrics.deployment_frequency.frequency_per_day', '0'), 'deployment').status}
                  </span>
                      </div>
                      <h4 className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2">Deployment
                        Frequency</h4>
                      <p className="text-lg font-bold text-[var(--text)] mb-1">
                        {getMetricValue(team, 'doraMetrics.deployment_frequency.frequency_per_day', '0')}/day
                      </p>
                      <p className="text-xs text-[var(--text-light)]">
                        {getMetricValue(team, 'doraMetrics.deployment_frequency.total_deployments', '0') > 0 ? (
                            `${getMetricValue(team, 'doraMetrics.deployment_frequency.total_deployments', '0')} deployments`
                        ) : (
                            getMetricValue(team, 'doraMetrics.deployment_frequency.status', 'No deployments found')
                        )}
                      </p>
                    </div>

                    {/* Lead Time */}
                    <div
                        className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)] hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-green-600"/>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            getMetricStatusMemoized(getMetricValue(team, 'doraMetrics.lead_time.average_days', '0'), 'leadtime').color
                        }`}>
                    {getMetricStatusMemoized(getMetricValue(team, 'doraMetrics.lead_time.average_days', '0'), 'leadtime').status}
                  </span>
                      </div>
                      <h4 className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2">Lead
                        Time</h4>
                      <p className="text-lg font-bold text-[var(--text)] mb-1">
                        {getMetricValue(team, 'doraMetrics.lead_time.average_days', '0.00')} days
                      </p>
                      <p className="text-xs text-[var(--text-light)]">
                        {getMetricValue(team, 'doraMetrics.lead_time.total_prs_analyzed', '0') > 0 ? (
                            `${getMetricValue(team, 'doraMetrics.lead_time.min_days', '0.00')} - ${getMetricValue(team, 'doraMetrics.lead_time.max_days', '0.00')} days`
                        ) : (
                            getMetricValue(team, 'doraMetrics.lead_time.status', 'No pull requests analysed')
                        )}
                      </p>
                    </div>

                    {/* Change Failure Rate */}
                    <div
                        className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)] hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-orange-600"/>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            getMetricStatusMemoized(getMetricValue(team, 'doraMetrics.change_failure_rate.failure_rate', '0.00%'), 'cfr').color
                        }`}>
                    {getMetricStatusMemoized(getMetricValue(team, 'doraMetrics.change_failure_rate.failure_rate', '0.00%'), 'cfr').status}
                  </span>
                      </div>
                      <h4 className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2">Change
                        Failure Rate</h4>
                      <p className="text-lg font-bold text-[var(--text)] mb-1">
                        {getMetricValue(team, 'doraMetrics.change_failure_rate.failure_rate', '0.00%')}
                      </p>
                      <p className="text-xs text-[var(--text-light)]">
                        {getMetricValue(team, 'doraMetrics.change_failure_rate.total_deployments', '0') > 0 ? (
                            `${getMetricValue(team, 'doraMetrics.change_failure_rate.deployment_failures', '0')} failures
                    out of ${getMetricValue(team, 'doraMetrics.change_failure_rate.total_deployments', '0')} deployments`
                        ) : (
                            getMetricValue(team, 'doraMetrics.deployment_frequency.status', 'No deployments found')
                        )}
                      </p>
                    </div>

                    {/* MTTR */}
                    <div
                        className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)] hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-purple-600"/>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            getMetricStatusMemoized(getMetricValue(team, 'doraMetrics.mttr.average_days', '0.00'), 'mttr').color
                        }`}>
                    {getMetricStatusMemoized(getMetricValue(team, 'doraMetrics.mttr.average_days', '0.00'), 'mttr').status}
                  </span>
                      </div>
                      <h4 className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2">Mean
                        Time to Recovery</h4>
                      <p className="text-lg font-bold text-[var(--text)] mb-1">
                        {getMetricValue(team, 'doraMetrics.mttr.average_days', '0.00')} days
                      </p>
                      <p className="text-xs text-[var(--text-light)]">
                        {getMetricValue(team, 'doraMetrics.mttr.total_incidents_analyzed', '0') > 0 ? (
                            `${getMetricValue(team, 'doraMetrics.mttr.total_incidents_analyzed', '0')} incidents`
                        ) : (
                            getMetricValue(team, 'doraMetrics.mttr.status', 'No incidents analyzed')
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Team Details Footer */}
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-[var(--text-light)]"/>
                        <div>
                          <p className="text-xs font-medium text-[var(--text)]">Analysis Period</p>
                          {/*<p className="text-xs text-[var(--text-light)]">{new Date(team.doraMetrics?.analysis_period.start_date).toLocaleDateString() || 'N/A'} - {new Date(team.doraMetrics?.analysis_period.end_date).toLocaleDateString() || 'N/A'}</p>*/}
                          <p className="text-xs text-[var(--text-light)]">
                            {formatDate(team.doraMetrics?.analysis_period.start_date)} - {formatDate(team.doraMetrics?.analysis_period.end_date)}
                          </p>
                        </div>
                      </div>

                      {team.repositoryInfo?.url && (
                          <div className="flex items-center space-x-2">
                            <Github className="w-4 h-4 text-[var(--text-light)]"/>
                            <div>
                              <p className="text-xs font-medium text-[var(--text)]">Repository</p>
                              <a
                                  href={team.repositoryInfo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors flex items-center space-x-1"
                              >
                                <span>{team.repositoryInfo.full_name}</span>
                                <ExternalLink className="w-3 h-3"/>
                              </a>
                            </div>
                          </div>
                      )}

                      <Link to={`/dashboard/metrics`}
                            className="text-xs font-medium text-[var(--text)] hover:text-[var(--primary-dark)] transition-colors">
                        <div className="w-4 h-4 bg-[var(--primary)] rounded-full flex items-center justify-center">
                          <TrendingUp className="w-2.5 h-2.5 text-white"/>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[var(--text)]">Performance</p>
                          <p className="text-xs text-[var(--text-light)]">View detailed metrics</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
          );
        })}
      </div>
  );
}

export default TeamInfo;