// import { useUnityContext } from "react-unity-webgl";
// import { useState, useEffect } from "react";

// // Service Worker 등록
// const registerServiceWorker = async () => {
//   if ('serviceWorker' in navigator) {
//     try {
//       const registration = await navigator.serviceWorker.register('/sw.js');
//       console.log('Service Worker 등록 성공:', registration);
//       return registration;
//     } catch (error) {
//       console.error('Service Worker 등록 실패:', error);
//       return null;
//     }
//   }
//   return null;
// };

// // 농장 설정 저장/로드
// const saveFarmConfig = (farmId, config) => {
//   const farmConfigs = JSON.parse(localStorage.getItem('farmConfigs') || '{}');
//   farmConfigs[farmId] = {
//     ...config,
//     lastUpdated: new Date().toISOString()
//   };
//   localStorage.setItem('farmConfigs', JSON.stringify(farmConfigs));
// };

// const loadFarmConfig = (farmId) => {
//   const farmConfigs = JSON.parse(localStorage.getItem('farmConfigs') || '{}');
//   return farmConfigs[farmId] || null;
// };

// // 재배방식과 외관정보를 조합해서 폴더명 생성
// const getFolderName = (farmType, houseType) => {
//   // farmType: 토양(S), 수경(W)
//   // houseType: 비닐(V), 유리(G)
//   const farmTypeCode = farmType === '고형배지' ? 'S' : farmType === '수경' ? 'W' : farmType;
//   const houseTypeCode = houseType === '플라스틱' ? 'P' : houseType === '유리' ? 'G' : houseType;
  
//   return `${farmTypeCode}${houseTypeCode}`; // SP, SG, WP, WG
// };

// const useSharedUnityContext = (farmId, farmType, houseType) => {
//   const [isReady, setIsReady] = useState(false);
//   const [error, setError] = useState(null);
//   const [folderName, setFolderName] = useState('');
//   const [farmConfig, setFarmConfig] = useState(null);
//   const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

//   // Service Worker 초기화
//   useEffect(() => {
//     const initServiceWorker = async () => {
//       const registration = await registerServiceWorker();
//       if (registration) {
//         // Service Worker가 활성화될 때까지 대기
//         if (registration.active) {
//           setServiceWorkerReady(true);
//         } else {
//           registration.addEventListener('updatefound', () => {
//             const newWorker = registration.installing;
//             newWorker.addEventListener('statechange', () => {
//               if (newWorker.state === 'activated') {
//                 setServiceWorkerReady(true);
//               }
//             });
//           });
//         }
//       } else {
//         // Service Worker를 사용할 수 없는 경우에도 진행
//         console.warn('Service Worker를 사용할 수 없습니다. 기본 방식으로 진행합니다.');
//         setServiceWorkerReady(true);
//       }
//     };

//     initServiceWorker();
//   }, []);

//   // 폴더명 결정
//   useEffect(() => {
//     if (farmType && houseType) {
//       const folder = getFolderName(farmType, houseType);
//       setFolderName(folder);
//       window.alert(folderName);
//     }
//   }, [farmType, houseType]);

//   // Unity Context 생성 (개별 농장 경로 사용)
//   const unityContext = useUnityContext({
//     loaderUrl: `Build/${folderName}/Build.loader.js`,
//     dataUrl: `Build/${folderName}/Build.data`,
//     frameworkUrl: `Build/${folderName}/Build.framework.js`,
//     codeUrl: `Build/${folderName}/Build.wasm`,
//   });

//   useEffect(() => {
//     const initializeFarm = async () => {
//       if (!farmId || !farmType || !houseType || !serviceWorkerReady) {
//         return;
//       }

//       try {
//         setIsReady(false);
//         setError(null);

//         console.log(`농장 초기화: ${farmId} (${farmType} + ${houseType})`);

//         // 농장 설정 로드 또는 생성
//         let config = loadFarmConfig(farmId);
        
//         if (!config) {
//           config = {
//             farmId: farmId,
//             farmType: farmType,
//             houseType: houseType,
//             templateFolder: folderName,
//             // crops: [],
//             // equipment: {
//             //   waterPump: { status: 'off', schedule: [] },
//             //   fan: { status: 'off', speed: 0 },
//             //   heater: { status: 'off', temperature: 20 },
//             //   led: { status: 'off', brightness: 0, schedule: [] }
//             // },
//             // sensors: {
//             //   temperature: { current: 22, target: 24, alerts: [] },
//             //   humidity: { current: 65, target: 70, alerts: [] },
//             //   ph: { current: 6.5, target: 6.0, alerts: [] },
//             //   light: { current: 80, target: 85, alerts: [] }
//             // },
//             // customizations: {
//             //   theme: 'default',
//             //   layout: 'standard',
//             //   notifications: true
//             // },
//             createdAt: new Date().toISOString()
//           };
          
//           saveFarmConfig(farmId, config);
//           console.log('새 농장 설정 생성:', config);
//         } else {
//           console.log('기존 농장 설정 로드:', config);
//         }

