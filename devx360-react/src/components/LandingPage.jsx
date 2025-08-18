import React, { useState, useEffect } from 'react';
import { ArrowRight, BarChart3, Zap, Shield, Users, Github, TrendingUp, Brain, Clock, Target, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);
  
  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveMetric(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const doraMetrics = [
    { name: 'Deployment Frequency', value: '208x', desc: 'Higher than low performers', icon: Zap },
    { name: 'Lead Time to Change', value: '< 1 day', desc: 'From weeks to hours', icon: Clock },
    { name: 'Mean Time to Recover', value: '< 1 hour', desc: '2,604x faster recovery', icon: Target },
    { name: 'Change Failure Rate', value: '< 15%', desc: 'Industry leading reliability', icon: CheckCircle }
  ];

  const features = [
    { icon: Brain, title: 'AI-Powered Analysis', desc: 'Intelligent code review and pattern detection' },
    { icon: BarChart3, title: 'Real-time Dashboards', desc: 'Live DORA metrics visualization' },
    { icon: Github, title: 'Seamless Integration', desc: 'Connect with GitHub, Jira, and CI/CD tools' },
    { icon: Users, title: 'Team Collaboration', desc: 'Privacy-first individual and team metrics' }
  ];

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 bg-black/20 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold">DevX360</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#metrics" className="hover:text-purple-400 transition-colors">Metrics</a>
            <a href="#about" className="hover:text-purple-400 transition-colors">About</a>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={handleSignIn}
              className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
            >
              Sign In
            </button>
            <button 
              onClick={handleRegister}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-full hover:scale-105 transition-transform"
            >
              Register
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              DevX360
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-4xl mx-auto leading-relaxed">
              AI-powered DevOps analytics that transforms your development metrics into 
              <span className="text-purple-400 font-semibold"> elite performance insights</span>
            </p>
            <div className="flex justify-center">
              <button 
                onClick={handleRegister}
                className="group bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/25"
              >
                Get Started Now
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating DORA Metrics Cards */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Industry-Standard DORA Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {doraMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div
                  key={index}
                  className={`relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 ${
                    activeMetric === index ? 'ring-2 ring-purple-400 bg-white/10' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <Icon className="w-12 h-12 text-purple-400 mb-4" />
                    <h3 className="text-lg font-bold mb-2">{metric.name}</h3>
                    <div className="text-3xl font-bold text-purple-400 mb-2">{metric.value}</div>
                    <p className="text-gray-400 text-sm">{metric.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Supercharge Your DevOps
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From AI-powered code analysis to real-time dashboards, DevX360 gives you everything needed to reach elite performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16">Built for the $3.4B SA Software Market</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8">
              <div className="text-5xl font-bold text-purple-400 mb-2">USD 1.2B</div>
              <div className="text-gray-300">Current SA Dev Industry Value</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold text-pink-400 mb-2">USD 3.4B</div>
              <div className="text-gray-300">Projected 2030 Value</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-300">Concurrent Users Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Ready to Transform Your Team's Performance?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the elite performers. Start tracking your DORA metrics with AI-powered insights today - completely free.
          </p>
          <button 
            onClick={handleRegister}
            className="group bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-6 rounded-full text-xl font-bold hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/25"
          >
            Get Started Free
            <ArrowRight className="inline-block ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold">DevX360</span>
          </div>
          <p className="text-gray-400 mb-4">AI-powered DevOps analytics for elite performance</p>
          <p className="text-gray-500 text-sm">© 2025 Open Vantage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;