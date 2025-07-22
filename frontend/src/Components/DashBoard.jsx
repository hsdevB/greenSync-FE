import React from 'react';
import DashBoardCards from './DashBoardCards';
import DashBoardCardsTest from './DashBoardCardsTest';
import RemoteControlPanel from './RemoteControlPanel';
import AIButton from './AIButton';
import './DashBoard.css';



const Dashboard = ({ selectedMenu, unityContext }) => {
  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        {/* <h1 className="dashboard-title">대시보드</h1>
        <div className="dashboard-time">{formatTime(currentTime)}</div> */}
      </div>
      {selectedMenu === 'dashboard' && <DashBoardCards unityContext={unityContext}/>}
      {selectedMenu === 'dashboard-test' && <DashBoardCardsTest unityContext={unityContext}/>}
      {selectedMenu === 'remote' && <RemoteControlPanel unityContext={unityContext}/>}
      {selectedMenu === 'ai-analysis' && <AIButton farmId="farm001" />}
      {/* 알림 등은 추후 추가 */}
    </div>
  );
};

export default Dashboard;
