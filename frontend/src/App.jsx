import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Unity } from 'react-unity-webgl';
import useSharedUnityContext from "./UnityWrapper";
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/DashBoard';
import MainPage from './Page/MainPage';
import LoginPage from './Page/LoginPage';
import SignupPage from './Page/SignupPage';
import CropControlUI from './Components/CropControlUI';
import AIAnalysisModal from './Components/AIAnalysisModal';
import UserProfilePage from './Page/UserProfilePage';
import { IotDataProvider } from './api/IotDataProvider.jsx';
import { UserProvider } from './store/useUserStore.jsx';
import { MQTTProvider } from './hooks/MQTTProvider';
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

function DashboardLayout({ farmData, unityContext }) {
  // 기존 대시보드 레이아웃을 별도 컴포넌트로 분리
  const [selectedMenu, setSelectedMenu] = React.useState('dashboard');
  const [showAIModal, setShowAIModal] = React.useState(false);
  const handleLogout = () => { /* 로그아웃 처리 */ 
    // 로그아웃 시 농장 정보 초기화
    localStorage.removeItem('farmData');
    localStorage.removeItem('isLoggedIn'); // 임의
    window.location.href = '/login'; // 임의
  };
  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu);
    if (menu === 'ai-analysis') {
      setShowAIModal(true);
    }
  };

  const handleAIModalClose = () => {
    setShowAIModal(false);
    // AI 분석 모달이 닫혀도 selectedMenu는 'ai-analysis'로 유지
    setSelectedMenu('ai-analysis');
  };
  return (
    // Dashboard에서만 MQTTContext 사용
    <MQTTProvider> 
      <div className="main-layout">
        <Sidebar
          selected={selectedMenu}
          onSelect={handleMenuSelect}
          onLogout={handleLogout}
          farmData={farmData}
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
                    borderRadius: '0px',
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
            <Dashboard 
                selectedMenu={selectedMenu} 
                unityContext={unityContext} 
                farmData={farmData}
              />
            </main>
          </div>
        </div>

        {/* AI 분석 모달 */}
        <AIAnalysisModal 
          isOpen={showAIModal}
          onClose={handleAIModalClose}
          farmId="farm001"
        />
      </div>
    </MQTTProvider>
  );
}

function App() {
  const [farmData, setFarmData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 임의
  const [loading, setLoading] = useState(true); // 임의

  // Unity Context 생성 (농장 데이터가 있을 때만)
  const unityContext = useSharedUnityContext(
    farmData?.farmId,
    farmData?.farmType,
    farmData?.houseType
  );

  // 로그인 상태 및 농장 정보 복원
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const savedLoginStatus = localStorage.getItem('isLoggedIn'); // 임의
        const savedFarmData = localStorage.getItem('farmData');

        if (savedLoginStatus === 'true' && savedFarmData) {
          const parsedFarmData = JSON.parse(savedFarmData);
          setFarmData(parsedFarmData);
          // setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('로그인 상태 복원 중 오류:', error); 
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('farmData');
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // 농장 정보 설정 함수 (로그인 시 호출)
  const setFarmInfo = (farmInfo) => {
    setFarmData(farmInfo);
    setIsLoggedIn(true);
    localStorage.setItem('farmData', JSON.stringify(farmInfo));
    localStorage.setItem('isLoggedIn', 'true');
  };

  // 로딩 중일 때 // 임의
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <UserProvider>
      <IotDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage onLogin={setFarmInfo} />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/user-profile" element={<UserProfilePage />} />
            <Route path="/dashboard" 
              element={
                isLoggedIn && farmData ? (
                  <DashboardLayout 
                    farmData={farmData} 
                    unityContext={unityContext} 
                  />
                ) : (
                  // 로그인하지 않았거나 농장 정보가 없으면 로그인 페이지로 리다이렉트
                  <LoginPage onLogin={setFarmInfo} />
                )
              } 
            />
            <Route path="/crop-control" element={<CropControlUI />} />
          </Routes>
        </BrowserRouter>
      </IotDataProvider>
    </UserProvider>
  );
}

export default App;