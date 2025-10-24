import React from 'react';
import { BookOpen, FileText, Video, Zap, ExternalLink, Sparkles, HelpCircle, MessageCircle, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function HelpMenu({ onClose }) {
  const navigate = useNavigate();

  const handleNavigateToFAQ = () => {
    navigate('/dashboard/FAQpage');
    if (onClose) onClose(); // Close the help menu if onClose is provided
  };

  const helpContent = [
    {
      title: 'Getting Started',
      description: 'Everything you need to begin your DevX360 journey',
      icon: <Zap size={20} className="section-icon" />,
      gradient: 'from-yellow-400 to-orange-500',
      items: [
        {
          title: 'User Guide',
          description: 'Complete setup and usage instructions',
          link: 'https://github.com/COS301-SE-2025/DevX360/blob/feature/frontend/README.md',
          type: 'external'
        },
        {
          title: 'API Documentation',
          description: 'Technical reference for developers',
          link: 'https://github.com/COS301-SE-2025/DevX360/blob/feature/api/README.md',
          type: 'external'
        }
      ]
    },
    {
      title: 'Frequently Asked Questions',
      description: 'Quick answers to common questions',
      icon: <HelpCircle size={20} className="section-icon" />,
      gradient: 'from-blue-400 to-indigo-600',
      items: [
        {
          title: 'Common Questions & Solutions',
          description: 'Troubleshooting and best practices',
          onClick: handleNavigateToFAQ,
          type: 'internal'
        }
      ]
    },
    {
      title: 'Technical Documentation',
      description: 'In-depth technical specifications and architecture',
      icon: <FileText size={20} className="section-icon" />,
      gradient: 'from-green-400 to-emerald-600',
      items: [
        {
          title: 'SRS Document',
          description: 'Software Requirements Specification',
          link: 'https://github.com/COS301-SE-2025/DevX360/blob/feature/documentation/Documentation/SRS%20V2.3.1.pdf',
          type: 'external'
        },
        {
          title: 'System Architecture',
          description: 'Architectural requirements and design',
          link: 'https://github.com/COS301-SE-2025/DevX360/blob/feature/documentation/Documentation/Architectural%20Requirements%20V3.1.pdf',
          type: 'external'
        }
      ]
    },
    {
      title: 'Video Tutorials',
      description: 'Visual walkthroughs and demonstrations',
      icon: <Video size={20} className="section-icon" />,
      gradient: 'from-purple-400 to-pink-600',
      items: [
        {
          title: 'Demo 1 - Platform Overview',
          description: 'Introduction to core features',
          link: 'https://drive.google.com/file/d/1MDIwWnNAUEV2ejQbL9K-zq6jvtjVqSEl/view?usp=sharing',
          type: 'external'
        },
        {
          title: 'Demo 2 - Advanced Features',
          description: 'Deep dive into advanced functionality',
          link: 'https://drive.google.com/file/d/1pbYanadFWiOqrrFJEYWaOpSvrdY5NNx0/view?usp=sharing',
          type: 'external'
        }
      ]
    }
  ];

  const renderMenuItem = (item, itemIndex) => {
    const baseClasses = "help-menu-link group/link relative flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-md cursor-pointer";
    const baseStyle = { background: 'var(--bg-secondary)' };

    if (item.type === 'internal' && item.onClick) {
      // Internal navigation (FAQ)
      return (
        <div
          key={itemIndex}
          onClick={item.onClick}
          className={baseClasses}
          style={baseStyle}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 group-hover/link:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <div className="text-gray-400 group-hover/link:text-blue-500 transition-all duration-200 group-hover/link:translate-x-0.5">
                →
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      );
    }

    // External links
    return (
      <a
        key={itemIndex}
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
        style={baseStyle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 group-hover/link:text-blue-600 transition-colors">
              {item.title}
            </h3>
            <ExternalLink 
              size={16} 
              className="text-gray-400 group-hover/link:text-blue-500 transition-all duration-200 group-hover/link:translate-x-0.5" 
            />
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            {item.description}
          </p>
        </div>
      </a>
    );
  };

  return (
    <div className="help-menu-container">
      {/* Close button if onClose is provided */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close help menu"
        >
          <X size={20} />
        </button>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header Section with Enhanced Styling */}
      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/50">
          <Sparkles size={18} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Help & Support Center</span>
        </div>
        <h1 className="help-menu-title text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          How can we help you?
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Discover everything you need to master DevX360. From quick start guides to comprehensive documentation, 
          we've created resources to help you succeed at every step of your journey.
        </p>
      </div>
      
      {/* Enhanced Help Cards Grid */}
      <div className="help-menu-grid">
        {helpContent.map((section, index) => (
          <div
            key={index}
            className="help-menu-card group relative overflow-hidden"
            style={{
              background: 'var(--bg-container)',
              '--hover-shadow': 'var(--shadow-xl)'
            }}
          >
            {/* Gradient Accent Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${section.gradient}`}></div>
            
            {/* Hover Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${section.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
            
            {/* Card Header */}
            <div className="help-menu-card-header relative">
              <div className={`p-3 bg-gradient-to-br ${section.gradient} rounded-xl shadow-lg`}>
                {section.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {section.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {section.description}
                </p>
              </div>
            </div>
            
            {/* Card Content with Enhanced Links */}
            <div className="px-6 pb-6">
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => renderMenuItem(item, itemIndex))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Enhanced Footer Section */}
      <div className="mt-20 text-center">
        <div className="help-menu-card relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-50"></div>
          
          <div className="relative p-10">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-100 rounded-full">
              <MessageCircle size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Need More Help?</span>
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Can't find what you're looking for?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Our dedicated support team and vibrant community are here to help you succeed. 
              Get personalized assistance or connect with fellow DevX360 users.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} />
                  <span>Contact Support</span>
                </div>
              </button>
              <a 
                href="https://github.com/COS301-SE-2025/DevX360"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 transform hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <Users size={18} />
                <span>Join Community</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpMenu;