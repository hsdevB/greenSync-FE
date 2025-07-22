import React, { useState } from 'react';
import './AIButton.css';

function AIButton({ farmId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState('tomato');
  const [showModal, setShowModal] = useState(false);

  // 실제 환경에서는 axios를 사용하지만, 여기서는 시뮬레이션
  const simulateAPICall = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            status: "success",
            predicted: {
              WTSPL_QTY: 23.6,
              VNTILAT_TPRT_1: 19.94,
              HTNG_TPRT_1: 17.99,
              YIELD_CNT: 7.58
            }
          }
        });
      }, 2000);
    });
  };

  // farmId를 사용하는 예시 (실제 API 호출 시 사용)
  console.log('Farm ID:', farmId);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // 실제 코드: const res = await axios.post('http://localhost:3001/predict', { farm_id: farmId, crop: crop });
      const res = await simulateAPICall(); // 시뮬레이션용
      
      if (res.data.status === 'success' || res.data.YIELD_CNT) {
        setResult(res.data.predicted ? res.data.predicted : res.data);
        setShowModal(true);
      } else {
        alert('AI 분석 실패: ' + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const getControlIcon = (type) => {
    switch (type) {
      case 'water':
        return '💧';
      case 'heat':
        return '🔥';
      case 'vent':
        return '🌬️';
      case 'yield':
        return '🍅';
      default:
        return '📊';
    }
  };

  const getGradeColor = (value, type) => {
    // 간단한 등급 시스템 (실제로는 더 정교한 로직 필요)
    switch (type) {
      case 'yield':
        if (value >= 7) return 'green';
        if (value >= 5) return 'yellow';
        return 'red';
      default:
        return 'blue';
    }
  };

  const getGradeInfo = (value) => {
    if (value >= 7) {
      return { grade: 'excellent', text: '🌟 우수' };
    } else if (value >= 5) {
      return { grade: 'normal', text: '⭐ 보통' };
    } else {
      return { grade: 'warning', text: '🔸 주의' };
    }
  };

  return (
    <div className="ai-button-container">
      {/* 작물 선택 */}
      <div className="ai-button-card">
        <h2 className="ai-button-title">🤖 AI 스마트팜 분석</h2>
        
        <div className="crop-selection">
          <label className="crop-label">작물 선택</label>
          <div className="crop-options">
            <label className="crop-option">
              <input
                type="radio"
                value="tomato"
                checked={crop === 'tomato'}
                onChange={() => setCrop('tomato')}
                className="crop-radio"
              />
              <span>🍅 토마토</span>
            </label>
            <label className="crop-option">
              <input
                type="radio"
                value="paprika"
                checked={crop === 'paprika'}
                onChange={() => setCrop('paprika')}
                className="crop-radio"
              />
              <span>🌶️ 파프리카</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="analyze-button"
        >
          {loading ? (
            <div className="loading-content">
              <div className="loading-spinner"></div>
              AI 분석 중...
            </div>
          ) : (
            '🔍 AI 분석 시작'
          )}
        </button>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* 모달 헤더 */}
            <div className="modal-header">
              <div className="modal-header-content">
                <h3 className="modal-title">
                  ✨ AI 분석 결과
                </h3>
                <button
                  onClick={closeModal}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <p className="modal-subtitle">
                {crop === 'tomato' ? '🍅 토마토' : '🌶️ 파프리카'} 최적 제어값
              </p>
            </div>

            {/* 모달 콘텐츠 */}
            <div className="modal-body">
              {result && (
                <div>
                  {/* 제어값 카드들 */}
                  <div className="results-grid">
                    {/* 급수량 */}
                    <div className="control-card water">
                      <div className="control-card-content">
                        <div className="control-info">
                          <span className="control-icon">{getControlIcon('water')}</span>
                          <div>
                            <h4 className="control-name">급수량</h4>
                            <p className="control-description">Water Supply</p>
                          </div>
                        </div>
                        <div className="control-value-container">
                          <div className="control-value water">
                            {result.WTSPL_QTY}
                          </div>
                          <div className="control-unit">L</div>
                        </div>
                      </div>
                    </div>

                    {/* 난방 온도 */}
                    <div className="control-card heat">
                      <div className="control-card-content">
                        <div className="control-info">
                          <span className="control-icon">{getControlIcon('heat')}</span>
                          <div>
                            <h4 className="control-name">난방 온도</h4>
                            <p className="control-description">Heating Temperature</p>
                          </div>
                        </div>
                        <div className="control-value-container">
                          <div className="control-value heat">
                            {result.HTNG_TPRT_1}
                          </div>
                          <div className="control-unit">℃</div>
                        </div>
                      </div>
                    </div>

                    {/* 배기 온도 */}
                    <div className="control-card vent">
                      <div className="control-card-content">
                        <div className="control-info">
                          <span className="control-icon">{getControlIcon('vent')}</span>
                          <div>
                            <h4 className="control-name">배기 온도</h4>
                            <p className="control-description">Ventilation Temperature</p>
                          </div>
                        </div>
                        <div className="control-value-container">
                          <div className="control-value vent">
                            {result.VNTILAT_TPRT_1}
                          </div>
                          <div className="control-unit">℃</div>
                        </div>
                      </div>
                    </div>

                    {/* 예측 수확수 - 하이라이트 */}
                    <div className="control-card yield">
                      <div className="control-card-content">
                        <div className="control-info">
                          <span className="control-icon yield">{getControlIcon('yield')}</span>
                          <div>
                            <h4 className="control-name yield">예측 수확수</h4>
                            <p className="control-description">Predicted Yield Count</p>
                          </div>
                        </div>
                        <div className="control-value-container">
                          <div className={`control-value yield ${getGradeColor(result.YIELD_CNT, 'yield')}`}>
                            {result.YIELD_CNT}
                          </div>
                          <div className="control-unit">개</div>
                        </div>
                      </div>
                      
                      {/* 수확수 평가 */}
                      <div className="yield-evaluation">
                        <div className="yield-evaluation-label">수확 예상 등급</div>
                        <div>
                          <span className={`grade-badge grade-${getGradeInfo(result.YIELD_CNT).grade}`}>
                            {getGradeInfo(result.YIELD_CNT).text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 추가 정보 */}
                  <div className="info-section">
                    <div className="info-text">
                      <p>💡 <strong>팁:</strong> 이 제어값들을 스마트팜 시스템에 적용하면 최적의 수확량을 기대할 수 있습니다.</p>
                      <p>📊 분석 시간: {new Date().toLocaleString('ko-KR')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 버튼 영역 */}
              <div className="button-area">
                <button
                  onClick={closeModal}
                  className="close-button"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    // 실제로는 시스템에 제어값을 적용하는 로직
                    alert('제어값이 스마트팜 시스템에 적용되었습니다!');
                    closeModal();
                  }}
                  className="apply-button"
                >
                  🚀 적용하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIButton;