import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
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
import axios from 'axios';
import './App.css';

const API_BASE_URL = import.meta.VITE_API_BASE_URL;
const API_LOGIN_API = import.meta.VITE_LOGIN_API;
const FARM_CODE_API = import.meta.VITE_FARM_CODE_API;
const FARM_CODE_ENDPOINT = import.meta.VITE_FARM_CODE_ENDPOINT;

// --- API 호출 함수 분리 ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 1. 로그인 API
const loginUser = async (userId, password) => {
  const response = await apiClient.post(`${API_LOGIN_API}`, { userId, password });
  if (!response.data || !response.data.token) {
    throw new Error('인증 토큰이 없습니다.');
  }
  return response.data.token;
};

// 2. farmCode API 호출
const getFarmCode = async () => {
  const response = await apiClient.get(`${FARM_CODE_API}/${FARM_CODE_ENDPOINT}`);
  return response.data; 
};

// 3. farmCode로 농장 데이터 조회 API 호출 (아직 없는듯)
const getFarmDataByCode = async (farmCode) => {
  const response = await apiClient.get(`/farm/${farmCode}/farmData`);
  // 성공 시, 농장 상세 데이터가 반환되는 API 필요 
  // 예: { farmId: "...", farmName: "...", farmType: "고형배지", ... }
  return response.data;
};

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

function DashboardLayout({ farmData, farmCode, onLogout }) {
  // 기존 대시보드 레이아웃을 별도 컴포넌트로 분리
  const unityContext = useSharedUnityContext(farmData);
  const [selectedMenu, setSelectedMenu] = React.useState('dashboard');
  const [showAIModal, setShowAIModal] = React.useState(false);

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
          onLogout={onLogout}
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
                {!unityContext.isLoaded && !unityContext.error && (
                  <div className="unity-loading-overlay">
                    <div className="unity-loading-text">
                      Unity 로딩 중... {Math.round(unityContext.loadingProgression * 100)}%
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
                      빌드: {unityContext.folderName || '대기 중'} ({farmData?.farmType} + {farmData?.houseType})
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
                farmCode={farmCode}
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

function AppContent() {
  const [farmCode, setFarmCode] = useState(null);
  const [farmData, setFarmData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 로그인 상태 및 농장 정보 복원
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedToken = localStorage.getItem('authToken');
        const savedFarmData = localStorage.getItem('farmData');
        const savedFarmCode = localStorage.getItem('farmCode');
        
        if (savedToken && savedFarmData && savedFarmCode) {
          // 앱 시작 시 토큰이 있으면 바로 apiClient 기본 헤더에 설정
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          setFarmData(JSON.parse(savedFarmData));
          setFarmCode(savedFarmCode);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('세션 복원 실패:', error);
        localStorage.clear();
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  //  4. API 호출 처리하는 로그인 핸들러
  const handleLogin = async (userId, password) => {
    try {
      // 1단계: 로그인하여 인증 토큰을 받음
      const token = await loginUser(userId, password);
      
      // 2단계: 받은 토큰을 apiClient 기본 헤더에 설정
      // 이제부터 모든 요청에 이 토큰이 포함
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('authToken', token);

      // 3단계: 인증된 상태에서 farmCode를 조회
      const farmCode = await getFarmCode();
      setFarmCode(farmCode);
      
      // 4단계: 받아온 farmCode로 실제 농장 데이터를 조회
      const fetchedFarmData = await getFarmDataByCode(farmCode);

      setFarmData(fetchedFarmData);
      localStorage.setItem('farmData', JSON.stringify(fetchedFarmData));
      setIsLoggedIn(true);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('로그인 프로세스 실패:', error);
      localStorage.clear(); // 실패 시 저장된 모든 정보 삭제
      throw error;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setFarmData(null);
    localStorage.removeItem('farmData');
    localStorage.removeItem('farmCode');
    localStorage.removeItem('authToken');
    // 로그아웃 시 apiClient 헤더에서도 토큰 제거
    delete apiClient.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" 
        element={!isLoggedIn  ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
      />
      <Route path="/signup" element={<SignupPage onNavigate={navigate}/>} />
      <Route path="/user-profile" element={<UserProfilePage />} />
      <Route path="/dashboard" 
        element={farmData && farmCode ? <DashboardLayout farmData={farmData} farmCode={farmCode} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
      <Route path="/crop-control" element={<CropControlUI />} />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <IotDataProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </IotDataProvider>
    </UserProvider>
  );
}

export default App;