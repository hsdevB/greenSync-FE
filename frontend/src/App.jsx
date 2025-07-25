import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useSharedUnityContext from "./UnityWrapper";
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/DashBoard';
import MainPage from './Page/MainPage';
import LoginPage from './Page/LoginPage';
import SignupPage from './Page/SignupPage';
import { MQTTProvider } from './hooks/MQTTProvider';
import './App.css';

function DashboardLayout({ farmData, unityContext }) {
  // 기존 대시보드 레이아웃을 별도 컴포넌트로 분리
  const [selectedMenu, setSelectedMenu] = React.useState('dashboard');
  const handleLogout = () => { /* 로그아웃 처리 */ 
    // 로그아웃 시 농장 정보 초기화
    localStorage.removeItem('farmData');
    localStorage.removeItem('isLoggedIn'); // 임의
    window.location.href = '/login'; // 임의
  };
  return (
    // Dashboard에서만 MQTTContext 사용
    <MQTTProvider> 
      <div className="main-layout">
        <Sidebar
          selected={selectedMenu}
          onSelect={setSelectedMenu}
          onLogout={handleLogout}
          farmData={farmData}
          />
        <main className="dashboard-area">
            <Dashboard 
              selectedMenu={selectedMenu} 
              unityContext={unityContext} 
              farmData={farmData}
            />
        </main>
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage onLogin={setFarmInfo} />} />
        <Route path="/signup" element={<SignupPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;