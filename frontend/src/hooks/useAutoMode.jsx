import { useEffect, useState, useRef } from 'react';
import useControlStore from '../store/useControlStore.jsx';
import { MQTTClient } from '../utils/MQTTClient.jsx';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEVICE_STATUS_ENDPOINT = import.meta.env.VITE_DEVICE_STATUS_ENDPOINT;
const CONTROL_SETTINGS_ENDPOINT = import.meta.env.VITE_CONTROL_SETTINGS_ENDPOINT;
const SENSOR_ENDPOINT = import.meta.env.VITE_SENSOR_ENDPOINT;

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const deviceStatusApi = {
  // 온도 업데이트 
  updateTemperature: async (farmCode, newValue) => {
    try {
      const response = await apiClient.put(`${SENSOR_ENDPOINT}/${CONTROL_SETTINGS_ENDPOINT}/${farmCode}`, {
        controlTemperature: newValue
      });
      return response.data;
    } catch (error) {
      console.error('온도 업데이트 실패:', error);
      throw error;
    }
  },

  // 습도 업데이트
  updateHumidity: async (farmCode, newValue) => {
    try {
      const response = await apiClient.put(`${SENSOR_ENDPOINT}/${CONTROL_SETTINGS_ENDPOINT}/${farmCode}`, {
        controlHumidity: newValue
      });
      return response.data;
    } catch (error) {
      console.error('습도 업데이트 실패:', error);
      throw error;
    }
  },

  // LED 레벨 업데이트 
  updateLed: async (farmCode, newLevel) => {
    try {
      const response = await apiClient.put(`${SENSOR_ENDPOINT}/${CONTROL_SETTINGS_ENDPOINT}/${farmCode}`, {
        ledStage: newLevel
      });
      return response.data;
    } catch (error) {
      console.error('LED 레벨 업데이트 실패:', error);
      throw error;
    }
  }
};

