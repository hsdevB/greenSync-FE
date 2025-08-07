import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AIAnalysisModal.css';
import { useNavigate } from 'react-router-dom';

const AIAnalysisModal = ({ isOpen, onClose, farmCode }) => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [crop] = useState('tomato'); // 기본값 tomato
  const [sensorData, setSensorData] = useState({
    temperature: '--',
    humidity: '--',
    light: '--'
  });

  // 센서 데이터 가져오기
  const fetchSensorData = async () => {
    // 농장코드가 없으면 기본값 사용
    if (!farmCode) {
      setSensorData({
        temperature: '22°C',
        humidity: '65%',
        light: '70%'
      });
      return;
    }

    try {
      //console.log('센서 데이터 요청 - Farm Code:', farmCode);
      
      // 온도 데이터 가져오기
      const tempResponse = await axios.get(`/sensor/temperature/code/${farmCode}`);
      // console.log('온도 응답:', tempResponse.data);
      
      // 습도 데이터 가져오기
      const humidityResponse = await axios.get(`/sensor/humidity/code/${farmCode}`);
      // console.log('습도 응답:', humidityResponse.data);
      
      // 조명 데이터 가져오기 (일사량)
      // const lightResponse = await axios.get(`/weather/code/${farmCode}`);
      //console.log('조명 응답:', lightResponse.data);
      
      // 데이터 파싱
      const temp = tempResponse.data.data.temperature || '--';
        
      const humidity = humidityResponse.data.data.humidity || '--';
      // const light = lightResponse.data && typeof lightResponse.data === 'number'
      //   ? lightResponse.data
      //   : lightResponse.data?.data?.light || lightResponse.data?.light || '--';
      
      setSensorData({
        temperature: `${temp}°C`,
        humidity: `${humidity}%`,
        // light: light !== '--' ? `${light}%` : '--'
      });
      
      //console.log('센서 데이터 설정:', { temp, humidity, light });
      
    } catch (error) {
      console.error('센서 데이터 가져오기 오류:', error);
      setSensorData({
        temperature: '22°C',
        humidity: '65%',
        light: '70%'
      });
    }
  };

  // AI 분석 요청 함수
  const requestAIAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    //console.log('AI 분석 요청 시작 - Farm Code:', farmCode);
    
    // 서버 연결 상태 확인을 위한 간단한 ping 요청
    try {
      await axios.get('http://192.168.0.33:3000/health', { timeout: 5000 });
    } catch (pingError) {
      console.warn('AI 서버 연결 확인 실패:', pingError);
      // ping 실패해도 계속 진행 (서버가 다른 엔드포인트는 응답할 수 있음)
    }
    
    try {
      // 먼저 센서 데이터 가져오기
      await fetchSensorData();
      
      // 센서 데이터를 다시 가져와서 최신 상태 확인
      let currentSensorData = {
        temperature: '--',
        humidity: '--',
        light: '--'
      };
      
      if (farmCode) {
        try {
          const tempResponse = await axios.get(`/sensor/temperature/code/${farmCode}`);
          const humidityResponse = await axios.get(`/sensor/humidity/code/${farmCode}`);
          
          const temp = tempResponse.data.data.temperature || '--';
          const humidity = humidityResponse.data.data.humidity || '--';
          
          currentSensorData = {
            temperature: `${temp}°C`,
            humidity: `${humidity}%`,
            light: '--'
          };
        } catch (error) {
          console.error('센서 데이터 재요청 오류:', error);
          currentSensorData = {
            temperature: '22°C',
            humidity: '65%',
            light: '70%'
          };
        }
      } else {
        currentSensorData = {
          temperature: '22°C',
          humidity: '65%',
          light: '70%'
        };
      }
      
      // 농장코드에 따른 다른 메시지 구성 (사용하지 않는 변수 제거)
      // const userMessage = farmCode 
      //   ? `농장 코드 ${farmCode}의 토마토 AI 분석 결과를 알려줘 예를 들어 작물 상태, 환경최적화, 급수시스템, 예측분석, 권장사항 다음주 수확 수 kg은?`
      //   : `일반적인 토마토 재배 환경에 대한 AI 분석 결과를 알려줘 예를 들어 작물 상태, 환경최적화, 급수시스템, 예측분석, 권장사항 다음주 수확 수 kg은?`;
      

      
      //console.log('AI 서버 요청 데이터:', requestData);
      
      // AI 서버 호출 (프록시 사용)
      // const response = await axios.post('/api/ollama/ask', requestData, {
      //   timeout: 60000, // 60초 타임아웃 설정
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });
      const response = await axios.post('http://192.168.0.33:3000/predict', {
        farmCode: farmCode,
        crop: crop, // crop 값 추가!
      }, {
        timeout: 30000, // 30초로 타임아웃 증가
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('AI 서버 응답:', response.data);

      if (response.data && response.data.predicted) {
        // AI 응답을 파싱하여 구조화된 데이터로 변환
        const aiResponse = response.data.predicted;
        const parsedData = parseAIResponse(aiResponse, farmCode, currentSensorData);
        setAnalysisData(parsedData);
      } else {
        throw new Error('AI 응답 데이터가 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('AI 분석 요청 오류:', err);
      
      // 구체적인 에러 메시지 설정
      let errorMessage = 'AI 분석 중 오류가 발생했습니다.';
      
      if (err.code === 'ECONNREFUSED') {
        errorMessage = 'AI 서버에 연결할 수 없습니다. Ollama 서버가 실행 중인지 확인해주세요.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'AI 서버 응답 시간이 초과되었습니다. 서버 상태를 확인하고 다시 시도해주세요.';
      } else if (err.response) {
        // 서버에서 응답이 왔지만 에러인 경우
        if (err.response.status === 404) {
          errorMessage = 'AI 서비스 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.';
        } else {
          errorMessage = `서버 오류: ${err.response.status} - ${err.response.statusText}`;
        }
      } else if (err.request) {
        // 요청은 보냈지만 응답이 없는 경우
        errorMessage = 'AI 서버로부터 응답을 받지 못했습니다. 서버 상태를 확인해주세요.';
      }
      
      setError(errorMessage);
      
      // 에러 발생 시 센서 데이터를 사용한 샘플 데이터 생성
      //console.log('에러로 인해 센서 데이터 기반 샘플 데이터를 사용합니다.');
      const sampleData = {
        farmInfo: {
          farmId: farmCode || '일반 분석',
          analysisDate: new Date().toLocaleDateString()
        },
        aiResponse: 'AI 서버 연결 오류로 인해 기본 분석 데이터를 제공합니다.',
        extractedData: {
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          harvest: '12kg',
          cropStatus: '건강한 상태',
          waterSystem: '정상 작동',
          prediction: '안정적 성장 예상'
        }
      };
      setAnalysisData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  // AI 응답을 파싱하는 함수
  const parseAIResponse = (response, farmCode, currentSensorData) => {
    console.log('AI 응답 파싱 시작:', response);
    console.log('현재 센서 데이터:', currentSensorData);
    
    // AI 응답에서 수치 추출
    const extractData = (text) => {
      const data = {
        temperature: currentSensorData.temperature, // 센서 데이터 우선 사용
        humidity: currentSensorData.humidity,      // 센서 데이터 우선 사용
        harvest: '분석 중',
        cropStatus: '분석 중',
        waterSystem: '분석 중',
        prediction: '분석 중'
      };

      try {
        console.log('텍스트 파싱:', text);
        
        // 온도 추출 (AI 응답에서 더 정확한 값이 있으면 사용)
        const tempPatterns = [
          /(\d+)°C/,           // 22°C
          /(\d+)\s*도/,        // 22도
          /온도[:\s]*(\d+)/,   // 온도: 22
          /(\d+)\s*C/,         // 22C
          /온도\s*(\d+)/,      // 온도 22
          /(\d+)\s*섭씨/       // 22섭씨
        ];
        
        for (const pattern of tempPatterns) {
          const match = text.match(pattern);
          if (match) {
            data.temperature = `${match[1]}°C`;
            console.log('AI에서 온도 추출 성공:', data.temperature);
            break;
          }
        }

        // 습도 추출 (AI 응답에서 더 정확한 값이 있으면 사용)
        const humidityPatterns = [
          /(\d+)%/,            // 65%
          /습도[:\s]*(\d+)/,   // 습도: 65
          /(\d+)\s*퍼센트/,    // 65퍼센트
          /습도\s*(\d+)/,      // 습도 65
          /(\d+)\s*%/          // 65 %
        ];
        
        for (const pattern of humidityPatterns) {
          const match = text.match(pattern);
          if (match) {
            data.humidity = `${match[1]}%`;
            console.log('AI에서 습도 추출 성공:', data.humidity);
            break;
          }
        }

        // 수확량 추출 (다양한 패턴 지원)
        const harvestPatterns = [
          /(\d+)\s*kg/,        // 15kg
          /(\d+)\s*킬로그램/,  // 15킬로그램
          /수확[:\s]*(\d+)/,   // 수확: 15
          /다음주[:\s]*(\d+)/, // 다음주: 15
          /(\d+)\s*kg/,        // 15 kg
          /수확량[:\s]*(\d+)/  // 수확량: 15
        ];
        
        for (const pattern of harvestPatterns) {
          const match = text.match(pattern);
          if (match) {
            data.harvest = `${match[1]}kg`;
            console.log('수확량 추출 성공:', data.harvest);
            break;
          }
        }

        // 작물 상태 키워드 분석
        if (text.includes('건강') || text.includes('양호') || text.includes('좋음') || text.includes('정상')) {
          data.cropStatus = '건강한 상태';
        } else if (text.includes('주의') || text.includes('문제') || text.includes('불량')) {
          data.cropStatus = '주의 필요';
        } else {
          data.cropStatus = '정상 상태';
        }

        // 급수 시스템 키워드 분석
        if (text.includes('정상') || text.includes('적절') || text.includes('양호')) {
          data.waterSystem = '정상 작동';
        } else if (text.includes('조절') || text.includes('조정') || text.includes('문제')) {
          data.waterSystem = '조절 필요';
        } else {
          data.waterSystem = '정상 작동';
        }

        // 예측 분석 키워드
        if (text.includes('안정') || text.includes('양호') || text.includes('좋음')) {
          data.prediction = '안정적 성장 예상';
        } else if (text.includes('주의') || text.includes('관리') || text.includes('문제')) {
          data.prediction = '관리 주의 필요';
        } else {
          data.prediction = '정상 성장 예상';
        }

        console.log('파싱 결과:', data);

      } catch (error) {
        console.warn('AI 응답 파싱 오류:', error);
      }

      return data;
    };

    // response가 객체인지 확인하고 predicted 데이터 처리
    if (typeof response === 'object' && response !== null) {
      console.log('객체 형태의 AI 응답 처리:', response);
      
      // predicted 객체가 있는 경우
      if (response.WTSPL_QTY !== undefined || response.VNTILAT_TPRT_1 !== undefined || 
          response.HTNG_TPRT_1 !== undefined || response.YIELD_CNT !== undefined) {
        
        const predictedData = {
          temperature: currentSensorData.temperature,
          humidity: currentSensorData.humidity,
          harvest: response.YIELD_CNT ? `${response.YIELD_CNT.toFixed(2)}kg` : '분석 중',
          cropStatus: '건강한 상태',
          waterSystem: '정상 작동',
          prediction: '안정적 성장 예상',
          // 추가 예측 데이터
          waterQuantity: response.WTSPL_QTY ? `${response.WTSPL_QTY.toFixed(2)}L` : '--',
          ventilationTemp: response.VNTILAT_TPRT_1 ? `${response.VNTILAT_TPRT_1.toFixed(1)}` : '--',
          heatingTemp: response.HTNG_TPRT_1 ? `${response.HTNG_TPRT_1.toFixed(1)}` : '--'
        };

        return {
          farmInfo: {
            farmId: farmCode || '미설정',
            analysisDate: new Date().toLocaleDateString()
          },
          aiResponse: 'AI 예측 모델 분석 완료',
          extractedData: predictedData
        };
      }
    }

    // 기존 텍스트 파싱 로직 (fallback)
    const extractedData = extractData(response);

    return {
      farmInfo: {
        farmId: farmCode || '미설정',
        analysisDate: new Date().toLocaleDateString()
      },
      aiResponse: response,
      extractedData: extractedData
    };
  };

  // 모달이 열릴 때 AI 분석 요청
  useEffect(() => {
    if (isOpen) {
      // 농장코드가 없어도 모달은 열리고, 분석 시도
      requestAIAnalysis();
    }
  }, [isOpen, farmCode]);

  if (!isOpen) return null;

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <h2>AI 스마트팜 분석</h2>
          <button className="ai-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="ai-modal-body">
          {loading ? (
            <div className="ai-loading">
              <div className="ai-loading-spinner"></div>
              <p>AI 분석 중...</p>
              <p className="loading-detail">서버에 연결하여 분석을 진행하고 있습니다.</p>
            </div>
          ) : error ? (
            <div className="ai-error">
              <div className="error-icon">⚠️</div>
              <h3>분석 오류</h3>
              <p>{error}</p>
              <div className="error-actions">
                {error.includes('농장코드가 설정되지 않았습니다') ? (
                  <>
                    <button 
                      className="retry-btn" 
                      onClick={() => {
                        onClose();
                        navigate('/signup');
                      }}
                      style={{
                        background: '#388e3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '8px'
                      }}
                    >
                      회원가입 페이지로 이동
                    </button>
                    <button className="close-btn" onClick={onClose}>
                      닫기
                    </button>
                  </>
                ) : (
                  <>
                    <button className="retry-btn" onClick={requestAIAnalysis}>
                      다시 시도
                    </button>
                    <button className="close-btn" onClick={onClose}>
                      닫기
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : analysisData ? (
            <>
              <div className="ai-analysis-section">
                <h3>농장 정보</h3>
                <div className="farm-info-grid">
                  <div className="info-item">
                    <span className="info-label">농장 ID:</span>
                    <span className="info-value">{analysisData.farmInfo.farmId}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">분석 날짜:</span>
                    <span className="info-value">{analysisData.farmInfo.analysisDate}</span>
                  </div>
                </div>
                {console.log('농장 정보:', {
                  farmId: analysisData.farmInfo.farmId,
                  analysisDate: analysisData.farmInfo.analysisDate
                })}
              </div>
              
              <div className="ai-analysis-section">
                <h3>AI 분석 결과</h3>
                {console.log('AI 분석 결과:', analysisData.extractedData)}
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <div className="card-header">
                      <span className="card-icon">🌱</span>
                      <h4>작물 상태</h4>
                    </div>
                    <div className="card-content">
                      <p>{analysisData.extractedData.cropStatus}</p>
                    </div>
                    {console.log('작물 상태:', analysisData.extractedData.cropStatus)}
                  </div>
                  
                  <div className="analysis-card">
                    <div className="card-header">
                      <span className="card-icon">🌡️</span>
                      <h4>환경 최적화</h4>
                    </div>
                    <div className="card-content">
                      <div className="env-item">
                        <span className="env-label">온도:</span>
                        <span className="env-value">{analysisData.extractedData.temperature}</span>
                      </div>
                      <div className="env-item">
                        <span className="env-label">습도:</span>
                        <span className="env-value">{analysisData.extractedData.humidity}</span>
                      </div>
                      {/* <div className="env-item">
                        <span className="env-label">조명:</span>
                        <span className="env-value">{sensorData.light}</span>
                      </div> */}
                    </div>
                    {console.log('환경 최적화:', {
                      temperature: analysisData.extractedData.temperature,
                      humidity: analysisData.extractedData.humidity
                    })}
                  </div>
                  
                  <div className="analysis-card">
                    <div className="card-header">
                      <span className="card-icon">💧</span>
                      <h4>급수 시스템</h4>
                    </div>
                    <div className="card-content">
                      <p>{analysisData.extractedData.waterSystem}</p>
                      {analysisData.extractedData.waterQuantity && (
                        <div className="env-item">
                          <span className="env-label">예측 급수량:</span>
                          <span className="env-value">{analysisData.extractedData.waterQuantity}</span>
                        </div>
                      )}
                    </div>
                    {console.log('급수 시스템:', {
                      waterSystem: analysisData.extractedData.waterSystem,
                      waterQuantity: analysisData.extractedData.waterQuantity
                    })}
                  </div>
                  
                  <div className="analysis-card">
                    <div className="card-header">
                      <span className="card-icon">🔮</span>
                      <h4>예측 분석</h4>
                    </div>
                    <div className="card-content">
                      <p>{analysisData.extractedData.prediction}</p>
                      {analysisData.extractedData.ventilationTemp && (
                        <div className="env-item">
                          <span className="env-label">환기</span>
                          <span className="env-value">{analysisData.extractedData.ventilationTemp}</span>
                        </div>
                      )}
                      {analysisData.extractedData.heatingTemp && (
                        <div className="env-item">
                          <span className="env-label">난방</span>
                          <span className="env-value">{analysisData.extractedData.heatingTemp}</span>
                        </div>
                      )}
                    </div>
                    {console.log('예측 분석:', {
                      prediction: analysisData.extractedData.prediction,
                      ventilationTemp: analysisData.extractedData.ventilationTemp,
                      heatingTemp: analysisData.extractedData.heatingTemp
                    })}
                  </div>
                </div>
              </div>
              
              <div className="ai-analysis-section">
                <h3>권장사항</h3>
                <div className="recommendations-list">
                  <div className="recommendation-item">
                    <span className="check-icon">✓</span>
                    <span>현재 설정된 자동 제어 모드를 유지하세요.</span>
                  </div>
                  <div className="recommendation-item">
                    <span className="check-icon">✓</span>
                    <span>정기적인 센서 점검을 권장합니다.</span>
                  </div>
                  <div className="recommendation-item">
                    <span className="check-icon">✓</span>
                    <span>예상 수확 수량 : {analysisData.extractedData.harvest}</span>
                  </div>
                </div>
                {console.log('권장사항:', {
                  autoModeRecommendation: '현재 설정된 자동 제어 모드를 유지하세요.',
                  sensorCheckRecommendation: '정기적인 센서 점검을 권장합니다.',
                  expectedHarvest: analysisData.extractedData.harvest
                })}
              </div>
            </>
          ) : (
            <div className="ai-no-data">
              <div className="no-data-icon">📊</div>
              <h3>분석 데이터 없음</h3>
              <p>AI 분석을 시작하려면 다시 시도해주세요.</p>
              <button className="retry-btn" onClick={requestAIAnalysis}>
                분석 시작
              </button>
            </div>
          )}
        </div>
        

      </div>
    </div>
  );
};

export default AIAnalysisModal;