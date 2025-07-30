import React from 'react';
import DashBoardCards from './DashBoardCards';
import DashBoardCardsTest from './DashBoardCardsTest';
import RemoteControlPanel from './RemoteControlPanel';
import AIChatbot from './AIChatbot';
import './DashBoard.css';

const Dashboard = ({ selectedMenu, unityContext, farmData }) => {
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
          farmData={farmData} 
        />}
      {selectedMenu === 'dashboard-test' && <DashBoardCardsTest unityContext={unityContext}/>}
      {selectedMenu === 'remote' && <RemoteControlPanel unityContext={unityContext}/>}
      {/* AI 분석은 사이드바에서 처리됨 */}
      {/* 알림 등은 추후 추가 */}
      
      {/* AI 챗봇 - AI 분석 메뉴 선택 시에만 표시 */}
      <AIChatbot showChatbot={selectedMenu === 'ai-analysis'} />
    </div>
  );
};

export default Dashboard;
