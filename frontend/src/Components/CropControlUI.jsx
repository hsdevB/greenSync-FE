import React, { useState } from 'react';

function CropControlUI({ farmId }) {
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
        if (value >= 7) return 'text-green-600';
        if (value >= 5) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 작물 선택 */}
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🤖 AI 스마트팜 분석</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">작물 선택</label>
          <div className="flex space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="tomato"
                checked={crop === 'tomato'}
                onChange={() => setCrop('tomato')}
                className="mr-2 text-green-500"
              />
              <span className="flex items-center">
                🍅 토마토
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="paprika"
                checked={crop === 'paprika'}
                onChange={() => setCrop('paprika')}
                className="mr-2 text-red-500"
              />
              <span className="flex items-center">
                🌶️ 파프리카
              </span>
            </label>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105 shadow-lg'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              AI 분석 중...
            </div>
          ) : (
            '🔍 AI 분석 시작'
          )}
        </button>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">
                  ✨ AI 분석 결과
                </h3>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-white opacity-90 mt-1">
                {crop === 'tomato' ? '🍅 토마토' : '🌶️ 파프리카'} 최적 제어값
              </p>
            </div>

            {/* 모달 콘텐츠 */}
            <div className="p-6">
              {result && (
                <div className="space-y-4">
                  {/* 제어값 카드들 */}
                  <div className="grid gap-4">
                    {/* 급수량 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getControlIcon('water')}</span>
                          <div>
                            <h4 className="font-medium text-gray-800">급수량</h4>
                            <p className="text-sm text-gray-600">Water Supply</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">
                            {result.WTSPL_QTY}
                          </div>
                          <div className="text-sm text-gray-500">L</div>
                        </div>
                      </div>
                    </div>

                    {/* 난방 온도 */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getControlIcon('heat')}</span>
                          <div>
                            <h4 className="font-medium text-gray-800">난방 온도</h4>
                            <p className="text-sm text-gray-600">Heating Temperature</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-red-600">
                            {result.HTNG_TPRT_1}
                          </div>
                          <div className="text-sm text-gray-500">℃</div>
                        </div>
                      </div>
                    </div>

                    {/* 배기 온도 */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getControlIcon('vent')}</span>
                          <div>
                            <h4 className="font-medium text-gray-800">배기 온도</h4>
                            <p className="text-sm text-gray-600">Ventilation Temperature</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-600">
                            {result.VNTILAT_TPRT_1}
                          </div>
                          <div className="text-sm text-gray-500">℃</div>
                        </div>
                      </div>
                    </div>

                    {/* 예측 수확수 - 하이라이트 */}
                    <div className="bg-gradient-to-r from-green-50 to-yellow-50 border-2 border-green-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-3xl mr-3">{getControlIcon('yield')}</span>
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg">예측 수확수</h4>
                            <p className="text-sm text-gray-600">Predicted Yield Count</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getGradeColor(result.YIELD_CNT, 'yield')}`}>
                            {result.YIELD_CNT}
                          </div>
                          <div className="text-sm text-gray-500">개</div>
                        </div>
                      </div>
                      
                      {/* 수확수 평가 */}
                      <div className="mt-3 p-2 bg-white rounded border">
                        <div className="text-xs text-gray-600 mb-1">수확 예상 등급</div>
                        <div className="flex items-center">
                          {result.YIELD_CNT >= 7 ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              🌟 우수
                            </span>
                          ) : result.YIELD_CNT >= 5 ? (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              ⭐ 보통
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              🔸 주의
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 추가 정보 */}
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="text-sm text-gray-600">
                      <p>💡 <strong>팁:</strong> 이 제어값들을 스마트팜 시스템에 적용하면 최적의 수확량을 기대할 수 있습니다.</p>
                      <p className="mt-2">📊 분석 시간: {new Date().toLocaleString('ko-KR')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 버튼 영역 */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    // 실제로는 시스템에 제어값을 적용하는 로직
                    alert('제어값이 스마트팜 시스템에 적용되었습니다!');
                    closeModal();
                  }}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
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

export default CropControlUI;