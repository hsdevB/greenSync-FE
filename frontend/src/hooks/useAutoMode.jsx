import { useEffect, useState, useCallback } from 'react';
import useControlStore from '../store/useControlStore.jsx';

// 자동 모드 로직을 담은 커스텀 훅
export const useAutoMode = (sendToUnity, mqttClient) => {
  const {
    fan, ledLevel,
    setWater, setFan, setLed,
    setTemp1,
    setHumid1,
    persistToLocal,
    autoMode
  } = useControlStore();

  // 시뮬레이션 데이터 (실제로는 IoT 센서 데이터를 사용)
  const [simulatedData, setSimulatedData] = useState({
    sensor1: { temp: 25, humid: 50 },
    // sensor2: { temp: 25, humid: 50 },
    // sensor3: { temp: 25, humid: 50 },
    // sensor4: { temp: 25, humid: 50 },
  });

  // MQTT LED 깜박임 함수
  const blinkLed = useCallback(async (ledIndex, currentFanState) => {
    if (!mqttClient || !mqttClient.isConnected) return;
    
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
  }, [mqttClient]);


  // 5초마다 시뮬레이션 데이터 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
    const generateSensorData = () => ({
      temp: Math.floor(Math.random() * (35 - 15 + 1)) + 15,
      humid: Math.floor(Math.random() * (80 - 30 + 1)) + 30
    });

    setSimulatedData({
      sensor1: generateSensorData(),
      // sensor2: generateSensorData(),
      // sensor3: generateSensorData(),
      // sensor4: generateSensorData()
    });
    }, 1000 * 5); // 5초마다

    return () => clearInterval(interval);
  }, []);

  // 자동 환경 제어 로직
  useEffect(() => {
    if (!autoMode || !sendToUnity) return;

    // 각 센서별 평균값 계산 또는 개별 제어
    const sensors = [simulatedData.sensor1];

    // 1. 온도 자동 제어 (센서별 개별 제어)
    sensors.forEach(async (sensor, index) => {
      const sensorNum = index + 1;
      let tempChanged = false;
      
      if (sensor.temp < 20) {
        tempChanged = true;
        sendToUnity(`tempControl${sensorNum}`, { value: 24 });
        if (sensorNum === 1) setTemp1(24);
        // else if (sensorNum === 2) setTemp2(24);
        // else if (sensorNum === 3) setTemp3(24);
        // else if (sensorNum === 4) setTemp4(24);
        console.log(`자동 모드: 센서${sensorNum} 온도 24도로 설정 (현재: ${sensor.temp}도)`);
      } else if (sensor.temp > 30) {
        tempChanged = true;
        sendToUnity(`tempControl${sensorNum}`, { value: 26 });
        if (sensorNum === 1) setTemp1(26);
        // else if (sensorNum === 2) setTemp2(26);
        // else if (sensorNum === 3) setTemp3(26);
        // else if (sensorNum === 4) setTemp4(26);
        console.log(`자동 모드: 센서${sensorNum} 온도 26도로 설정 (현재: ${sensor.temp}도)`);
      }
      else {
        sendToUnity(`tempControl${sensorNum}`, { value: sensor.temp });
      }

      // 온도 변경 시 MQTT LED 깜박임 및 센서 데이터 전송
      if (tempChanged && sensorNum === 1) {
        await blinkLed(0, fan); // 온도센서 LED 깜박임
      }
    });

    // 2. 습도 자동 제어 (센서별 개별 제어)
    sensors.forEach(async (sensor, index) => {
      const sensorNum = index + 1;
      let humidChanged = false;
      
      if (sensor.humid < 40) {
        humidChanged = true;
        sendToUnity(`humidControl${sensorNum}`, { value: 50 });
        if (sensorNum === 1) setHumid1(50);
        // else if (sensorNum === 2) setHumid2(50);
        // else if (sensorNum === 3) setHumid3(50);
        // else if (sensorNum === 4) setHumid4(50);
        console.log(`자동 모드: 센서${sensorNum} 습도 50%로 설정 (현재: ${sensor.humid}%)`);
      } else if (sensor.humid > 70) {
        humidChanged = true;
        sendToUnity(`humidControl${sensorNum}`, { value: 60 });
        if (sensorNum === 1) setHumid1(60);
        // else if (sensorNum === 2) setHumid2(60);
        // else if (sensorNum === 3) setHumid3(60);
        // else if (sensorNum === 4) setHumid4(60);
        console.log(`자동 모드: 센서${sensorNum} 습도 60%로 설정 (현재: ${sensor.humid}%)`);
      }
      else {
        sendToUnity(`humidControl${sensorNum}`, { value: sensor.humid });
      }

      // 습도 변경 시 MQTT LED 깜박임 및 센서 데이터 전송
      if (humidChanged && sensorNum === 1) {
        await blinkLed(1, fan); // 습도센서 LED 깜박임
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
      if (ledLevelByTime > 0) {
        blinkLed(3, fan); // LED밝기 LED 깜박임
      }
    }

    persistToLocal();
  }, [autoMode, simulatedData, sendToUnity, ledLevel, mqttClient, blinkLed, setHumid1, setLed, setTemp1]);

  // 자동 급수 주기 타이머
  useEffect(() => {
    if (!autoMode || !sendToUnity) return;

    const wateringInterval = setInterval(async () => {
      console.log('자동 모드: 급수 시작');
      sendToUnity("startWater", { status: true });
      // MQTT LED 깜박임
      await blinkLed(2, fan); // 급수 LED 깜박임
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
  }, [autoMode, sendToUnity, mqttClient, persistToLocal, setWater, blinkLed]);

  // 자동 환기 주기 타이머
  useEffect(() => {
    if (!autoMode || !sendToUnity) return;

    const fanToggleInterval = setInterval(() => {
      const newFan = !fan;
      console.log('자동 모드: 환기 시스템', newFan ? 'ON' : 'OFF');
      sendToUnity("fanStatus", { status: newFan });

      // MQTT로 팬 제어 신호 전송
      if (mqttClient && mqttClient.isConnected) {
        mqttClient.publish('device/control', {
          "fan": newFan
        });
      }

      setFan(newFan);
      persistToLocal();
    }, 1000 * 10); // 10초마다 토글 (테스트용)
    // }, 1000 * 60 * 30); // 30분마다 토글 (테스트용)

    return () => clearInterval(fanToggleInterval);
  }, [autoMode, sendToUnity, fan, mqttClient, persistToLocal, setFan]);

  return {
    simulatedData,
    isAutoMode: autoMode
  };
};