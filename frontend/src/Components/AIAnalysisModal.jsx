import React, { useState, useEffect } from 'react';
import './AIAnalysisModal.css';

function AIAnalysisModal({ isOpen, onClose, farmId = "farm001" }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [crop, setCrop] = useState('tomato');

  // 실제 환경에서는 axios를 사용하지만, 여기서는 시뮬레이션
  const simulateAPICall = (selectedCrop) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 작물별 다른 데이터 반환
        const cropData = {
          tomato: {
            status: "success",
            predicted: {
              WTSPL_QTY: 23.6,
              VNTILAT_TPRT_1: 19.94,
              HTNG_TPRT_1: 17.99,
              YIELD_CNT: 7.58
            }
          },
          paprika: {
            status: "success",
            predicted: {
              WTSPL_QTY: 18.2,
              VNTILAT_TPRT_1: 22.15,
              HTNG_TPRT_1: 20.45,
              YIELD_CNT: 5.32
            }
          }
        };

        resolve({
          data: cropData[selectedCrop] || cropData.tomato
        });
      }, 2000);
    });
  };

  const handleAnalyze = async () => {
    console.log('AI 분석 시작 - 모달 열기');
    setLoading(true);
    setResult(null);
    
    try {
      const res = await simulateAPICall(crop);
      console.log('API Response:', res.data);
      
      if (res.data.status === 'success' && res.data.predicted) {
        console.log('결과 설정:', res.data.predicted);
        setResult(res.data.predicted);
      } else {
        console.log('분석 실패 - 데이터 형식 오류');
        alert('AI 분석 실패: 데이터 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('AI 분석 오류:', err);
      alert('서버 오류 발생');
    } finally {
      console.log('로딩 완료');
      setLoading(false);
    }
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
        return crop === 'tomato' ? '🍅' : '🌶️';
      default:
        return '📊';
    }
  };

  const getGradeColor = (value, type) => {
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

  // 모달이 열릴 때 자동으로 분석 시작
  useEffect(() => {
    if (isOpen) {
      handleAnalyze();
    }
  }, [isOpen, crop]);

  if (!isOpen) return null;

  return (
    <div className="ai-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="ai-modal-content">
        {/* 모달 헤더 */}
        <div className="ai-modal-header">
          <div className="ai-modal-header-content">
            <h3 className="ai-modal-title">
              ✨ AI 스마트팜 분석
            </h3>
            <button
              onClick={onClose}
              className="ai-modal-close"
            >
              ×
            </button>
          </div>
          <p className="ai-modal-subtitle">
            {crop === 'tomato' ? '🍅 토마토' : '🌶️ 파프리카'} 최적 제어값 분석
          </p>
        </div>

        {/* 작물 선택 */}
        <div className="ai-crop-selection">
          <label className="ai-crop-label">분석할 작물 선택</label>
          <div className="ai-crop-options">
            <label className="ai-crop-option">
              <input
                type="radio"
                value="tomato"
                checked={crop === 'tomato'}
                onChange={() => setCrop('tomato')}
                className="ai-crop-radio"
              />
              <span className={crop === 'tomato' ? 'selected' : ''}>🍅 토마토</span>
            </label>
            <label className="ai-crop-option">
              <input
                type="radio"
                value="paprika"
                checked={crop === 'paprika'}
                onChange={() => setCrop('paprika')}
                className="ai-crop-radio"
              />
              <span className={crop === 'paprika' ? 'selected' : ''}>🌶️ 파프리카</span>
            </label>
          </div>
        </div>

        {/* 모달 콘텐츠 */}
        <div className="ai-modal-body">
          {loading ? (
            <div className="ai-modal-loading">
              <div className="ai-modal-loading-spinner"></div>
              <p className="ai-modal-loading-text">AI가 {crop === 'tomato' ? '토마토' : '파프리카'} 데이터를 분석하고 있습니다...</p>
              <p className="ai-modal-loading-subtext">잠시만 기다려주세요</p>
            </div>
          ) : result ? (
            <div>
              <p style={{color: 'green', marginBottom: '16px', textAlign: 'center'}}>✅ {crop === 'tomato' ? '토마토' : '파프리카'} 분석 완료!</p>
              {/* 제어값 카드들 */}
              <div className="ai-results-grid">
                {/* 급수량 */}
                <div className="ai-control-card water">
                  <div className="ai-control-card-content">
                    <div className="ai-control-info">
                      <span className="ai-control-icon">{getControlIcon('water')}</span>
                      <div>
                        <h4 className="ai-control-name">급수량</h4>
                        <p className="ai-control-description">Water Supply</p>
                      </div>
                    </div>
                    <div className="ai-control-value-container">
                      <div className="ai-control-value water">
                        {result.WTSPL_QTY}
                      </div>
                      <div className="ai-control-unit">L</div>
                    </div>
                  </div>
                </div>

                {/* 난방 온도 */}
                <div className="ai-control-card heat">
                  <div className="ai-control-card-content">
                    <div className="ai-control-info">
                      <span className="ai-control-icon">{getControlIcon('heat')}</span>
                      <div>
                        <h4 className="ai-control-name">난방 온도</h4>
                        <p className="ai-control-description">Heating Temperature</p>
                      </div>
                    </div>
                    <div className="ai-control-value-container">
                      <div className="ai-control-value heat">
                        {result.HTNG_TPRT_1}
                      </div>
                      <div className="ai-control-unit">℃</div>
                    </div>
                  </div>
                </div>

                {/* 배기 온도 */}
                <div className="ai-control-card vent">
                  <div className="ai-control-card-content">
                    <div className="ai-control-info">
                      <span className="ai-control-icon">{getControlIcon('vent')}</span>
                      <div>
                        <h4 className="ai-control-name">배기 온도</h4>
                        <p className="ai-control-description">Ventilation Temperature</p>
                      </div>
                    </div>
                    <div className="ai-control-value-container">
                      <div className="ai-control-value vent">
                        {result.VNTILAT_TPRT_1}
                      </div>
                      <div className="ai-control-unit">℃</div>
                    </div>
                  </div>
                </div>

                {/* 예측 수확수 - 하이라이트 */}
                <div className="ai-control-card yield">
                  <div className="ai-control-card-content">
                    <div className="ai-control-info">
                      <span className="ai-control-icon yield">{getControlIcon('yield')}</span>
                      <div>
                        <h4 className="ai-control-name yield">예측 수확수</h4>
                        <p className="ai-control-description">Predicted Yield Count</p>
                      </div>
                    </div>
                    <div className="ai-control-value-container">
                      <div className={`ai-control-value yield ${getGradeColor(result.YIELD_CNT, 'yield')}`}>
                        {result.YIELD_CNT}
                      </div>
                      <div className="ai-control-unit">개</div>
                    </div>
                  </div>
                  {/* 수확수 평가 */}
                  <div className="ai-yield-evaluation">
                    <div className="ai-yield-evaluation-label">수확 예상 등급</div>
                    <div>
                      <span className={`ai-grade-badge ai-grade-${getGradeInfo(result.YIELD_CNT).grade}`}>
                        {getGradeInfo(result.YIELD_CNT).text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 추가 정보 */}
              <div className="ai-info-section">
                <div className="ai-info-text">
                  <p>💡 <strong>팁:</strong> 이 제어값들을 스마트팜 시스템에 적용하면 최적의 수확량을 기대할 수 있습니다.</p>
                  <p>📊 분석 시간: {new Date().toLocaleString('ko-KR')}</p>
                  <p>🌱 분석 작물: {crop === 'tomato' ? '토마토' : '파프리카'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '20px'}}>
              <p style={{color: 'red'}}>❌ 분석 결과를 불러올 수 없습니다.</p>
              <p>상태: {loading ? '로딩 중' : '결과 없음'}</p>
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="ai-button-area">
            <button
              onClick={onClose}
              className="ai-close-button"
            >
              닫기
            </button>
            {!loading && result && (
              <button
                onClick={() => {
                  alert(`${crop === 'tomato' ? '토마토' : '파프리카'} 제어값이 스마트팜 시스템에 적용되었습니다!`);
                  onClose();
                }}
                className="ai-apply-button"
              >
                🚀 적용하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAnalysisModal; 