import React from 'react';
import DashBoardCards from './DashBoardCards';
import RemoteControlPanel from './RemoteControlPanel';
import AIChatComponent from './AIChatComponent';
import './DashBoard.css';

const Dashboard = ({ selectedMenu, unityContext, farmCode }) => {
  // 디버깅을 위한 콘솔 로그
  console.log('Dashboard selectedMenu:', selectedMenu);
  console.log('showChatbot:', selectedMenu === 'ai-analysis');

  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        {/* <h1 className="dashboard-title">대시보드</h1>
        <div className="dashboard-time">{formatTime(currentTime)}</div> */}
      </div>
      {selectedMenu === 'dashboard' && <DashBoardCards 
          farmCode={farmCode}
        />}
      {selectedMenu === 'remote' && <RemoteControlPanel unityContext={unityContext} farmCode={farmCode}/>}
      {selectedMenu === 'ai-analysis' && <AIChatComponent />}
      {/* 알림 등은 추후 추가 */}
    </div>
  );
};

export default Dashboard;
