import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useSharedUnityContext from "./UnityWrapper";
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/DashBoard';
import MainPage from './Page/MainPage';
import LoginPage from './Page/LoginPage';
import SignupPage from './Page/SignupPage';
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

function DashboardLayout({ unityContext }) {
  const [selectedMenu, setSelectedMenu] = React.useState('dashboard');
  const [showAIModal, setShowAIModal] = React.useState(false);
  const handleLogout = () => { /* 로그아웃 처리 */ };
  
  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu);
    if (menu === 'ai-analysis') {
      setShowAIModal(true);
    }
  };
  
  return (
    // Dashboard에서만 MQTTContext 사용
    <MQTTProvider> 
      <div className="main-layout">
        <Sidebar
          selected={selectedMenu}
          onSelect={setSelectedMenu}
          onLogout={handleLogout}
        />
        <main className="dashboard-area">
            <Dashboard selectedMenu={selectedMenu} unityContext={unityContext} />
        </main>
      </div>
    </MQTTProvider>
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