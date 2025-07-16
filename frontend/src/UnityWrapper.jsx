import { useUnityContext } from "react-unity-webgl";

const useSharedUnityContext = () => {
  return useUnityContext({
    loaderUrl: "Build/Build.loader.js",
    dataUrl: "Build/Build.data.unityweb",
    frameworkUrl: "Build/Build.framework.js.unityweb",
    codeUrl: "Build/Build.wasm.unityweb",
  });
};

export default useSharedUnityContext;
