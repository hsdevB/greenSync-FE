import React, { useState, useEffect } from "react";
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
import DailyTempHumidityChart from './DailyTempHumidityChart.jsx';

// import { useAutoMode } from '../hooks/useAutoMode.jsx'; // 자동 모드 커스텀 훅

const DashBoardCards = ({ farmData }) => {
  // 디버깅을 위한 콘솔 로그
  console.log('DashBoardCards rendered with farmData:', farmData);



  // 상태 관리 초기화
  const [refreshDisabled, setRefreshDisabled] = useState(false); // 새로고침 비활성화 상태
  const [refreshTimer, setRefreshTimer] = useState(0); // 새로고침 타이머
  const iotData = useIotData(); // 온실 내 IoT 데이터
  const [indoorTemp, setIndoorTemp] = useState('--'); 
  const [indoorHumi, setIndoorHumi] = useState('--');
  const [phValue, setPhValue] = useState('--');
  const [carbonDioxide, setCarbonDioxide] = useState('--');
  const [elcDT, setElcDT] = useState('--');
  const [illuminance, setIlluminance] = useState('--');
  const [insolation, setInsolation] = useState('--');
  const [windDirection, setWindDirection] = useState('--');
  const [windSpeed, setWindSpeed] = useState('--');
  const [dewPoint, setDewPoint] = useState('--');
  const [isRain, setIsRain] = useState('--');
  const [temperatureChartData, setTemperatureChartData] = useState([]);

  const {
    // water, fan, ledLevel,
    temp1,
    humid1,
    autoMode,
  } = useControlStore();

  // // 자동모드 커스텀 훅 사용
  // const { simulatedData } = useAutoMode();

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

  // 농장 정보에 따른 센서 데이터 가져오기 함수들
  useEffect(() => {
    // 첫 번째 데이터로 고정
    const farmId = 1;

    const fetchIndoorTemp = async () => { // 화살표 함수 사용 
      try {
        // 프록시를 사용하지 않고 직접 주소로 요청
        const res = await axios.get(`/sensor/temperature/${farmId}`);
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
  // 첫 번째 데이터로 고정
  const farmId = 1;

  const fetchIndoorHumi = async () => {
    try {
      const res = await axios.get(`/sensor/humidity/${farmId}`);
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
  // 첫 번째 데이터로 고정
  const farmId = 1;

  const fetchNutrient = async () => {
    try {
      const res = await axios.get(`/sensor/nutrient/${farmId}`);
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
  // 첫 번째 데이터로 고정
  const farmId = 1;

  const fetchCarbonDioxide = async () => {
      try {
        const res = await axios.get(`/sensor/carbonDioxide/${farmId}`);
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
  // 첫 번째 데이터로 고정
  const farmId = 1;

  const fetchIlluminance = async () => {
    try {
      const res = await axios.get(`/sensor/illuminance/${farmId}`);
      console.log("Illuminance response: ", res.data);
      if (res.data && typeof res.data === 'number') {
        setIlluminance(res.data);
      } else if (res.data && res.data.data && res.data.data.illuminance) {
        setIlluminance(res.data.data.illuminance);
      } else if (res.data && res.data.illuminance) {
        setIlluminance(res.data.illuminance);
      } else {
        setIlluminance('--');
      }
    } catch (e) {
      console.error('Illuminance fetch error:', e);
      console.error('Error response:', e.response?.data);
      setIlluminance('--');
    }
  };
  fetchIlluminance();
}, []);

// 일사량 데이터 가져오기
useEffect(() => {
  const fetchInsolation = async () => {
    try {
      const res = await axios.get(`/weather/mapped`);
      console.log("Insolation response: ", res.data);
      if (res.data && typeof res.data === 'number') {
        setInsolation(res.data);
      } else if (res.data && res.data.data && res.data.data.insolation) {
        setInsolation(res.data.data.insolation);
      } else if (res.data && res.data.insolation) {
        setInsolation(res.data.insolation);
      } else {
        setInsolation('--');
      }
    } catch (e) {
      console.error('Insolation fetch error:', e);
      console.error('Error response:', e.response?.data);
      setInsolation('--');
    }
  };
  fetchInsolation();
}, []);

// 풍향 데이터 가져오기

useEffect(() => {
  const fetchWindDirection = async () => {
    try {
      const res = await axios.get(`/weather/mapped`);
      console.log("Wind Direction response: ", res.data);
      if (res.data && typeof res.data === 'number') {
        setWindDirection(res.data);
      } else if (res.data && res.data.data && res.data.data.windDirection) {
        setWindDirection(res.data.data.windDirection);
      } else if (res.data && res.data.windDirection) {
        setWindDirection(res.data.windDirection);
      } else {
        setWindDirection('--');
      }
    } catch (e) {
      console.error('Wind Direction fetch error:', e);
      console.error('Error response:', e.response?.data);
      setWindDirection('--');
    }
  };
  fetchWindDirection();
}, []);

// 풍속 데이터 가져오기
useEffect(() => {
  const fetchWindSpeed = async () => {
    try {
      const res = await axios.get(`/weather/mapped`);
      console.log("Wind Speed response: ", res.data);
      if (res.data && typeof res.data === 'number') {
        setWindSpeed(res.data);
      } else if (res.data && res.data.data && res.data.data.windSpeed) {
        setWindSpeed(res.data.data.windSpeed);
      } else if (res.data && res.data.windSpeed) {
        setWindSpeed(res.data.windSpeed);
      } else {
        setWindSpeed('--');
      }
    } catch (e) {
      console.error('Wind Speed fetch error:', e);
      console.error('Error response:', e.response?.data);
      setWindSpeed('--');
    }
  };
  fetchWindSpeed();
}, []);

// 이슬점 데이터 가져오기
useEffect(() => {
  const fetchDewPoint = async () => {
    try {
      const res = await axios.get(`/weather/mapped`);
      console.log("Dew Point response: ", res.data);
      if (res.data && typeof res.data === 'number') {
        setDewPoint(res.data);
      } else if (res.data && res.data.data && res.data.data.dewPoint) {
        setDewPoint(res.data.data.dewPoint);
      } else if (res.data && res.data.dewPoint) {
        setDewPoint(res.data.dewPoint);
      } else {
        setDewPoint('--');
      }
    } catch (e) {
      console.error('Dew Point fetch error:', e);
      console.error('Error response:', e.response?.data);
      setDewPoint('--');
    }
  };
  fetchDewPoint();
}, []);

// 강수여부 데이터 가져오기
useEffect(() => {
  const fetchIsRain = async () => {
    try {
      const res = await axios.get(`/weather/mapped`);
      console.log("Is Rain response: ", res.data);
      if (res.data && typeof res.data === 'number') {
        setIsRain(res.data);
      } else if (res.data && res.data.data && res.data.data.isRain) {
        setIsRain(res.data.data.isRain);
      } else if (res.data && res.data.isRain) {
        setIsRain(res.data.isRain);
      } else {
        setIsRain('--');
      }
    } catch (e) {
      console.error('Is Rain fetch error:', e);
      console.error('Error response:', e.response?.data);
      setIsRain('--');
    }
  };
  fetchIsRain();
}, []);

// 온도 차트 데이터 가져오기
useEffect(() => {
  const fetchTemperatureChartData = async () => {
    try {
      const res = await axios.get(`/chart/temperature/daily/ABCD1234`); // 실제 API 엔드포인트로 수정
      console.log("Temperature Chart response: ", res.data);
      if (res.data && res.data.success) {
        const transformedData = transformTemperatureData(res.data);
        setTemperatureChartData(transformedData);
      } else {
        setTemperatureChartData([]);
      }
    } catch (e) {
      console.error('Temperature Chart fetch error:', e);
      console.error('Error response:', e.response?.data);
      setTemperatureChartData([]);
    }
  };
  fetchTemperatureChartData();
}, []);

// 대시보드 데이터 (임시)
const dashboardData = DashBoardData;

// 온도 차트 데이터 변환 함수
const transformTemperatureData = (rawData) => {
  if (!rawData || !rawData.data || !rawData.data.datasets || !rawData.data.datasets[0]) {
    return [];
  }
  
  const temperatures = rawData.data.datasets[0].data;
  const timeLabels = ['10시', '12시', '14시', '16시', '18시', '20시', '22시', '24시', '02시', '04시', '06시', '08시'];
  
  return temperatures.map((temp, index) => ({
    time: timeLabels[index],
    temperature: temp
  }));
};

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
                <h3 className="dashboard-card-title">자동 제어 기준 온도</h3>
              </div>
              <div className="dashboard-card-value red" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {temp1}
              </div>
              <div className="dashboard-card-unit" style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '4px' }}>
                ℃
              </div>

            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="dashboard-card crop-card-hover" data-type="humidity">
              <div className="dashboard-card-section">
                <Droplets className="dashboard-card-icon blue" />
                <h3 className="dashboard-card-title">자동 제어 기준 습도</h3>
              </div>
              <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {humid1}
              </div>
              <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
                %
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 첫 번째 줄: 실내온도/습도, 산도 */}
      <div className="dashboard-cards-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        {/* 실내온도/습도 카드 */}
        <div style={{ flex: 1 }}>
          <div className="dashboard-card combined-card" data-type="indoorTempHumi">
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%"
            }}>
              {/* 온도 영역 */}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div className="dashboard-card-section">
                  <span style={{ color: "#e57373", fontSize: "1.5rem" }}>🌡️</span>
                  <h3 className="dashboard-card-title">실내온도</h3>
                </div>
                <div className="dashboard-card-value red" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {indoorTemp ?? "--"}
                </div>
                <div className="dashboard-card-unit" style={{ color: '#e57373', fontSize: '0.9rem', marginTop: '10px' }}>
                  ℃
                </div>
              </div>
              {/* 구분선 */}
              <div style={{
                width: 1,
                height: 60,
                background: "#eee",
                margin: "0 16px" // 온도 습도 간격
              }}></div>
              {/* 습도 영역 */}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div className="dashboard-card-section">
                  <span style={{ color: "#2196f3", fontSize: "1.5rem" }}>💧</span>
                  <h3 className="dashboard-card-title">실내습도</h3>
                </div>
                <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {indoorHumi ?? "--"}
                </div>
                <div className="dashboard-card-unit" style={{ color: '#2196f3', fontSize: '0.9rem', marginTop: '10px' }}>
                  %
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 16, color: "#888", fontWeight: "bold" }}>
              {/* 실시간 측정값 */}
            </div>
          </div>
        </div>
        
        {/* 산도(pH) 카드 */}
        <div style={{ flex: 1 }}>
          <div className="dashboard-card" data-type="ph">
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
          </div>
        </div>
      </div>

      {/* 두 번째 줄: 이산화탄소, 전기전도도 */}
      <div className="dashboard-cards-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        {/* 이산화탄소 카드 */}
        <div style={{ flex: 1 }}>
          <div className="dashboard-card" data-type="co2">
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
          </div>
        </div>
        
        {/* 전기전도도(EC) 카드 */}
        <div style={{ flex: 1 }}>
          <div className="dashboard-card" data-type="ec">
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
          </div>
        </div>
      </div>

      {/* 세 번째 줄: 일사량, 광량 */}
      <div className="dashboard-cards-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        {/* 일사량 카드 */}
        <div style={{ flex: 1 }}>
          <div className="dashboard-card" data-type="solar">
            <div className="dashboard-card-section">
              <Sun className="dashboard-card-icon yellow" />
              <h3 className="dashboard-card-title">일사량</h3>
            </div>
            <div className="dashboard-card-value yellow" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {insolation}
            </div>
            <div className="dashboard-card-unit" style={{ color: '#facc15', fontSize: '0.9rem', marginTop: '4px' }}>
              mol/m²/d
            </div>
          </div>
        </div>
        
        {/* 광량 카드 */}
        <div style={{ flex: 1 }}>
          <div className="dashboard-card" data-type="illuminance">
            <div className="dashboard-card-section">
              <Cloud className="dashboard-card-icon blue" />
              <h3 className="dashboard-card-title">광량</h3>
            </div>
            <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {illuminance}
            </div>
            <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
              lux
            </div>
          </div>
        </div>
      </div>

      {/* 네 번째 줄: 풍향, 풍속 */}
      <div className="dashboard-cards-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        {/* 풍향(기상청) 카드 */}
        <div style={{ flex: 1 }}>
          <div className="dashboard-card" data-type="wind">
            <div className="dashboard-card-section">
              <Cloud className="dashboard-card-icon blue" />
              <h3 className="dashboard-card-title">풍향</h3>
            </div>
            <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {windDirection}
            </div>
            <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
              도(°)
            </div>
          </div>
        </div>
        
        {/* 풍속(기상청) 카드 */}
        <div style={{ flex: 1 }}>
          <div className="dashboard-card" data-type="wind">
            <div className="dashboard-card-section">
              <Cloud className="dashboard-card-icon blue" />
              <h3 className="dashboard-card-title">풍속</h3>
            </div>
            <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {windSpeed}
            </div>
            <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
              m/s
            </div>
          </div>
        </div>
      </div>

      {/* 다섯 번째 줄: 이슬점, 강수여부 */}
      <div className="dashboard-cards-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        {/* 이슬점(기상청) 카드 */}
        <div style={{ flex: 1 }}>
          <div className="dashboard-card" data-type="dew">
            <div className="dashboard-card-section">
              <Cloud className="dashboard-card-icon blue" />
              <h3 className="dashboard-card-title">이슬점</h3>
            </div>
            <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {dewPoint}
            </div>
            <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
              ℃
            </div>
          </div>
        </div>
        
        {/* 강수여부(기상청) 카드 */}
        <div style={{ flex: 1 }}>
          <div className="dashboard-card" data-type="rain">
            <div className="dashboard-card-section">
              <Cloud className="dashboard-card-icon blue" />
              <h3 className="dashboard-card-title">강수여부</h3>
            </div>
            <div className="dashboard-card-value blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {isRain ? "true" : "false"}
            </div>
            <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
              상태
            </div>
          </div>
        </div>
      </div>

      {/* 일일 온/습도 모니터링 그래프 */}
      <div className="dashboard-single-cards-row" style={{ margin: '0 32px 24px 32px' }}>
        <DailyTempHumidityChart farmId={1} />
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
        </div>
      </div>

      {/* 온도 차트 그래프 */}
      {/* <div className="dashboard-single-cards-row" style={{ margin: '0 32px 24px 32px' }}>
        <div className="dashboard-graph-card">
          <div className="dashboard-graph-title">일일 온도 변화</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={temperatureChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div> */}
    </div>
  );
};

export default DashBoardCards;