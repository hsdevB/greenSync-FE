import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Unity } from 'react-unity-webgl';
import useSharedUnityContext from "./UnityWrapper";
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/DashBoard';
import MainPage from './Page/MainPage';
import LoginPage from './Page/LoginPage';
import SignupPage from './Page/SignupPage';
import CropControlUI from './Components/CropControlUI';
import './App.css';

// 현재 시간을 문자열로 반환하는 함수
function getCurrentTimeString() {
  const now = new Date();
  return now.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function DashboardLayout({ unityContext }) {
  // 기존 대시보드 레이아웃을 별도 컴포넌트로 분리
  const [selectedMenu, setSelectedMenu] = React.useState('dashboard');
  const handleLogout = () => { /* 로그아웃 처리 */ };
  return (
    <div className="main-layout">
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