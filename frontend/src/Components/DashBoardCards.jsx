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
class UnityMessage {
  constructor(name, data) {
    this.name = name;
    this.data = data;
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

  // 백엔드 서버 연결 상태 확인
  const checkBackendConnection = async () => {
    try {
      console.log('Checking backend connection...');
      const response = await axios.get('/sensor/health', { timeout: 3000 });
      console.log('Backend is accessible:', response.data);
      return true;
    } catch (error) {
      console.error('Backend connection failed:', error.message);
      return false;
    }
  };

  // 컴포넌트 마운트 시 백엔드 연결 확인
  useEffect(() => {
    checkBackendConnection();
  }, []);

<div style={{ width: '100%', minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', marginTop: '32px' }}>
  <div style={{ flex: 1, maxWidth: '900px', position: 'relative' }}>
    {!isLoaded && (
      <div className="unity-loading-overlay">
        <div className="unity-loading-text">
          Unity 로딩 중... {loadingPercentage}%
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
    />
  </div>
</div>

  // 상태 관리 초기화
  const [currentTime, setCurrentTime] = useState(getCurrentTimeString()); // 현재 시간
  const [refreshDisabled, setRefreshDisabled] = useState(false); // 새로고침 비활성화 상태
  const [refreshTimer, setRefreshTimer] = useState(0); // 새로고침 타이머
  const iotData = useIotData(); // 온실 내 IoT 데이터
  const [indoorTemp, setIndoorTemp] = useState('--'); 
  const [indoorHumi, setIndoorHumi] = useState('--');
  const [phValue, setPhValue] = useState('--');
  const [carbonDioxide, setCarbonDioxide] = useState('--');
  const [nutrient, setNutrient] = useState('--');
  const [elcDT, setElcDT] = useState('--');
  const [illuminance, setIlluminance] = useState('--');


  // unity 초기화할 때 보내줄 제어값
  const sendToUnity = useCallback((eventName, payload) => {
    const message = new UnityMessage(eventName, payload);
    sendMessage("MessageManager", "ReceiveMessage", JSON.stringify(message));
  }, [sendMessage]);

  const {
    water, fan, led, temp, humid, restoreFromLocal
  } = useControlStore();

  useEffect(() => {
  // 상태 복원 (로컬스토리지에 저장한 상태 있다면)
  restoreFromLocal();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      sendToUnity("startWater", { status: water });
      sendToUnity("fanStatus", { status: fan });
      sendToUnity("ledLevel", { level: led ? 3 : 0 });
      sendToUnity("tempControl", { value: temp });
      sendToUnity("humidControl", { value: humid });
    }
  }, [isLoaded]);

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

  // 대시보드 데이터 (임시)
  const dashboardData = DashBoardData;

  // 실내온도 데이터 가져오기
  useEffect(() => {
    const fetchIndoorTemp = async () => { // 화살표 함수 사용 
      try {
        // 프록시를 사용하지 않고 직접 주소로 요청
        const id = 1;
        const res = await axios.get(`/sensor/temperature/${id}`);// 1인 수정 해야함 변수 추가 해야함
        console.log("res: ", JSON.stringify(res));
        // alert(JSON.stringify(res.data));
        if (res.data && typeof res.data === 'number') {
          setIndoorTemp(res.data);
        } else if (res.data && res.data.data.temperature) {
          setIndoorTemp(res.data.data.temperature);
        } else {
          setIndoorTemp('--');
        }
      } catch (e) {
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
    } catch (e) {
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
              </div>
              <div className="unity-loading-bar-bg">
                <div
                  className="unity-loading-bar-fill"
                  style={{ width: `${loadingPercentage}%` }}
                ></div>
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
    </div>
  );
};

export default DashBoardCards;