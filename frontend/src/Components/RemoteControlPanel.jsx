import React, { useState, useEffect, useRef, useCallback } from "react";
import "./RemoteControlPanel.css";
import { useIotData } from '../api/useIotData.js';
import useControlStore from '../store/useControlStore.jsx';
import { useAutoMode } from '../hooks/useAutoMode.jsx'; // 자동 모드 커스텀 훅
import mqtt from 'mqtt'; // 실제 환경에서는 mqtt.js 라이브러리 사용
import AIAnalysisModal from "./AIAnalysisModal";

// MQTT 클라이언트
class MQTTClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  // MQTT 브로커 연결
  connect(brokerUrl = 'ws://192.168.0.26::9001') {
    if (this.isConnecting || this.isConnected) {
      console.log('이미 연결 중이거나 연결됨');
      return;
    }

    try {
      this.isConnecting = true;
      console.log(`MQTT 브로커 연결 시도: ${brokerUrl}`);
      
      this.client = mqtt.connect(brokerUrl);
      
      // 연결 성공 이벤트
      this.client.on('connect', () => {
        console.log('MQTT 브로커 연결 성공');
        this.isConnected = true;
        this.isConnecting = false;
      });

      // 연결 실패 이벤트
      this.client.on('error', (error) => {
        console.error('MQTT 연결 오류:', error);
        this.isConnected = false;
        this.isConnecting = false;
      });

      // 연결 끊김 이벤트
      this.client.on('close', () => {
        console.log('MQTT 연결 끊김');
        this.isConnected = false;
        this.isConnecting = false;
      });

      // 재연결 이벤트
      this.client.on('reconnect', () => {
        console.log('MQTT 재연결 시도');
        this.isConnecting = true;
      });

    } catch (error) {
      console.error('MQTT 연결 실패:', error);
      this.isConnected = false;
      this.isConnecting = false;
    }
  }

  // MQTT 메시지 발행
  publish(topic, message) {
    // client와 연결 상태 모두 확인
    if (!this.client || !this.isConnected) {
      console.warn('MQTT 브로커에 연결되지 않음 또는 클라이언트 없음');
      return;
    }

    try {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      console.log(`MQTT 발행 - Topic: ${topic}, Payload: ${payload}`);
      
      this.client.publish(topic, payload, (error) => {
        if (error) {
          console.error('MQTT 메시지 발행 실패:', error);
        } else {
          console.log('MQTT 메시지 발행 성공');
        }
      });
      
    } catch (error) {
      console.error('MQTT 메시지 발행 실패:', error);
    }
  }

  // LED 깜박임 제어 (각 센서별 개별 제어)
  async blinkLed(ledIndex, currentFanState) {
    // 특정 LED만 켜기 (온도센서=0, 습도센서=1, 급수=2, LED밝기=3)
    const ledObject = [false, false, false, false];
    ledObject[ledIndex] = true;
    
    this.publish('device/control/ABCD1234', {
      "fan": currentFanState,
      "leds": ledObject
    });
    
    // 딜레이
    if (ledIndex != 2)
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms
    else
      await new Promise(resolve => setTimeout(resolve, 5000)); // 급수 끝나는 시간(5초)
    
    // LED 끄기
    this.publish('device/control/ABCD1234', {
      "leds": [false, false, false, false]
    });
  }

  disconnect() {
    if (this.client && this.isConnected) {
      this.client.end();
      this.isConnected = false;
      console.log('MQTT 연결 종료');
    }
  }
}
class UnityMessage {
  constructor(name, data) {
    this.name = name;
    this.data = JSON.stringify(data);
  }
}

// SVG 아이콘 직접 삽입 (또는 public 폴더에 이미지 파일로 넣어도 됨)
const RefreshIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V2L7 6.5L12 11V8C15.31 8 18 10.69 18 14C18 17.31 15.31 20 12 20C8.69 20 6 17.31 6 14H4C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 9.58 16.42 6 12 6V5Z" fill="black"/>
  </svg>
);

