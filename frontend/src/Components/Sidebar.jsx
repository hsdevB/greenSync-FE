// src/Components/Sidebar.jsx
import { User, BarChart3, Settings, Bell, Users, Brain, UserCheck } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore.jsx";
import "./Sidebar.css";

const Sidebar = ({ selected, onSelect, onLogout }) => {
  const { userInfo } = useUserStore();
  
  return (
    <aside className="sidebar">
      {/* 프로필 */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          {userInfo.profileImage ? (
            <img 
              src={userInfo.profileImage} 
              alt="프로필" 
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover"
              }}
            />
          ) : (
            <User className="sidebar-avatar-icon" />
          )}
        </div>
        <div className="sidebar-username">{userInfo.name}님</div>
        {/* 내 정보 버튼 추가 */}
        <button
          className="sidebar-profile-btn"
          onClick={() => window.location.href = "/user-profile"}
          style={{
            marginTop: "8px",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #388e3c",
            background: "#fff",
            color: "#388e3c",
            cursor: "pointer",
            fontSize: "13px",
            width: "100%"
          }}
        >
          내 정보
        </button>
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
              data-menu="ai-analysis"
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