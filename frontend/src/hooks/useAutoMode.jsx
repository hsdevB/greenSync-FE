import { useEffect, useState, useRef } from 'react';
import useControlStore from '../store/useControlStore.jsx';
import { MQTTClient } from '../utils/MQTTClient.jsx';

// 자동 모드 로직을 담은 커스텀 훅
export const useAutoMode = (sendToUnity) => {
  const mqttClientRef = useRef(null);

  const {
    fan, ledLevel,
    setWater, setFan, setLed,
    setTemp1,
    setHumid1,
    persistToLocal,
    autoMode
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
      let newTargetTemp = sensor.temp;
      
      if (sensor.temp < 20) {
        newTargetTemp = 24;
        // else if (sensorNum === 2) setTemp2(24);
        // else if (sensorNum === 3) setTemp3(24);
        // else if (sensorNum === 4) setTemp4(24);
      } else if (sensor.temp > 30) {
        newTargetTemp = 26;
        // else if (sensorNum === 2) setTemp2(26);
        // else if (sensorNum === 3) setTemp3(26);
        // else if (sensorNum === 4) setTemp4(26);
      }
      
      // 목표 온도가 변경되었을 때만 처리
      if (newTargetTemp !== null && prevTargetTempsRef.current[index] !== newTargetTemp) {
        if (sensorNum === 1) setTemp1(newTargetTemp);
        sendToUnity(`tempControl${sensorNum}`, { value: newTargetTemp });
        console.log(`자동 모드: 센서${sensorNum} 온도 ${newTargetTemp}도로 설정 (현재: ${sensor.temp}도)`);

        // MQTT 깜박임 처리
        if (mqttClientRef.current && mqttClientRef.current.isConnected) {
          mqttClientRef.current.blinkLed(3, fan);
        }
        
        prevTargetTempsRef.current[index] = newTargetTemp;
      }
    });

    // 2. 습도 자동 제어 (센서별 개별 제어)
    sensors.forEach(async (sensor, index) => {
      const sensorNum = index + 1;
      let newTargetHumid = sensor.humid;
      
      if (sensor.humid < 40) {
        newTargetHumid = 50;
        // else if (sensorNum === 2) setHumid2(50);
        // else if (sensorNum === 3) setHumid3(50);
        // else if (sensorNum === 4) setHumid4(50);
      } else if (sensor.humid > 70) {
        newTargetHumid = 60;
        // else if (sensorNum === 2) setHumid2(60);
        // else if (sensorNum === 3) setHumid3(60);
        // else if (sensorNum === 4) setHumid4(60);
      }
      
      // 목표 습도가 변경되었을 때만 처리
      if (newTargetHumid !== null && prevTargetHumidsRef.current[index] !== newTargetHumid) {
        if (sensorNum === 1) setHumid1(newTargetHumid);
        sendToUnity(`humidControl${sensorNum}`, { value: newTargetHumid });
        console.log(`자동 모드: 센서${sensorNum} 습도 ${newTargetHumid}%로 설정 (현재: ${sensor.humid}%)`);

        // MQTT 깜박임 처리
        if (mqttClientRef.current && mqttClientRef.current.isConnected) {
          mqttClientRef.current.blinkLed(2, fan);
        }
        
        prevTargetHumidsRef.current[index] = newTargetHumid;
      }
    });

    // 3. LED 자동 제어 (시간 기준)
    const now = new Date();
    const hour = now.getHours();
    const ledLevelByTime = (hour >= 6 && hour < 18) ? 3 : 1;
    if (ledLevel !== ledLevelByTime) {
      sendToUnity("ledLevel", { level: ledLevelByTime });
      setLed(ledLevelByTime);
      console.log('자동 모드: LED 밝기', ledLevelByTime, '로 설정 (현재 시간:', hour, '시)');
      
      // LED 밝기 변경 시 MQTT LED 깜박임
      if (ledLevelByTime > 0 && mqttClientRef.current && mqttClientRef.current.isConnected) {
        mqttClientRef.current.blinkLed(1, fan);
      }
    }

    persistToLocal();
  }, [autoMode, simulatedData.sensor1.temp, simulatedData.sensor1.humid, sendToUnity, ledLevel, fan]);

  // 자동 급수 주기 타이머
  useEffect(() => {
    if (!autoMode || !sendToUnity) return;

    const wateringInterval = setInterval(async () => {
      console.log('자동 모드: 급수 시작');
      sendToUnity("startWater", { status: true });
      // MQTT LED 깜박임
      if (mqttClientRef.current && mqttClientRef.current.isConnected) {
        mqttClientRef.current.blinkLed(0, fan);
      }
      setWater(true);
      persistToLocal();

      setTimeout(() => {
        console.log('자동 모드: 급수 종료');
        setWater(false);
        persistToLocal();
      }, 1000 * 5); // 5초간 급수
    }, 1000 * 20); // 20초마다 (테스트용)
    // }, 1000 * 60 * 60); // 1시간마다

    return () => clearInterval(wateringInterval);
  }, [autoMode, sendToUnity, fan]);

  // 자동 환기 주기 타이머
  useEffect(() => {
    if (!autoMode || !sendToUnity) return;

    const fanToggleInterval = setInterval(() => {
      const newFan = !fan;
      console.log('자동 모드: 환기 시스템', newFan ? 'ON' : 'OFF');
      sendToUnity("fanStatus", { status: newFan });

      // MQTT로 팬 제어 신호 전송
      if (mqttClientRef.current && mqttClientRef.current.isConnected) {
        mqttClientRef.current.publish('device/control/ABCD1234', {
          "fan": newFan,
          "leds": [false, false, false, false]
        });
      }

      setFan(newFan);
      persistToLocal();
    }, 1000 * 10); // 10초마다 토글 (테스트용)
    // }, 1000 * 60 * 30); // 30분마다 토글 (테스트용)

    return () => clearInterval(fanToggleInterval);
  }, [autoMode, sendToUnity, fan]);

  return {
    simulatedData,
    isAutoMode: autoMode
  };
};