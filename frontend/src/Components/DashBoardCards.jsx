import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { useAutoMode } from '../hooks/useAutoMode.jsx'; // 자동 모드 커스텀 훅
import mqtt from 'mqtt';

class MQTTClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  connect(brokerUrl = 'ws://192.168.0.26:9001') {
    try {
      // 실제 환경
      this.client = mqtt.connect(brokerUrl);
      // console.log(`MQTT 브로커 연결 시도: ${brokerUrl}`);
      // this.isConnected = true;
      // 실제 환경에서는 mqtt.connect(brokerUrl) 사용
      this.client.on('connect', () => {
        console.log('MQTT 브로커 연결 성공');
        this.isConnected = true;
      });
    } catch (error) {
      console.error('MQTT 연결 실패:', error);
    }
  }

  publish(topic, message) {
    if (!this.isConnected) {
      console.warn('MQTT 브로커에 연결되지 않음');
      return;
    }

    try {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      console.log(`MQTT 발행 - Topic: ${topic}, Payload: ${payload}`);
    } catch (error) {
      console.error('MQTT 메시지 발행 실패:', error);
    }
  }

  disconnect() {
    if (this.client && this.isConnected) {
      this.isConnected = false;
      console.log('MQTT 연결 종료');
    }
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

const DashBoardCards = () => {
  // MQTT 클라이언트 추가
  const mqttClientRef = useRef(null);

  // MQTT 클라이언트 초기화
  useEffect(() => {
    mqttClientRef.current = new MQTTClient();
    mqttClientRef.current.connect();
    
    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.disconnect();
      }
    };
  }, []);

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

  const {
    temp1,
    humid1,
    restoreFromLocal, autoMode,
  } = useControlStore();

  // 자동모드 커스텀 훅 사용
  const { simulatedData } = useAutoMode();

  // MQTT를 통한 센서 데이터 전송 함수
  const sendSensorDataToMQTT = useCallback((sensorData) => {
    if (mqttClientRef.current && autoMode) {
      mqttClientRef.current.publish('sensor/data/send', sensorData);
    }
  }, [autoMode]);

  useEffect(() => {
  // 상태 복원 (로컬스토리지에 저장한 상태 있다면)
  restoreFromLocal();
  }, []);

  // 자동모드일 때 센서 데이터를 MQTT로 전송
  useEffect(() => {
    if (autoMode && simulatedData) {
      const sensorData = {
        "temperature": simulatedData.sensor1?.temp || temp1,
        "humidity": simulatedData.sensor1?.humid || humid1,
        "phLevel": phValue !== '--' ? phValue : 6.5,
        "eleDT": elcDT !== '--' ? elcDT : 1.2,
        "co2": carbonDioxide !== '--' ? carbonDioxide : 400,
      };
      sendSensorDataToMQTT(sensorData);
    }
  }, [autoMode, simulatedData, temp1, humid1, phValue, elcDT, carbonDioxide, sendSensorDataToMQTT]);

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

  // 카드 JSX를 배열로 모으기
  // '일일 총 급수량' 카드 분리
  const waterCard = (
    <div className="dashboard-graph-card" key="waterData">
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
  );

  // 기존 allCards에서 waterData 카드 제거
  let allCards = [
    // 실내온도
    <div className="dashboard-card" key="indoorTemp">
      <h3 className="dashboard-card-title">실내온도</h3>
      <div className="dashboard-card-value orange">{indoorTemp} ℃</div>
      <div className="dashboard-card-desc">실시간 측정값</div>
    </div>,
    // 실내습도
    <div className="dashboard-card" key="indoorHumi">
      <h3 className="dashboard-card-title">실내습도</h3>
      <div className="dashboard-card-value blue">{indoorHumi} %</div>
      <div className="dashboard-card-desc">실시간 측정값</div>
    </div>,
    // 산도
    <div className="dashboard-card" key="phValue">
      <h3 className="dashboard-card-title">산도(pH)</h3>
      <div className="dashboard-card-value green">{phValue}</div>
      <div className="dashboard-card-desc">실시간 측정값</div>
    </div>,
    // 전기전도도
    <div className="dashboard-card" key="elcDT">
      <h3 className="dashboard-card-title">전기전도도(EC)</h3>
      <div className="dashboard-card-value yellow">{elcDT} mS/cm</div>
      <div className="dashboard-card-desc">실시간 측정값</div>
    </div>,
    // 수분 부족량
    <div className="dashboard-card" key="moistureDeficit">
      <h3 className="dashboard-card-title">수분 부족량</h3>
      <div className="dashboard-card-value red">{iotData ? iotData.moistureDeficit : 0} L</div>
      <div className="dashboard-bar-bg">
        <div
          className="dashboard-bar-fill"
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
    </div>,
    // 일사량 (기상청 API)
    <div className="dashboard-card" key="solar">
      <h3 className="dashboard-card-title">일사량(기상청)</h3>
      <div className="dashboard-card-value yellow">{iotData ? iotData.dliValue : '--'} mol/m²/d</div>
      <div className="dashboard-card-desc">기상청 단기예보 기준</div>
    </div>,
    // 누적광량 (막대차트)
    <div className="dashboard-card" key="illuminance">
      <h3 className="dashboard-card-title">누적광량 (DLI)</h3>
      <div className="dashboard-card-value yellow">{iotData ? iotData.dliValue : '--'} mol/m²/d</div>
      <ResponsiveContainer width="100%" height={60}>
        <BarChart data={iotData?.dliChartData ?? []}>
          <Bar dataKey="value" fill="#facc15" />
        </BarChart>
      </ResponsiveContainer>
      <div className="dashboard-card-desc">목표: {iotData ? iotData.dliTarget : '--'} mol/m²/d</div>
    </div>,
    // 이슬점 (기상청)
    <div className="dashboard-card" key="dewPoint">
      <h3 className="dashboard-card-title">이슬점(기상청)</h3>
      <div className="dashboard-card-value blue">{iotData ? iotData.dewPoint : '--'} ℃</div>
      <div className="dashboard-card-desc">기상청 단기예보 기준</div>
    </div>,
    // 풍향 (기상청 API)
    <div className="dashboard-card dashboard-card-center" key="windDirection">
      <h3 className="dashboard-card-title">풍향(기상청)</h3>
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, height:'100%'}}>
        <div className="dashboard-card-value orange" style={{fontSize:'2rem', margin:'16px 0 4px 0', textAlign:'center'}}>{iotData ? iotData.windDirection : '--'}°</div>
        <div className="dashboard-card-unit" style={{textAlign:'center'}}>방향</div>
      </div>
    </div>,
    // 풍속 (기상청 API)
    <div className="dashboard-card dashboard-card-center" key="windSpeed">
      <h3 className="dashboard-card-title">풍속(기상청)</h3>
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, height:'100%'}}>
        <div className="dashboard-card-value orange" style={{fontSize:'2rem', margin:'16px 0 4px 0', textAlign:'center'}}>{iotData ? iotData.windSpeed : '--'} m/s</div>
        <div className="dashboard-card-unit" style={{textAlign:'center'}}>속도</div>
      </div>
    </div>,
    // 강수여부 (기상청 API)
    <div className="dashboard-card" key="rainStatus">
      <h3 className="dashboard-card-title">강수여부(기상청)</h3>
      <div className="dashboard-card-value blue">
        {iotData && iotData.rainStatus !== undefined
          ? (iotData.rainStatus ? "강수" : "없음")
          : "--"}
      </div>
      <div className="dashboard-card-desc">기상청 단기예보 기준</div>
    </div>,
    // CO2(이산화탄소)
    <div className="dashboard-card dashboard-card-center" key="carbonDioxide">
      <h3 className="dashboard-card-title">이산화탄소</h3>
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, height:'100%'}}>
        <div className="dashboard-card-value green" style={{fontSize:'2rem', margin:'16px 0 4px 0', textAlign:'center'}}>{carbonDioxide}</div>
        <div className="dashboard-card-unit" style={{textAlign:'center'}}>ppm</div>
      </div>
    </div>,
    // 습도 관리
    <div className="dashboard-card" key="humidityControl">
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
    </div>,
    // 광량
    <div className="dashboard-card" key="light">
      <div className="dashboard-card-section">
        <Sun className="dashboard-card-icon yellow" />
        <h3 className="dashboard-card-title">광량</h3>
      </div>
      <div className="dashboard-card-status">조도 센서</div>
      <div className="dashboard-card-value yellow">{iotData ? iotData.acSlrdQy : '--'}</div>
      <div className="dashboard-card-status">μmol/m²/s</div>
      <div className="dashboard-card-desc">DLI {iotData ? iotData.dliValue : '--'} mol/m²/d</div>
      <div className="dashboard-bar-bg"><div className="dashboard-bar-fill"></div></div>
    </div>,
    // 일일 온/습도 모니터링
    <div className="dashboard-graph-card" key="tempHumidData">
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
    </div>,
  ];
  allCards = allCards.filter(card => card.key !== 'waterData');

  // 맨 마지막에 waterCard 추가
  allCards.push(waterCard);

  // 2개씩 row로 묶고, 마지막 3개는 따로 처리
  const cardRows = [];
  const n = allCards.length;
  for (let i = 0; i < n - 3; i += 2) {
    cardRows.push(allCards.slice(i, i + 2));
  }
  const lastThree = allCards.slice(n - 3);

  return (
    <div className="dashboard-cards-container">
      {/* 상단 sticky header */}
      <div className="dashboard-sticky-header">
        <div className="dashboard-title">대시보드</div>
        <div className="dashboard-card-value.time">{currentTime}</div>
      </div>
      
      {/* 새로고침 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', marginBottom: '24px' }}>
        <button
          className="dashboard-refresh-btn"
          onClick={handleRefresh}
          disabled={refreshDisabled}
          style={{
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
            fontSize: '1.5rem'
          }}
          title="대시보드 새로고침"
        >
          <RotateCcw size={28} />
        </button>
        {refreshDisabled && (
          <span style={{ marginLeft: 8, color: "#888", fontSize: "0.95em", alignSelf: 'center' }}>
            {Math.floor(refreshTimer / 60)}:{(refreshTimer % 60).toString().padStart(2, "0")} 후 재시도 가능
          </span>
        )}
      </div>

      {/* 기본 정보 카드 배치 */}
      {/* 1번째 줄: 현재 날씨, 현재 시간, 주간/야간 */}
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
            <div className="dashboard-card-value orange">{temp1} ℃</div>
            <div className="dashboard-card-desc">자동 모드 기준값</div>
          </div>
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">자동 제어 기준 습도1</h3>
            <div className="dashboard-card-value blue">{humid1} %</div>
            <div className="dashboard-card-desc">자동 모드 기준값</div>
          </div>
        </div>
      )}

      {/* 2개씩 카드 렌더링 */}
      {cardRows.map((row, idx) => (
        <div className="dashboard-cards-row" key={idx} style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          {row.map((card, cidx) => (
            <div style={{ flex: 1 }} key={cidx}>{card}</div>
          ))}
        </div>
      ))}
      {/* 마지막 줄: 왼쪽 1개, 오른쪽 2개 세로 */}
      <div className="dashboard-cards-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>{lastThree[0]}</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {lastThree[1]}
          {lastThree[2]}
        </div>
      </div>
    </div>
  );
};

export default DashBoardCards;