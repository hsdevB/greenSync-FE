import { useUnityContext } from "react-unity-webgl";
import { useState, useEffect } from "react";
import fs from 'fs';
import path from 'path';
import process from 'process';

// 폴더를 recursively 복사하는 유틸리티 함수
const copyFolderRecursive = async (src, dest) => {
  try {
    // 대상 폴더가 없으면 생성
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);

    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        await copyFolderRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    return true;
  } catch (error) {
    console.error(`폴더 복사 실패: ${error.message}`);
    return false;
  }
};

// 재배방식과 외관정보를 조합해서 폴더명 생성
const getFolderName = (farmType, houseType) => {
  // farmType: 토양(S), 수경(W)
  // houseType: 비닐(V), 유리(G)
  const farmTypeCode = farmType === '토양' ? 'S' : farmType === '수경' ? 'W' : farmType;
  const houseTypeCode = houseType === '비닐' ? 'V' : houseType === '유리' ? 'G' : houseType;
  
  return `${farmTypeCode}${houseTypeCode}`; // SV, SG, WV, WG
};

// 농장 폴더 복사 함수
const createFarmFolder = async (farmType, houseType, farmId) => {
  try {
    const publicPath = path.join(process.cwd(), 'public');
    const folderName = getFolderName(farmType, houseType);
    const sourcePath = path.join(publicPath, folderName); // SV, SG, WV, WG 중 하나
    const destPath = path.join(publicPath, farmId.toString());

    // 소스 폴더 존재 확인
    if (!fs.existsSync(sourcePath)) {
      console.error(`소스 폴더가 존재하지 않습니다: ${sourcePath} (${farmType} + ${houseType})`);
      return false;
    }

    // 대상 폴더가 이미 존재하는지 확인
    if (fs.existsSync(destPath)) {
      console.log(`농장 폴더가 이미 존재합니다: ${destPath}`);
      return true;
    }

    // 폴더 복사 실행
    const copySuccess = await copyFolderRecursive(sourcePath, destPath);
    
    if (copySuccess) {
      console.log(`농장 폴더 복사 완료: ${sourcePath} -> ${destPath}`);
    }

    return copySuccess;
  } catch (error) {
    console.error(`농장 폴더 생성 중 오류: ${error.message}`);
    return false;
  }
};

const useSharedUnityContext = (farmId, farmType, houseType) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // farmId를 사용한 Unity Context 생성
  const unityContext = useUnityContext({
    loaderUrl: `${farmId}/Build/Build.loader.js`,
    dataUrl: `${farmId}/Build/Build.data`,
    frameworkUrl: `${farmId}/Build/Build.framework.js`,
    codeUrl: `${farmId}/Build/Build.wasm`,
  });

  useEffect(() => {
    const initializeFarm = async () => {
      if (!farmId || !farmType || !houseType) {
        setError('farmId, farmType, houseType이 모두 필요합니다.');
        return;
      }

      try {
        setIsReady(false);
        setError(null);

        // 농장 폴더 생성/복사
        const copySuccess = await createFarmFolder(farmType, houseType, farmId);
        
        if (!copySuccess) {
          const folderName = getFolderName(farmType, houseType);
          throw new Error(`농장 폴더 생성에 실패했습니다. (${folderName})`);
        }

        setIsReady(true);
      } catch (err) {
        console.error('농장 초기화 중 오류:', err);
        setError(err.message);
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