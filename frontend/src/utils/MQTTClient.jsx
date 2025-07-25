import mqtt from 'mqtt';

export class MQTTClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  connect(brokerUrl = 'ws://192.168.0.26:9001') {
    try {
      // 실제 환경
      this.client = mqtt.connect(brokerUrl);
      // console.log(`MQTT 브로커 연결 시도: ${brokerUrl}`);
      // this.isConnected = true;
      // 실제 환경에서는 mqtt.connect(brokerUrl) 사용
      this.client.on('connect', () => {
        console.log('MQTT 브로커 연결 성공');
        this.isConnected = true;
      });
    } catch (error) {
      console.error('MQTT 연결 실패:', error);
    }
  }

  publish(topic, message) {
    if (!this.client || !this.isConnected) {
      console.warn('MQTT 브로커에 연결되지 않음');
      return;
    }

    try {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      console.log(`MQTT 발행 - Topic: ${topic}, Payload: ${payload}`);
      
      this.client.publish(topic, payload, (error) => {
        if (error) {
          console.error('MQTT 메시지 발행 실패:', error);
        }
      });
    } catch (error) {
      console.error('MQTT 메시지 발행 실패:', error);
    }
  }

  // LED 깜박임 제어 (각 센서별 개별 제어)
  async blinkLed(ledIndex, currentFanState) {
    // 특정 LED만 켜기 (온도센서=0, 습도센서=1, 급수=2, LED밝기=3)
    const ledObject = [false, false, false, false];
    ledObject[ledIndex] = true;
    
    this.publish('device/control/ABCD1234', {
      "fan": currentFanState,
      "leds": ledObject
    });
    
    // 딜레이
    if (ledIndex != 0)
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms
    else
      await new Promise(resolve => setTimeout(resolve, 5000)); // 급수 끝나는 시간(5초)
    
    // LED 끄기
    this.publish('device/control/ABCD1234', {
      "leds": [false, false, false, false]
    });
  }

  disconnect() {
    if (this.client && this.isConnected) {
      this.client.end();
      this.isConnected = false;
      console.log('MQTT 연결 종료');
    }
  }
}