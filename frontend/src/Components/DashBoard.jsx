import React from 'react';
import DashBoardCards from './DashBoardCards';
import RemoteControlPanel from './RemoteControlPanel';
import './DashBoard.css';



const Dashboard = ({ selectedMenu }) => {
  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        {/* <h1 className="dashboard-title">대시보드</h1>
        <div className="dashboard-time">{formatTime(currentTime)}</div> */}
      </div>
      {selectedMenu === 'dashboard' && <DashBoardCards />}
      {selectedMenu === 'remote' && <RemoteControlPanel />}
      {/* 알림 등은 추후 추가 */}
    </div>
  );
};

export default Dashboard;
