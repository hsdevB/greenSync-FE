import { useUnityContext } from "react-unity-webgl";
import { useState, useEffect } from "react";

// 재배방식과 외관정보를 조합해서 폴더명 생성 (디버깅용)
const getFolderName = (farmType, houseType) => {
  // farmType: 토양(S), 수경(W)
  // houseType: 비닐(V), 유리(G)
  const farmTypeCode = farmType === '토양' ? 'S' : farmType === '수경' ? 'W' : farmType;
  const houseTypeCode = houseType === '비닐' ? 'V' : houseType === '유리' ? 'G' : houseType;
  
  return `${farmTypeCode}${houseTypeCode}`; // SV, SG, WV, WG
};

const useSharedUnityContext = (farmId = 1, farmType = '수경', houseType = '유리') => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Unity Context 생성 - 실제 Build 폴더 경로 사용
  const unityContext = useUnityContext({
    loaderUrl: `/Build/Build.loader.js`,
    dataUrl: `/Build/Build.data`,
    frameworkUrl: `/Build/Build.framework.js`,
    codeUrl: `/Build/Build.wasm`,
  });

  useEffect(() => {
    const initializeFarm = async () => {
      try {
        setIsReady(false);
        setError(null);
        
        // Unity 로딩을 위해 준비 완료 상태로 설정
        setIsReady(true);
      } catch (err) {
        console.error('Unity 초기화 중 오류:', err);
        setError(err.message);
        setIsReady(true);
      }
    };

    initializeFarm();
  }, [farmId, farmType, houseType]);

  return {
    ...unityContext,
    isReady,
    error,
    folderName: getFolderName(farmType, houseType) // 디버깅용
  };
};

export default useSharedUnityContext;