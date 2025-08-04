import { useUnityContext } from "react-unity-webgl";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

// WebGLMessage 클래스 (Unity와 이름 충돌 방지)
class WebGLMessage {
  constructor(eventName, payload) {
    this.name = eventName;
    this.data = payload;
    this.timestamp = Date.now();
  }
}

// 재배방식과 외관정보를 조합해서 폴더명 생성
const getFolderName = (farmType, houseType) => {
  const farmTypeCode = farmType === '고형배지' ? 'S' : farmType === '수경재배' ? 'W' : farmType;
  const houseTypeCode = houseType === '플라스틱온실' ? 'P' : houseType === '유리온실' ? 'G' : houseType;
  // //console.log(`getFolderName: ${farmTypeCode}${houseTypeCode} (${farmType} + ${houseType})`);
  return `${farmTypeCode}${houseTypeCode}`; // SP, SG, WP, WG
};

const useSharedUnityContext = (farmCode,farmType, houseType) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const initializationRef = useRef(false);
  const currentFolderRef = useRef(null);

  // 폴더명 계산
  const folderName = useMemo(() => {
    if (!farmType || !houseType) {
      // //console.log('⚠️ farmData 불완전, 기본값 WG 사용');
      return 'WG';
    }
    
    const folder = getFolderName(farmType, houseType);
    return folder;
  }, [farmType, houseType]);

  // Unity Context 설정
  const unityConfig = useMemo(() => {
    const config = {
      loaderUrl: `Build/${folderName}/Build.loader.js`,
      dataUrl: `Build/${folderName}/Build.data.unityweb`,
      frameworkUrl: `Build/${folderName}/Build.framework.js.unityweb`,
      codeUrl: `Build/${folderName}/Build.wasm.unityweb`,
    };

    // //console.log('🎯 Unity Config 생성:', config);
    
    // 폴더가 변경되면 초기화 상태 리셋
    if (currentFolderRef.current !== folderName) {
      // //console.log(`📁 폴더 변경: ${currentFolderRef.current} → ${folderName}`);
      currentFolderRef.current = folderName;
      setIsReady(false);
      initializationRef.current = false;
      setError(null);
    }

    return config;
  }, [folderName]);

  // Unity Context 생성
  const unityContext = useUnityContext(unityConfig);

  // safeSendMessage 함수 (RemoteControlPanel 방식)
  const safeSendMessage = useCallback((objectName, methodName, parameter) => {
    try {
      if (!unityContext.isLoaded) {
        console.warn('Unity가 아직 로드되지 않았습니다.');
        return false;
      }
      
      unityContext.sendMessage(objectName, methodName, parameter);
      //console.log(`✅ Unity 메시지 전송 성공: ${objectName}.${methodName}`);
      return true;
    } catch (error) {
      console.error(`❌ Unity 메시지 전송 실패: ${objectName}.${methodName}`, error);
      return false;
    }
  }, [unityContext]);

  // sendToUnity 함수 (RemoteControlPanel 방식과 동일)
  const sendToUnity = useCallback((eventName, payload) => {
    const message = new WebGLMessage(eventName, payload);
    //console.log("Sending to Unity:", JSON.stringify(message));
    
    try {
      // 여러 가능한 매니저에 시도 (MessageManager 우선)
      const managers = ["MessageManager", "FarmMessageManager", "FarmModelManager", "GameManager"];
      let sent = false;
      
      for (const manager of managers) {
        if (safeSendMessage(manager, "ReceiveMessage", JSON.stringify(message))) {
          sent = true;
          break;
        }
      }
      
      if (!sent) {
        console.error("모든 매니저에 메시지 전송 실패");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error sending message to Unity:", error);
      return false;
    }
  }, [safeSendMessage]);

  // 농장 데이터 전송 함수
  const sendFarmDataToUnity = useCallback(() => {
    if (!farmCode) {
      console.warn('농장 데이터가 없습니다.');
      return false;
    }

    const farmInitData = {
      farmType: farmType,
      houseType: houseType,
    };

    //console.log('📤 농장 데이터 전송:', farmInitData);

    // UnityMessage 방식으로 전송
    const success = sendToUnity("INITIALIZE_FARM", farmInitData);
    
    if (success) {
      setIsReady(true);
      initializationRef.current = true;
      //console.log('✅ 농장 데이터 전달 완료!');
      return true;
    } else {
      setError('농장 데이터 전송에 실패했습니다.');
      return false;
    }
  }, [farmType, houseType, sendToUnity]);

  // Unity 로드 완료 시 농장 데이터 전달
  useEffect(() => {
    if (unityContext.isLoaded && farmType && houseType && !initializationRef.current) {
      //console.log('🚀 Unity 로드 완료, 농장 데이터 전송 시작...');
      
      // Unity가 완전히 초기화될 때까지 대기
      const timer = setTimeout(() => {
        sendFarmDataToUnity();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [unityContext.isLoaded, farmType, houseType, sendFarmDataToUnity]);

  // 로딩 진행률 모니터링
  useEffect(() => {
    if (unityContext.loadingProgression === 0 && !unityContext.isLoaded) return;

    const progress = Math.round(unityContext.loadingProgression * 100);
    //console.log(`📊 ${folderName} Unity 로딩: ${progress}%`);
    
    if (unityContext.isLoaded && !initializationRef.current) {
      //console.log(`🎉 ${folderName} Unity 로딩 완료!`);
    }
  }, [unityContext.loadingProgression, unityContext.isLoaded, folderName]);

  // 브라우저 콘솔용 전역 함수 등록
  useEffect(() => {
    // 테스트용 전역 함수
    window.sendFarmDataToUnity = () => {
      //console.log('🔧 수동으로 농장 데이터 전송 시도...');
      return sendFarmDataToUnity();
    };

    window.testUnityMessage = (eventName = "TEST_EVENT", payload = { test: "data" }) => {
      //console.log('🔧 Unity 메시지 테스트...');
      return sendToUnity(eventName, payload);
    };

    return () => {
      delete window.sendFarmDataToUnity;
      delete window.testUnityMessage;
    };
  }, [sendFarmDataToUnity, sendToUnity]);

  return {
    ...unityContext,
    isReady,
    error,
    folderName,
    sendToUnity,
    sendFarmDataToUnity,
    
    // 디버깅 정보
    debugInfo: {
      farmCode: !!farmCode,
      farmType: !!farmType,
      houseType: !!houseType,
      folderName,
      currentFolder: currentFolderRef.current,
      config: unityConfig,
      isLoaded: unityContext.isLoaded,
      loadingProgression: unityContext.loadingProgression,
      isReady,
      initializationComplete: initializationRef.current
    }
  };
};

export default useSharedUnityContext;