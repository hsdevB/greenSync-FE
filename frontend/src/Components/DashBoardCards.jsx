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

  const [currentTime, setCurrentTime] = useState(getCurrentTimeString()); // 현재 시간
  const [refreshDisabled, setRefreshDisabled] = useState(false); // 새로고침 비활성화 상태
  const [refreshTimer, setRefreshTimer] = useState(0); // 새로고침 타이머
  const iotData = useIotData(); // 온실 내 IoT 데이터
  const [indoorTemp, setIndoorTemp] = useState('--');

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
    water, fan, ledLevel, temp, humid, restoreFromLocal
  } = useControlStore();

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

  // 대시보드 데이터 (임시)
  const dashboardData = DashBoardData;

  // 실내온도 데이터 가져오기
  useEffect(() => {
    console.log('fetchIndoorTemp called');
    const fetchIndoorTemp = async () => {
      try {
        // 프록시를 사용하지 않고 직접 주소로 요청
        const res = await axios.get('/sensor/temperature/1');
        console.log(res);
        // 데이터가 잘 받아오는지 확인
        console.log('indoorTemp data:', res.data);
        if (res.data && typeof res.data === 'number') {
          setIndoorTemp(res.data);
        } else if (res.data && res.data.temperature) {
          setIndoorTemp(res.data.temperature);
        } else {
          setIndoorTemp('--');
        }
      } catch (e) {
        setIndoorTemp('--');
        console.error(e);
      }
    };
    fetchIndoorTemp();
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
            devicePixelRatio={Math.min(window.devicePixelRatio, 2)} // 최대 2배로 제한
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
      {/* 1번째 줄: 현재 날씨, 현재 시간, 주간/야간 */}
      <div className="dashboard-info-row">
        {/* OpenWeather 카드 추가 */}
        <div className="dashboard-card">
          <OpenWeather />
        </div>
        {/* 현재 시간 */}
        <div className="dashboard-card">
          <div className="dashboard-card-section">
            <Activity className="dashboard-card-icon green" />
            <h3 className="dashboard-card-title">현재 시간</h3>
          </div>
          <div className="dashboard-card-value">{currentTime}</div>
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
        {/* 실내온도 */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">실내온도</h3>
          <div className="dashboard-card-value orange">{indoorTemp} ℃</div> 
          <div className="dashboard-card-desc">실시간 측정값</div>
        </div>
        {/* 실내습도 */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">실내습도</h3>
          <div className="dashboard-card-value blue">{iotData ? iotData.inHumi : '--'} %</div>
          <div className="dashboard-card-desc">실시간 측정값</div>
        </div>
        {/* 산도 */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">산도(pH)</h3>
          <div className="dashboard-card-value green">{iotData ? iotData.ph : '--'}</div>
          <div className="dashboard-card-desc">실시간 측정값</div>
        </div>
        {/* 전기전도도 */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">전기전도도(EC)</h3>
          <div className="dashboard-card-value yellow">{iotData ? iotData.ec : '--'} mS/cm</div>
          <div className="dashboard-card-desc">실시간 측정값</div>
        </div>
      </div>
      {/* 기존의 수분 부족량, 일사량, 누적광량, 이슬점 카드를 한 줄로 배치 */}
      <div className="dashboard-cards-row">
        {/* 수분 부족량 */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">수분 부족량</h3>
          <div className="dashboard-card-value red">{iotData ? iotData.moistureDeficit : 0} L</div>
          <div className="dashboard-bar-bg">
            <div
              className="dashboard-bar-fill" // 수분 부족량 바 채우기
              style={{
                width: `${iotData ? iotData.moistureDeficitPercent : 0}%`,
                background: (iotData ? iotData.moistureDeficitPercent : 0) > 70 ? 'red' : '#10b981',
                height: '10px',
                borderRadius: '5px'
              }}
            ></div>
          </div>
          <div className="dashboard-card-desc">
            {(iotData ? iotData.moistureDeficitPercent : 0) > 70 ? "수분 부족! 급수 필요" : "정상 범위"}
          </div>
        </div>
        {/* 일사량 (기상청 API) */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">일사량(기상청)</h3>
          <div className="dashboard-card-value yellow">{iotData ? iotData.dliValue : '--'} mol/m²/d</div>
          <div className="dashboard-card-desc">기상청 단기예보 기준</div>
        </div>
        {/* 누적광량 (막대차트) */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">누적광량 (DLI)</h3>
          <div className="dashboard-card-value yellow">{iotData ? iotData.dliValue : '--'} mol/m²/d</div>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={iotData?.dliChartData ?? []}>
              <Bar dataKey="value" fill="#facc15" />
            </BarChart>
          </ResponsiveContainer>
          <div className="dashboard-card-desc">목표: {iotData ? iotData.dliTarget : '--'} mol/m²/d</div>
        </div>
        {/* 이슬점 (기상청 API) */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">이슬점(기상청)</h3>
          <div className="dashboard-card-value blue">{iotData ? iotData.dewPoint : '--'} ℃</div>
          <div className="dashboard-card-desc">기상청 단기예보 기준</div>
        </div>
      </div>
      {/* 상단 카드 4개 */}
      <div className="dashboard-cards-row">
        {/* 풍향/풍속 (기상청 API) */}
        <div className="dashboard-card">
          <div className="dashboard-card-value orange">{iotData ? iotData.windSpeed : '--'} m/s</div>
          <div className="dashboard-card-unit">{iotData ? iotData.windDirection : '--'}°</div>
          <div className="dashboard-card-label">풍향/풍속(기상청)</div>
        </div>
        {/* CO2 */}
        <div className="dashboard-card">
          <div className="dashboard-card-value green">{iotData ? iotData.inCo2 : '--'}</div>
          <div className="dashboard-card-unit">ppm</div>
          <div className="dashboard-card-label">CO2</div>
        </div>
        {/* 수확량 */}
        <div className="dashboard-card">
          <div className="dashboard-card-value">{iotData ? iotData.frtCnt : '--'}</div>
          <div className="dashboard-card-unit">회</div>
          <div className="dashboard-card-label">수확량</div>
        </div>
        {/* 생육 예측 차트 (임시) */}
        <div className="dashboard-card">
          <div className="dashboard-predict-label">생육 예측: 94.2%</div>
          <div className="dashboard-predict-bad">● 부실생 예측: 3.1%</div>
          <div className="dashboard-predict-good">● 성장 속도: 예상보다 8% 빠름</div>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={dashboardData.growthData}>
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <button className="dashboard-predict-btn">AI 분석결과</button>
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
        {/* 일일 양액 급여량 */}
        <div className="dashboard-graph-card">
          <div className="dashboard-graph-title">일일 양액 급여량</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={dashboardData.nutrientDayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
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
        {/* 일일 양액 급여량 (시간별) */}
        <div className="dashboard-graph-card">
          <div className="dashboard-graph-title">일일 양액 시간별 급여량</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={dashboardData.nutrientHourData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
          <div className="dashboard-graph-desc">
            일평균 양액량 <span style={{ color: "#22c55e" }}>88.0L</span> / 평균 EC <span style={{ color: "#3b82f6" }}>1.87</span> / 평균 pH <span style={{ color: "#10b981" }}>6.18</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoardCards;