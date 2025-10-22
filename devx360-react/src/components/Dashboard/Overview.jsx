import React from 'react';
import HeaderInfo from "../common/HeaderInfo";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Github, User, Users, BarChart3, Shield, ArrowRight, GitBranch, Clock, TrendingUp, Zap } from 'lucide-react';

function Overview() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="bg-[var(--bg-container)] shadow-sm border-b border-[var(--border)] sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-[var(--text)]">DevX360</h1>
              <div className="h-6 w-px bg-[var(--border)]"></div>
              <p className="text-lg font-medium text-[var(--text-light)]">Overview</p>
            </div>
            <HeaderInfo />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-[var(--bg-container)] to-[var(--bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-[var(--text)] mb-2">
                  Welcome back, {currentUser?.name}
                </h2>
                <p className="text-[var(--text-light)] text-lg leading-relaxed mb-6">
                  Track, analyze, and improve your team's software delivery performance with AI-powered insights.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-container)] rounded-lg border border-[var(--border)]">
                    <Users className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-sm font-medium text-[var(--text)]">
                      {currentUser?.teams?.length || 0} {currentUser?.teams?.length === 1 ? 'Team' : 'Teams'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-container)] rounded-lg border border-[var(--border)]">
                    <Shield className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-sm font-medium text-[var(--text)] capitalize">
                      {currentUser?.role}
                    </span>
                  </div>
                  {currentUser?.githubUsername && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-container)] rounded-lg border border-[var(--border)]">
                      <Github className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-[var(--text)]">
                        Connected
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {currentUser?.teams?.length > 0 && (
                <button
                  onClick={() => navigate('/dashboard/metrics')}
                  className="flex-shrink-0 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-medium transition-colors flex items-center gap-2 group"
                >
                  View Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* What We Track - DORA Metrics */}
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-[var(--text)] mb-2">What we track</h3>
            <p className="text-[var(--text-light)]">
              The four DORA metrics that distinguish elite teams from the rest. 
              Research shows elite performers deploy <span className="font-semibold text-[var(--text)]">208× more frequently</span> and 
              recover <span className="font-semibold text-[var(--text)]">2,604× faster</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-container)] rounded-lg p-5 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--text)] mb-1">Deployment Frequency</h4>
                  <p className="text-sm text-[var(--text-light)] leading-relaxed">
                    How often you ship to production. Elite teams deploy multiple times per day.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-container)] rounded-lg p-5 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--text)] mb-1">Lead Time for Changes</h4>
                  <p className="text-sm text-[var(--text-light)] leading-relaxed">
                    Time from commit to production. Elite teams achieve less than one day.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-container)] rounded-lg p-5 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--text)] mb-1">Change Failure Rate</h4>
                  <p className="text-sm text-[var(--text-light)] leading-relaxed">
                    Percentage of deployments causing failures. Elite teams stay below 15%.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-container)] rounded-lg p-5 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--text)] mb-1">Mean Time to Recovery</h4>
                  <p className="text-sm text-[var(--text-light)] leading-relaxed">
                    How quickly you recover from failures. Elite teams restore in under one hour.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[var(--text)] mb-4">Quick access</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Features - Larger cards */}
            <button
              onClick={() => navigate('/dashboard/team')}
              className="lg:col-span-2 text-left p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-container)] hover:border-[var(--primary)] hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)] group-hover:border-[var(--primary)] transition-colors">
                    <Users className="w-6 h-6 text-[var(--text-light)] group-hover:text-[var(--primary)] transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-[var(--text)] mb-1">
                      Teams
                    </h4>
                    <p className="text-sm text-[var(--text-light)] leading-relaxed">
                      Create and manage teams, configure repositories, and monitor DORA metrics across different time periods
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-light)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/profile')}
              className="text-left p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-container)] hover:border-[var(--primary)] hover:shadow-md transition-all group"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)] group-hover:border-[var(--primary)] transition-colors">
                    <User className="w-6 h-6 text-[var(--text-light)] group-hover:text-[var(--primary)] transition-colors" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--text-light)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[var(--text)] mb-1">
                    Profile
                  </h4>
                  <p className="text-sm text-[var(--text-light)] leading-relaxed">
                    Connect GitHub and manage your account
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/metrics')}
              className="lg:col-span-2 text-left p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-container)] hover:border-[var(--primary)] hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)] group-hover:border-[var(--primary)] transition-colors">
                    <BarChart3 className="w-6 h-6 text-[var(--text-light)] group-hover:text-[var(--primary)] transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-[var(--text)] mb-1">
                      Dashboard
                    </h4>
                    <p className="text-sm text-[var(--text-light)] leading-relaxed">
                      View detailed metrics, trends, contributor stats, and AI-powered insights for your teams
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-light)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => navigate('/dashboard/admin')}
                className="text-left p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-container)] hover:border-[var(--primary)] hover:shadow-md transition-all group"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)] group-hover:border-[var(--primary)] transition-colors">
                      <Shield className="w-6 h-6 text-[var(--text-light)] group-hover:text-[var(--primary)] transition-colors" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-[var(--text-light)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text)] mb-1">
                      Admin
                    </h4>
                    <p className="text-sm text-[var(--text-light)] leading-relaxed">
                      Manage users and monitor security
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Conditional CTA */}
        {currentUser?.teams?.length === 0 && (
          <div className="border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Ready to get started?
              </h3>
              <p className="text-blue-700 dark:text-blue-300 mb-4 leading-relaxed">
                Create a team or join an existing one to start tracking metrics and getting AI-powered insights.
              </p>
              <button
                onClick={() => navigate('/dashboard/team')}
                className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                Go to Teams
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Overview;
