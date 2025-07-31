import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AIAnalysisModal.css';

const AIAnalysisModal = ({ isOpen, onClose, farmId }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // AI 분석 요청 함수
  const requestAIAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    console.log('AI 분석 요청 시작 - Farm ID:', farmId);
    
    try {
      const requestData = {
        userMessage: `농장 ID ${farmId}의 토마토 AI 분석 결과를 알려줘 예를 들어 작물 상태, 환경최적화, 급수시스템, 예측분석, 권장사항 다음주 수확 수 kg은?`
      };
      
      console.log('AI 서버 요청 데이터:', requestData);
      
      // AI 서버 호출 (프록시 사용)
      const response = await axios.post('/api/ollama/ask', requestData, {
        timeout: 60000, // 60초 타임아웃 설정
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('AI 서버 응답:', response.data);

      if (response.data && response.data.reply) {
        // AI 응답을 파싱하여 구조화된 데이터로 변환
        const aiResponse = response.data.reply;
        const parsedData = parseAIResponse(aiResponse, farmId);
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
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
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
      
      // 에러 발생 시 샘플 데이터로 대체 (선택적)
      console.log('에러로 인해 샘플 데이터를 사용합니다.');
      const sampleData = {
        farmInfo: {
          farmId: farmId,
          analysisDate: new Date().toLocaleDateString()
        },
        aiResponse: 'AI 서버 연결 오류로 인해 샘플 데이터를 제공합니다.',
        extractedData: {
          temperature: '22°C',
          humidity: '65%',
          harvest: '15kg',
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
  const parseAIResponse = (response, farmId) => {
    // AI 응답에서 수치 추출
    const extractData = (text) => {
      const data = {
        temperature: '분석 중',
        humidity: '분석 중',
        harvest: '분석 중',
        cropStatus: '분석 중',
        waterSystem: '분석 중',
        prediction: '분석 중'
      };

      try {
        // 온도 추출 (숫자°C 패턴)
        const tempMatch = text.match(/(\d+)°C/);
        if (tempMatch) {
          data.temperature = `${tempMatch[1]}°C`;
        }

        // 습도 추출 (숫자% 패턴)
        const humidityMatch = text.match(/(\d+)%/);
        if (humidityMatch) {
          data.humidity = `${humidityMatch[1]}%`;
        }

        // 수확량 추출 (숫자kg 패턴)
        const harvestMatch = text.match(/(\d+)\s*kg/);
        if (harvestMatch) {
          data.harvest = `${harvestMatch[1]}kg`;
        }

        // 작물 상태 키워드 분석
        if (text.includes('건강') || text.includes('양호') || text.includes('좋음')) {
          data.cropStatus = '건강한 상태';
        } else if (text.includes('주의') || text.includes('문제')) {
          data.cropStatus = '주의 필요';
        } else {
          data.cropStatus = '정상 상태';
        }

        // 급수 시스템 키워드 분석
        if (text.includes('정상') || text.includes('적절')) {
          data.waterSystem = '정상 작동';
        } else if (text.includes('조절') || text.includes('조정')) {
          data.waterSystem = '조절 필요';
        } else {
          data.waterSystem = '정상 작동';
        }

        // 예측 분석 키워드
        if (text.includes('안정') || text.includes('양호')) {
          data.prediction = '안정적 성장 예상';
        } else if (text.includes('주의') || text.includes('관리')) {
          data.prediction = '관리 주의 필요';
        } else {
          data.prediction = '정상 성장 예상';
        }

      } catch (error) {
        console.warn('AI 응답 파싱 오류:', error);
      }

      return data;
    };

    const extractedData = extractData(response);

    return {
      farmInfo: {
        farmId: farmId,
        analysisDate: new Date().toLocaleDateString()
      },
      aiResponse: response,
      extractedData: extractedData
    };
  };

  // 모달이 열릴 때 AI 분석 요청
  useEffect(() => {
    if (isOpen && farmId) {
      requestAIAnalysis();
    }
  }, [isOpen, farmId]);

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
                <button className="retry-btn" onClick={requestAIAnalysis}>
                  다시 시도
                </button>
                <button className="close-btn" onClick={onClose}>
                  닫기
                </button>
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
              </div>
              
              <div className="ai-analysis-section">
                <h3>AI 분석 결과</h3>
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <div className="card-header">
                      <span className="card-icon">🌱</span>
                      <h4>작물 상태</h4>
                    </div>
                    <div className="card-content">
                      <p>{analysisData.extractedData.cropStatus}</p>
                    </div>
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
                      <div className="env-item">
                        <span className="env-label">조명:</span>
                        <span className="env-value">적절한 수준 유지 중</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="analysis-card">
                    <div className="card-header">
                      <span className="card-icon">💧</span>
                      <h4>급수 시스템</h4>
                    </div>
                    <div className="card-content">
                      <p>{analysisData.extractedData.waterSystem}</p>
                    </div>
                  </div>
                  
                  <div className="analysis-card">
                    <div className="card-header">
                      <span className="card-icon">🔮</span>
                      <h4>예측 분석</h4>
                    </div>
                    <div className="card-content">
                      <p>{analysisData.extractedData.prediction}</p>
                    </div>
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
                    <span>다음 주 수확 수량 : {analysisData.extractedData.harvest}</span>
                  </div>
                </div>
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
        
        <div className="ai-modal-footer">
          <button className="ai-modal-btn" onClick={onClose}>
            확인ㄹ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;