export default function RemoteControlPanel({unityContext}) {
  const iotData = useIotData();
  const { sendMessage } = unityContext;

  // MQTT 클라이언트 인스턴스
  const mqttClientRef = useRef(null);

  // MQTT 클라이언트 초기화
  useEffect(() => {
    mqttClientRef.current = new MQTTClient();
    mqttClientRef.current.connect(); // 실제 브로커 주소로 변경 필요
    
    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.disconnect();
      }
    };
  }, []);

  const sendToUnity = useCallback((eventName, payload) => {
    const message = new UnityMessage(eventName, payload);
    console.log("Sending to Unity:", JSON.stringify(message));
    sendMessage("MessageManager", "ReceiveMessage", JSON.stringify(message));
  }, [sendMessage]);

  // 전역 store 업데이트 및 저장
  const {
    water, fan, ledLevel,
    temp1,
    humid1,
    setWater, setFan, setLed, 
    setTemp1,
    setHumid1,
    persistToLocal,
    autoMode, manualMode,
    toggleAutoMode, toggleManualMode,
    vent, setVent,
  } = useControlStore();

  // 자동 모드 커스텀 훅 사용
  const { simulatedData } = useAutoMode(sendToUnity);
  
  // 마운트 시 store 초기화
  useEffect(() => {
    useControlStore.getState().restoreFromLocal();
  }, []);

  // 새로고침 비활성화 상태 및 타이머
  const [refreshDisabled, setRefreshDisabled] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState(0);
  const timerRef = useRef(null);

  // 마운트 시 localStorage에서 남은 시간 계산
  useEffect(() => {
    const lastRefresh = localStorage.getItem("lastRefreshTime");
    if (lastRefresh) {
      const elapsed = Math.floor((Date.now() - Number(lastRefresh)) / 1000);
      if (elapsed < 300) {
        setRefreshDisabled(true);
        setRefreshTimer(300 - elapsed);
      }
    }
  }, []);

  // 새로고침 버튼 클릭 핸들러
  const handleRefresh = () => {
    // 실제 새로고침 로직 (예: 데이터 fetch 등)
    // fetchData();
    const now = Date.now();
    localStorage.setItem("lastRefreshTime", now.toString());
    setRefreshDisabled(true);
    setRefreshTimer(300); // 5분(300초)
  };

  // 타이머 관리 (useEffect)
  useEffect(() => {
    if (refreshDisabled && refreshTimer > 0) {
      timerRef.current = setInterval(() => {
        setRefreshTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [refreshTimer, refreshDisabled]);

  useEffect(() => {
    if (refreshTimer === 0 && refreshDisabled) {
      setRefreshDisabled(false);
      localStorage.removeItem("lastRefreshTime");
      clearInterval(timerRef.current);
    }
  }, [refreshTimer, refreshDisabled]);

  // 수동 모드 ---------------------------------------------------
  // 온도 제어 ▲▼
  const handleTempChange = async (sensorNum, delta) => {
    const currentTemp = temp1;
    const newValue = Math.max(10, Math.min(40, currentTemp + delta));
    
    sendToUnity(`tempControl${sensorNum}`, { value: newValue });
    // MQTT로 LED 깜박임 신호 전송
    if (mqttClientRef.current) {
      await mqttClientRef.current.blinkLed(0, fan);
    }
    // 온도/습도 센서 데이터 전송
    const sensorData = {
      "temperature": newValue,
      "humidity": humid1,
      "phLevel": 6.5,
      "eleDT": 1.2,
      "co2": 400,
    };
    if (mqttClientRef.current) {
      mqttClientRef.current.publish('sensor/data/send', sensorData);
    }
    if (sensorNum === 1) setTemp1(newValue);
    // else if (sensorNum === 2) setTemp2(newValue);
    // else if (sensorNum === 3) setTemp3(newValue);
    // else if (sensorNum === 4) setTemp4(newValue);
    persistToLocal();
  };

  // 습도 제어 ▲▼
  const handleHumidChange = async (sensorNum, delta) => {
    const currentHumid = humid1;
    const newValue = Math.max(30, Math.min(90, currentHumid + delta));
    
    sendToUnity(`humidControl${sensorNum}`, { value: newValue });
    // MQTT로 LED 깜박임 신호 전송
    if (mqttClientRef.current) {
      await mqttClientRef.current.blinkLed(1, fan);
    }
    // 온도/습도 센서 데이터 전송
    const sensorData = {
      "temperature": temp1,
      "humidity": newValue,
      "phLevel": 6.5,
      "eleDT": 1.2,
      "co2": 400,
    };
    if (mqttClientRef.current) {
      mqttClientRef.current.publish('sensor/data/send', sensorData);
    }
    if (sensorNum === 1) setHumid1(newValue);
    // else if (sensorNum === 2) setHumid2(newValue);
    // else if (sensorNum === 3) setHumid3(newValue);
    // else if (sensorNum === 4) setHumid4(newValue);
    
    persistToLocal();
  };
  

  // 관개 시스템
  const handleWaterClick = async () => {
    // 센서로 on/off 전달 (sendToSensor('water', !prev))
    if(water) return; // 이미 급수 중이면 무시

    sendToUnity("startWater", { status: true });
    // MQTT로 LED 깜박임 신호 전송
    if (mqttClientRef.current) {
      await mqttClientRef.current.blinkLed(2, fan);
    }

    setWater(true);
    persistToLocal();

    // 5초 후 자동 종료
    setTimeout(() => {
      setWater(false);
      persistToLocal();
    }, 5000);
  };

  // 환기 시스템 토글
  const handleFanToggle = () => {
    const newState = !fan;
    sendToUnity("fanStatus", { status: newState });

    // MQTT로 팬 제어 신호 전송
    if (mqttClientRef.current) {
      mqttClientRef.current.publish('device/control/ABCD1234', {
        "fan": newState,
        "leds": [false, false, false, false]
      });
      console.log("fan작동");
    }

    setFan(newState);
    persistToLocal();
  };

  // LED 조명
  const handleLedToggle = async (e) => {
    // 센서로는 밝기기 조절 할 때마다 led 꺼졌다 켜졌다 전달해야 함.
    const level = parseInt(e.target.value);
    console.log("LED 밝기 설정:", level);
    sendToUnity("ledLevel", { level });

    // MQTT로 LED 깜박임 신호 전송 (밝기 조절할 때마다)
    if (mqttClientRef.current && level > 0) {
      await mqttClientRef.current.blinkLed(3, fan);
    }

    setLed(level);
    persistToLocal();
  };

  const handleAutoModeToggle = () => {
    toggleAutoMode();
  };

  const handleManualModeToggle = () => {
    toggleManualMode();
  };

  const controlDisabled = autoMode;

  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="remote-panel-root">
      {/* 왼쪽 패널 */}
      <div className="left-panel">
        {/* 새로고침 버튼을 오른쪽 상단에 flex로 배치 */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
          <button
            onClick={handleRefresh}
            disabled={refreshDisabled}
            className="refresh-btn"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              outline: "none"
            }}
            aria-label="새로고침"
          >
            <RefreshIcon />
          </button>
          {refreshDisabled && (
            <span style={{ marginLeft: 8, color: "#888", fontSize: "0.95em" }}>
              {Math.floor(refreshTimer / 60)}:{(refreshTimer % 60).toString().padStart(2, "0")} 후 재시도 가능
            </span>
          )}
        </div>

        {/* 상단 타이틀 */}
        <div className="panel-header">
          <div className="panel-title">컨테이너형 스마트팜</div>
          <div className="panel-subtitle">GreenSync</div>
        </div>



        {/* 자동 모드일 때 시뮬레이션 데이터 표시 */}
        {autoMode && (
          <div className="realtime-data-section">
            <div className="section-title">자동 제어 기준 데이터 (데이터확인용)</div>
            <div className="data-grid">
              <DataCard label="센서1 온도" value={simulatedData.sensor1?.temp || '--'} unit="℃" />
              <DataCard label="센서1 습도" value={simulatedData.sensor1?.humid || '--'} unit="%" />
              {/* <DataCard label="센서2 온도" value={simulatedData.sensor2?.temp || '--'} unit="℃" /> */}
              {/* <DataCard label="센서2 습도" value={simulatedData.sensor2?.humid || '--'} unit="%" /> */}
              {/* <DataCard label="센서3 온도" value={simulatedData.sensor3?.temp || '--'} unit="℃" /> */}
              {/* <DataCard label="센서3 습도" value={simulatedData.sensor3?.humid || '--'} unit="%" /> */}
              {/* <DataCard label="센서4 온도" value={simulatedData.sensor4?.temp || '--'} unit="℃" /> */}
              {/* <DataCard label="센서4 습도" value={simulatedData.sensor4?.humid || '--'} unit="%" /> */}
            </div>
          </div>
        )}

        {/* 원격제어 상태 section-title 추가 */}
        <div className="section-title">원격제어 상태</div>
        <div className="data-grid">
          <DataCard label="난방" value={fan ? "ON" : "OFF"} unit={fan ? "🟢" : "🔴"} />
          <DataCard label="배기" value={vent ? "ON" : "OFF"} unit={vent ? "🟢" : "🔴"} />
          <DataCard label="급수량" value={water ? "ON" : "OFF"} unit={water ? "🟢" : "🔴"} />
        </div>
        {/* MQTT 연결 상태 표시 */}
        <div className="realtime-data-section">
          <div className="section-title">MQTT 연결 상태(확인용)</div>
          <div className="data-grid">
            <DataCard 
              label="MQTT" 
              value={mqttClientRef.current?.isConnected ? "연결됨" : "연결 안됨"} 
              unit={mqttClientRef.current?.isConnected ? "🟢" : "🔴"} 
            />
          </div>
        </div>
        {/* 기기 제어 */}
        <div className="device-control-section">
          <div className="section-title">공조 설비 기기 - 원격제어</div>
          {/* AI 스마트팜 분석 버튼 추가 */}
          <button
            onClick={() => setAiModalOpen(true)}
            style={{
              margin: "12px 0",
              padding: "10px 24px",
              background: "#388e3c",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            AI 스마트팜 분석
          </button>
          <div className="control-row">
            <span>자동모드</span>
            <button 
              onClick={handleAutoModeToggle}
              disabled={!manualMode} // 수동모드가 꺼져 있으면 자동모드도 못 누르게
              className={autoMode ? "btn-on" : "btn-off"}
            >
              {autoMode ? "ON" : "OFF"}
            </button>
          </div>
          <div className="control-row">
            <span>수동모드</span>
            <button 
              onClick={handleManualModeToggle}
              disabled={!autoMode} // 자동모드가 꺼져 있으면 수동모드도 못 누르게게
              className={manualMode ? "btn-on" : "btn-off"}
            >
              {manualMode ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div> {/* 왼쪽 패널 닫힘 */}

      {/* 오른쪽 패널 */}
      <div className="right-panel">
        {/* 제어판 카드 UI (2x2 grid) */}
        <div className="panel-title-row">
          <span className="panel-title-icon">📋</span>
          <span className="panel-title-text">제어판</span>
        </div>
        <div className="control-card-grid">
          {/* 관개 시스템 */}
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#2196f3" }}>💧</span>
              <span className="control-card-title" style={{ color: "#2196f3" }}>관개 시스템</span>
            </div>
            <div className="control-card-body">
              <button 
                onClick={handleWaterClick}
                disabled={water || controlDisabled}
                className={water ? "btn-disabled" : water ? "btn-on" : "btn-off"}
              >
                {water ? "급수 중..." : "급수하기"}
              </button>
              <div className="control-card-desc">
                {autoMode ? "자동 제어 중" : "수동 물 공급"}
              </div>
            </div>
          </div>
          {/* 환기 시스템 */}
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#8bc34a" }}>🍃</span>
              <span className="control-card-title" style={{ color: "#8bc34a" }}>환기 시스템</span>
            </div>
            <div className="control-card-body">
              <label className="switch">
                <input type="checkbox" checked={fan} onChange={handleFanToggle} disabled={controlDisabled} />
                <span className="slider"></span>
              </label>
              <div className="control-card-desc">
                {autoMode ? "자동 제어 중" : "수동 환기"}
              </div>
            </div>
          </div>
          
          {/* 온·습도 제어1 */}
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#e57373" }}>🌡️💧</span>
              <span className="control-card-title" style={{ color: "#e57373" }}>온·습도 제어1</span>
            </div>
            <div className="control-card-body">
              <div className="temp-control-row">
                <button className="temp-btn" onClick={() => handleTempChange(1, -1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{temp1}℃</span>
                <button className="temp-btn" onClick={() => handleTempChange(1, 1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 난방 제어" : "수동 난방 시스템"}
              </div>

              <div className="temp-control-row" style={{ marginTop: "12px" }}>
                <button className="temp-btn" onClick={() => handleHumidChange(1, -1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{humid1}%</span>
                <button className="temp-btn" onClick={() => handleHumidChange(1, 1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 가습 제어" : "수동 가습 시스템"}
              </div>
            </div>
          </div>

          {/* LED 조명 */}
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#ffd600" }}>💡</span>
              <span className="control-card-title" style={{ color: "#ffd600" }}>LED 조명</span>
            </div>
            <div className="control-card-body">
              <input
                type="range"
                min={0}
                max={3}
                value={ledLevel ?? 0}
                onChange={handleLedToggle}
                disabled={controlDisabled}
                className="slider-range"
                />
              <div className="control-card-desc">
                {autoMode ? `자동 제어 중 (${ledLevel ?? 0})` : `LED 밝기 제어(${ledLevel ?? 0})`}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* AI 분석 모달 */}
      <AIAnalysisModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
}

// 실시간 데이터 카드
function DataCard({ label, value, unit }) {
  return (
    <div className="data-card">
      <div className="data-label">{label}</div>
      <div className="data-value">
        {value} {unit && <span className="data-unit">{unit}</span>}
      </div>
    </div>
  );
}