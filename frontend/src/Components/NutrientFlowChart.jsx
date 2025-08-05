import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NutrientFlowChart.css';

const NutrientFlowChart = ({ farmCode }) => {
  const [data, setData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState(['phLevel', 'ecLevel']);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 여러 가능한 API 엔드포인트 시도
        let phLevels = [];
        let ecLevels = [];
        
        try {
          // 먼저 개별 pH, EC 엔드포인트 시도
          const [phResponse, ecResponse] = await Promise.all([
            axios.get(`http://192.168.0.33:3000/chart/nutrient/daily/${farmCode}`),
            axios.get(`http://192.168.0.33:3000/chart/nutrient/daily/${farmCode}`)
          ]);

          phLevels = phResponse.data.data?.datasets?.[0]?.data?.phAverageData || [];
          ecLevels = ecResponse.data.data?.datasets?.[0]?.data?.ecAverageData || [];
          
          console.log("개별 엔드포인트 - pH 데이터:", phLevels);
          console.log("개별 엔드포인트 - EC 데이터:", ecLevels);
        } catch (error) {
          console.log("개별 엔드포인트 실패, 통합 엔드포인트 시도:", error.message);
          
          // 개별 엔드포인트가 실패하면 통합 nutrient 엔드포인트 시도
          const nutrientResponse = await axios.get(`http://192.168.0.33:3000/chart/nutrient/daily/${farmCode}`);
          
          console.log("통합 nutrient 응답:", nutrientResponse.data);
          
          // 통합 응답에서 데이터 추출
          if (nutrientResponse.data.data?.datasets?.[0]?.data) {
            const nutrientData = nutrientResponse.data.data.datasets[0].data;
            phLevels = nutrientData.phAverageData || [];
            ecLevels = nutrientData.ecAverageData || [];
          } else if (nutrientResponse.data.phLevel) {
            phLevels = [nutrientResponse.data.phLevel];
            ecLevels = [nutrientResponse.data.ecLevel];
          }
          
          console.log("통합 엔드포인트 - pH 데이터:", phLevels);
          console.log("통합 엔드포인트 - EC 데이터:", ecLevels);
        }

        // 시간 라벨 생성 (24시간, 3시간 간격)
        const timeLabels = ['00시', '03시', '06시', '09시', '12시', '15시', '18시', '21시'];
        
        // 시계열 데이터 생성
        const timeSeriesData = timeLabels.map((label, index) => {
          const timestamp = new Date();
          timestamp.setHours(index * 3, 0, 0, 0);
          
          return {
            timestamp: timestamp,
            phLevel: phLevels[index] || 6.0, // 기본값 6.0
            ecLevel: ecLevels[index] || 2.0  // 기본값 2.0
          };
        });

        // 1시간 간격 데이터 생성 (테이블용)
        const hourlyData = [];
        for (let i = 0; i < 24; i++) {
          const timestamp = new Date();
          timestamp.setHours(i, 0, 0, 0);
          
          // 3시간 간격 데이터에서 가장 가까운 값 찾기
          const closestIndex = Math.floor(i / 3);
          const phValue = phLevels[closestIndex] || 6.0;
          const ecValue = ecLevels[closestIndex] || 2.0;
          
          hourlyData.push({
            timestamp: timestamp,
            phLevel: phValue,
            ecLevel: ecValue
          });
        }

        console.log("최종 시계열 데이터:", timeSeriesData);
        setData(timeSeriesData);
        
        // 1시간 간격 데이터도 상태로 저장
        setHourlyData(hourlyData);
      } catch (error) {
        console.error('Data loading error:', error);
        // 에러 시 기본 데이터 생성 (24시간, 3시간 간격)
        const now = new Date();
        const todayMidnight = new Date(now);
        todayMidnight.setHours(0, 0, 0, 0); // 00:00:00으로 설정
        
        const fallbackData = [];
        for (let i = 0; i < 8; i++) {
          const time = new Date(todayMidnight.getTime() + i * 3 * 60 * 60 * 1000);
          fallbackData.push({
            timestamp: time,
            phLevel: 6.0,
            ecLevel: 2.0
          });
        }
        setData(fallbackData);
        
        // 에러 시 1시간 간격 기본 데이터도 생성
        const fallbackHourlyData = [];
        for (let i = 0; i < 24; i++) {
          const time = new Date(todayMidnight.getTime() + i * 60 * 60 * 1000);
          fallbackHourlyData.push({
            timestamp: time,
            phLevel: 6.0,
            ecLevel: 2.0
          });
        }
        setHourlyData(fallbackHourlyData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [farmCode]);

  const formatTime = (timestamp) => {
    const hours = timestamp.getHours().toString().padStart(2, '0');
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getMetricColor = (metric) => {
    const colors = {
      phLevel: '#4CAF50',
      ecLevel: '#FF9800'
    };
    return colors[metric] || '#666';
  };

  const getMetricLabel = (metric) => {
    const labels = {
      phLevel: '산도 (pH)',
      ecLevel: '전기전도도 (mS/cm)'
    };
    return labels[metric] || metric;
  };

  const getMetricUnit = (metric) => {
    const units = {
      phLevel: 'pH',
      ecLevel: 'mS/cm'
    };
    return units[metric] || '';
  };

  const getYAxisRange = (metric) => {
    // 실제 데이터 기반으로 동적 범위 계산
    if (data.length === 0) {
      const ranges = {
        phLevel: [5, 7],
        ecLevel: [1, 3]
      };
      return ranges[metric] || [0, 100];
    }
    
    const values = data.map(item => item[metric]).filter(val => 
      !isNaN(val) && val !== null && val !== undefined && typeof val === 'number'
    );
    
    if (values.length === 0) {
      const ranges = {
        phLevel: [5, 7],
        ecLevel: [1, 3]
      };
      return ranges[metric] || [0, 100];
    }
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // min, max가 유효한지 확인
    if (isNaN(min) || isNaN(max)) {
      const ranges = {
        phLevel: [5, 7],
        ecLevel: [1, 3]
      };
      return ranges[metric] || [0, 100];
    }
    
    const range = max - min;
    
    // 최소 범위 보장 (너무 작은 변동도 보이도록)
    const minRange = metric === 'phLevel' ? 0.5 : 0.3;
    const padding = Math.max(range * 0.2, minRange * 0.1);
    
    return [min - padding, max + padding];
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="nutrient-chart-loading">
          <div className="loading-spinner"></div>
          <p>양액 데이터를 불러오는 중...</p>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="nutrient-chart-empty">
          <p>데이터가 없습니다.</p>
        </div>
      );
    }

    const chartWidth = 490;
    const chartHeight = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    return (
      <div className="nutrient-chart-container">
        <div className="nutrient-chart-header">
        <h3>양액 공급량 시계열 데이터 (24시간, 3시간 간격)</h3>
        <div className="nutrient-chart-controls">
          {/* <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="24h">24시간</option>
          </select> */}
        </div>
      </div>

      <div className="nutrient-chart-metrics">
        {['phLevel', 'ecLevel'].map(metric => (
          <label key={metric} className="metric-checkbox">
            <input
              type="checkbox"
              checked={selectedMetrics.includes(metric)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedMetrics([...selectedMetrics, metric]);
                } else {
                  setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                }
              }}
            />
            <span style={{ color: getMetricColor(metric) }}>
              {getMetricLabel(metric)}
            </span>
          </label>
        ))}
      </div>

        <div className="nutrient-chart">
          <svg width={chartWidth} height={chartHeight} className="nutrient-svg">
            {/* 배경 그리드 */}
            {[...Array(5)].map((_, i) => (
              <line
                key={`grid-${i}`}
                x1={margin.left}
                y1={margin.top + (i * height / 4)}
                x2={margin.left + width}
                y2={margin.top + (i * height / 4)}
                stroke="#e0e0e0"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            ))}

          {/* X축 시간 라벨 */}
            {data.map((item, i) => {
              const x = margin.left + (i * width / (data.length - 1));
              return (
                                 <text
                   key={`time-${i}`}
                   x={x}
                   y={chartHeight - 10}
                   fontSize="10"
                   fill="#666"
                   textAnchor="middle"
                 >
                   {formatTime(item.timestamp)}
                 </text>
              );
            })}

            {/* 데이터 라인 */}
            {selectedMetrics.map(metric => {
              const [min, max] = getYAxisRange(metric);
              const color = getMetricColor(metric);
              
              console.log(`${metric} 렌더링 - 데이터:`, data.map(item => item[metric]));
              console.log(`${metric} 렌더링 - 범위:`, [min, max]);
              
              const points = data.map((item, i) => {
                const x = margin.left + (i * width / Math.max(data.length - 1, 1));
                const value = item[metric];
                if (isNaN(value) || value === null || value === undefined) {
                  return null; // 유효하지 않은 점은 건너뛰기
                }
                const normalizedValue = (max - min) === 0 ? 0.5 : (value - min) / (max - min);
                const y = margin.top + (1 - normalizedValue) * height;
                return `${x},${y}`;
              }).filter(point => point !== null).join(' ');

              console.log(`${metric} 렌더링 - 포인트:`, points);

              return (
                <g key={metric}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {data.map((item, i) => {
                    const x = margin.left + (i * width / Math.max(data.length - 1, 1));
                    const value = item[metric];
                    if (isNaN(value) || value === null || value === undefined) {
                      return null; // 유효하지 않은 점은 건너뛰기
                    }
                    const normalizedValue = (max - min) === 0 ? 0.5 : (value - min) / (max - min);
                    const y = margin.top + (1 - normalizedValue) * height;
                    
                    return (
                      <circle
                        key={`${metric}-${i}`}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={color}
                        className="data-point"
                        data-value={value}
                        data-unit={getMetricUnit(metric)}
                      />
                    );
                  }).filter(circle => circle !== null)}
                </g>
              );
            })}

            {/* Y축 라벨 제거 - 오른쪽 범례만 유지 */}

            {/* 범례 */}
            <g transform={`translate(10, ${margin.top})`}>
              {selectedMetrics.map((metric, index) => {
                const color = getMetricColor(metric);
                return (
                  <g key={`legend-${metric}`} transform={`translate(0, ${index * 20})`}>
                    <line
                      x1="0"
                      y1="0"
                      x2="20"
                      y2="0"
                      stroke={color}
                      strokeWidth="3"
                    />
                    <text
                      x="30"
                      y="4"
                      fontSize="10"
                      fill={color}
                    >
                      {getMetricLabel(metric)}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* 데이터 테이블 */}
        <div className="nutrient-data-table">
          <h4>최근 데이터</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>시간</th>
                  {selectedMetrics.map(metric => (
                    <th key={metric}>{getMetricLabel(metric)}</th>
                  ))}
                </tr>
              </thead>
                <tbody>
                 {hourlyData.slice(0, 24).map((item, index) => (
                   <tr key={index}>
                     <td>{formatTime(item.timestamp)}</td>
                     {selectedMetrics.map(metric => {
                       const value = item[metric];
                       const displayValue = (isNaN(value) || value === null || value === undefined) 
                         ? 'N/A' 
                         : `${value.toFixed(2)} ${getMetricUnit(metric)}`;
                       return (
                         <td key={metric} style={{ color: getMetricColor(metric) }}>
                           {displayValue}
                         </td>
                       );
                     })}
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nutrient-flow-chart">
      {renderChart()}
    </div>
  );
};

export default NutrientFlowChart; 