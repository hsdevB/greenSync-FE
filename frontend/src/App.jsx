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
import AIAnalysisModal from './Components/AIAnalysisModal';
import UserProfilePage from './Page/UserProfilePage';
import Chatbot from './Components/Chatbot';
import RemoteControlPanel from './Components/RemoteControlPanel';
import { IotDataProvider } from './api/IotDataProvider.jsx';
import { UserProvider } from './store/useUserStore.jsx';
import { MQTTProvider } from './hooks/MQTTProvider';
import './App.css';

// // 목업 농장 데이터
// const MOCK_FARM_DATA = {
//   farmId: "farm001",
//   farmName: "GreenSync 스마트팜",
//   farmType: "hydroponic", // hydroponic, soil, greenhouse
//   houseType: "container", // container, greenhouse, outdoor
//   owner: "김농부",
//   location: "서울특별시 강남구",
//   establishedDate: "2024-01-15",
//   totalArea: "100평",
//   cropType: "상추, 토마토, 오이",
//   sensors: {
//     temperature: 4,
//     humidity: 4,
//     ph: 2,
//     light: 2
//   },
//   devices: {
//     waterPump: 1,
//     fan: 2,
//     heater: 1,
//     led: 4
//   }
// };

// // 목업 사용자 데이터 (이메일/비밀번호 기반)
// const MOCK_USERS = [
//   {
//     email: 'admin@greensync.com',
//     password: '1234',
//     farmData: MOCK_FARM_DATA
//   },
//   {
//     email: 'farmer@greensync.com',
//     password: 'farm123',
//     farmData: {
//       ...MOCK_FARM_DATA,
//       farmId: "farm002",
//       farmName: "스마트 그린하우스",
//       owner: "이농부"
//     }
//   },
//   {
//     email: 'test@test.com',
//     password: 'test123',
//     farmData: {
//       ...MOCK_FARM_DATA,
//       farmId: "farm003",
//       farmName: "테스트 농장",
//       owner: "테스트농부"
//     }
//   }
// ];

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
  // 기존 대시보드 레이아웃을 별도 컴포넌트로 분리
  const [selectedMenu, setSelectedMenu] = React.useState('dashboard');
  const [showAIModal, setShowAIModal] = React.useState(false);
  const [showChatbot, setShowChatbot] = React.useState(false);
  const handleLogout = () => { /* 로그아웃 처리 */ 
    // 로그아웃 시 농장 정보 초기화
    // localStorage.removeItem('farmData');
    // localStorage.removeItem('isLoggedIn'); // 임의
    // window.location.href = '/login'; // 임의
  };
  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu);
    // AI 분석 버튼 클릭 시 채팅봇 열기
    if (menu === 'ai-analysis') {
      setShowChatbot(true);
    }
  };

  const handleAIModalClose = () => {
    setShowAIModal(false);
    // AI 분석 모달이 닫혀도 selectedMenu는 'ai-analysis'로 유지
    setSelectedMenu('ai-analysis');
  };

  const handleChatbotClose = () => {
    setShowChatbot(false);
    setSelectedMenu('dashboard'); // 채팅봇 닫을 때 대시보드로 돌아가기
  };
  return (
    // Dashboard에서만 MQTTContext 사용
    <MQTTProvider> 
      <div className="main-layout">
        <Sidebar
          selected={selectedMenu}
          onSelect={handleMenuSelect}
          onLogout={handleLogout}
          // farmData={farmData}
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
          <div className="unity-section" style={{ 
            display: selectedMenu === 'ai-analysis' ? 'none' : 'block',
            width: selectedMenu === 'ai-analysis' ? '0%' : '50%'
          }}>
            <div className="unity-container">
              <div className="unity-content">
                {unityContext.unityProvider && (
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
                )}
                                  {/* Unity 로딩 오버레이 */}
                  {unityContext.unityProvider && !unityContext.isLoaded && (
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
                      {unityContext.error && (
                        <div className="unity-error-text">
                          오류: {unityContext.error}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
              
          {/* 오른쪽: UI 콘텐츠 */}
          <div className="ui-section" style={{ 
            width: selectedMenu === 'ai-analysis' ? '100%' : '60%'
          }}>
            <main className="dashboard-area">
            <Dashboard 
                selectedMenu={selectedMenu} 
                unityContext={unityContext} 
                // farmData={farmData}
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

        {/* AI 분석 채팅봇 */}
        <Chatbot 
          isOpen={showChatbot}
          onClose={handleChatbotClose}
          sidebar={
            <Sidebar
              selected={selectedMenu}
              onSelect={handleMenuSelect}
              onLogout={handleLogout}
            />
          }
        />
      </div>
    </MQTTProvider>
  );
}

// // LoginPage를 감싸는 컴포넌트 (목업 로그인 기능 추가)
// function LoginPageWrapper({ onLogin }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     // 목업 로그인 처리
//     setTimeout(() => {
//       const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      
//       if (user) {
//         onLogin(user.farmData);
//         localStorage.setItem('currentUser', JSON.stringify({
//           email: user.email,
//           loginTime: new Date().toISOString()
//         }));
//         // 대시보드로 리다이렉트
//         window.location.href = '/dashboard';
//       } else {
//         setError('이메일 또는 비밀번호가 틀렸습니다.');
//       }
//       setLoading(false);
//     }, 1000); // 실제 API 호출을 시뮬레이션
//   };

//   return (
//     <div style={{
//       minHeight: "100vh",
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       justifyContent: "center",
//       background: "linear-gradient(135deg, #e0f7fa 0%, #a5d6a7 100%)"
//     }}>
//       <div style={{
//         fontSize: 36,
//         fontWeight: "bold",
//         color: "#388e3c",
//         marginBottom: 8
//       }}>
//         GreenSync
//       </div>
//       <div style={{
//         fontSize: 18,
//         color: "#555",
//         marginBottom: 32
//       }}>
//         로그인
//       </div>

//       {/* 목업 계정 안내 */}
//       <div style={{
//         background: "rgba(255, 255, 255, 0.9)",
//         padding: "16px",
//         borderRadius: "8px",
//         marginBottom: "16px",
//         fontSize: "14px",
//         color: "#555",
//         textAlign: "center",
//         boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
//       }}>
//         <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#388e3c" }}>테스트 계정</div>
//         <div>관리자: admin@greensync.com / 1234</div>
//         <div>농부: farmer@greensync.com / farm123</div>
//         <div>테스트: test@test.com / test123</div>
//       </div>

//       <form onSubmit={handleLogin} style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         width: 320,
//         background: "white",
//         padding: 32,
//         borderRadius: 12,
//         boxShadow: "0 2px 16px rgba(56,142,60,0.10)",
//         marginBottom: 16
//       }}>
//         {error && (
//           <div style={{
//             width: "100%",
//             padding: "12px",
//             marginBottom: "16px",
//             background: "#ffebee",
//             color: "#c62828",
//             borderRadius: "6px",
//             fontSize: "14px",
//             textAlign: "center"
//           }}>
//             {error}
//           </div>
//         )}
        
//         <input
//           type="email"
//           placeholder="이메일"
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//           required
//           disabled={loading}
//           style={{
//             width: "100%",
//             padding: "12px 16px",
//             marginBottom: 16,
//             border: "1px solid #bdbdbd",
//             borderRadius: 6,
//             fontSize: 16,
//             opacity: loading ? 0.6 : 1
//           }}
//         />
//         <input
//           type="password"
//           placeholder="비밀번호"
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//           required
//           disabled={loading}
//           style={{
//             width: "100%",
//             padding: "12px 16px",
//             marginBottom: 24,
//             border: "1px solid #bdbdbd",
//             borderRadius: 6,
//             fontSize: 16,
//             opacity: loading ? 0.6 : 1
//           }}
//         />
//         <button 
//           type="submit" 
//           disabled={loading}
//           style={{
//             width: "100%",
//             padding: "14px 0",
//             fontSize: 18,
//             background: loading ? "#ccc" : "#388e3c",
//             color: "white",
//             border: "none",
//             borderRadius: 8,
//             cursor: loading ? "not-allowed" : "pointer",
//             fontWeight: "bold"
//           }}
//         >
//           {loading ? "로그인 중..." : "로그인"}
//         </button>
//       </form>
//       <div style={{ fontSize: 15, color: "#666" }}>
//         계정이 없으신가요? <a href="/signup" style={{ color: "#388e3c", textDecoration: "underline" }}>회원가입</a>
//       </div>
//     </div>
//   );
// }

function App() {
  // const [farmData, setFarmData] = useState(null);
  // const [isLoggedIn, setIsLoggedIn] = useState(false); // 임의
  // const [loading, setLoading] = useState(true); // 임의

  // Unity Context 생성 (농장 데이터가 있을 때만)
  const unityContext = useSharedUnityContext(
    // farmData?.farmId,
    // farmData?.farmType,
    // farmData?.houseType
  );

  // // 로그인 상태 및 농장 정보 복원
  // useEffect(() => {
  //   const checkLoginStatus = () => {
  //     try {
  //       const savedLoginStatus = localStorage.getItem('isLoggedIn'); // 임의
  //       const savedFarmData = localStorage.getItem('farmData');

  //       if (savedLoginStatus === 'true' && savedFarmData) {
  //         const parsedFarmData = JSON.parse(savedFarmData);
  //         setFarmData(parsedFarmData);
  //         // setIsLoggedIn(true);
  //       }
  //     } catch (error) {
  //       console.error('로그인 상태 복원 중 오류:', error); 
  //       localStorage.removeItem('isLoggedIn');
  //       localStorage.removeItem('farmData');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   checkLoginStatus();
  // }, []);

  // // 농장 정보 설정 함수 (로그인 시 호출)
  // const setFarmInfo = (farmInfo) => {
  //   setFarmData(farmInfo);
  //   // setIsLoggedIn(true);
  //   localStorage.setItem('farmData', JSON.stringify(farmInfo));
  //   localStorage.setItem('isLoggedIn', 'true');
  // };

  // // 로딩 중일 때 // 임의
  // if (loading) {
  //   return (
  //     <div style={{ 
  //       display: 'flex', 
  //       justifyContent: 'center', 
  //       alignItems: 'center', 
  //       height: '100vh',
  //       flexDirection: 'column'
  //     }}>
  //       <div>로딩 중...</div>
  //     </div>
  //   );
  // }

  return (
    <UserProvider>
      <IotDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* 목업데이터용 (하단) */}
            {/* <Route path="/login" element={<LoginPageWrapper onLogin={setFarmInfo} />} /> */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/user-profile" element={<UserProfilePage />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/remote" element={<RemoteControlPanel unityContext={unityContext} />} />
            <Route path="/dashboard" 
              element={
                // isLoggedIn && farmData ? (
                  <DashboardLayout 
                    // farmData={farmData} 
                    unityContext={unityContext} 
                  />
                // ) : (
                  // 로그인하지 않았거나 농장 정보가 없으면 로그인 페이지로 리다이렉트
                  // <LoginPage onLogin={setFarmInfo} />
                  // 목업 데이터용 (하단)
                  // <LoginPageWrapper onLogin={setFarmInfo} />
                // )
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