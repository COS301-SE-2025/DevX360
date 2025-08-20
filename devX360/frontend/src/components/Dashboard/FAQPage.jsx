import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Clock, BarChart3, Brain, Trophy, Users, Download, Eye, Globe, RefreshCw, AlertTriangle, Search } from 'lucide-react';

function FAQPage() {
  const [openItems, setOpenItems] = useState(new Set([0])); // First item open by default
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData = [
    {
      category: "DORA Metrics",
      gradient: "from-blue-400 to-indigo-600",
      icon: <BarChart3 size={20} />,
      questions: [
        {
          question: "What are DORA Metrics?",
          answer: "DORA (DevOps Research and Assessment) Metrics are four key performance indicators that measure software delivery performance:",
          details: [
            "Deployment Frequency: How often code is deployed to production",
            "Lead Time for Changes: Time from commit to production deployment", 
            "Change Failure Rate: Percentage of deployments causing failures",
            "Mean Time to Recovery (MTTR): Time to restore service after failure"
          ]
        },
        {
          question: "What does \"Elite\", \"High\", \"Medium\", \"Low\" performance mean?",
          answer: "These classifications come from DORA research and represent industry performance tiers:",
          details: [
            "Elite: Top 10% of performers (multiple daily deployments, <1 hour lead time)",
            "High: 20% (daily deployments, <1 day lead time)",
            "Medium: 50% (weekly deployments, <1 week lead time)", 
            "Low: Bottom 20% (monthly deployments, >1 month lead time)"
          ]
        }
      ]
    },
    {
      category: "Data & Updates",
      gradient: "from-green-400 to-emerald-600", 
      icon: <Clock size={20} />,
      questions: [
        {
          question: "How often is the dashboard data updated?",
          answer: "Data refresh frequency varies by type:",
          details: [
            "Every 24 hours for repository statistics",
            "In real-time when triggered manually",
            "Immediately after new deployments/incidents are detected"
          ]
        },
        {
          question: "What timezone are the timestamps in?",
          answer: "All times are shown in:",
          details: [
            "Your local browser timezone",
            "UTC when exporting raw data", 
            "Configurable in user settings"
          ]
        }
      ]
    },
    {
      category: "AI Analysis",
      gradient: "from-purple-400 to-pink-600",
      icon: <Brain size={20} />,
      questions: [
        {
          question: "How is the AI Analysis generated?",
          answer: "The AI follows a comprehensive analysis process:",
          details: [
            "1. Analyzes your team's historical performance data",
            "2. Compares against industry benchmarks", 
            "3. Identifies patterns and improvement opportunities",
            "4. Generates actionable recommendations",
            "Analysis typically takes 2 minutes after initial team setup"
          ]
        }
      ]
    },
    {
      category: "Teams & Visibility",
      gradient: "from-orange-400 to-red-500",
      icon: <Users size={20} />,
      questions: [
        {
          question: "Can I compare multiple teams/projects?",
          answer: "Currently, the dashboard shows:",
          details: [
            "Data for one team at a time",
            "Comparison against industry benchmarks",
            "Future versions will support multi-team comparisons"
          ]
        },
        {
          question: "Who can see this dashboard?",
          answer: "Visibility follows a secure access model:",
          details: [
            "Team members see their team's data",
            "Admins see all teams", 
            "Data is never shared outside your organization"
          ]
        }
      ]
    },
    {
      category: "Data Export",
      gradient: "from-cyan-400 to-blue-500",
      icon: <Download size={20} />,
      questions: [
        {
          question: "How can I export this data?",
          answer: "Current export options include:",
          details: [
            "Screenshot any dashboard section",
            "Copy/paste from the AI Analysis",
            "Future versions will include CSV/PDF export"
          ]
        }
      ]
    }
  ];

  const troubleshootingTips = [
    {
      issue: "Data looks stale?",
      solution: "Click \"Refresh Data\" in the top-right",
      icon: <RefreshCw size={16} />
    },
    {
      issue: "Metrics seem wrong?",
      solution: "Check your repository and CI/CD integrations",
      icon: <AlertTriangle size={16} />
    },
    {
      issue: "AI Analysis stuck?",
      solution: "It automatically retries every 30 minutes",
      icon: <Brain size={16} />
    }
  ];

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.details.some(detail => detail.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/50">
            <Sparkles size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Frequently Asked Questions</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Find Your Answers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Get instant answers to common questions about DevX360, DORA metrics, and platform features.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        {filteredFAQ.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 bg-gradient-to-br ${category.gradient} rounded-xl shadow-lg text-white`}>
                {category.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {category.questions.map((item, questionIndex) => {
                const globalIndex = categoryIndex * 100 + questionIndex;
                const isOpen = openItems.has(globalIndex);
                
                return (
                  <div key={questionIndex} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                    <button
                      onClick={() => toggleItem(globalIndex)}
                      className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {item.question}
                      </h3>
                      <div className="flex-shrink-0">
                        {isOpen ? (
                          <ChevronUp size={24} className="text-gray-500 transition-transform duration-200" />
                        ) : (
                          <ChevronDown size={24} className="text-gray-500 transition-transform duration-200" />
                        )}
                      </div>
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-6 animate-fadeIn">
                        <div className="border-t border-gray-100 pt-6">
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            {item.answer}
                          </p>
                          {item.details && (
                            <ul className="space-y-2">
                              {item.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
                                  <span className="text-gray-600 leading-relaxed">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Troubleshooting Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Troubleshooting Tips</h2>
            <p className="text-gray-600">Common solutions for frequent issues</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {troubleshootingTips.map((tip, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    {tip.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{tip.issue}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{tip.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 text-center border border-blue-100 shadow-lg">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-100 rounded-full">
              <Eye size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Still Need Help?</span>
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Can't find your answer?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Our support team is here to help. Get personalized assistance or explore our comprehensive documentation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Contact Support
              </button>
              <button className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 transform hover:-translate-y-0.5">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default FAQPage;