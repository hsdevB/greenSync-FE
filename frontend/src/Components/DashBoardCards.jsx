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
  const [refreshDisabled, setRefreshDisabled] = useState(false); // 새로고침 비활성화 상태
  const [refreshTimer, setRefreshTimer] = useState(0); // 새로고침 타이머
  const iotData = useIotData(); // 온실 내 IoT 데이터
  const [indoorTemp, setIndoorTemp] = useState('--'); 
  const [indoorHumi, setIndoorHumi] = useState('--');
  const [phValue, setPhValue] = useState('--');
  const [carbonDioxide, setCarbonDioxide] = useState('--');
  const [elcDT, setElcDT] = useState('--');
  // const [illuminance, setIlluminance] = useState('--'); // 사용하지 않는 변수 제거

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
  }, [restoreFromLocal]);

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
      // 시간 업데이트는 필요시에만 사용
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  // 새로고침 함수 (데이터 fetch 또는 window.location.reload 등으로 대체 가능)
  // const handleRefresh = () => { // 사용하지 않는 함수 제거
  //   setRefreshDisabled(true);
  //   setRefreshTimer(300); // 5분(300초)
  //   localStorage.setItem('dashboard_refreshDisabled', 'true');
  //   localStorage.setItem('dashboard_refreshTimer', '300');
  // };

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

  // 실내온도 데이터 가져오기
  useEffect(() => {
    const fetchIndoorTemp = async () => {
      try {
        const id = 1;
        const res = await axios.get(`/api/sensor/temperature/${id}`);
        console.log("Temperature response: ", res.data);
        if (res.data && typeof res.data === 'number') {
          setIndoorTemp(res.data);
        } else if (res.data && res.data.data && res.data.data.temperature) {
          setIndoorTemp(res.data.data.temperature);
        } else if (res.data && res.data.temperature) {
          setIndoorTemp(res.data.temperature);
        } else {
          setIndoorTemp('--');
        }
      } catch (error) {
        console.error('Temperature fetch error:', error);
        console.error('Error response:', error.response?.data);
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
        const res = await axios.get(`/api/sensor/humidity/${id}`);
        console.log("Humidity response: ", res.data);
        if (res.data && typeof res.data === 'number') {
          setIndoorHumi(res.data);
        } else if (res.data && res.data.data && res.data.data.humidity) {
          setIndoorHumi(res.data.data.humidity);
        } else if (res.data && res.data.humidity) {
          setIndoorHumi(res.data.humidity);
        } else {
          setIndoorHumi('--');
        }
      } catch (error) {
        console.error('Humidity fetch error:', error);
        console.error('Error response:', error.response?.data);
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
        const res = await axios.get(`/api/sensor/nutrient/${id}`);
        console.log("Nutrient response: ", res.data);

        // pH 값 설정
        if (res.data && typeof res.data === 'number') {
          setPhValue(res.data);
        } else if (res.data && res.data.data && res.data.data.phLevel) {
          setPhValue(res.data.data.phLevel);
        } else if (res.data && res.data.phLevel) {
          setPhValue(res.data.phLevel);
        } else {
          setPhValue('--');
        }

        // EC 값 설정
        if (res.data && typeof res.data === 'number') {
          setElcDT(res.data);
        } else if (res.data && res.data.data && res.data.data.elcDT) {
          setElcDT(res.data.data.elcDT);
        } else if (res.data && res.data.elcDT) {
          setElcDT(res.data.elcDT);
        } else {
          setElcDT('--');
        }
      } catch (e) {
        console.error('Nutrient fetch error:', e);
        console.error('Error response:', e.response?.data);
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
        const res = await axios.get(`/api/sensor/carbonDioxide/${id}`);
        console.log("CO2 response: ", res.data);
        if (res.data && typeof res.data === 'number') {
          setCarbonDioxide(res.data);
        } else if (res.data && res.data.data && res.data.data.co2) {
          setCarbonDioxide(res.data.data.co2);
        } else if (res.data && res.data.co2) {
          setCarbonDioxide(res.data.co2);
        } else {
          setCarbonDioxide('--');
        }
      } catch (e) {
        console.error('CO2 fetch error:', e);
        console.error('Error response:', e.response?.data);
        setCarbonDioxide('--');
      }
    };
    fetchCarbonDioxide();
  }, []);

  //광량 데이터 가져오기
  useEffect(() => {
    const fetchIlluminance = async () => {
      try {
        const id = 1;
        const res = await axios.get(`/api/sensor/illuminance/${id}`);
        console.log("Illuminance response: ", res.data);
        if (res.data && typeof res.data === 'number') {
          // setIlluminance(res.data); // 사용하지 않는 변수 제거
        } else if (res.data && res.data.data && res.data.data.illuminance) {
          // setIlluminance(res.data.data.illuminance); // 사용하지 않는 변수 제거
        } else if (res.data && res.data.illuminance) {
          // setIlluminance(res.data.illuminance); // 사용하지 않는 변수 제거
        } else {
          // setIlluminance('--'); // 사용하지 않는 변수 제거
        }
      } catch (e) {
        console.error('Illuminance fetch error:', e);
        console.error('Error response:', e.response?.data);
        // setIlluminance('--'); // 사용하지 않는 변수 제거
      }
    };
    fetchIlluminance();
  }, []);

  // 대시보드 데이터 (임시)
  const dashboardData = DashBoardData;

  // 각 줄을 배열로 선언
  const row1 = [
    // 실내온도/습도 카드
    <div className="dashboard-card combined-card" key="indoorTempHumi">
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
      }}>
        {/* 온도 영역 */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ color: "#e57373", fontSize: "2rem" }}>🌡️</div>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>실내온도</div>
          <div style={{ fontSize: "1.5rem", color: "#e57373" }}>{indoorTemp ?? "--"}</div>
          <div style={{ color: "#e57373", fontWeight: "bold" }}>℃</div>
        </div>
        {/* 구분선 */}
        <div style={{
          width: 1,
          height: 60,
          background: "#eee",
          margin: "0 16px"
        }}></div>
        {/* 습도 영역 */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ color: "#2196f3", fontSize: "2rem" }}>💧</div>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>실내습도</div>
          <div style={{ fontSize: "1.5rem", color: "#2196f3" }}>{indoorHumi ?? "--"}</div>
          <div style={{ color: "#2196f3", fontWeight: "bold" }}>%</div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 16, color: "#888", fontWeight: "bold" }}>
        {/* 실시간 측정값 */}
      </div>
      {/* <div className="dashboard-bar-bg"><div className="dashboard-bar-fill"></div></div> */}
    </div>,
    // 산도(pH) 카드
    <div className="dashboard-card" key="phValue" data-type="ph">
      <div className="dashboard-card-section">
        <Activity className="dashboard-card-icon green" />
        <h3 className="dashboard-card-title">산도(pH)</h3>
      </div>
      <div className="dashboard-card-value green" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        {phValue}
      </div>
      <div className="dashboard-card-unit" style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '4px' }}>
        pH
      </div>
      {/* <div className="dashboard-card-desc">실시간 측정값</div> */}
      {/* <div className="dashboard-gradient-bar" style={{ 
        height: '4px', 
        borderRadius: '2px', 
        marginTop: '8px',
        width: '100%'
      }}></div> */}
    </div>
  ];

  const row2 = [
    // 이산화탄소 카드
    <div className="dashboard-card" key="carbonDioxide" data-type="co2">
      <div className="dashboard-card-section">
        <Activity className="dashboard-card-icon green" />
        <h3 className="dashboard-card-title">이산화탄소</h3>
      </div>
      <div className="dashboard-card-value green" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        {carbonDioxide}
      </div>
      <div className="dashboard-card-unit" style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '4px' }}>
        ppm
      </div>
      {/* <div className="dashboard-card-desc">실시간 측정값</div> */}
      {/* <div className="dashboard-gradient-bar" style={{ 
        height: '4px', 
        borderRadius: '2px', 
        marginTop: '8px',
        width: '100%'
      }}></div> */}
    </div>,
    // 전기전도도(EC) 카드
    <div className="dashboard-card" key="elcDT" data-type="ec">
      <div className="dashboard-card-section">
        <Zap className="dashboard-card-icon yellow" />
        <h3 className="dashboard-card-title">전기전도도(EC)</h3>
      </div>
      <div className="dashboard-card-value yellow" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        {elcDT}
      </div>
      <div className="dashboard-card-unit" style={{ color: '#f59e0b', fontSize: '0.9rem', marginTop: '4px' }}>
        mS/cm
      </div>
      {/* <div className="dashboard-card-desc">실시간 측정값</div> */}
      {/* <div className="dashboard-gradient-bar" style={{ 
        height: '4px', 
        borderRadius: '2px', 
        marginTop: '8px',
        width: '100%'
      }}></div> */}
    </div>
  ];

  const row3 = [
    // 풍향(기상청) 카드
    <div className="dashboard-card" key="windDirection" data-type="wind">
      <div className="dashboard-card-section">
        <Cloud className="dashboard-card-icon blue" />
        <h3 className="dashboard-card-title">풍향(기상청)</h3>
      </div>
      <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        {iotData ? iotData.windDirection : '--'}
      </div>
      <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
        °
      </div>
      {/* <div className="dashboard-card-desc">기상청 단기예보 기준</div> */}
      {/* <div className="dashboard-gradient-bar" style={{
        height: '4px',
        borderRadius: '2px',
        marginTop: '8px',
        width: '100%'
      }}></div> */}
    </div>,
    // 풍속(기상청) 카드
    <div className="dashboard-card" key="windSpeed" data-type="wind">
      <div className="dashboard-card-section">
        <Cloud className="dashboard-card-icon blue" />
        <h3 className="dashboard-card-title">풍속(기상청)</h3>
      </div>
      <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        {iotData ? iotData.windSpeed : '--'}
      </div>
      <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
        m/s
      </div>
      {/* <div className="dashboard-card-desc">기상청 단기예보 기준</div> */}
      {/* <div className="dashboard-gradient-bar" style={{
        height: '4px',
        borderRadius: '2px',
        marginTop: '8px',
        width: '100%'
      }}></div> */}
    </div>
  ];

  const row4 = [
    // 이슬점(기상청) 카드
    <div className="dashboard-card" key="dewPoint" data-type="dew">
      <div className="dashboard-card-section">
        <Cloud className="dashboard-card-icon blue" />
        <h3 className="dashboard-card-title">이슬점(기상청)</h3>
      </div>
      <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        {iotData ? iotData.dewPoint : '--'}
      </div>
      <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
        ℃
      </div>
      {/* <div className="dashboard-card-desc">기상청 단기예보 기준</div> */}
      {/* <div className="dashboard-gradient-bar" style={{
        height: '4px',
        borderRadius: '2px',
        marginTop: '8px',
        width: '100%'
      }}></div> */}
    </div>,
    // 강수여부(기상청) 카드
    <div className="dashboard-card" key="rainStatus" data-type="rain">
      <div className="dashboard-card-section">
        <Cloud className="dashboard-card-icon blue" />
        <h3 className="dashboard-card-title">강수여부(기상청)</h3>
      </div>
      <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        {iotData && iotData.rainStatus !== undefined
          ? (iotData.rainStatus ? "강수" : "없음")
          : "--"}
      </div>
      <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
        상태
      </div>
      {/* <div className="dashboard-card-desc">기상청 단기예보 기준</div> */}
      {/* <div className="dashboard-gradient-bar" style={{
        height: '4px',
        borderRadius: '2px',
        marginTop: '8px',
        width: '100%'
      }}></div> */}
    </div>
  ];

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
    // 일사량 (기상청 API)
    <div className="dashboard-card" key="solar">
      <h3 className="dashboard-card-title">일사량(기상청)</h3>
      <div className="dashboard-card-value yellow">추가예정</div>
      <div className="dashboard-card-desc">기상청 단기예보 기준</div>
    </div>,
    // 누적광량 (막대차트)
    <div className="dashboard-card" key="illuminance">
      <h3 className="dashboard-card-title">광량 (LUX)</h3>
      <div className="dashboard-card-value yellow">{illuminance} lux</div>
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
    // 풍향 (기상청 API)
    <div className="dashboard-card dashboard-card-center" key="windDirection">
      <h3 className="dashboard-card-title">풍향(기상청)</h3>
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, height:'100%'}}>
        <div className="dashboard-card-value orange" style={{fontSize:'2rem', margin:'16px 0 4px 0', textAlign:'center'}}>{iotData ? iotData.windSpeed : '--'} m/s</div>
        <div className="dashboard-card-unit" style={{textAlign:'center'}}>{iotData ? iotData.windDirection : '--'}°</div>
      </div>
    </div>,
    // 풍속 (기상청 API)
    <div className="dashboard-card dashboard-card-center" key="windSpeed">
      <h3 className="dashboard-card-title">풍속(기상청)</h3>
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, height:'100%'}}>
        <div className="dashboard-card-value orange" style={{fontSize:'2rem', margin:'16px 0 4px 0', textAlign:'center'}}>{iotData ? iotData.windSpeed : '--'} m/s</div>
        <div className="dashboard-card-unit" style={{textAlign:'center'}}>{iotData ? iotData.windDirection : '--'}°</div>
      </div>
    </div>,
    // CO2(이산화탄소)
    <div className="dashboard-card" key="carbonDioxide" style={{ minHeight: '220px' }}>
      <div className="dashboard-card-section">
        <Activity className="dashboard-card-icon green" />
        <h3 className="dashboard-card-title">이산화탄소</h3>
      </div>
      <div className="dashboard-card-status">센서</div>
      <div className="dashboard-card-value green">{carbonDioxide}</div>
      <div className="dashboard-card-unit">ppm</div>
      <div className="dashboard-card-desc">실시간 측정값</div>
    </div>,
    // 광량
    <div className="dashboard-card" key="light" style={{ minHeight: '220px' }}>
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
    // 습도 관리 (이전에는 광량 위였으나, 이제 아래로 이동)
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
      {/* 새로고침 버튼 */}
      {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
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
<<<<<<< HEAD
      </div> */}

      {/* 기본 정보 카드 배치 */}
      {/* 1번째 줄: 현재 날씨, 현재 시간, 주간/야간 */}
      <div className="dashboard-cards-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        {/* OpenWeather 카드 추가 */}
        <div style={{ flex: 1 }}>
          {/* <div className="dashboard-card crop-card-hover" data-type="weather"> */}
            <OpenWeather />
          {/* </div> */}
        </div>
        {/* 주간/야간 */}
        <div style={{ flex: 1 }}>
          <div className="dashboard-card crop-card-hover" data-type="daynight">
            <div className="dashboard-card-section">
              {new Date().getHours() >= 6 && new Date().getHours() < 18 ? <Sun className="dashboard-card-icon yellow" /> : <Moon className="dashboard-card-icon gray" />}
              <h3 className="dashboard-card-title">주간/야간</h3>
            </div>
            <div className="dashboard-card-value yellow" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {new Date().getHours() >= 6 && new Date().getHours() < 18 ? '주간' : '야간'}
            </div>
            <div className="dashboard-card-unit" style={{ color: '#f59e0b', fontSize: '0.9rem', marginTop: '4px' }}>
              {new Date().getHours() >= 6 && new Date().getHours() < 18 ? '☀️' : '🌙'}
            </div>
            {/* <div className="dashboard-card-desc">현재 시간 기준</div> */}
            {/* <div className="dashboard-gradient-bar" style={{ 
              height: '4px', 
              borderRadius: '2px', 
              marginTop: '8px',
              width: '100%'
            }}></div> */}
          </div>
        </div>
      </div>

      {/* 자동 모드일 때 시뮬레이션 데이터 표시 */}
      {autoMode && (
        <div className="dashboard-cards-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <div className="dashboard-card crop-card-hover" data-type="temperature">
              <div className="dashboard-card-section">
                <Thermometer className="dashboard-card-icon red" />
                <h3 className="dashboard-card-title">자동 제어 기준 온도1</h3>
              </div>
              <div className="dashboard-card-value red" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {temp1}
              </div>
              <div className="dashboard-card-unit" style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '4px' }}>
                ℃
              </div>
              {/* <div className="dashboard-card-desc">자동 모드 기준값</div> */}
              {/* <div className="dashboard-gradient-bar" style={{ 
                height: '4px', 
                borderRadius: '2px', 
                marginTop: '8px',
                width: '100%'
              }}></div> */}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="dashboard-card crop-card-hover" data-type="humidity">
              <div className="dashboard-card-section">
                <Droplets className="dashboard-card-icon blue" />
                <h3 className="dashboard-card-title">자동 제어 기준 습도1</h3>
              </div>
              <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {humid1}
              </div>
              <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
                %
              </div>
              {/* <div className="dashboard-card-desc">자동 모드 기준값</div> */}
              {/* <div className="dashboard-gradient-bar" style={{ 
                height: '4px', 
                borderRadius: '2px', 
                marginTop: '8px',
                width: '100%'
              }}></div> */}
            </div>
          </div>
        </div>
      )}

      {/* 첫 번째 줄: 실내온도/습도, 산도/전기전도도 */}
      {/* 두 번째 줄: 풍향, 풍속 */}
      {/* 세 번째 줄: CO2, 광량 */}
      {/* 네 번째 줄: 강수여부, 기타 카드 등 */}
      {/* 필요시 추가 줄... */}

      {/* 일일 온/습도 모니터링 - 밑으로 배치, 좌우로 길게 */}
      {/* <div className="dashboard-cards-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div className="dashboard-graph-card" key="tempHumidData" style={{ width: '100%', padding: '20px', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
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
      </div> */}

      {/* 일일 총 급수량 - 밑으로 배치, 좌우로 길게 */}
      {/* <div className="dashboard-cards-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div className="dashboard-graph-card" key="waterData" style={{ width: '100%', padding: '20px', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
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
      </div> */}
      {[row1, row2, row3, row4].map((row, idx) => (
        <div className="dashboard-cards-row" key={idx} style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          {row.map((card, cidx) => (
            <div style={{ flex: 1 }} key={cidx}>{card}</div>
          ))}
        </div>
      ))}
      {/* 일일 온/습도 모니터링 그래프 */}
      <div className="dashboard-single-cards-row" style={{ margin: '0 32px 24px 32px' }}>
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
      
      {/* 일일 총 급수량 그래프 */}
      <div className="dashboard-single-cards-row" style={{ margin: '0 32px 24px 32px' }}>
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
=======
      </div>
      {/* 자동 모드일 때 시뮬레이션 데이터 표시 */}
      {autoMode && (
        <div className="dashboard-info-row">
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">자동 제어 기준 온도</h3>
            <div className="dashboard-card-value orange">{simulatedData.temp} ℃</div>
            <div className="dashboard-card-desc">자동 모드 기준값</div>
          </div>
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">자동 제어 기준 습도</h3>
            <div className="dashboard-card-value blue">{simulatedData.humid} %</div>
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
>>>>>>> d9e4379e3d0ee0294ecd06e6d69ac4b38d4eb702
        </div>
      </div>
    </div>
  );
};

export default DashBoardCards;