// 자동 모드 로직을 담은 커스텀 훅
export const useAutoMode = (farmCode, sendToUnity) => {
  const mqttClientRef = useRef(null);

  const {
    fan, ledLevel, temp1, humid1,
    setWater, setFan, setLed,
    setTemp1,
    setHumid1,
    autoMode,
  } = useControlStore();

  // MQTT 클라이언트 초기화 (한 번만)
  useEffect(() => {
    if (!mqttClientRef.current) {
      mqttClientRef.current = new MQTTClient();
      mqttClientRef.current.connect();
    }
    
    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.disconnect();
        mqttClientRef.current = null;
      }
    };
  }, []);

  // 시뮬레이션 데이터 (실제로는 IoT 센서 데이터를 사용)
  const [simulatedData, setSimulatedData] = useState({
    sensor1: { temp: 25, humid: 50 },
    // sensor2: { temp: 25, humid: 50 },
    // sensor3: { temp: 25, humid: 50 },
    // sensor4: { temp: 25, humid: 50 },
  });

  // 이전 설정값들을 useRef로 관리하여 무한 루프 방지
  const prevTargetTempsRef = useRef([null]);
  const prevTargetHumidsRef = useRef([null]);

  // 10초마다 시뮬레이션 데이터 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedData(prevData => {
        const prevTemp = prevData?.sensor1?.temp ?? 25;
        const prevHumid = prevData?.sensor1?.humid ?? 50;
  
        const newTemp = clamp(prevTemp + getRandomStep(), 15, 35);
        const newHumid = clamp(prevHumid + getRandomStep(), 30, 80);
  
        return {
          sensor1: {
            temp: newTemp,
            humid: newHumid
          }
        };
      });
    }, 1000 * 10); // 10초마다
  
    return () => clearInterval(interval);
  }, []);
  
  function getRandomStep() {
    const step = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
    return step;
  }
  
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // 자동 환경 제어 로직
  useEffect(() => {
    if (!autoMode || !sendToUnity) return;

    // 각 센서별 평균값 계산 또는 개별 제어
    const sensors = [simulatedData.sensor1];

    // 1. 온도 자동 제어 (센서별 개별 제어)
    sensors.forEach(async (sensor, index) => {
      const sensorNum = index + 1;
      let newTargetTemp = null;
      
      if (sensor.temp < 20) {
        newTargetTemp = 24;
      } else if (sensor.temp > 30) {
        newTargetTemp = 26;
      }
      
      // 목표 온도가 변경되었을 때만 처리
      if (newTargetTemp !== null && prevTargetTempsRef.current[index] !== newTargetTemp) {
        try {
          // 1. UI 즉시 업데이트
          if (sensorNum === 1) setTemp1(newTargetTemp);
          sendToUnity(`tempControl${sensorNum}`, { value: newTargetTemp });

          // 2. 백그라운드 API 호출
          await deviceStatusApi.updateTemperature(farmCode, newTargetTemp);
          console.log(`자동 모드: 센서${sensorNum} 온도 ${newTargetTemp}도로 설정 (현재: ${sensor.temp}도)`);

          // MQTT 깜박임 처리
          if (mqttClientRef.current && mqttClientRef.current.isConnected) {
            await mqttClientRef.current.blinkLed(3, fan);
          }

          // 성공 시 이전 값 업데이트
          prevTargetTempsRef.current[index] = newTargetTemp;
        } catch (error) {
          console.error(`자동 모드: 센서${sensorNum} 온도 설정 실패:`, error);
          // 실패 시 UI 롤백
          if (sensorNum === 1) setTemp1(temp1); // 원래 값으로 복원
          sendToUnity(`tempControl${sensorNum}`, { value: temp1 });
        }
      }
    });

    // 2. 습도 자동 제어 (센서별 개별 제어)
    sensors.forEach(async (sensor, index) => {
      const sensorNum = index + 1;
      let newTargetHumid = null;
      
      if (sensor.humid < 40) {
        newTargetHumid = 50;
      } else if (sensor.humid > 70) {
        newTargetHumid = 60;
      }
      
      // 목표 습도가 변경되었을 때만 처리
      if (newTargetHumid !== null && prevTargetHumidsRef.current[index] !== newTargetHumid) {
        try {
          // 1. UI 즉시 업데이트
          if (sensorNum === 1) setHumid1(newTargetHumid);
          sendToUnity(`humidControl${sensorNum}`, { value: newTargetHumid });

          // 2. 백그라운드 API 호출
          await deviceStatusApi.updateHumidity(farmCode, newTargetHumid);
          console.log(`자동 모드: 센서${sensorNum} 습도 ${newTargetHumid}%로 설정 (현재: ${sensor.humid}%)`);
  
          // MQTT 깜박임 처리
          if (mqttClientRef.current && mqttClientRef.current.isConnected) {
            await mqttClientRef.current.blinkLed(2, fan);
          }

          // 성공 시 이전 값 업데이트
          prevTargetHumidsRef.current[index] = newTargetHumid;
        } catch (error) {
          console.error(`자동 모드: 센서${sensorNum} 습도 설정 실패:`, error);
          // 실패 시 UI 롤백
          if (sensorNum === 1) setHumid1(humid1); // 원래 값으로 복원
          sendToUnity(`humidControl${sensorNum}`, { value: humid1 });
        }
      }
    });

    // 3. LED 자동 제어 (시간 기준)
    const now = new Date();
    const hour = now.getHours();
    const ledLevelByTime = (hour >= 6 && hour < 18) ? 3 : 1;

    if (ledLevel !== ledLevelByTime) {
      (async () => {
        try {
          // 1. UI 즉시 업데이트
          sendToUnity("ledLevel", { level: ledLevelByTime });
          setLed(ledLevelByTime);

          // 2. 백그라운드 API 호출
          await deviceStatusApi.updateLed(farmCode, ledLevelByTime);
          console.log('자동 모드: LED 밝기', ledLevelByTime, '로 설정 (현재 시간:', hour, '시)');
          
          // LED 밝기 변경 시 MQTT LED 깜박임
          if (ledLevelByTime > 0 && mqttClientRef.current && mqttClientRef.current.isConnected) {
            await mqttClientRef.current.blinkLed(1, fan);
          }
        } catch (error) {
          console.error('자동 모드: LED 밝기 설정 실패:', error);
          // 실패 시 UI 롤백
          setLed(ledLevel); // 원래 값으로 복원
          sendToUnity("ledLevel", { level: ledLevel });
        }
      })();
    }
  }, [autoMode, simulatedData.sensor1.temp, simulatedData.sensor1.humid, sendToUnity, ledLevel, fan, temp1, humid1]);

  // 자동 급수 주기 타이머
  useEffect(() => {
    if (!autoMode || !sendToUnity) return;

    const wateringInterval = setInterval(async () => {
      // UI 즉시 업데이트
      console.log('자동 모드: 급수 시작');
      sendToUnity("startWater", { status: true });
      setWater(true);
      
      // MQTT LED 깜박임
      if (mqttClientRef.current && mqttClientRef.current.isConnected) {
        await mqttClientRef.current.blinkLed(0, fan);
      }
      setTimeout(async () => {
        console.log('자동 모드: 급수 종료');
        setWater(false);
        sendToUnity("startWater", { status: false });
      }, 1000 * 5); // 5초간 급수
    }, 1000 * 20); // 20초마다 (테스트용)
    // }, 1000 * 60 * 60); // 1시간마다

    return () => clearInterval(wateringInterval);
  }, [autoMode, sendToUnity, fan]);

  // 자동 환기 주기 타이머
  useEffect(() => {
    if (!autoMode || !sendToUnity) return;

    const fanToggleInterval = setInterval(async() => {
      const newFan = !fan;

        console.log('자동 모드: 환기 시스템', newFan ? 'ON' : 'OFF');
        // UI 즉시 업데이트
        sendToUnity("fanStatus", { status: newFan });
        setFan(newFan);

        // MQTT로 팬 제어 신호 전송
        if (mqttClientRef.current && mqttClientRef.current.isConnected) {
          mqttClientRef.current.publish(`device/control/${farmCode}`, {
            "fan": newFan,
          });
        }
    }, 1000 * 10); // 10초마다 토글 (테스트용)
    // }, 1000 * 60 * 30); // 30분마다 토글

    return () => clearInterval(fanToggleInterval);
  }, [autoMode, sendToUnity, fan]);

  return {
    simulatedData,
    isAutoMode: autoMode
  };
};