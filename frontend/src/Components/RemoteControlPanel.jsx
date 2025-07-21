import React, { useState, useEffect, useRef, useCallback } from "react";
import "./RemoteControlPanel.css";
import { useIotData } from '../api/useIotData.js';
import useControlStore from '../store/useControlStore.jsx';
import { useAutoMode } from '../hooks/useAutoMode.jsx'; // 자동 모드 커스텀 훅

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

  const sendToUnity = useCallback((eventName, payload) => {
    const message = new UnityMessage(eventName, payload);
    console.log("Sending to Unity:", JSON.stringify(message));
    sendMessage("MessageManager", "ReceiveMessage", JSON.stringify(message));
  }, [sendMessage]);

  // 전역 store 업데이트 및 저장
  const {
    water, fan, ledLevel, temp, humid,
    setWater, setFan, setLed, setTemp, setHumid,
    persistToLocal,
    autoMode, manualMode,
    toggleAutoMode, toggleManualMode,
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
  }, [refreshDisabled]);

  useEffect(() => {
    if (refreshTimer === 0 && refreshDisabled) {
      setRefreshDisabled(false);
      localStorage.removeItem("lastRefreshTime");
      clearInterval(timerRef.current);
    }
  }, [refreshTimer, refreshDisabled]);

  // 수동 모드 ---------------------------------------------------
  // 온도 제어 ▲▼
  const handleTempChange = (delta) => {
    const newValue = Math.max(10, Math.min(40, temp + delta));
    // 센서로는 온도 조절 할 때마다 led 꺼졌다 켜졌다 전달해야 함.
    sendToUnity("tempControl", { value: newValue });
    setTemp(newValue);
    persistToLocal();
  };

  // 습도 제어 ▲▼
  const handleHumidChange = (delta) => {
    const newValue = Math.max(30, Math.min(90, humid + delta));
    // 센서로는 습도도 조절 할 때마다 led 꺼졌다 켜졌다 전달해야 함.
    sendToUnity("humidControl", { value: newValue });
    setHumid(newValue);
    persistToLocal();
  };
  

  // 관개 시스템
  const handleWaterClick = () => {
    // 센서로 on/off 전달 (sendToSensor('water', !prev))
    if(water) return; // 이미 급수 중이면 무시
    sendToUnity("startWater", { status: true });
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
    // 센서로 on/off 전달 (sendToSensor('fan', !prev))
    const newState = !fan;
    sendToUnity("fanStatus", { status: newState });
    setFan(newState);
    persistToLocal();
  };

  // LED 조명
  const handleLedToggle = (e) => {
    // 센서로는 밝기기 조절 할 때마다 led 꺼졌다 켜졌다 전달해야 함.
    const level = parseInt(e.target.value);
    console.log("LED 밝기 설정:", level);
    sendToUnity("ledLevel", { level });
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

        {/* 실시간 데이터 */}
        <div className="realtime-data-section">
          <div className="section-title">Real - time DATA</div>
          <div className="data-grid">
            <DataCard label="온도" value={iotData ? iotData.inTp : '--'} unit="℃" />
            <DataCard label="습도" value={iotData ? iotData.inHd : '--'} unit="%" />
            <DataCard label="CO2" value={iotData ? iotData.inCo2 : '--'} unit="ppm" />
            <DataCard label="EC" value={iotData ? iotData.ec : '--'} unit="mS/cm" />
            <DataCard label="PH" value={iotData ? iotData.ph : '--'} />
          </div>
        </div>

        {/* 자동 모드일 때 시뮬레이션 데이터 표시 */}
        {autoMode && (
          <div className="realtime-data-section">
            <div className="section-title">자동 제어 기준 데이터</div>
            <div className="data-grid">
              <DataCard label="기준온도" value={simulatedData.temp} unit="℃" />
              <DataCard label="기준습도" value={simulatedData.humid} unit="%" />
            </div>
          </div>
        )}
      </div>

      {/* 오른쪽 패널 */}
      <div className="right-panel">
        {/* 기기 제어 */}
        <div className="device-control-section">
          <div className="section-title">공조 설비 기기 - 원격제어</div>
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
          {/* 온도 제어 */}
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#e57373" }}>🌡️💧</span>
              <span className="control-card-title" style={{ color: "#e57373" }}>온·습도 제어1</span>
            </div>
            <div className="control-card-body">
              <div className="temp-control-row">
                <button className="temp-btn" onClick={() => handleTempChange(-1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{temp}℃</span>
                <button className="temp-btn" onClick={() => handleTempChange(1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 난방 제어" : "수동 난방 시스템"}
              </div>

              {/* 습도 제어 */}
              <div className="temp-control-row" style={{ marginTop: "12px" }}>
                <button className="temp-btn" onClick={() => handleHumidChange(-1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{humid}%</span>
                <button className="temp-btn" onClick={() => handleHumidChange(1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 가습 제어" : "수동 가습 시스템"}
              </div>
            </div>
          </div>
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#e57373" }}>🌡️💧</span>
              <span className="control-card-title" style={{ color: "#e57373" }}>온·습도 제어2</span>
            </div>
            <div className="control-card-body">
              <div className="temp-control-row">
                <button className="temp-btn" onClick={() => handleTempChange(-1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{temp}℃</span>
                <button className="temp-btn" onClick={() => handleTempChange(1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 난방 제어" : "수동 난방 시스템"}
              </div>

              {/* 습도 제어 */}
              <div className="temp-control-row" style={{ marginTop: "12px" }}>
                <button className="temp-btn" onClick={() => handleHumidChange(-1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{humid}%</span>
                <button className="temp-btn" onClick={() => handleHumidChange(1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 가습 제어" : "수동 가습 시스템"}
              </div>
            </div>
          </div>
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#e57373" }}>🌡️💧</span>
              <span className="control-card-title" style={{ color: "#e57373" }}>온·습도 제어3</span>
            </div>
            <div className="control-card-body">
              <div className="temp-control-row">
                <button className="temp-btn" onClick={() => handleTempChange(-1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{temp}℃</span>
                <button className="temp-btn" onClick={() => handleTempChange(1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 난방 제어" : "수동 난방 시스템"}
              </div>

              {/* 습도 제어 */}
              <div className="temp-control-row" style={{ marginTop: "12px" }}>
                <button className="temp-btn" onClick={() => handleHumidChange(-1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{humid}%</span>
                <button className="temp-btn" onClick={() => handleHumidChange(1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 가습 제어" : "수동 가습 시스템"}
              </div>
            </div>
          </div>
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#e57373" }}>🌡️💧</span>
              <span className="control-card-title" style={{ color: "#e57373" }}>온·습도 제어4</span>
            </div>
            <div className="control-card-body">
              <div className="temp-control-row">
                <button className="temp-btn" onClick={() => handleTempChange(-1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{temp}℃</span>
                <button className="temp-btn" onClick={() => handleTempChange(1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 난방 제어" : "수동 난방 시스템"}
              </div>

              {/* 습도 제어 */}
              <div className="temp-control-row" style={{ marginTop: "12px" }}>
                <button className="temp-btn" onClick={() => handleHumidChange(-1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{humid}%</span>
                <button className="temp-btn" onClick={() => handleHumidChange(1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 가습 제어" : "수동 가습 시스템"}
              </div>
            </div>
          </div>
        </div>
      </div>
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