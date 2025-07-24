import React, { useContext } from 'react';
import { MQTTContext } from './MQTTContext';

// MQTT Hook - 다른 컴포넌트에서 사용
export const useMQTT = () => {
    const context = useContext(MQTTContext);
    if(!context) {
      throw new Error('useMQTT must be used within MQTTProvider');
    }
    return context;
  };