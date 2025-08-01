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
  const farmTypeCode = farmType === '고형배지' ? 'S' : farmType === '수경' ? 'W' : farmType;
  const houseTypeCode = houseType === '플라스틱' ? 'P' : houseType === '유리' ? 'G' : houseType;
  console.log(`getFolderName: ${farmTypeCode}${houseTypeCode} (${farmType} + ${houseType})`);
  return `${farmTypeCode}${houseTypeCode}`; // SP, SG, WP, WG
};

const useSharedUnityContext = (farmData) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const initializationRef = useRef(false);
  const currentFolderRef = useRef(null);

  console.log('🔍 farmData 상태:', farmData);

  // 폴더명 계산
  const folderName = useMemo(() => {
    if (!farmData?.farmType || !farmData?.houseType) {
      console.log('⚠️ farmData 불완전, 기본값 WG 사용');
      return 'WG';
    }
    
    const folder = getFolderName(farmData.farmType, farmData.houseType);
    console.log(`✅ 폴더명 결정: ${folder}`);
    return folder;
  }, [farmData?.farmType, farmData?.houseType]);

  // Unity Context 설정
  const unityConfig = useMemo(() => {
    const config = {
      loaderUrl: `Build/${folderName}/Build.loader.js`,
      dataUrl: `Build/${folderName}/Build.data.unityweb`,
      frameworkUrl: `Build/${folderName}/Build.framework.js.unityweb`,
      codeUrl: `Build/${folderName}/Build.wasm.unityweb`,
    };

    console.log('🎯 Unity Config 생성:', config);
    
    // 폴더가 변경되면 초기화 상태 리셋
    if (currentFolderRef.current !== folderName) {
      console.log(`📁 폴더 변경: ${currentFolderRef.current} → ${folderName}`);
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
      console.log(`✅ Unity 메시지 전송 성공: ${objectName}.${methodName}`);
      return true;
    } catch (error) {
      console.error(`❌ Unity 메시지 전송 실패: ${objectName}.${methodName}`, error);
      return false;
    }
  }, [unityContext]);

  // sendToUnity 함수 (RemoteControlPanel 방식과 동일)
  const sendToUnity = useCallback((eventName, payload) => {
    const message = new WebGLMessage(eventName, payload);
    console.log("Sending to Unity:", JSON.stringify(message));
    
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
    if (!farmData) {
      console.warn('농장 데이터가 없습니다.');
      return false;
    }

    const farmInitData = {
      // farmId: farmData.farmId,
      farmName: farmData.farmName,
      owner: farmData.owner,
      farmType: farmData.farmType,
      houseType: farmData.houseType,
      cropType: farmData.cropType || "방울토마토"
    };

    console.log('📤 농장 데이터 전송:', farmInitData);

    // UnityMessage 방식으로 전송
    const success = sendToUnity("INITIALIZE_FARM", farmInitData);
    
    if (success) {
      setIsReady(true);
      initializationRef.current = true;
      console.log('✅ 농장 데이터 전달 완료!');
      return true;
    } else {
      setError('농장 데이터 전송에 실패했습니다.');
      return false;
    }
  }, [farmData, sendToUnity]);

  // Unity 로드 완료 시 농장 데이터 전달
  useEffect(() => {
    if (unityContext.isLoaded && farmData && !initializationRef.current) {
      console.log('🚀 Unity 로드 완료, 농장 데이터 전송 시작...');
      
      // Unity가 완전히 초기화될 때까지 대기
      const timer = setTimeout(() => {
        sendFarmDataToUnity();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [unityContext.isLoaded, farmData, sendFarmDataToUnity]);

  // 로딩 진행률 모니터링
  useEffect(() => {
    if (unityContext.loadingProgression === 0 && !unityContext.isLoaded) return;

    const progress = Math.round(unityContext.loadingProgression * 100);
    console.log(`📊 ${folderName} Unity 로딩: ${progress}%`);
    
    if (unityContext.isLoaded && !initializationRef.current) {
      console.log(`🎉 ${folderName} Unity 로딩 완료!`);
    }
  }, [unityContext.loadingProgression, unityContext.isLoaded, folderName]);

  // 브라우저 콘솔용 전역 함수 등록
  useEffect(() => {
    // 테스트용 전역 함수
    window.sendFarmDataToUnity = () => {
      console.log('🔧 수동으로 농장 데이터 전송 시도...');
      return sendFarmDataToUnity();
    };

    window.testUnityMessage = (eventName = "TEST_EVENT", payload = { test: "data" }) => {
      console.log('🔧 Unity 메시지 테스트...');
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
      farmData: !!farmData,
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

// import { useUnityContext } from "react-unity-webgl";
// import { useState, useEffect, useMemo, useRef } from "react";

// // 재배방식과 외관정보를 조합해서 폴더명 생성
// const getFolderName = (farmType, houseType) => {
//   const farmTypeCode = farmType === '고형배지' ? 'S' : farmType === '수경' ? 'W' : farmType;
//   const houseTypeCode = houseType === '플라스틱' ? 'P' : houseType === '유리' ? 'G' : houseType;
//   console.log(`getFolderName: ${farmTypeCode}${houseTypeCode} (${farmType} + ${houseType})`);
//   return `${farmTypeCode}${houseTypeCode}`; // SP, SG, WP, WG
// };

// const useSharedUnityContext = (farmData) => {
//   const [isReady, setIsReady] = useState(false);
//   const [error, setError] = useState(null);
//   const [forceReload, setForceReload] = useState(0);
//   const initializationRef = useRef(false);
//   const unityContextRef = useRef(null);

//   console.log('🔍 farmData 상태:', farmData);

//   // 폴더명 계산 - 기본값 제공
//   const folderName = useMemo(() => {
//     if (!farmData?.farmType || !farmData?.houseType) {
//       console.log('⚠️ farmData 불완전, 기본값 WG 사용');
//       return 'WG'; // 기본값 제공
//     }
    
//     const folder = getFolderName(farmData.farmType, farmData.houseType);
//     console.log(`✅ 폴더명 결정: ${folder}`);
//     return folder;
//   }, [farmData?.farmType, farmData?.houseType]);

//   // Unity Context 설정 - 항상 유효한 값으로 생성
//   const unityConfig = useMemo(() => {
//     const config = {
//       loaderUrl: `Build/${folderName}/Build.loader.js`,
//       dataUrl: `Build/${folderName}/Build.data.unityweb`,
//       frameworkUrl: `Build/${folderName}/Build.framework.js.unityweb`,
//       codeUrl: `Build/${folderName}/Build.wasm.unityweb`,
//     };

//     console.log('🎯 Unity Config:', config);
    
//     // Context 재생성을 위한 키 변경
//     setForceReload(prev => prev + 1);
//     setIsReady(false);
//     initializationRef.current = false;
//     setError(null);

//     return config;
//   }, [folderName]);

//   // Unity Context 생성
//   const unityContext = useUnityContext(unityConfig);
//   unityContextRef.current = unityContext;

//   // Unity 상태 모니터링 및 강제 재로딩
//   useEffect(() => {
//     console.log('🎮 Unity Context 생성됨:', {
//       folderName,
//       isLoaded: unityContext.isLoaded,
//       loadingProgression: unityContext.loadingProgression,
//       unityProvider: !!unityContext.unityProvider,
//       forceReload
//     });

//     // 5초 후에도 로딩이 시작되지 않으면 경고
//     const timeoutWarning = setTimeout(() => {
//       if (!unityContext.isLoaded && unityContext.loadingProgression === 0) {
//         console.warn('⚠️ Unity 로딩이 시작되지 않음. 파일 확인 중...');
        
//         // 파일 존재 여부 확인
//         checkFilesExistence(folderName);
//       }
//     }, 5000);

//     return () => clearTimeout(timeoutWarning);
//   }, [folderName, forceReload]);

//   // 파일 존재 여부 확인 함수
//   const checkFilesExistence = async (folder) => {
//     const files = [
//       `Build/${folder}/Build.loader.js`,
//       `Build/${folder}/Build.data.unityweb`,
//       `Build/${folder}/Build.framework.js.unityweb`,
//       `Build/${folder}/Build.wasm.unityweb`
//     ];

//     console.log('🔍 Unity 파일 존재 여부 확인 중...');
    
//     for (const file of files) {
//       try {
//         const response = await fetch(file, { method: 'HEAD' });
//         console.log(`${response.ok ? '✅' : '❌'} ${file} - ${response.status}`);
        
//         if (!response.ok) {
//           setError(`파일을 찾을 수 없습니다: ${file}`);
//           return;
//         }
//       } catch (err) {
//         console.error(`❌ ${file} 확인 실패:`, err);
//         setError(`파일 확인 실패: ${file}`);
//         return;
//       }
//     }
    
//     console.log('✅ 모든 Unity 파일이 존재합니다.');
//     console.log('🔄 react-unity-webgl 라이브러리 문제일 수 있습니다.');
//   };

//   // 로딩 진행률 모니터링
//   useEffect(() => {
//     if (unityContext.loadingProgression === 0 && !unityContext.isLoaded) return;

//     const progress = Math.round(unityContext.loadingProgression * 100);
//     console.log(`📊 Unity 로딩: ${progress}% (isLoaded: ${unityContext.isLoaded})`);
    
//     if (unityContext.isLoaded) {
//       console.log('🎉 Unity 로딩 완료!');
//     }
//   }, [unityContext.loadingProgression, unityContext.isLoaded]);

//   // 강제 재로딩 함수
//   const forceReloadUnity = () => {
//     console.log('🔄 Unity 강제 재로딩...');
//     setForceReload(prev => prev + 1);
//   };

//   // Unity 로드 완료 시 농장 데이터 전달
//   useEffect(() => {
//     if (unityContext.isLoaded && farmData && !initializationRef.current) {
//       console.log('🚀 농장 데이터 전달 시작...');
      
//       const timer = setTimeout(() => {
//         try {
//           const farmInitData = {
//             farmId: farmData.farmId,
//             farmName: farmData.farmName,
//             owner: farmData.owner,
//             farmType: farmData.farmType,
//             houseType: farmData.houseType,
//             cropType: farmData.cropType || "방울토마토"
//           };

//           console.log('📤 Unity에 데이터 전달:', farmInitData);
//           unityContext.sendMessage("FarmModelManager", "InitializeFarmData", JSON.stringify(farmInitData));
          
//           setIsReady(true);
//           initializationRef.current = true;
//           console.log('✅ 농장 데이터 전달 완료!');
//         } catch (err) {
//           console.error('❌ 농장 데이터 전달 실패:', err);
//           setError(`농장 데이터 전달 실패: ${err.message}`);
//         }
//       }, 2000);

//       return () => clearTimeout(timer);
//     }
//   }, [unityContext.isLoaded, farmData]);

//   return {
//     ...unityContext,
//     isReady,
//     error,
//     folderName,
//     forceReload: forceReloadUnity,
    
//     // 디버깅 정보
//     debugInfo: {
//       farmData: !!farmData,
//       folderName,
//       config: unityConfig,
//       forceReloadCount: forceReload
//     }
//   };
// };

// export default useSharedUnityContext;

// // import { useUnityContext } from "react-unity-webgl";

// // const useSharedUnityContext = () => {
// //   return useUnityContext({ // WG폴더 추가해서 폴더구조 맞춰주세요 
// //     loaderUrl: "Build/WG/Build.loader.js",
// //     dataUrl: "Build/WG/Build.data.unityweb",
// //     frameworkUrl: "Build/WG/Build.framework.js.unityweb",
// //     codeUrl: "Build/WG/Build.wasm.unityweb",
// //   })
// // };

// // export default useSharedUnityContext;