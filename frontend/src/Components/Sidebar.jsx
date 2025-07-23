// src/Components/Sidebar.jsx
import { User, BarChart3, Settings, Bell, Users, Brain } from "lucide-react";
import React from "react";
import "./Sidebar.css";

const Sidebar = ({ selected, onSelect, onLogout }) => {
  return (
    <aside className="sidebar">
      {/* 프로필 */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          <User className="sidebar-avatar-icon" />
        </div>
        <div className="sidebar-username">○○○님</div>
      </div>
      {/* 메뉴 */}
      <nav className="sidebar-nav">
        <ul>
          <li>
            <button
              className={`sidebar-menu-btn${selected === 'dashboard' ? ' selected' : ''}`}
              onClick={() => onSelect && onSelect('dashboard')}
            >
              <BarChart3 className="sidebar-menu-icon" /> 대시보드
            </button>
          </li>
          <li>
            <button
              className={`sidebar-menu-btn${selected === 'remote' ? ' selected' : ''}`}
              onClick={() => onSelect && onSelect('remote')}
            >
              <Settings className="sidebar-menu-icon" /> 원격제어
            </button>
          </li>
          <li>
            <button
              className={`sidebar-menu-btn${selected === 'alarm' ? ' selected' : ''}`}
              onClick={() => onSelect && onSelect('alarm')}
            >
              <Bell className="sidebar-menu-icon" /> 알림
            </button>
          </li>
          <li>
            <button
              className={`sidebar-menu-btn${selected === 'ai-analysis' ? ' selected' : ''}`}
              onClick={() => onSelect && onSelect('ai-analysis')}
            >
              <Brain className="sidebar-menu-icon" /> AI 분석
            </button>
          </li>
        </ul>
      </nav>
      <div className="sidebar-divider"></div>
      {/* 로그아웃 */}
      <div className="sidebar-logout">
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <Users className="sidebar-menu-icon" /> 로그아웃
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;