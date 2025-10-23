import React, { useState, useEffect, useCallback } from 'react';
import { createMCPToken, getMCPTokens, revokeMCPToken, updateMCPToken } from '../../services/mcp';
import toast from 'react-hot-toast';
import { Key, Plus, Copy, Trash2, Edit3, X, Check, AlertCircle, Info, ExternalLink, Shield, AlertTriangle } from 'lucide-react';
import RevokeTokenConfirmation from './modal/RevokeTokenConfirmation';
import ModalPortal from './modal/ModalPortal';

function MCPTokenManagement() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [newTokenData, setNewTokenData] = useState(null);
  const [editingTokenId, setEditingTokenId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [securityInfo, setSecurityInfo] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Form state for creating new token
  const [formData, setFormData] = useState({
    name: '',
    expiresInDays: 90, // Default to 90 days to match backend
  });

  // Load tokens on mount
  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const data = await getMCPTokens();
      setTokens(data.tokens || []);
      
      // Calculate security info from token count
      const MAX_TOKENS = 3;
      setSecurityInfo({
        activeTokens: data.count || 0,
        maxTokens: MAX_TOKENS,
        remainingSlots: MAX_TOKENS - (data.count || 0)
      });
    } catch (error) {
      console.error('Failed to load MCP tokens:', error);
      toast.error(error.message || 'Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please provide a token name');
      return;
    }

    try {
      const data = await createMCPToken(
        formData.name.trim(),
        formData.expiresInDays || null
      );
      
      setNewTokenData(data);
      setShowCreateModal(false);
      setShowTokenModal(true);
      setFormData({ name: '', expiresInDays: 90 });
      
      // Reload tokens list
      await loadTokens();
      
      toast.success('MCP token created successfully!');
    } catch (error) {
      console.error('Failed to create token:', error);
      
      // Parse error response
      const errorData = error.response?.data || {};
      
      // Handle specific error cases
      if (errorData.message?.includes('Maximum') || errorData.message?.includes('active tokens')) {
        const hint = errorData.hint || 'Please revoke one before creating a new token.';
        toast.error(`${errorData.message} ${hint}`);
      } else if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error(errorData.message || error.message || 'Failed to create token');
      }
    }
  };

  const handleCopyToken = () => {
    if (newTokenData?.token) {
      navigator.clipboard.writeText(newTokenData.token);
      toast.success('Token copied to clipboard!');
    }
  };

  const handleCopyConfig = () => {
    if (newTokenData?.setupInstructions?.configSnippet) {
      navigator.clipboard.writeText(JSON.stringify(newTokenData.setupInstructions.configSnippet, null, 2));
      toast.success('Configuration copied to clipboard!');
    }
  };

  const handleRevokeToken = (tokenId, tokenName) => {
    setRevokeTarget({ id: tokenId, name: tokenName });
  };

  const confirmRevokeToken = async () => {
    if (!revokeTarget) return;

    setIsRevoking(true);
    try {
      await revokeMCPToken(revokeTarget.id);
      toast.success('Token revoked successfully');
      await loadTokens();
      setRevokeTarget(null);
    } catch (error) {
      console.error('Failed to revoke token:', error);
      toast.error(error.message || 'Failed to revoke token');
    } finally {
      setIsRevoking(false);
    }
  };

  const closeRevokeModal = () => {
    if (!isRevoking) {
      setRevokeTarget(null);
    }
  };

  const handleStartEdit = (token) => {
    setEditingTokenId(token.id);
    setEditingName(token.name);
  };

  const handleCancelEdit = () => {
    setEditingTokenId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (tokenId) => {
    if (!editingName.trim()) {
      toast.error('Token name cannot be empty');
      return;
    }

    try {
      await updateMCPToken(tokenId, editingName.trim());
      toast.success('Token name updated successfully');
      setEditingTokenId(null);
      setEditingName('');
      await loadTokens();
    } catch (error) {
      console.error('Failed to update token:', error);
      toast.error(error.message || 'Failed to update token');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never expires';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
            <Key size={20} />
            MCP API Tokens
          </h3>
          <p className="text-sm text-[var(--text-light)] mt-1">
            Connect Claude Desktop to DevX360 using the Model Context Protocol
          </p>
          
          {/* Security Info Badge */}
          {securityInfo && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-[var(--text-light)]">
                {securityInfo.activeTokens} / {securityInfo.maxTokens} tokens active
              </span>
              {securityInfo.remainingSlots === 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                  Limit Reached
                </span>
              )}
              {securityInfo.remainingSlots > 0 && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  {securityInfo.remainingSlots} slot{securityInfo.remainingSlots !== 1 ? 's' : ''} available
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={securityInfo && securityInfo.remainingSlots === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          title={securityInfo && securityInfo.remainingSlots === 0 ? 'Maximum token limit reached. Revoke a token to create a new one.' : 'Create new token'}
        >
          <Plus size={16} />
          New Token
        </button>
      </div>

      {/* Token List */}
      {loading ? (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-8 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[var(--text-light)]">
            <div className="w-4 h-4 border-2 border-[var(--text-light)] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading tokens...</span>
          </div>
        </div>
      ) : tokens.length === 0 ? (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-8 text-center">
          <Key size={48} className="mx-auto text-[var(--text-light)] mb-3" />
          <h4 className="text-base font-medium text-[var(--text)] mb-2">Get Started with MCP</h4>
          <p className="text-[var(--text-light)] mb-4 max-w-md mx-auto">
            Create a token to enable Claude Desktop integration with DevX360. Access repository analytics, DORA metrics, and more directly from Claude.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Create Your First Token
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.id}
              className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editingTokenId === token.id ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-md bg-[var(--bg-container)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(token.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        title="Save"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 text-[var(--text-light)] hover:bg-[var(--border)] rounded-md transition-colors"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-[var(--text)] truncate">
                        {token.name}
                      </h4>
                      {isExpired(token.expiresAt) && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                          Expired
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-[var(--text-light)]">
                    <div>
                      <span className="font-medium">Token:</span> {token.tokenPreview}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {formatDate(token.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span> {formatDate(token.expiresAt)}
                    </div>
                  </div>
                  
                  {token.lastUsedAt && (
                    <div className="text-xs text-[var(--text-light)] mt-2">
                      Last used: {formatDate(token.lastUsedAt)} • Used {token.usageCount || 0} times
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {editingTokenId !== token.id && (
                    <>
                      <button
                        onClick={() => handleStartEdit(token)}
                        className="p-2 text-[var(--text-light)] hover:text-[var(--primary)] hover:bg-[var(--border)] rounded-md transition-colors"
                        title="Edit token name"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleRevokeToken(token.id, token.name)}
                        className="p-2 text-[var(--text-light)] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Revoke token"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Token Modal */}
      <ModalPortal isOpen={showCreateModal}>
        <div 
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-container)] rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[var(--text)]">Create New MCP Token</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--text-light)] hover:text-[var(--text)] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateToken} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Token Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Claude Desktop - Work Laptop"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
                <p className="text-xs text-[var(--text-light)] mt-1">
                  A descriptive name to identify where this token is used
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Expiration (days)
                </label>
                <input
                  type="number"
                  value={formData.expiresInDays}
                  onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) || 90 })}
                  placeholder="90"
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <p className="text-xs text-[var(--text-light)] mt-1">
                  Default: 90 days (1-365 days allowed)
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  The token will only be shown once after creation. Make sure to save it securely.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Shield size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Security Limits:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Maximum 3 active tokens per user</li>
                    <li>5 token creations per hour limit</li>
                    <li>500 API requests per 15 minutes per token</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--border)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors font-medium"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      </ModalPortal>

      {/* Show Token Modal (Only shown once after creation) */}
      <ModalPortal isOpen={showTokenModal && !!newTokenData}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-container)] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex-shrink-0 p-6 pb-4 border-b border-[var(--border)]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--text)] mb-1">Token Created Successfully!</h3>
                  <p className="text-sm text-[var(--text-light)] flex items-center gap-1">
                    <AlertTriangle size={16} className="text-[#DC2626] flex-shrink-0" />
                    <span>Make sure to copy your token now. You won't be able to see it again!</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTokenModal(false);
                    setNewTokenData(null);
                  }}
                  className="text-[var(--text-light)] hover:text-[var(--text)] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
              {/* Security Warning - PROMINENT */}
              {newTokenData?.securityWarning && (
                <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-red-900 mb-2 text-base">
                        {newTokenData.securityWarning.title}
                      </h4>
                      <ul className="space-y-1.5">
                        {newTokenData.securityWarning.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                            <span className="text-red-600 font-bold mt-0.5">•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Token Security Info */}
              {newTokenData?.securityInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-blue-900">
                    <Shield size={16} className="text-blue-600" />
                    <span className="font-medium">Security Status:</span>
                    <span>
                      {newTokenData.securityInfo.activeTokens} / {newTokenData.securityInfo.maxTokens} tokens active
                      {newTokenData.securityInfo.remainingSlots > 0 && 
                        ` (${newTokenData.securityInfo.remainingSlots} slot${newTokenData.securityInfo.remainingSlots !== 1 ? 's' : ''} remaining)`
                      }
                    </span>
                  </div>
                  {newTokenData?.expiresInDays && (
                    <div className="text-xs text-blue-800 mt-1 ml-6">
                      This token expires in {newTokenData.expiresInDays} days
                    </div>
                  )}
                </div>
              )}
              {/* Token Display */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Your API Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTokenData?.token || ''}
                    readOnly
                    className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] font-mono text-sm"
                  />
                  <button
                    onClick={handleCopyToken}
                    className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
              </div>

              {/* Setup Instructions */}
              {newTokenData?.setupInstructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Claude Desktop Setup</h4>
                    <p className="text-sm text-blue-800">
                      Add this configuration to your Claude Desktop config.json file
                    </p>
                  </div>
                </div>

                {/* Config File Locations */}
                {newTokenData.setupInstructions.configPaths && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-900">Config File Location:</span>
                  </div>
                  <div className="bg-white rounded-md p-2 border border-blue-200 text-xs font-mono text-[var(--text)] space-y-1">
                    {newTokenData.setupInstructions.configPaths.macos && (
                      <div><strong>macOS:</strong> {newTokenData.setupInstructions.configPaths.macos}</div>
                    )}
                    {newTokenData.setupInstructions.configPaths.linux && (
                      <div><strong>Linux:</strong> {newTokenData.setupInstructions.configPaths.linux}</div>
                    )}
                    {newTokenData.setupInstructions.configPaths.windows && (
                      <div><strong>Windows:</strong> {newTokenData.setupInstructions.configPaths.windows}</div>
                    )}
                  </div>
                </div>
                )}

                {/* Configuration Snippet */}
                {newTokenData.setupInstructions.configSnippet && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-900">Configuration:</span>
                    <button
                      onClick={handleCopyConfig}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Copy size={14} />
                      Copy Config
                    </button>
                  </div>
                  <pre className="bg-white rounded-md p-3 border border-blue-200 text-xs overflow-x-auto">
                    <code>{JSON.stringify(newTokenData.setupInstructions.configSnippet, null, 2)}</code>
                  </pre>
                </div>
                )}

                {/* Important Note */}
                {newTokenData.setupInstructions.note && (
                <div className="mt-3 flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <Info size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-800">
                    {newTokenData.setupInstructions.note}
                  </p>
                </div>
                )}

                {/* Advanced Config (Optional) */}
                {newTokenData.setupInstructions.advancedConfig && (
                <details className="mt-3">
                  <summary className="text-xs font-medium text-blue-900 cursor-pointer hover:text-blue-700">
                    Advanced Configuration (Optional)
                  </summary>
                  <div className="mt-2 bg-white rounded-md p-3 border border-blue-200">
                    <p className="text-xs text-blue-800 mb-2">
                      {newTokenData.setupInstructions.advancedConfig.description}
                    </p>
                    {newTokenData.setupInstructions.advancedConfig.example && (
                      <pre className="bg-gray-50 rounded p-2 text-xs overflow-x-auto mt-2">
                        <code>{JSON.stringify(newTokenData.setupInstructions.advancedConfig.example, null, 2)}</code>
                      </pre>
                    )}
                    {newTokenData.setupInstructions.advancedConfig.optionalApiUrl && (
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Default API URL:</strong> {newTokenData.setupInstructions.advancedConfig.optionalApiUrl}
                      </p>
                    )}
                  </div>
                </details>
                )}

                {/* Documentation Link */}
                {newTokenData.setupInstructions.documentationUrl && (
                  <a
                    href={newTokenData.setupInstructions.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink size={14} />
                    View Full Documentation
                  </a>
                )}

                {/* Restart Reminder */}
                <div className="mt-3 flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertCircle size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    Restart Claude Desktop after updating the config file to apply changes.
                  </p>
                </div>
              </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowTokenModal(false);
                    setNewTokenData(null);
                  }}
                  className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors font-medium"
                >
                  I've Saved My Token
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </ModalPortal>

      {/* Revoke Token Confirmation Modal */}
      <ModalPortal isOpen={!!revokeTarget}>
        <RevokeTokenConfirmation
          tokenName={revokeTarget?.name}
          onConfirm={confirmRevokeToken}
          onClose={closeRevokeModal}
          isRevoking={isRevoking}
        />
      </ModalPortal>
    </div>
  );
}

export default MCPTokenManagement;


