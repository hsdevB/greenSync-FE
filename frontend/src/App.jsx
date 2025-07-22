import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useSharedUnityContext from "./UnityWrapper";
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/DashBoard';
import MainPage from './Page/MainPage';
import LoginPage from './Page/LoginPage';
import SignupPage from './Page/SignupPage';
import CropControlUI from './Components/CropControlUI';
import { Unity } from 'react-unity-webgl';
import './App.css';

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
      
      {/* 메인 콘텐츠 영역 */}
      <main className="dashboard-area">
        <Dashboard selectedMenu={selectedMenu} unityContext={unityContext} />
      </main>
      
      {/* 고정된 3D Unity 화면 */}
      <div className="unity-fixed-container">
        <div className="unity-fixed-content">
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
            <div className="unity-loading-overlay-fixed">
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