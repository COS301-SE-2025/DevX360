import React from 'react';
import { BookOpen, FileText, Video, GitPullRequest, Zap } from 'lucide-react';

function HelpMenu() {
  const helpContent = [

        {
      title: 'Getting Started',
      icon: <Zap size={20} className="section-icon" />,
      items: [
        {
          title: 'User Guide',
          link: 'https://github.com/COS301-SE-2025/DevX360/blob/feature/frontend/README.md'
        },
        {
          title: 'API Documentation',
          link: 'https://github.com/COS301-SE-2025/DevX360/blob/feature/api/README.md'
        }
      ]
    },
    {
      title: 'Frequently Asked Questions',
      icon: <BookOpen size={20} className="section-icon" />,
      items: [

        {
          title: 'Questions',
          link: 'https://github.com/COS301-SE-2025/DevX360/blob/feature/documentation/Documentation/Frequently%20Asked%20Questions.pdf'
        }
      ]
    },
    {
      title: 'Technical Docs',
      icon: <FileText size={20} className="section-icon" />,
      items: [
        {
          title: 'SRS Document',
          link: 'https://github.com/COS301-SE-2025/DevX360/blob/feature/documentation/Documentation/SRS%20V2.3.1.pdf'
        },
        {
          title: 'Architecture',
          link: 'https://github.com/COS301-SE-2025/DevX360/blob/feature/documentation/Documentation/Architectural%20Requirements%20V3.1.pdf'
        }
      ]
    },
    {
      title: 'Video Tutorials',
      icon: <Video size={20} className="section-icon" />,
      items: [
        {
          title: 'Demo 1 Video',
          link: 'https://drive.google.com/file/d/1MDIwWnNAUEV2ejQbL9K-zq6jvtjVqSEl/view?usp=sharing '
        },
        {
          title: 'Demo 2 Video',
          link: ''
        }
      ]
    }
  ];

  return (
    <div className="help-menu-container">
      <h1 className="help-menu-title">How can we help you?</h1>
      
      <div className="help-menu-grid">
        {helpContent.map((section, index) => (
          <div key={index} className="help-menu-card">
            <div className="help-menu-card-header">
              {section.icon}
              <h2>{section.title}</h2>
            </div>
            <ul className="help-menu-list">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="help-menu-link">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HelpMenu;