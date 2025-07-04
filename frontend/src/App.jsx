import  {  useCallback, useEffect, useState } from 'react';
import { Unity , useUnityContext } from "react-unity-webgl";

import './App.css'

class UnityMessage {
  constructor(name, data) {
    this.name = name;
    this.data = data;
  }
}
//Unity의 메시지모델과 동일하게 맞추었다.

const App = () => {
  const { unityProvider,sendMessage, addEventListener, removeEventListener,
    isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "Build/Build.loader.js",
    dataUrl: "Build/Build.data.unityweb",
    frameworkUrl: "Build/Build.framework.js.unityweb",
    codeUrl: "Build/Build.wasm.unityweb",
  });
  //라이브러리에서 제공해주는 리스너와 send기능을 선언 . 빌드 파일들을 이름에 맞추어 적어준다.
  
  const [dat, setData] =useState("");
  
  //훅 콜백으로 유니티로부터의 메시지 받는 부분
  const ReceiveMsg = useCallback((dat)=>{
    setData(dat);
    console.log("Receive Success!")
    console.log(dat)
  },[]);

//훅 리스너 연결 여기서 OnMessageReceived 부분은 .jslib의 string부분과 같아야함
  useEffect(() => {
    addEventListener("OnMessageReceived",ReceiveMsg);
    return() => {
      removeEventListener("OnMessageReceived",ReceiveMsg);
    };
  },[addEventListener,removeEventListener,ReceiveMsg]);
  
  //제공해주는 유니티 로딩부분
  const loadingPercentage = Math.round(loadingProgression * 100);

  const testSend = () => {
    //테스트 유니티로 메시지 보내기
    //(유니티 오브젝트 이름,함수이름, 데이터 (파라미터는 하나이상 안되므로 json을 써준것))
    sendMessage("MessageManager","ReceiveMessage", JSON.stringify(message))
  }

//테스트데이터 클래스
  const message = new UnityMessage('SCENE',{
    name: "ViewerScene",
    mode: 0
  })

  return (
    <div className='App'>
        {isLoaded === false && (
         <div className="loading-overlay">
            <p>Loading... ({loadingPercentage}%)</p> 
         </div>
       )}
        <button onClick={testSend}>ToUNITY</button>
        <div>Unity Message: {dat}</div>
         <Unity style={{
           width: '80%',
           height: '30%',
           justifySelf: 'center',
           alignSelf: 'center',
          }}
             unityProvider={unityProvider}
             devicePixelRatio={devicePixelRatio}
            />
    </div>
  );
};

export default App;