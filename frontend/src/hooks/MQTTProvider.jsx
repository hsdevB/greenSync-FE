import React, { useRef, useEffect } from 'react';
import { MQTTContext } from './MQTTContext';

export function MQTTProvider({ children }) {
  const mqttClientRef = useRef(null);

  // MQTT 초기화
  useEffect(() => {
    // 동적으로 import하여 순환 참조 방지
    import('../utils/MQTTClient').then(({ MQTTClient }) => {
      mqttClientRef.current = new MQTTClient();
      mqttClientRef.current.connect('ws://192.168.0.26:9001');
    });

    return () => {
      if(mqttClientRef.current) {
        mqttClientRef.current.disconnect();
      }
    };
  },[]);

  return (
    <MQTTContext.Provider value={mqttClientRef.current}>
      {children}
    </MQTTContext.Provider>
  );
} 