//         setFarmConfig(config);
//         setIsReady(true);

//       } catch (err) {
//         console.error('농장 초기화 중 오류:', err);
//         setError(err.message);
//       }
//     };

//     initializeFarm();
//   }, [farmId, farmType, houseType, folderName, serviceWorkerReady]);

//   // Unity 로드 완료 시 농장 설정 전달
//   useEffect(() => {
//     if (unityContext.isLoaded && farmConfig) {
//       setTimeout(() => {
//         try {
//           unityContext.sendMessage("GameManager", "InitializeFarm", JSON.stringify(farmConfig));
//           console.log('농장 설정을 Unity에 전달:', farmConfig);
//         } catch (error) {
//           console.error('Unity 설정 전달 실패:', error);
//         }
//       }, 1000);
//     }
//   }, [unityContext.isLoaded, farmConfig]);

//   // 농장 설정 업데이트
//   const updateFarmConfig = (newConfig) => {
//     const updatedConfig = { ...farmConfig, ...newConfig };
//     setFarmConfig(updatedConfig);
//     saveFarmConfig(farmId, updatedConfig);
    
//     if (unityContext.isLoaded) {
//       try {
//         unityContext.sendMessage("GameManager", "UpdateFarmConfig", JSON.stringify(newConfig));
//       } catch (error) {
//         console.error('Unity 설정 업데이트 실패:', error);
//       }
//     }
//   };

//   // // 작물 관리
//   // const addCrop = (cropData) => {
//   //   const newCrop = {
//   //     id: `crop_${Date.now()}`,
//   //     ...cropData,
//   //     addedAt: new Date().toISOString(),
//   //     status: 'planted'
//   //   };
    
//   //   const newCrops = [...(farmConfig?.crops || []), newCrop];
//   //   updateFarmConfig({ crops: newCrops });
    
//   //   // Unity에 작물 추가 명령
//   //   if (unityContext.isLoaded) {
//   //     try {
//   //       unityContext.sendMessage("CropManager", "AddCrop", JSON.stringify(newCrop));
//   //     } catch (error) {
//   //       console.error('Unity 작물 추가 실패:', error);
//   //     }
//   //   }
//   // };

//   // const removeCrop = (cropId) => {
//   //   const newCrops = (farmConfig?.crops || []).filter(crop => crop.id !== cropId);
//   //   updateFarmConfig({ crops: newCrops });
    
//   //   if (unityContext.isLoaded) {
//   //     try {
//   //       unityContext.sendMessage("CropManager", "RemoveCrop", cropId);
//   //     } catch (error) {
//   //       console.error('Unity 작물 제거 실패:', error);
//   //     }
//   //   }
//   // };

//   // // 장비 제어
//   // const controlEquipment = (equipmentType, command, params = {}) => {
//   //   const newEquipment = {
//   //     ...farmConfig?.equipment,
//   //     [equipmentType]: {
//   //       ...farmConfig?.equipment?.[equipmentType],
//   //       ...params,
//   //       lastUpdated: new Date().toISOString()
//   //     }
//   //   };
    
//   //   updateFarmConfig({ equipment: newEquipment });
    
//   //   if (unityContext.isLoaded) {
//   //     try {
//   //       unityContext.sendMessage("EquipmentManager", "ControlEquipment", JSON.stringify({
//   //         type: equipmentType,
//   //         command: command,
//   //         params: params
//   //       }));
//   //     } catch (error) {
//   //       console.error('Unity 장비 제어 실패:', error);
//   //     }
//   //   }
//   // };

//   // // 센서 데이터 업데이트
//   // const updateSensorData = (sensorType, data) => {
//   //   const newSensors = {
//   //     ...farmConfig?.sensors,
//   //     [sensorType]: {
//   //       ...farmConfig?.sensors?.[sensorType],
//   //       ...data,
//   //       lastUpdated: new Date().toISOString()
//   //     }
//   //   };
    
//   //   updateFarmConfig({ sensors: newSensors });
//   // };

//   return {
//     ...unityContext,
//     isReady,
//     error,
//     folderName,
//     farmConfig,
//     serviceWorkerReady,
    
//     // 농장 관리 함수들
//     updateFarmConfig,
//     // addCrop,
//     // removeCrop,
//     // controlEquipment,
//     // updateSensorData,
    
//     // 디버깅 정보
//     farmPath: `/${farmId}`,
//     templatePath: `/unity-templates/${folderName}`,
//     isServiceWorkerActive: serviceWorkerReady
//   };
// };

// export default useSharedUnityContext;

import { useUnityContext } from "react-unity-webgl";
//

const useSharedUnityContext = () => {
  return useUnityContext({
    loaderUrl: "Build/WG/Build.loader.js",
    dataUrl: "Build/WG/Build.data.unityweb",
    frameworkUrl: "Build/WG/Build.framework.js.unityweb",
    codeUrl: "Build/WG/Build.wasm.unityweb",
  })
};

export default useSharedUnityContext;