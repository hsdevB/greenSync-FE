import React from 'react';
import DashBoardCards from './DashBoardCards';
import './DashBoard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        {/* <h1 className="dashboard-title">대시보드</h1>
        <div className="dashboard-time">{formatTime(currentTime)}</div> */}
      </div>
      <DashBoardCards />
    </div>
  );
};

export default Dashboard;
