import React, { useState, useEffect, useCallback } from "react";
import { Unity } from "react-unity-webgl";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { Sun, Moon, Cloud, Thermometer, Droplets, Zap, Activity, RotateCcw } from "lucide-react";
import "./DashBoardCards.css";
import DashBoardData from './DashBoardData.json';
import OpenWeather from "./OpenWheater.jsx";
import { useIotData } from '../api/useIotData.js';
import axios from "axios";
import useControlStore from '../store/useControlStore.jsx';
import { useAutoMode } from '../hooks/useAutoMode.jsx';
class UnityMessage {
  constructor(name, data) {
    this.name = name;
    this.data = JSON.stringify(data);
  }
}

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

const DashBoardCards = ({ unityContext }) => {
  const { unityProvider, isLoaded, loadingProgression, sendMessage } = unityContext;
  const loadingPercentage = Math.round(loadingProgression * 100); // 로딩 퍼센트

  // 상태 관리 초기화
  const [currentTime, setCurrentTime] = useState(getCurrentTimeString()); // 현재 시간
  const [refreshDisabled, setRefreshDisabled] = useState(false); // 새로고침 비활성화 상태
  const [refreshTimer, setRefreshTimer] = useState(0); // 새로고침 타이머
  const [unityError, setUnityError] = useState(null); // Unity 에러 상태
  const iotData = useIotData(); // 온실 내 IoT 데이터
  const [indoorTemp, setIndoorTemp] = useState('--'); 
  const [indoorHumi, setIndoorHumi] = useState('--');
  const [phValue, setPhValue] = useState('--');
  const [carbonDioxide, setCarbonDioxide] = useState('--');
  const [elcDT, setElcDT] = useState('--');
  const [illuminance, setIlluminance] = useState('--');


 // unity 초기화할 때 보내줄 제어값
 const sendToUnity = useCallback((eventName, payload) => {
  if (!isLoaded) {
    console.log("Unity not loaded yet, skipping message:", eventName);
    return;
  }
  
  try {
    const message = new UnityMessage(eventName, payload);
    console.log("Sending to Unity:", JSON.stringify(message));
    sendMessage("MessageManager", "ReceiveMessage", JSON.stringify(message));
  } catch (error) {
    console.error("Error sending message to Unity:", error);
  }
}, [sendMessage, isLoaded]);

const {
  water, fan, ledLevel, temp, humid, restoreFromLocal, autoMode,
} = useControlStore();

// 자동모드 커스텀 훅 사용
const { simulatedData } = useAutoMode(sendToUnity);

useEffect(() => {
// 상태 복원 (로컬스토리지에 저장한 상태 있다면)
restoreFromLocal();
}, []);

useEffect(() => {
  if (isLoaded) {
    // Unity 로드 완료 후 약간의 지연을 두고 메시지 전송
    setTimeout(() => {
      try {
        sendToUnity("startWater", { status: water });
        sendToUnity("fanStatus", { status: fan });
        sendToUnity("ledLevel", { level: ledLevel ? 3 : 0 });
        sendToUnity("tempControl", { value: temp });
        sendToUnity("humidControl", { value: humid });
        
        // 주간/야간 설정
        const currentHour = new Date().getHours();
        const isDay = currentHour >= 6 && currentHour < 18;
        sendToUnity("toggleDayNight", { isDay: isDay });
      } catch (error) {
        console.error("Error initializing Unity:", error);
      }
    }, 500); // 500ms 지연
  }
}, [isLoaded, sendToUnity, water, fan, ledLevel, temp, humid]);

  useEffect(() => {
    // 새로고침 상태 복원
    const savedDisabled = localStorage.getItem('dashboard_refreshDisabled');
    const savedTimer = localStorage.getItem('dashboard_refreshTimer');
    if (savedDisabled === 'true' && savedTimer && Number(savedTimer) > 0) {
      setRefreshDisabled(true);
      setRefreshTimer(Number(savedTimer));
    }
  }, []); // 컴포넌트 마운트 시 새로고침 상태 복원

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeString());
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  // 새로고침 함수 (데이터 fetch 또는 window.location.reload 등으로 대체 가능)
  const handleRefresh = () => {
    setRefreshDisabled(true);
    setRefreshTimer(300); // 5분(300초)
    localStorage.setItem('dashboard_refreshDisabled', 'true');
    localStorage.setItem('dashboard_refreshTimer', '300');
  };

  // 타이머 감소 및 localStorage 동기화
  useEffect(() => {
    let timerRef;
    if (refreshDisabled && refreshTimer > 0) {
      timerRef = setInterval(() => {
        setRefreshTimer(prev => {
          const next = prev - 1;
          localStorage.setItem('dashboard_refreshTimer', String(next));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef);
  }, [refreshDisabled, refreshTimer]);

  // 타이머 종료 시 상태 및 localStorage 초기화
  useEffect(() => {
    if (refreshTimer === 0 && refreshDisabled) {
      setRefreshDisabled(false);
      localStorage.setItem('dashboard_refreshDisabled', 'false');
      localStorage.setItem('dashboard_refreshTimer', '0');
    }
  }, [refreshTimer, refreshDisabled]);

  // Unity 로딩 타임아웃 처리
  useEffect(() => {
    if (!isLoaded && loadingProgression > 0) {
      const timeout = setTimeout(() => {
        if (loadingProgression < 1) {
          console.warn('Unity 로딩 타임아웃 - 90%에서 멈춤');
          setUnityError('Unity 로딩이 시간 초과되었습니다. 페이지를 새로고침해주세요.');
        }
      }, 60000); // 60초로 증가

      return () => clearTimeout(timeout);
    }
  }, [isLoaded, loadingProgression]);

  // Unity 로딩 진행률 모니터링
  useEffect(() => {
    console.log('Unity 상태:', { isLoaded, loadingProgression, loadingPercentage });
    
    if (loadingProgression > 0) {
      console.log(`Unity 로딩 진행률: ${Math.round(loadingProgression * 100)}%`);
      
      // 90%에서 멈추는 것이 정상임을 알려주는 메시지
      if (loadingProgression >= 0.9 && loadingProgression < 1) {
        console.log('Unity 로딩이 90%에서 잠시 멈춥니다. 이는 정상적인 과정입니다.');
      }
    }
  }, [isLoaded, loadingProgression, loadingPercentage]);

  // Unity 에러 상태 초기화
  useEffect(() => {
    if (isLoaded) {
      setUnityError(null);
    }
  }, [isLoaded]);

  // 대시보드 데이터 (임시)
  const dashboardData = DashBoardData;

  // 실내온도 데이터 가져오기
  useEffect(() => {
    const fetchIndoorTemp = async () => {
      try {
        const id = 1;
        const res = await axios.get(`/sensor/temperature/${id}`);
        console.log("res: ", JSON.stringify(res));
        if (res.data && typeof res.data === 'number') {
          setIndoorTemp(res.data);
        } else if (res.data && res.data.data.temperature) {
          setIndoorTemp(res.data.data.temperature);
        } else {
          setIndoorTemp('--');
        }
      } catch (error) {
        console.error('Temperature fetch error:', error);
        setIndoorTemp('--');
      }
    };
    fetchIndoorTemp();
  }, []);
//실내습도 데이터 가져오기
useEffect(() => {
  const fetchIndoorHumi = async () => {
    try {
      const id = 1;
      const res = await axios.get(`/sensor/humidity/${id}`);
      if (res.data && typeof res.data === 'number') {
        setIndoorHumi(res.data);
      } else if (res.data && res.data.data.humidity) {
        setIndoorHumi(res.data.data.humidity);
      } else {
        setIndoorHumi('--');
      }
    } catch (error) {
      console.error('Humidity fetch error:', error);
      setIndoorHumi('--');
    }
  };
  fetchIndoorHumi();
}, []);

// 산도(phLevel)와 전기전도도(elcDT) 한 번에 가져오기
useEffect(() => {
  const fetchNutrient = async () => {
    try {
      const id = 1;
      const res = await axios.get(`/sensor/nutrient/${id}`);

      if (res.data && typeof res.data === 'number') {
        setPhValue(res.data);
      } else if (res.data && res.data.data.phLevel) {
        setPhValue(res.data.data.phLevel);
      } else {
        setPhValue('--');
      }

      if (res.data && typeof res.data === 'number') {
        setElcDT(res.data);
      } else if (res.data && res.data.data.elcDT) {
        setElcDT(res.data.data.elcDT);
      } else {
        setElcDT('--');
      }
    } catch (e) {
      console.error('Nutrient fetch error:', e);
      console.error('Error details:', {
        message: e.message,
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data
      });
      setPhValue('--');
      setElcDT('--');
    }
  };
  fetchNutrient();
}, []);

//이산화탄소 데이터 가져오기
useEffect(() => {
  const fetchCarbonDioxide = async () => {
    try {
      const id = 1;
      const res = await axios.get(`/sensor/carbonDioxide/${id}`);
      if (res.data && typeof res.data === 'number') {
        setCarbonDioxide(res.data);
      } else if (res.data && res.data.data.co2) {
        setCarbonDioxide(res.data.data.co2);
      } else {
        setCarbonDioxide('--');
      }
    } catch (e) {
      setCarbonDioxide('--');
      console.error(e);
    }
  };
  fetchCarbonDioxide();
}, []);

//광량 데이터 가져오기
useEffect(() => {
  const fetchIlluminance = async () => {
    try {
      const id = 1;
      const res = await axios.get(`/sensor/illuminance/${id}`);
      if (res.data && typeof res.data === 'number') {
        setIlluminance(res.data);
      } else if (res.data && res.data.data.illuminance) {
        setIlluminance(res.data.data.illuminance);
      } else {
        setIlluminance('--');
      }
    } catch (e) {
      setIlluminance('--');
      console.error(e);
    }
  };
  fetchIlluminance();
}, []);

  return (
    <div className="dashboard-cards-container">
      {/* 상단 sticky header */}
      <div className="dashboard-sticky-header">
        <div className="dashboard-title">대시보드</div>
        <div className="dashboard-card-value.time">{currentTime}</div>
      </div>
      {/* WebGL 3D 모델 + 새로고침 버튼 */}
      <div style={{ width: '100%', minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', marginTop: '32px' }}>
        <div style={{ flex: 1, maxWidth: '900px', position: 'relative' }}>
          {/* Unity 로딩 오버레이 */}
          {!isLoaded && (
            <div className="unity-loading-overlay">
              <div className="unity-loading-text">
                Unity 로딩 중... {loadingPercentage}%
                {loadingPercentage >= 90 && loadingPercentage < 100 && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginTop: '8px',
                    fontStyle: 'italic'
                  }}>
                    잠시만 기다려주세요...
                  </div>
                )}
              </div>
              <div className="unity-loading-bar-bg">
                <div
                  className="unity-loading-bar-fill"
                  style={{ width: `${loadingPercentage}%` }}
                ></div>
              </div>
              {unityError && (
                <div style={{ 
                  color: '#ef4444', 
                  marginTop: '16px', 
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  {unityError}
                </div>
              )}
              {/* 디버깅 정보 */}
              <div style={{ 
                fontSize: '10px', 
                color: '#999', 
                marginTop: '8px',
                textAlign: 'center'
              }}>
                Unity 상태: {isLoaded ? '로드됨' : '로딩 중'} | 진행률: {loadingPercentage}%
              </div>
            </div>
          )}
          <Unity
            style={{
              width: '100%',
              height: '400px',
              background: '#222',
              borderRadius: '16px',
              opacity: isLoaded ? 1 : 0.3,
              transition: 'opacity 0.3s'
            }}
            unityProvider={unityProvider}
            devicePixelRatio={window.devicePixelRatio}
            config={{
              companyName: "GreenSync",
              productName: "SmartFarm",
              productVersion: "1.0.0"
            }}
            onError={(error) => {
              console.error('Unity 에러:', error);
              setUnityError(`Unity 로딩 중 오류가 발생했습니다: ${error}`);
            }}
            onProgress={(progress) => {
              console.log('Unity 로딩 진행률:', progress);
            }}
            onInitialized={() => {
              console.log('Unity 초기화 완료!');
            }}
          />
        </div>
        {/* 새로고침 버튼 */}
        <button
          className="dashboard-refresh-btn"
          onClick={handleRefresh}
          disabled={refreshDisabled}
          style={{
            marginLeft: '24px',
            height: '48px',
            minWidth: '48px',
            borderRadius: '12px',
            border: 'none',
            background: '#f4f4f4',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.5rem',
            position: 'relative',
            top: 0
          }}
          title="대시보드 새로고침"
        >
          <RotateCcw size={28} />
        </button>
        {refreshDisabled && (
          <span style={{ marginLeft: 8, color: "#888", fontSize: "0.95em" }}>
            {Math.floor(refreshTimer / 60)}:{(refreshTimer % 60).toString().padStart(2, "0")} 후 재시도 가능
          </span>
        )}
      </div>

      {/* WebGL 밑에 기본 정보 카드 배치 */}
      {/* 1번째 줄: 현재 날씨, 주간/야간 */}
      <div className="dashboard-info-row">
        {/* OpenWeather 카드 추가 */}
        <div className="dashboard-card">
          <OpenWeather />
        </div>
        {/* 주간/야간 */}
        <div className="dashboard-card">
          <div className="dashboard-card-section">
            {new Date().getHours() >= 6 && new Date().getHours() < 18 ? <Sun className="dashboard-card-icon yellow" /> : <Moon className="dashboard-card-icon gray" />}
            <h3 className="dashboard-card-title">주간/야간</h3>
          </div>
          <div className="dashboard-card-center">
            {new Date().getHours() >= 6 && new Date().getHours() < 18 ? (
              <span className="dashboard-daynight-text day">
                ☀️ 주간
              </span>
            ) : (
              <span className="dashboard-daynight-text night">
                🌙 야간
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 자동 모드일 때 시뮬레이션 데이터 표시 */}
      {autoMode && (
        <div className="dashboard-info-row">
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">자동 제어 기준 온도1</h3>
            <div className="dashboard-card-value orange">{simulatedData.temp} ℃</div>
            <div className="dashboard-card-desc">자동 모드 기준값</div>
          </div>
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">자동 제어 기준 습도1</h3>
            <div className="dashboard-card-value blue">{simulatedData.humid} %</div>
            <div className="dashboard-card-desc">자동 모드 기준값</div>
          </div>
        </div>
      )}
  
      {/* 자동 모드일 때 시뮬레이션 데이터 표시 */}
      {autoMode && (
        <div className="dashboard-info-row">
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">자동 제어 기준 온도2</h3>
            <div className="dashboard-card-value orange">{simulatedData.temp} ℃</div>
            <div className="dashboard-card-desc">자동 모드 기준값</div>
          </div>
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">자동 제어 기준 습도2</h3>
            <div className="dashboard-card-value blue">{simulatedData.humid} %</div>
            <div className="dashboard-card-desc">자동 모드 기준값</div>
          </div>
        </div>
      )}

      {/* 자동 모드일 때 시뮬레이션 데이터 표시 */}
      {autoMode && (
        <div className="dashboard-info-row">
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">자동 제어 기준 온도3</h3>
            <div className="dashboard-card-value orange">{simulatedData.temp} ℃</div>
            <div className="dashboard-card-desc">자동 모드 기준값</div>
          </div>
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">자동 제어 기준 습도3</h3>
            <div className="dashboard-card-value blue">{simulatedData.humid} %</div>
            <div className="dashboard-card-desc">자동 모드 기준값</div>
          </div>
        </div>
      )}

      {/* 자동 모드일 때 시뮬레이션 데이터 표시 */}
      {autoMode && (
        <div className="dashboard-info-row">
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">자동 제어 기준 온도4</h3>
            <div className="dashboard-card-value orange">{simulatedData.temp} ℃</div>
            <div className="dashboard-card-desc">자동 모드 기준값</div>
          </div>
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">자동 제어 기준 습도4</h3>
            <div className="dashboard-card-value blue">{simulatedData.humid} %</div>
            <div className="dashboard-card-desc">자동 모드 기준값</div>
          </div>
        </div>
      )}


      {/* 실내온도, 실내습도, 산도, 전기전도도 카드를 한 줄로 배치 */}
      <div className="dashboard-cards-row">
       
        {/* 외부온도 */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">실내온도</h3>
          <div className="dashboard-card-value orange">{indoorTemp} ℃</div> 
          <div className="dashboard-card-desc">실시간 측정값</div>
        </div>
        {/* 습도 */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">실내습도</h3>
          <div className="dashboard-card-value blue">{indoorHumi} %</div>
          <div className="dashboard-card-desc">실시간 측정값</div>
        </div>
        {/* 산도 */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">산도(pH)</h3>
          <div className="dashboard-card-value green">{phValue}</div>
          <div className="dashboard-card-desc">실시간 측정값</div>
        </div>
        {/* 전기전도도 */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">전기전도도(EC)</h3>
          <div className="dashboard-card-value yellow">{elcDT} mS/cm</div>
          <div className="dashboard-card-desc">실시간 측정값</div>
        </div>
      </div>
      {/* 기존의 수분 부족량, 일사량, 누적광량, 이슬점 카드를 한 줄로 배치 */}
      <div className="dashboard-cards-row">
        {/* 일사량 (기상청 API) */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">일사량(기상청)</h3>
          <div className="dashboard-card-value yellow">추가예정</div>
          <div className="dashboard-card-desc">기상청 단기예보 기준</div>
        </div>
        {/* 누적광량 (막대차트) */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">광량 (LUX)</h3>
          <div className="dashboard-card-value yellow">{illuminance} lux</div>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={iotData?.dliChartData ?? []}>
              <Bar dataKey="value" fill="#facc15" />
            </BarChart>
          </ResponsiveContainer>
          <div className="dashboard-card-desc">목표: {iotData ? iotData.dliTarget : '--'} mol/m²/d</div>
        </div>
        {/* 이슬점 (기상청) */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">이슬점(기상청)</h3>
          <div className="dashboard-card-value blue">{iotData ? iotData.dewPoint : '--'} ℃</div>
          <div className="dashboard-card-desc">기상청 단기예보 기준</div>
        </div>
        {/* 강수여부 (기상청 API) */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">강수여부(기상청)</h3>
          <div className="dashboard-card-value blue">
            {iotData && iotData.rainStatus !== undefined
              ? (iotData.rainStatus ? "강수" : "없음")
              : "--"}
          </div>
          <div className="dashboard-card-desc">기상청 단기예보 기준</div>
        </div>
      </div>
      
      {/* 상단 카드 4개 */}
      <div className="dashboard-cards-row">
        {/* 풍향 (기상청 API) */}
        <div className="dashboard-card dashboard-card-center">
          <h3 className="dashboard-card-title">풍향(기상청)</h3>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, height:'100%'}}>
            <div className="dashboard-card-value orange" style={{fontSize:'2rem', margin:'16px 0 4px 0', textAlign:'center'}}>{iotData ? iotData.windSpeed : '--'} m/s</div>
            <div className="dashboard-card-unit" style={{textAlign:'center'}}>{iotData ? iotData.windDirection : '--'}°</div>
          </div>
        </div>
           {/* 풍속 (기상청 API) */}
           <div className="dashboard-card dashboard-card-center">
          <h3 className="dashboard-card-title">풍속(기상청)</h3>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, height:'100%'}}>
            <div className="dashboard-card-value orange" style={{fontSize:'2rem', margin:'16px 0 4px 0', textAlign:'center'}}>{iotData ? iotData.windSpeed : '--'} m/s</div>
            <div className="dashboard-card-unit" style={{textAlign:'center'}}>{iotData ? iotData.windDirection : '--'}°</div>
          </div>
        </div>
        {/* CO2(이산화탄소) */}
        <div className="dashboard-card dashboard-card-center">
          <h3 className="dashboard-card-title">이산화탄소</h3>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, height:'100%'}}>
            <div className="dashboard-card-value green" style={{fontSize:'2rem', margin:'16px 0 4px 0', textAlign:'center'}}>{carbonDioxide}</div>
            <div className="dashboard-card-unit" style={{textAlign:'center'}}>ppm</div>
          </div>
        </div>
      </div>
      {/* 나머지 카드: 2개씩 한 줄 */}
      <div className="dashboard-cards-grid">
        {/* 습도 관리 (임시) */}
        <div className="dashboard-card">
          <div className="dashboard-card-section">
            <Droplets className="dashboard-card-icon blue" />
            <h3 className="dashboard-card-title">습도 관리</h3>
          </div>
          <div className="dashboard-card-value blue">{iotData ? iotData.inHd : '--'}%</div>
          <div className="dashboard-card-status">습도</div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={dashboardData.humidityPieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value">
                {dashboardData.humidityPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="dashboard-card-desc">목표 습도 60-70%</div>
        </div>
        {/* 광량 (임시) */}
        <div className="dashboard-card">
          <div className="dashboard-card-section">
            <Sun className="dashboard-card-icon yellow" />
            <h3 className="dashboard-card-title">광량</h3>
          </div>
          <div className="dashboard-card-status">조도 센서</div>
          <div className="dashboard-card-value yellow">{iotData ? iotData.acSlrdQy : '--'}</div>
          <div className="dashboard-card-status">μmol/m²/s</div>
          <div className="dashboard-card-desc">DLI {iotData ? iotData.dliValue : '--'} mol/m²/d</div>
          <div className="dashboard-bar-bg"><div className="dashboard-bar-fill"></div></div>
        </div>
      </div>
      {/* 하단 그래프 4개 (임시 데이터) */}
      <div className="dashboard-graph-grid">
        {/* 일일 총 급수량 */}
        <div className="dashboard-graph-card">
          <div className="dashboard-graph-title">일일 총 급수량</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={dashboardData.waterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* 일일 온/습도 모니터링 */}
        <div className="dashboard-graph-card">
          <div className="dashboard-graph-title">일일 온/습도 모니터링</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={dashboardData.tempHumidData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={10} />
              <YAxis yAxisId="left" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" fontSize={10} />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="humid" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <div className="dashboard-graph-desc">
            평균 온도 <span style={{ color: "#ef4444" }}>23.8°C</span> / 평균 습도 <span style={{ color: "#3b82f6" }}>60.3%</span>
          </div>
        </div>
      </div>

      {/* 최적 제어값 및 예측 수확수 섹션 */}
      <div className="dashboard-cards-row">
        {/* 토마토 최적 제어값 */}
        <div className="dashboard-card">
          <div className="dashboard-card-section">
            <h3 className="dashboard-card-title">토마토 최적 제어값 및 예측 수확수</h3>
          </div>
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>급수량:</span>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>2.5 L</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>난방 온도:</span>
              <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '16px' }}>22 ℃</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>배기 온도:</span>
              <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '16px' }}>18 ℃</span>
            </div>
            <div style={{ 
              borderTop: '1px solid #e5e7eb', 
              paddingTop: '12px', 
              textAlign: 'center',
              background: '#fef3c7',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <div style={{ color: '#92400e', fontSize: '14px', marginBottom: '4px' }}>예측 수확수</div>
              <div style={{ color: '#92400e', fontSize: '24px', fontWeight: 'bold' }}>156 kg</div>
            </div>
          </div>
        </div>

        {/* 파프리카 최적 제어값 */}
        <div className="dashboard-card">
          <div className="dashboard-card-section">
            <h3 className="dashboard-card-title">파프리카 최적 제어값 및 예측 수확수</h3>
          </div>
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>급수량:</span>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>3.2 L</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>난방 온도:</span>
              <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '16px' }}>24 ℃</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>배기 온도:</span>
              <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '16px' }}>20 ℃</span>
            </div>
            <div style={{ 
              borderTop: '1px solid #e5e7eb', 
              paddingTop: '12px', 
              textAlign: 'center',
              background: '#fef3c7',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <div style={{ color: '#92400e', fontSize: '14px', marginBottom: '4px' }}>예측 수확수</div>
              <div style={{ color: '#92400e', fontSize: '24px', fontWeight: 'bold' }}>89 kg</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoardCards;