import { useEffect, useState } from 'react';
import useControlStore from '../store/useControlStore.jsx';

// 자동 모드 로직을 담은 커스텀 훅
export const useAutoMode = (sendToUnity) => {
  const {
    fan, ledLevel,
    setWater, setFan, setLed, setTemp, setHumid,
    persistToLocal,
    autoMode
  } = useControlStore();

  // 시뮬레이션 데이터 (실제로는 IoT 센서 데이터를 사용)
  const [simulatedData, setSimulatedData] = useState({
    temp: 25,
    humid: 50,
  });

  // 5초마다 시뮬레이션 데이터 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const simulatedTemp = Math.floor(Math.random() * (35 - 15 + 1)) + 15; // 15~35도
      const simulatedHumid = Math.floor(Math.random() * (80 - 30 + 1)) + 30; // 30~80%
      setSimulatedData({ temp: simulatedTemp, humid: simulatedHumid });
    }, 1000 * 5); // 5초마다

    return () => clearInterval(interval);
  }, []);

  // 자동 환경 제어 로직
  useEffect(() => {
    if (!autoMode || !sendToUnity) return;

    const { temp: inTp, humid: inHd } = simulatedData;

    // 1. 온도 자동 제어
    if (inTp < 20) {
      sendToUnity("tempControl", { value: 24 });
      setTemp(24);
      console.log('자동 모드: 온도 24도로 설정 (현재:', inTp, '도)');
    } else if (inTp > 30) {
      sendToUnity("tempControl", { value: 26 });
      setTemp(26);
      console.log('자동 모드: 온도 26도로 설정 (현재:', inTp, '도)');
    }

    // 2. 습도 자동 제어
    if (inHd < 40) {
      sendToUnity("humidControl", { value: 50 });
      setHumid(50);
      console.log('자동 모드: 습도 50%로 설정 (현재:', inHd, '%)');
    } else if (inHd > 70) {
      sendToUnity("humidControl", { value: 60 });
      setHumid(60);
      console.log('자동 모드: 습도 60%로 설정 (현재:', inHd, '%)');
    }

    // 3. LED 자동 제어 (시간 기준)
    const now = new Date();
    const hour = now.getHours();
    const ledLevelByTime = (hour >= 6 && hour < 18) ? 3 : 1;
    if (ledLevel !== ledLevelByTime) {
      sendToUnity("ledLevel", { level: ledLevelByTime });
      setLed(ledLevelByTime);
      console.log('자동 모드: LED 밝기', ledLevelByTime, '로 설정 (현재 시간:', hour, '시)');
    }

    persistToLocal();
  }, [autoMode, simulatedData, sendToUnity, ledLevel]);

  // 자동 급수 주기 타이머
  useEffect(() => {
    if (!autoMode || !sendToUnity) return;

    const wateringInterval = setInterval(() => {
      console.log('자동 모드: 급수 시작');
      sendToUnity("startWater", { status: true });
      setWater(true);
      persistToLocal();

      setTimeout(() => {
        console.log('자동 모드: 급수 종료');
        setWater(false);
        persistToLocal();
      }, 1000 * 5); // 5초간 급수
    }, 1000 * 20); // 20초마다 (테스트용)
    // }, 1000 * 60 * 60); // 1시간마다 (테스트용)

    return () => clearInterval(wateringInterval);
  }, [autoMode, sendToUnity]);

  // 자동 환기 주기 타이머
  useEffect(() => {
    if (!autoMode || !sendToUnity) return;

    const fanToggleInterval = setInterval(() => {
      const newFan = !fan;
      console.log('자동 모드: 환기 시스템', newFan ? 'ON' : 'OFF');
      sendToUnity("fanStatus", { status: newFan });
      setFan(newFan);
      persistToLocal();
    }, 1000 * 10); // 10초마다 토글 (테스트용)
    // }, 1000 * 60 * 30); // 30분마다 토글 (테스트용)

    return () => clearInterval(fanToggleInterval);
  }, [autoMode, sendToUnity]);

  return {
    simulatedData,
    isAutoMode: autoMode
  };
};