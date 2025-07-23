import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useSharedUnityContext from "./UnityWrapper";
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/DashBoard';
import MainPage from './Page/MainPage';
import LoginPage from './Page/LoginPage';
import SignupPage from './Page/SignupPage';
import CropControlUI from './Components/CropControlUI';
import AIButton from './Components/AIButton';
import { Unity } from 'react-unity-webgl';
import './App.css';

function getCurrentTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const day = now.getDay();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  let hour = now.getHours();
  const min = now.getMinutes().toString().padStart(2, "0");
  const ampm = hour < 12 ? "오전" : "오후";
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${year}년 ${month}월 ${date}일 ${days[day]}요일 ${ampm} ${hour}:${min}`;
}

function DashboardLayout({ unityContext }) {
  const [selectedMenu, setSelectedMenu] = React.useState('dashboard');
  const handleLogout = () => { /* 로그아웃 처리 */ };
  
  return (
    <div className="main-layout">
      {/* 사이드바 */}
      <Sidebar
        selected={selectedMenu}
        onSelect={setSelectedMenu}
        onLogout={handleLogout}
      />
      
      {/* 상단 고정된 대시보드 헤더 */}
      <div className="dashboard-header-fixed">
        <div className="dashboard-header-content">
          <div className="dashboard-title">대시보드</div>
          <div className="dashboard-time">{getCurrentTimeString()}</div>
        </div>
      </div>
      
      {/* 좌우 분할 레이아웃 */}
      <div className="split-layout">
        {/* 왼쪽: Unity 3D 화면 */}
        <div className="unity-section">
      <div className="unity-container">
        <div className="unity-content">
          <Unity
            style={{
              width: '100%',
              height: '100%',
              background: '#222',
              borderRadius: '12px',
              opacity: unityContext.isLoaded ? 1 : 0.3,
              transition: 'opacity 0.3s'
            }}
            unityProvider={unityContext.unityProvider}
            devicePixelRatio={window.devicePixelRatio}
            config={{
              companyName: "GreenSync",
              productName: "SmartFarm",
              productVersion: "1.0.0"
            }}
            onError={(error) => {
              console.error('Unity 에러:', error);
            }}
            onProgress={(progress) => {
              console.log('Unity 로딩 진행률:', progress);
            }}
            onInitialized={() => {
              console.log('Unity 초기화 완료!');
            }}
          />
          {/* Unity 로딩 오버레이 */}
          {!unityContext.isLoaded && (
            <div className="unity-loading-overlay">
              <div className="unity-loading-text">
                Unity 로딩 중... {Math.round(unityContext.loadingProgression * 100)}%
              </div>
              <div className="unity-loading-bar-bg">
                <div
                  className="unity-loading-bar-fill"
                  style={{ width: `${Math.round(unityContext.loadingProgression * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
        
        {/* 오른쪽: UI 콘텐츠 */}
        <div className="ui-section">
          <main className="dashboard-area">
            <Dashboard selectedMenu={selectedMenu} unityContext={unityContext} />
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  const unityContext = useSharedUnityContext();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardLayout unityContext={unityContext} />} />
        <Route path="/crop-control" element={<CropControlUI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;