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

function DashboardLayout({ unityContext }) {
  // 기존 대시보드 레이아웃을 별도 컴포넌트로 분리
  const [selectedMenu, setSelectedMenu] = React.useState('dashboard');
  const handleLogout = () => { /* 로그아웃 처리 */ };
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;