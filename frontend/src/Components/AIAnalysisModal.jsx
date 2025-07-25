import React from 'react';
import './AIAnalysisModal.css';

const AIAnalysisModal = ({ isOpen, onClose, farmId }) => {
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
          <div className="ai-analysis-section">
            <h3>농장 정보</h3>
            <p>농장 ID: {farmId}</p>
            <p>분석 날짜: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="ai-analysis-section">
            <h3>AI 분석 결과</h3>
            <div className="ai-analysis-item">
              <h4>🌱 작물 상태</h4>
              <p>현재 작물 상태는 양호합니다. 적절한 온도와 습도가 유지되고 있습니다.</p>
            </div>
            
            <div className="ai-analysis-item">
              <h4>🌡️ 환경 최적화</h4>
              <p>온도: 23°C (적정 범위 내)</p>
              <p>습도: 65% (적정 범위 내)</p>
              <p>조명: 적절한 수준 유지 중</p>
            </div>
            
            <div className="ai-analysis-item">
              <h4>💧 급수 시스템</h4>
              <p>급수량이 적절하게 조절되고 있습니다.</p>
            </div>
            
            <div className="ai-analysis-item">
              <h4>🔮 예측 분석</h4>
              <p>향후 7일간 안정적인 성장이 예상됩니다.</p>
            </div>
          </div>
          
          <div className="ai-analysis-section">
            <h3>권장사항</h3>
            <ul>
              <li>현재 설정된 자동 제어 모드를 유지하세요.</li>
              <li>정기적인 센서 점검을 권장합니다.</li>
              <li>다음 주 수확 예정일: 2024년 1월 15일</li>
            </ul>
          </div>
        </div>
        
        <div className="ai-modal-footer">
          <button className="ai-modal-btn" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;