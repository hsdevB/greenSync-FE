import { useUnityContext } from "react-unity-webgl";

const useSharedUnityContext = () => {
  return useUnityContext({
    loaderUrl: "Build/Build.loader.js",
    dataUrl: "Build/Build.data",
    frameworkUrl: "Build/Build.framework.js",
    codeUrl: "Build/Build.wasm",
  });
};

export default useSharedUnityContext;
