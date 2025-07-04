import React, { useState, useEffect } from 'react';
import {
  User, BarChart3, Settings, Bell, Users
} from 'lucide-react';
import './DashBoard.css';
import './Sidebar.css';
import DashBoardCards from './DashBoardCards';

const Sidebar = ({ selected }) => (
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
          >
            <BarChart3 className="sidebar-menu-icon" /> 대시보드
          </button>
        </li>
        <li>
          <button
            className={`sidebar-menu-btn${selected === 'remote' ? ' selected' : ''}`}
          >
            <Settings className="sidebar-menu-icon" /> 원격제어
          </button>
        </li>
        <li>
          <button
            className={`sidebar-menu-btn${selected === 'alarm' ? ' selected' : ''}`}
          >
            <Bell className="sidebar-menu-icon" /> 알림
          </button>
        </li>
      </ul>
    </nav>
    <div className="sidebar-divider"></div>
    {/* 로그아웃 */}
    <div className="sidebar-logout">
      <button className="sidebar-logout-btn">
        <Users className="sidebar-menu-icon" /> 로그아웃
      </button>
    </div>
  </aside>
);

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => {
    return time.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-root">
      {/* Sidebar */}
      <Sidebar selected="dashboard" />

      {/* 메인 컨텐츠 */}
      <div className="dashboard-main">
        {/* 헤더 */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">대시보드</h1>
          <div className="dashboard-time">{formatTime(currentTime)}</div>
        </div>

        {/* 2x2 그래프 카드 (맨 위로 배치됨) */}
        <DashBoardCards />

        {/* 기존 상단 카드들 */}
        <div className="dashboard-cards-row">
          {/* ...조도, CO2, 습윤, 생육 예측 등 카드... */}
        </div>

        {/* 기존 메인 차트들 */}
        <div className="dashboard-charts-row">
          {/* ...온도, CO2/습도 차트... */}
        </div>

        {/* 기존 하단 카드들 */}
        <div className="dashboard-cards-row">
          {/* ...습도 관리, 광량, 전기전도도, pH 수치 카드... */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
