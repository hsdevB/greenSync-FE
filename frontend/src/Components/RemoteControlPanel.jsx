import React, { useState, useEffect, useRef, useCallback } from "react";
import "./RemoteControlPanel.css";
import useControlStore from '../store/useControlStore.jsx';
import { useAutoMode } from '../hooks/useAutoMode.jsx'; // 자동 모드 커스텀 훅
import mqtt from 'mqtt'; // 실제 환경에서는 mqtt.js 라이브러리 사용
import AIAnalysisModal from "./AIAnalysisModal";

// MQTT 클라이언트
class MQTTClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  // MQTT 브로커 연결
  connect(brokerUrl = 'ws://192.168.0.26::9001') {
    if (this.isConnecting || this.isConnected) {
      console.log('이미 연결 중이거나 연결됨');
      return;
    }

    try {
      this.isConnecting = true;
      console.log(`MQTT 브로커 연결 시도: ${brokerUrl}`);
      
      this.client = mqtt.connect(brokerUrl);
      
      // 연결 성공 이벤트
      this.client.on('connect', () => {
        console.log('MQTT 브로커 연결 성공');
        this.isConnected = true;
        this.isConnecting = false;
      });

      // 연결 실패 이벤트
      this.client.on('error', (error) => {
        console.error('MQTT 연결 오류:', error);
        this.isConnected = false;
        this.isConnecting = false;
      });

      // 연결 끊김 이벤트
      this.client.on('close', () => {
        console.log('MQTT 연결 끊김');
        this.isConnected = false;
        this.isConnecting = false;
      });

      // 재연결 이벤트
      this.client.on('reconnect', () => {
        console.log('MQTT 재연결 시도');
        this.isConnecting = true;
      });

    } catch (error) {
      console.error('MQTT 연결 실패:', error);
      this.isConnected = false;
      this.isConnecting = false;
    }
  }

  // MQTT 메시지 발행
  publish(topic, message) {
    // client와 연결 상태 모두 확인
    if (!this.client || !this.isConnected) {
      console.warn('MQTT 브로커에 연결되지 않음 또는 클라이언트 없음');
      return;
    }

    try {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      console.log(`MQTT 발행 - Topic: ${topic}, Payload: ${payload}`);
      
      this.client.publish(topic, payload, (error) => {
        if (error) {
          console.error('MQTT 메시지 발행 실패:', error);
        } else {
          console.log('MQTT 메시지 발행 성공');
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
    if (ledIndex != 2)
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
class UnityMessage {
  constructor(name, data) {
    this.name = name;
    this.data = JSON.stringify(data);
  }
}



const AnimatedExhaustIcon = ({ isOn }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={isOn ? "#4CAF50" : "#f44336"} strokeWidth="2" fill="none"/>
    <g style={{ transform: isOn ? 'rotate(360deg)' : 'rotate(0deg)', 
               transition: 'transform 0.5s ease-in-out' }}>
      <path d="M12 4v16M4 12h16" stroke={isOn ? "#4CAF50" : "#f44336"} strokeWidth="2" fill="none"/>
    </g>
  </svg>
);

const ExhaustFanIcon = ({ isOn }) => (
  <svg width="32" height="32" viewBox="0 0 512 512" fill="none">
    <g transform="translate(0,512) scale(0.1,-0.1)" fill={isOn ? "#4CAF50" : "#f44336"} stroke="none">
      <path d="M2335 4484 c-199 -33 -423 -126 -587 -244 -280 -201 -485 -521 -555
-867 -25 -124 -25 -406 0 -522 96 -445 356 -786 752 -984 81 -40 234 -96 308
-112 15 -3 27 -11 27 -18 0 -6 -33 -106 -73 -222 l-72 -210 -124 -5 -124 -5
-180 -265 c-110 -163 -192 -273 -211 -285 -24 -16 -32 -29 -34 -57 -6 -73 -83
-68 1100 -68 1055 0 1058 0 1079 21 30 30 22 78 -16 104 -19 12 -103 126 -211
285 l-181 265 -124 5 -124 5 -76 220 c-75 214 -76 220 -55 226 182 55 248 80
339 126 375 191 639 538 729 955 29 138 32 410 5 538 -60 282 -177 507 -369
705 -121 126 -237 210 -393 286 -204 99 -386 140 -615 138 -74 -1 -171 -7
-215 -15z m485 -54 c551 -112 969 -541 1065 -1094 19 -113 19 -324 0 -444 -88
-540 -509 -979 -1055 -1098 -67 -15 -126 -19 -275 -19 -172 1 -200 3 -295 27
-267 67 -469 181 -652 365 -258 262 -389 581 -389 947 0 363 136 692 391 946
227 227 497 353 840 394 72 9 275 -5 370 -24z m-245 -2705 c66 0 141 4 167 7
l46 7 71 -210 c39 -116 71 -214 71 -218 0 -5 -731 -2 -738 3 -1 2 30 98 69
214 l71 211 61 -7 c34 -4 116 -7 182 -7z m688 -557 c35 -51 112 -164 170 -250
l107 -158 -980 0 -979 0 86 128 c48 70 124 182 170 250 l84 122 639 0 639 0
64 -92z m352 -468 c4 -6 1 -17 -5 -25 -19 -22 -2081 -22 -2100 0 -6 8 -9 19
-5 25 4 7 337 10 1055 10 718 0 1051 -3 1055 -10z"/>
      <path d="M2339 4334 c-376 -68 -706 -310 -879 -645 -98 -190 -140 -364 -140
-579 0 -331 117 -622 345 -858 423 -439 1083 -507 1598 -165 39 26 117 93 172
148 148 147 244 303 305 492 113 353 66 734 -132 1049 -65 105 -207 258 -307
332 -151 112 -343 195 -525 227 -109 19 -332 19 -437 -1z m295 -64 c9 -22 16
-42 16 -44 0 -2 -28 -7 -62 -11 -35 -4 -90 -17 -123 -28 l-60 -22 -37 60 c-20
33 -33 61 -29 63 21 8 137 20 202 21 l77 1 16 -40z m126 20 c37 -5 89 -17 118
-25 50 -15 52 -17 52 -50 0 -40 3 -39 -64 -20 -28 8 -84 18 -125 23 l-73 7
-14 40 c-7 22 -14 41 -14 42 0 1 12 1 28 -2 15 -2 56 -9 92 -15z m-415 -62
c19 -29 35 -58 35 -64 0 -6 -16 -24 -36 -39 -41 -31 -69 -87 -79 -158 l-6 -48
-51 73 c-27 40 -77 101 -111 135 l-61 62 50 21 c74 32 177 66 211 69 7 0 28
-23 48 -51z m753 -50 c57 -28 106 -56 108 -62 9 -23 -37 -171 -82 -262 -52
-108 -145 -249 -235 -362 -35 -42 -64 -79 -65 -81 -2 -2 -19 6 -38 18 l-35 22
20 44 c10 25 27 64 38 88 18 42 153 179 258 262 60 47 83 81 83 125 0 63 -55
127 -150 175 -46 23 -50 28 -50 61 0 44 3 43 148 -28z m-1010 -70 c128 -130
169 -205 187 -342 7 -55 20 -132 29 -169 9 -38 16 -73 16 -79 0 -5 -25 23 -56
63 -141 183 -299 332 -426 399 -58 31 -59 32 -41 52 27 30 194 138 213 138 9
0 44 -28 78 -62z m579 35 c16 -56 8 -412 -11 -531 l-19 -113 -40 3 -41 3 -17
135 c-20 158 -47 286 -83 394 -31 93 -31 92 -3 101 84 26 118 34 159 34 44 1
48 -1 55 -26z m206 3 c55 -17 57 -18 57 -53 0 -57 -38 -226 -71 -319 -23 -63
-45 -101 -81 -142 -27 -32 -62 -76 -76 -99 -31 -49 -47 -55 -39 -14 3 15 13
93 23 172 16 145 16 420 -2 463 -7 18 -3 19 62 14 38 -3 95 -13 127 -22z
m-408 -211 c44 -170 79 -435 58 -435 -6 0 -24 -3 -40 -6 -29 -6 -30 -4 -53 58
-12 34 -44 111 -71 170 -44 97 -49 114 -49 180 0 99 13 140 57 179 l37 32 19
-44 c10 -24 29 -84 42 -134z m560 141 c61 -44 88 -85 79 -120 -3 -15 -31 -47
-63 -73 -31 -26 -82 -72 -115 -102 -37 -36 -56 -49 -52 -36 3 11 17 59 30 108
14 48 31 126 38 172 7 49 17 85 23 85 6 0 33 -15 60 -34z m272 -22 c92 -74
143 -127 143 -148 0 -30 -70 -142 -142 -226 -72 -84 -212 -208 -332 -294 l-79
-57 -23 28 c-13 15 -23 32 -24 36 0 4 22 34 49 67 167 201 331 505 331 614 0
14 4 26 10 26 5 0 35 -21 67 -46z m-1478 -83 c127 -65 293 -222 441 -419 44
-59 80 -109 80 -112 0 -4 -14 -16 -30 -29 -30 -22 -31 -22 -54 -4 -271 213
-432 307 -610 354 -38 11 -71 21 -73 23 -8 7 170 216 184 216 2 0 30 -13 62
-29z m1694 -138 c69 -92 109 -162 102 -183 -9 -29 -140 -145 -219 -195 -63
-39 -82 -45 -161 -55 -49 -6 -130 -20 -179 -30 -49 -11 -91 -19 -92 -17 -2 1
39 35 89 74 170 133 373 360 394 440 3 13 9 23 13 23 5 0 28 -26 53 -57z
m-1819 -105 c131 -43 310 -149 484 -286 45 -36 82 -67 82 -70 0 -13 -36 -62
-46 -62 -22 0 -150 63 -187 92 -20 17 -87 88 -147 158 -61 70 -117 131 -126
134 -28 11 -84 6 -113 -8 -38 -20 -86 -76 -116 -136 -23 -46 -28 -50 -60 -50
-19 0 -35 2 -35 5 0 13 55 136 87 193 l35 63 42 -6 c22 -4 67 -16 100 -27z
m691 -117 c25 -62 44 -119 42 -126 -3 -7 -14 -15 -25 -17 -17 -5 -22 5 -40 86
-24 106 -37 183 -29 176 3 -3 26 -56 52 -119z m-653 38 c13 -7 64 -60 114
-119 l92 -107 -62 19 c-73 23 -245 58 -286 58 -17 0 -30 2 -30 5 0 20 45 87
79 118 44 40 57 43 93 26z m1935 -84 c13 -33 33 -91 44 -130 l19 -70 -22 -18
c-27 -21 -94 -57 -105 -57 -4 0 -18 16 -30 35 -28 42 -64 62 -144 78 l-60 12
67 44 c37 24 94 72 128 106 33 34 65 62 70 61 4 -1 19 -29 33 -61z m-918 -67
c-12 -23 -24 -38 -26 -31 -4 11 38 85 45 78 2 -2 -7 -23 -19 -47z m-1272 -85
c-9 -37 -19 -96 -23 -129 -6 -60 -7 -62 -45 -77 l-39 -15 0 33 c0 38 25 174
41 222 8 26 16 32 42 35 18 2 34 2 35 1 2 -1 -3 -32 -11 -70z m243 47 c159
-36 256 -75 318 -128 31 -27 76 -61 100 -77 46 -30 55 -51 19 -41 -13 3 -86
13 -163 22 -139 16 -437 16 -476 -1 -15 -6 -18 -1 -18 31 0 39 10 91 31 172
12 42 12 42 58 42 25 0 84 -9 131 -20z m915 -15 c98 -16 207 -110 245 -213 30
-78 25 -195 -10 -267 -31 -64 -101 -134 -165 -165 -42 -21 -64 -25 -145 -25
-81 0 -103 4 -145 25 -64 31 -134 101 -165 165 -35 72 -40 189 -10 267 26 70
91 145 158 181 48 26 138 47 177 41 11 -1 38 -6 60 -9z m842 -100 c21 -9 48
-30 60 -47 l23 -32 -48 -19 c-85 -34 -266 -75 -410 -94 -78 -9 -144 -15 -147
-11 -3 3 -8 21 -11 39 l-6 34 109 44 c59 24 133 56 163 72 48 24 67 28 142 29
56 0 101 -5 125 -15z m-307 -10 c-14 -8 -72 -33 -129 -56 -99 -39 -105 -40
-118 -23 -7 10 -13 21 -13 25 0 8 217 61 275 67 6 1 -1 -5 -15 -13z m573 -42
c4 -27 9 -90 13 -140 l7 -93 -44 -19 -44 -20 -8 52 c-5 29 -18 83 -30 122
l-22 70 55 37 c30 20 58 37 61 37 4 1 9 -20 12 -46z m-1534 -8 c2 -3 2 -8 -2
-11 -6 -6 -77 33 -77 42 0 5 71 -24 79 -31z m1384 -100 c10 -27 21 -77 24
-111 l6 -61 -83 -13 c-98 -15 -310 -8 -470 15 -58 9 -110 17 -115 19 -6 2 -9
21 -7 42 l4 39 145 18 c136 17 393 74 431 97 30 17 46 6 65 -45z m-1643 35
c47 -5 115 -15 153 -21 l67 -12 0 -38 c0 -42 13 -37 -160 -60 -125 -16 -254
-44 -361 -78 -86 -28 -95 -29 -106 -14 -17 22 -45 154 -41 189 3 25 8 30 43
35 66 10 314 10 405 -1z m-491 -90 c6 -39 20 -94 31 -122 11 -29 19 -52 17
-53 -1 0 -26 -15 -55 -33 -29 -18 -57 -32 -62 -32 -11 0 -23 94 -24 195 l-1
80 35 17 c19 10 38 18 41 18 3 0 11 -32 18 -70z m711 -59 c0 -5 3 -22 6 -38 5
-27 3 -31 -20 -37 -14 -3 -93 -36 -176 -71 -130 -56 -157 -65 -210 -65 -88 0
-146 17 -175 52 -33 39 -32 46 13 65 136 57 562 129 562 94z m1580 -70 c0 -42
-29 -190 -45 -228 -12 -28 -19 -33 -49 -33 l-35 0 14 41 c8 23 20 82 27 131
11 86 13 90 42 103 44 19 46 18 46 -14z m-674 -7 c117 -18 428 -25 503 -11
l44 8 -6 -66 c-4 -37 -14 -94 -23 -127 l-17 -60 -66 7 c-81 8 -128 18 -259 58
-88 26 -111 37 -160 80 -31 28 -78 66 -104 85 -27 18 -48 36 -48 38 0 7 22 5
136 -12z m-876 -35 c7 -11 10 -22 8 -24 -8 -7 -248 -57 -259 -53 -7 2 30 21
82 42 52 21 103 42 114 46 32 14 44 11 55 -11z m765 -34 l30 -26 -42 21 c-44
21 -53 30 -30 30 6 0 26 -12 42 -25z m-1421 -24 c34 -48 82 -73 159 -80 l58
-6 -67 -44 c-38 -25 -100 -76 -140 -113 l-72 -69 -30 73 c-44 107 -64 189 -50
206 9 10 105 71 114 72 1 0 14 -18 28 -39z m1489 -40 c44 -20 143 -116 242
-236 75 -91 104 -109 157 -102 56 8 106 52 148 130 33 64 37 67 72 67 l37 0
-13 -38 c-17 -48 -73 -159 -97 -193 -18 -25 -21 -26 -71 -17 -151 27 -375 155
-634 364 -18 15 -18 21 6 54 l21 29 44 -19 c25 -11 64 -29 88 -39z m-774 3
c12 -15 21 -29 21 -33 0 -3 -32 -46 -70 -94 -146 -184 -260 -387 -295 -523 -9
-38 -19 -75 -21 -82 -3 -10 -17 -4 -47 19 -66 51 -167 152 -167 168 0 23 58
120 111 187 27 34 87 97 133 141 81 77 291 243 307 243 4 0 17 -12 28 -26z
m-94 8 c-6 -5 -39 -31 -75 -58 -176 -132 -333 -299 -400 -425 -17 -33 -33 -59
-35 -59 -14 0 -155 216 -155 237 0 20 127 136 207 190 80 53 86 55 190 69 84
11 205 35 273 53 2 0 0 -3 -5 -7z m758 -100 c206 -166 411 -280 563 -313 32
-7 61 -14 63 -15 6 -5 -86 -118 -138 -169 l-51 -49 -63 31 c-131 66 -286 214
-449 431 l-70 93 23 25 c12 13 28 24 36 24 7 0 46 -26 86 -58z m-581 15 l26
-22 -44 -92 c-40 -82 -54 -100 -137 -175 -50 -46 -114 -102 -140 -123 -56 -45
-77 -80 -77 -129 0 -50 51 -111 130 -155 60 -34 65 -40 68 -74 l3 -37 -51 20
c-64 25 -147 67 -182 92 -23 16 -26 24 -22 51 19 107 81 247 172 387 74 115
202 280 216 280 6 0 23 -10 38 -23z m918 -8 c75 -23 241 -59 276 -59 31 0 30
-6 -5 -61 -37 -60 -76 -89 -117 -89 -29 0 -41 10 -102 83 -38 45 -77 88 -86
96 -15 13 -41 51 -34 51 2 0 32 -9 68 -21z m-860 -25 c0 -8 -40 -74 -45 -74
-2 0 4 18 12 40 14 34 33 54 33 34z m359 -81 c11 -49 23 -108 26 -133 8 -60
-4 -41 -56 91 -39 97 -41 103 -23 116 10 7 21 13 25 13 4 0 17 -39 28 -87z
m-315 -60 c-19 -125 -25 -426 -12 -517 l8 -49 -64 7 c-36 3 -91 14 -123 24
-54 17 -58 20 -61 51 -5 45 22 175 60 294 26 83 39 108 81 155 27 32 65 81 85
110 19 29 37 50 40 48 2 -3 -4 -58 -14 -123z m100 107 c20 0 22 -7 34 -113 15
-144 42 -276 82 -401 17 -54 28 -102 23 -106 -15 -15 -99 -39 -161 -46 -61 -6
-61 -6 -69 22 -15 55 -8 412 10 528 19 120 23 130 44 122 8 -3 25 -6 37 -6z
m135 -27 c7 -21 40 -100 73 -176 l60 -138 -4 -88 c-4 -95 -17 -127 -64 -158
-33 -21 -35 -18 -74 107 -32 104 -65 274 -76 395 -8 84 -2 95 46 95 21 0 29
-7 39 -37z m208 -88 c140 -174 316 -331 422 -375 17 -7 31 -15 31 -19 0 -10
-83 -71 -162 -121 -52 -32 -71 -39 -85 -32 -30 16 -126 123 -172 190 -53 79
-71 121 -71 169 0 21 -11 92 -25 158 -25 121 -28 142 -21 134 2 -2 39 -49 83
-104z m-658 -185 c-26 -85 -59 -236 -59 -277 0 -18 -4 -33 -9 -33 -5 0 -31 15
-57 33 -50 33 -94 88 -94 116 0 9 30 43 67 76 36 33 89 81 117 107 28 25 52
46 53 44 1 -1 -7 -31 -18 -66z m793 -323 c32 -32 58 -60 58 -62 0 -6 -133 -56
-199 -74 l-69 -19 -25 36 c-62 95 -61 87 -17 117 41 29 80 94 80 136 0 13 3
34 6 46 6 20 12 14 57 -50 28 -39 77 -98 109 -130z m-270 -97 l37 -60 -27 -7
c-15 -4 -81 -8 -146 -8 l-119 0 -13 37 c-12 34 -11 36 9 42 12 3 36 6 52 6 17
0 59 11 95 24 36 13 67 24 70 24 3 1 22 -26 42 -58z m-380 7 l81 -12 13 -37
c13 -37 13 -38 -12 -38 -36 0 -223 39 -246 51 -12 6 -18 21 -18 43 l0 34 50
-15 c28 -8 87 -20 132 -26z"/>
      <path d="M2264 1080 c-55 -22 -70 -95 -29 -135 40 -41 105 -33 131 17 35 68
-33 146 -102 118z m82 -45 c34 -52 -14 -110 -74 -89 -64 23 -46 114 23 114 26
0 39 -6 51 -25z"/>
      <path d="M2524 1076 c-51 -22 -62 -95 -21 -134 53 -50 137 -13 137 59 0 33
-29 79 -50 79 -4 0 -14 2 -22 5 -7 2 -27 -2 -44 -9z m78 -33 c38 -34 11 -103
-40 -103 -54 0 -81 62 -45 102 20 22 61 23 85 1z"/>
      <path d="M2803 1083 c-37 -7 -66 -52 -59 -93 11 -69 92 -95 141 -45 59 58 2
154 -82 138z m73 -48 c21 -32 11 -72 -21 -87 -35 -16 -71 -3 -85 32 -10 25
-10 34 4 55 23 35 79 35 102 0z"/>
    </g>
  </svg>
);

const HeaterIcon = ({ isOn }) => (
  <svg width="32" height="32" viewBox="0 0 512 512" fill="none">
    <g transform="translate(0,512) scale(0.1,-0.1)" fill={isOn ? "#4CAF50" : "#f44336"} stroke="none">
      <path d="M1300 4894 c-132 -199 -134 -301 -10 -493 92 -145 92 -180 -1 -322 -34 -51 -63 -98 -66 -105 -4 -10 104 -94 122 -94 3 0 37 48 75 106 132 199 134 301 10 493 -92 145 -92 180 1 322 34 51 63 98 66 105 4 10 -104 94 -122 94 -3 0 -37 -48 -75 -106z"/>
      <path d="M2100 4894 c-132 -199 -134 -301 -10 -493 92 -145 92 -180 -1 -322 -34 -51 -63 -98 -66 -105 -4 -10 104 -94 122 -94 3 0 37 48 75 106 132 199 134 301 10 493 -92 145 -92 180 1 322 34 51 63 98 66 105 4 10 -104 94 -122 94 -3 0 -37 -48 -75 -106z"/>
      <path d="M2900 4894 c-132 -199 -134 -301 -10 -493 92 -145 92 -180 -1 -322 -34 -51 -63 -98 -66 -105 -4 -10 104 -94 122 -94 3 0 37 48 75 106 132 199 134 301 10 493 -92 145 -92 180 1 322 34 51 63 98 66 105 4 10 -104 94 -122 94 -3 0 -37 -48 -75 -106z"/>
      <path d="M3700 4894 c-132 -199 -134 -301 -10 -493 92 -145 92 -180 -1 -322 -34 -51 -63 -98 -66 -105 -4 -10 104 -94 122 -94 3 0 37 48 75 106 132 199 134 301 10 493 -92 145 -92 180 1 322 34 51 63 98 66 105 4 10 -104 94 -122 94 -3 0 -37 -48 -75 -106z"/>
      <path d="M441 3744 c-169 -45 -301 -180 -346 -351 -23 -87 -22 -2380 0 -2468 51 -192 207 -331 408 -359 l81 -12 73 -219 c49 -150 80 -226 94 -237 19 -16 45 -18 209 -18 164 0 190 2 209 18 14 11 45 87 94 237 l74 220 1223 0 1223 0 74 -220 c49 -150 80 -226 94 -237 19 -16 45 -18 209 -18 164 0 190 2 209 18 14 11 45 87 94 237 l73 219 83 12 c207 30 373 184 411 383 14 74 14 2348 0 2422 -25 131 -124 266 -239 328 -123 65 34 61 -2236 60 -1766 0 -2068 -2 -2114 -15z m4249 -175 c70 -33 126 -89 159 -159 l26 -55 0 -1195 0 -1195 -24 -52 c-29 -66 -111 -143 -176 -169 -49 -19 -100 -19 -2120 -19 l-2070 0 -55 26 c-70 33 -126 89 -159 159 l-26 55 0 1195 0 1195 26 55 c43 91 124 157 216 179 22 5 916 8 2093 8 l2055 -2 55 -26z"/>
      <path d="M531 3414 c-58 -29 -104 -84 -122 -143 -7 -24 -9 -395 -7 -1132 l3 -1096 30 -49 c19 -30 49 -60 79 -79 l49 -30 1997 0 1997 0 49 30 c30 19 60 49 79 79 l30 49 0 1117 0 1117 -30 49 c-19 30 -49 60 -79 79 l-49 30 -1987 3 -1986 2 -53 -26z"/>
    </g>
  </svg>
);

const WateringPlantsIcon = ({ isOn }) => (
  <svg width="32" height="32" viewBox="0 0 512 512" fill="none">
    <g transform="translate(0,512) scale(0.1,-0.1)" fill={isOn ? "#4CAF50" : "#f44336"} stroke="none">
      <path d="M4055 4403 c-372 -84 -555 -138 -692 -205 -96 -46 -161 -110 -201 -196 -24 -50 -27 -69 -27 -162 0 -93 3 -111 27 -163 35 -74 121 -160 195 -195 52 -24 70 -27 163 -27 93 0 112 3 162 27 86 40 150 105 196 201 62 128 152 423 192 632 6 33 14 68 16 78 5 17 4 18 -31 10z m-165 -202 c0 -18 -80 -289 -105 -354 -58 -154 -93 -199 -180 -232 -53 -21 -144 -16 -192 9 -40 20 -89 70 -110 109 -8 17 -18 59 -21 94 -4 53 -1 70 21 116 15 29 37 63 51 76 36 34 194 98 361 146 160 47 175 50 175 36z"/>
      <path d="M4910 4375 c-365 -84 -589 -168 -686 -257 -100 -92 -139 -257 -95 -396 54 -166 199 -272 374 -272 86 0 151 20 224 67 93 61 156 179 233 436 34 114 110 422 110 450 0 9 6 10 -160 -28z m-44 -197 c-10 -56 -86 -298 -118 -379 -38 -96 -77 -145 -142 -175 -119 -55 -257 -7 -318 110 -32 59 -31 155 1 219 30 62 78 97 194 141 97 37 334 109 381 115 4 0 5 -14 2 -31z"/>
      <path d="M2140 4374 c-102 -27 -191 -96 -244 -187 -45 -76 -56 -157 -56 -417 l0 -234 -47 -48 -48 -48 53 -52 52 -53 52 52 53 52 275 3 276 3 65 32 c121 60 201 173 220 311 5 37 8 186 7 332 l-3 265 -300 2 c-238 1 -311 -1 -355 -13z m498 -377 l-3 -244 -30 -49 c-19 -30 -49 -60 -79 -79 l-49 -30 -186 -3 -186 -3 95 96 95 95 -53 52 -52 53 -93 -93 c-51 -50 -96 -92 -101 -92 -4 0 -6 78 -4 173 4 190 13 225 71 285 70 73 99 80 365 81 l213 1 -3 -243z"/>
      <path d="M1200 3603 l0 -628 -84 84 -85 84 -3 276 -3 276 -28 57 c-57 116 -164 202 -285 227 -32 7 -169 11 -343 11 l-290 0 3 -327 3 -328 32 -68 c39 -82 110 -154 190 -194 l58 -28 282 -5 283 -5 135 -135 135 -135 0 -626 0 -626 70 -7 c38 -4 74 -4 80 -1 7 4 10 442 10 1286 l0 1279 80 0 80 0 0 -1285 0 -1285 23 0 c12 0 46 3 75 6 l52 7 0 261 0 261 138 138 137 137 231 0 c127 0 257 5 290 11 173 32 300 168 325 347 5 37 8 186 7 332 l-3 265 -260 3 c-143 2 -295 -2 -337 -7 -179 -24 -315 -151 -347 -325 -6 -33 -11 -164 -11 -291 l0 -230 -78 -78 c-42 -42 -81 -77 -85 -77 -4 0 -7 443 -7 985 l0 985 -235 0 -235 0 0 -627z m-510 226 c68 -14 128 -62 162 -128 28 -52 28 -56 28 -229 l0 -177 -95 95 -95 95 -52 -52 -51 -51 86 -94 86 -93 -162 -3 c-186 -4 -221 3 -278 55 -80 72 -84 87 -87 356 l-3 237 205 0 c113 0 228 -5 256 -11z m1950 -940 c0 -246 -5 -278 -57 -338 -61 -72 -94 -81 -299 -81 l-179 0 175 175 175 176 -54 50 -54 51 -171 -171 c-94 -94 -175 -171 -180 -171 -4 0 -6 78 -4 173 5 188 11 216 67 279 64 73 87 78 349 78 l232 0 0 -221z"/>
      <path d="M4598 3265 c-184 -42 -375 -96 -476 -136 -175 -70 -243 -124 -299 -238 -25 -50 -28 -67 -28 -161 0 -99 2 -110 32 -171 77 -156 253 -248 418 -218 202 36 287 144 394 498 38 127 116 450 109 456 -2 1 -69 -12 -150 -30z m-52 -197 c-10 -56 -86 -298 -118 -380 -55 -139 -127 -197 -244 -198 -203 -1 -315 224 -193 390 28 37 70 63 169 102 64 26 358 116 384 117 4 1 5 -14 2 -31z"/>
      <path d="M82 2537 l3 -323 38 -76 c58 -119 156 -193 287 -218 29 -5 157 -10 284 -10 l230 0 48 -47 48 -47 55 54 55 54 -50 51 -50 51 0 252 c0 229 -2 258 -21 314 -37 110 -110 192 -215 240 -47 22 -60 23 -382 26 l-333 3 3 -324z m684 138 c30 -19 60 -49 79 -79 l30 -49 3 -186 3 -186 -175 175 -176 175 -55 -55 -55 -55 177 -178 178 -179 -180 4 c-198 4 -228 12 -292 77 -64 63 -68 83 -71 339 l-3 233 244 -3 244 -3 49 -30z"/>
      <path d="M790 1340 l-495 -5 -67 -33 c-84 -41 -167 -128 -199 -209 -20 -50 -24 -80 -27 -220 l-4 -163 2562 0 2562 0 -4 163 c-3 140 -7 170 -27 220 -32 81 -115 168 -199 209 l-66 33 -186 2 c-401 6 -3384 8 -3850 3z m4002 -160 c54 -15 118 -68 145 -120 15 -30 25 -72 29 -122 l7 -78 -2413 0 -2413 0 6 76 c7 91 35 153 88 196 75 61 -84 57 2314 58 1486 0 2212 -3 2237 -10z"/>
    </g>
  </svg>
);


export default function RemoteControlPanel({unityContext}) {
  const { sendMessage } = unityContext;

  // MQTT 클라이언트 인스턴스
  const mqttClientRef = useRef(null);

  // MQTT 클라이언트 초기화
  useEffect(() => {
    mqttClientRef.current = new MQTTClient();
    mqttClientRef.current.connect(); // 실제 브로커 주소로 변경 필요
    
    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.disconnect();
      }
    };
  }, []);

  const sendToUnity = useCallback((eventName, payload) => {
    const message = new UnityMessage(eventName, payload);
    console.log("Sending to Unity:", JSON.stringify(message));
    sendMessage("MessageManager", "ReceiveMessage", JSON.stringify(message));
  }, [sendMessage]);

  // 전역 store 업데이트 및 저장
  const {
    water, fan, ledLevel,
    temp1,
    humid1,
    setWater, setFan, setLed, 
    setTemp1,
    setHumid1,
    persistToLocal,
    autoMode, manualMode,
    toggleAutoMode, toggleManualMode,
    vent,
  } = useControlStore();

  // 자동 모드 커스텀 훅 사용
  const { simulatedData } = useAutoMode(sendToUnity);
  
  // 마운트 시 store 초기화
  useEffect(() => {
    useControlStore.getState().restoreFromLocal();
  }, []);



  // 수동 모드 ---------------------------------------------------
  // 온도 제어 ▲▼
  const handleTempChange = async (sensorNum, delta) => {
    const currentTemp = temp1;
    const newValue = Math.max(10, Math.min(40, currentTemp + delta));
    
    sendToUnity(`tempControl${sensorNum}`, { value: newValue });
    // MQTT로 LED 깜박임 신호 전송
    if (mqttClientRef.current) {
      await mqttClientRef.current.blinkLed(0, fan);
    }
    // 온도/습도 센서 데이터 전송
    const sensorData = {
      "temperature": newValue,
      "humidity": humid1,
      "phLevel": 6.5,
      "eleDT": 1.2,
      "co2": 400,
    };
    if (mqttClientRef.current) {
      mqttClientRef.current.publish('sensor/data/send', sensorData);
    }
    if (sensorNum === 1) setTemp1(newValue);
    // else if (sensorNum === 2) setTemp2(newValue);
    // else if (sensorNum === 3) setTemp3(newValue);
    // else if (sensorNum === 4) setTemp4(newValue);
    persistToLocal();
  };

  // 습도 제어 ▲▼
  const handleHumidChange = async (sensorNum, delta) => {
    const currentHumid = humid1;
    const newValue = Math.max(30, Math.min(90, currentHumid + delta));
    
    sendToUnity(`humidControl${sensorNum}`, { value: newValue });
    // MQTT로 LED 깜박임 신호 전송
    if (mqttClientRef.current) {
      await mqttClientRef.current.blinkLed(1, fan);
    }
    // 온도/습도 센서 데이터 전송
    const sensorData = {
      "temperature": temp1,
      "humidity": newValue,
      "phLevel": 6.5,
      "eleDT": 1.2,
      "co2": 400,
    };
    if (mqttClientRef.current) {
      mqttClientRef.current.publish('sensor/data/send', sensorData);
    }
    if (sensorNum === 1) setHumid1(newValue);
    // else if (sensorNum === 2) setHumid2(newValue);
    // else if (sensorNum === 3) setHumid3(newValue);
    // else if (sensorNum === 4) setHumid4(newValue);
    
    persistToLocal();
  };
  

  // 관개 시스템
  const handleWaterClick = async () => {
    // 센서로 on/off 전달 (sendToSensor('water', !prev))
    if(water) return; // 이미 급수 중이면 무시

    sendToUnity("startWater", { status: true });
    // MQTT로 LED 깜박임 신호 전송
    if (mqttClientRef.current) {
      await mqttClientRef.current.blinkLed(2, fan);
    }

    setWater(true);
    persistToLocal();

    // 5초 후 자동 종료
    setTimeout(() => {
      setWater(false);
      persistToLocal();
    }, 5000);
  };

  // 환기 시스템 토글
  const handleFanToggle = () => {
    const newState = !fan;
    sendToUnity("fanStatus", { status: newState });

    // MQTT로 팬 제어 신호 전송
    if (mqttClientRef.current) {
      mqttClientRef.current.publish('device/control/ABCD1234', {
        "fan": newState,
        "leds": [false, false, false, false]
      });
      console.log("fan작동");
    }

    setFan(newState);
    persistToLocal();
  };

  // LED 조명
  const handleLedToggle = async (e) => {
    // 센서로는 밝기기 조절 할 때마다 led 꺼졌다 켜졌다 전달해야 함.
    const level = parseInt(e.target.value);
    console.log("LED 밝기 설정:", level);
    sendToUnity("ledLevel", { level });

    // MQTT로 LED 깜박임 신호 전송 (밝기 조절할 때마다)
    if (mqttClientRef.current && level > 0) {
      await mqttClientRef.current.blinkLed(3, fan);
    }

    setLed(level);
    persistToLocal();
  };

  const handleAutoModeToggle = () => {
    toggleAutoMode();
  };

  const handleManualModeToggle = () => {
    toggleManualMode();
  };

  const controlDisabled = autoMode;

  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="remote-panel-root">
      {/* 왼쪽 패널 */}
      <div className="left-panel">

        {/* 상단 타이틀 */}
        <div className="panel-header">
          <div className="panel-title">컨테이너형 스마트팜</div>
          <div className="panel-subtitle">GreenSync</div>
        </div>



        {/* 자동 모드일 때 시뮬레이션 데이터 표시 */}
        {autoMode && (
          <div className="realtime-data-section">
            <div className="section-title">자동 제어 기준 데이터 (데이터확인용)</div>
            <div className="data-grid">
              <DataCard label="센서1 온도" value={simulatedData.sensor1?.temp || '--'} unit="℃" />
              <DataCard label="센서1 습도" value={simulatedData.sensor1?.humid || '--'} unit="%" />
              {/* <DataCard label="센서2 온도" value={simulatedData.sensor2?.temp || '--'} unit="℃" /> */}
              {/* <DataCard label="센서2 습도" value={simulatedData.sensor2?.humid || '--'} unit="%" /> */}
              {/* <DataCard label="센서3 온도" value={simulatedData.sensor3?.temp || '--'} unit="℃" /> */}
              {/* <DataCard label="센서3 습도" value={simulatedData.sensor3?.humid || '--'} unit="%" /> */}
              {/* <DataCard label="센서4 온도" value={simulatedData.sensor4?.temp || '--'} unit="℃" /> */}
              {/* <DataCard label="센서4 습도" value={simulatedData.sensor4?.humid || '--'} unit="%" /> */}
            </div>
          </div>
        )}

        {/* 원격제어 상태 section-title 추가 */}
        <div className="section-title">원격제어 상태</div>
        <div className="data-grid">
          <DataCard label="난방" value={vent ? "ON" : "OFF"} unit={vent ? "🟢" : "🔴"} icon={<HeaterIcon isOn={vent} />} />
          <DataCard label="배기" value={fan ? "ON" : "OFF"} unit={fan ? "🟢" : "🔴"} icon={<ExhaustFanIcon isOn={fan} />} />
          <DataCard label="급수량" value={water ? "ON" : "OFF"} unit={water ? "🟢" : "🔴"} icon={<WateringPlantsIcon isOn={water} />} />
        </div>
        {/* MQTT 연결 상태 표시 */}
        <div className="realtime-data-section">
          <div className="section-title">MQTT 연결 상태(확인용)</div>
          <div className="data-grid">
            <DataCard 
              label="MQTT" 
              value={mqttClientRef.current?.isConnected ? "연결됨" : "연결 안됨"} 
              unit={mqttClientRef.current?.isConnected ? "🟢" : "🔴"} 
            />
          </div>
        </div>
        {/* 기기 제어 */}
        <div className="device-control-section">
          <div className="section-title">공조 설비 기기 - 원격제어</div>
          {/* AI 스마트팜 분석 버튼 추가 */}
          <button
            onClick={() => setAiModalOpen(true)}
            style={{
              margin: "12px 0",
              padding: "10px 24px",
              background: "#388e3c",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            AI 스마트팜 분석
          </button>
          <div className="control-row">
            <span>자동모드</span>
            <button 
              onClick={handleAutoModeToggle}
              disabled={!manualMode} // 수동모드가 꺼져 있으면 자동모드도 못 누르게
              className={autoMode ? "btn-on" : "btn-off"}
            >
              {autoMode ? "ON" : "OFF"}
            </button>
          </div>
          <div className="control-row">
            <span>수동모드</span>
            <button 
              onClick={handleManualModeToggle}
              disabled={!autoMode} // 자동모드가 꺼져 있으면 수동모드도 못 누르게게
              className={manualMode ? "btn-on" : "btn-off"}
            >
              {manualMode ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div> {/* 왼쪽 패널 닫힘 */}

      {/* 오른쪽 패널 */}
      <div className="right-panel">
        {/* 제어판 카드 UI (2x2 grid) */}
        <div className="panel-title-row">
          <span className="panel-title-icon">📋</span>
          <span className="panel-title-text">제어판</span>
        </div>
        <div className="control-card-grid">
          {/* 관개 시스템 */}
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#2196f3" }}>💧</span>
              <span className="control-card-title" style={{ color: "#2196f3" }}>관개 시스템</span>
            </div>
            <div className="control-card-body">
              <button 
                onClick={handleWaterClick}
                disabled={water || controlDisabled}
                className={water ? "btn-disabled" : water ? "btn-on" : "btn-off"}
              >
                {water ? "급수 중..." : "급수하기"}
              </button>
              <div className="control-card-desc">
                {autoMode ? "자동 제어 중" : "수동 물 공급"}
              </div>
            </div>
          </div>
          {/* 환기 시스템 */}
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#8bc34a" }}>🍃</span>
              <span className="control-card-title" style={{ color: "#8bc34a" }}>환기 시스템</span>
            </div>
            <div className="control-card-body">
              <label className="switch">
                <input type="checkbox" checked={fan} onChange={handleFanToggle} disabled={controlDisabled} />
                <span className="slider"></span>
              </label>
              <div className="control-card-desc">
                {autoMode ? "자동 제어 중" : "수동 환기"}
              </div>
            </div>
          </div>
          
          {/* 온·습도 제어1 */}
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#e57373" }}>🌡️</span>
              <span className="control-card-title" style={{ color: "#e57373" }}>온·습도 제어1</span>
            </div>
            <div className="control-card-body">
              <div className="temp-control-row">
                <button className="temp-btn" onClick={() => handleTempChange(1, -1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{temp1}℃</span>
                <button className="temp-btn" onClick={() => handleTempChange(1, 1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 난방 제어" : "수동 난방 시스템"}
              </div>

              <div className="temp-control-row" style={{ marginTop: "12px" }}>
                <button className="temp-btn" onClick={() => handleHumidChange(1, -1)} disabled={controlDisabled}>-</button>
                <span className="temp-value">{humid1}%</span>
                <button className="temp-btn" onClick={() => handleHumidChange(1, 1)} disabled={controlDisabled}>+</button>
              </div>
              <div className="control-card-desc">
                {autoMode ? "자동 가습 제어" : "수동 가습 시스템"}
              </div>
            </div>
          </div>

          {/* LED 조명 */}
          <div className="control-card">
            <div className="control-card-header">
              <span className="control-card-icon" style={{ color: "#ffd600" }}>💡</span>
              <span className="control-card-title" style={{ color: "#ffd600" }}>LED 조명</span>
            </div>
            <div className="control-card-body">
              <input
                type="range"
                min={0}
                max={3}
                value={ledLevel ?? 0}
                onChange={handleLedToggle}
                disabled={controlDisabled}
                className="slider-range"
                />
              <div className="control-card-desc">
                {autoMode ? `자동 제어 중 (${ledLevel ?? 0})` : `LED 밝기 제어(${ledLevel ?? 0})`}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* AI 분석 모달 */}
      <AIAnalysisModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
}

// 실시간 데이터 카드
function DataCard({ label, value, unit, icon }) {
  return (
    <div className="data-card">
      {icon && <div className="data-icon">{icon}</div>}
      <div className="data-label">{label}</div>
      <div className="data-value">
        {value} {unit && <span className="data-unit">{unit}</span>}
      </div>
    </div>
  );
}