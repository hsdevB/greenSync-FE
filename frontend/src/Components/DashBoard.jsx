import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './DashBoard.css';
import DashBoardCards from './DashBoardCards';

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
      {/* Sidebar는 개별 컴포넌트로 분리 */}
      <Sidebar selected="dashboard" />
      {/* 메인 컨텐츠 */}
      <div className="dashboard-main">
        {/* 헤더 */}
        <div className="dashboard-header" style={{
          position: 'sticky',
          top: 0,
          background: '#f7f8fa',
          zIndex: 10,
          padding: '24px 0 16px 0'
        }}>
          <h1 className="dashboard-title">대시보드</h1>
          <div className="dashboard-time">{formatTime(currentTime)}</div>
        </div>
        {/* 2x2 그래프 카드 (맨 위로 배치됨) */}
        <DashBoardCards />
      </div>
    </div>
  );
};

export default Dashboard;
