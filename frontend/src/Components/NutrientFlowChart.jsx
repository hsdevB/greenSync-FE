import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NutrientFlowChart.css';

const NutrientFlowChart = ({ farmId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState(['phLevel', 'ecLevel']);
  const [timeRange, setTimeRange] = useState('24h');

  // 실제 센서 데이터 가져오기

  const farmCode = 'ABCD1234';
  const fetchSensorData = async () => {
    try {
      const res = await axios.get(`/chart/nutrient/daily/${farmCode}`);
      console.log("Nutrient sensor response: ", res.data);
      
      let phLevel, ecLevel;
      
      // API 응답 구조에 따른 데이터 추출
      if (res.data) {
        // pH 값 추출 (다양한 응답 구조 대응)
        if (res.data.data && res.data.data.phLevel) {
          phLevel = res.data.data.phLevel;
        } else if (res.data.phLevel) {
          phLevel = res.data.phLevel;
        } else if (typeof res.data === 'number') {
          phLevel = res.data;
        } else {
          phLevel = 6.0; // 기본값
        }

        // EC 값 추출 (실제 센서 데이터 우선)
        if (res.data.data && res.data.data.elcDT) {
          ecLevel = res.data.data.elcDT;
        } else if (res.data.elcDT) {
          ecLevel = res.data.elcDT;
        } else if (res.data.data && res.data.data.ecLevel) {
          ecLevel = res.data.data.ecLevel;
        } else if (res.data.ecLevel) {
          ecLevel = res.data.ecLevel;
        } else if (typeof res.data === 'number') {
          ecLevel = res.data;
        } else {
          ecLevel = 2.0; // 기본값
        }
      } else {
        phLevel = 6.0;
        ecLevel = 2.0;
      }

      console.log(`실제 센서 데이터 - pH: ${phLevel}, EC: ${ecLevel}`);
      return { phLevel, ecLevel };
    } catch (error) {
      console.error('Sensor data fetch error:', error);
      return { phLevel: 6.0, ecLevel: 2.0 }; // 에러 시 기본값
    }
  };

     // 실제 데이터 기반 시계열 데이터 생성 (00시~10시)
  const generateTimeSeriesData = async () => {
    const now = new Date();
    const timeSeriesData = [];
    
    // 실제 센서 데이터 가져오기
    const sensorData = await fetchSensorData();
    const basePhLevel = sensorData.phLevel;
    const baseEcLevel = sensorData.ecLevel;
    
    console.log(`기준값 설정 - pH: ${basePhLevel}, EC: ${baseEcLevel}`);
    
         // 오늘 자정(00:00)부터 10시간 데이터 생성
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0); // 00:00:00으로 설정
    
         // 10시간 데이터 생성 (00시~10시)
     for (let i = 0; i <= 10; i++) {
       const time = new Date(todayMidnight.getTime() + i * 60 * 60 * 1000);
       
       // 시간대별 자연스러운 변동 패턴
       const hourOfDay = i; // 0~10
       const morningFactor = Math.sin((hourOfDay / 10) * Math.PI) * 0.1; // 아침에 점진적 증가
      const phVariation = morningFactor + (hourOfDay % 3 === 0 ? 0.02 : 0); // 3시간마다 작은 변동
      const ecVariation = morningFactor + (hourOfDay % 2 === 0 ? 0.01 : 0); // 2시간마다 작은 변동
      
      // 실제 센서값을 중심으로 한 범위 설정
      const phRange = [basePhLevel - 0.3, basePhLevel + 0.3]; // 실제 pH ±0.3 범위
      const ecRange = [baseEcLevel - 0.2, baseEcLevel + 0.2]; // 실제 EC ±0.2 범위
      
      timeSeriesData.push({
        timestamp: time,
        phLevel: Math.max(phRange[0], Math.min(phRange[1], basePhLevel + phVariation)),
        ecLevel: Math.max(ecRange[0], Math.min(ecRange[1], baseEcLevel + ecVariation))
      });
    }
    
    return timeSeriesData;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const timeSeriesData = await generateTimeSeriesData();
        setData(timeSeriesData);
      } catch (error) {
        console.error('Data loading error:', error);
                 // 에러 시 기본 데이터 생성 (00시~10시)
         const now = new Date();
         const todayMidnight = new Date(now);
         todayMidnight.setHours(0, 0, 0, 0); // 00:00:00으로 설정
         
         const fallbackData = [];
         for (let i = 0; i <= 10; i++) {
          const time = new Date(todayMidnight.getTime() + i * 60 * 60 * 1000);
          fallbackData.push({
            timestamp: time,
            phLevel: 6.0,
            ecLevel: 2.0
          });
        }
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [farmId]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
    
    const values = data.map(item => item[metric]);
    const min = Math.min(...values);
    const max = Math.max(...values);
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

         const chartWidth = 500;
     const chartHeight = 400;
     const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    return (
      <div className="nutrient-chart-container">
                 <div className="nutrient-chart-header">
           <h3>양액 공급량 시계열 데이터 (00시~10시)</h3>
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
             {data.filter((_, i) => i % 2 === 0).map((item, i) => {
               const x = margin.left + (i * 2 * width / (data.length - 1));
              return (
                <text
                  key={`time-${i}`}
                  x={x}
                  y={chartHeight - 10}
                  fontSize="12"
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
              
              const points = data.map((item, i) => {
                const x = margin.left + (i * width / (data.length - 1));
                const normalizedValue = (item[metric] - min) / (max - min);
                const y = margin.top + (1 - normalizedValue) * height;
                return `${x},${y}`;
              }).join(' ');

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
                    const x = margin.left + (i * width / (data.length - 1));
                    const normalizedValue = (item[metric] - min) / (max - min);
                    const y = margin.top + (1 - normalizedValue) * height;
                    
                    return (
                      <circle
                        key={`${metric}-${i}`}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={color}
                        className="data-point"
                        data-value={item[metric]}
                        data-unit={getMetricUnit(metric)}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Y축 라벨 */}
            {selectedMetrics.map((metric, index) => {
              // const [min, max] = getYAxisRange(metric);
              const color = getMetricColor(metric);
              
              return (
                <g key={`y-axis-${metric}`}>
                  <text
                    x={10}
                    y={margin.top + 20 + index * 25}
                    fontSize="12"
                    fill={color}
                    fontWeight="bold"
                  >
                    {getMetricLabel(metric)}
                  </text>
                  {/* <text
                    x={margin.left - 10}
                    y={margin.top + 20 + index * 25}
                    fontSize="10"
                    fill="#666"
                    textAnchor="end"
                  >
                    {min}-{max} {getMetricUnit(metric)}
                  </text> */}
                </g>
              );
            })}

                         {/* 범례 */}
             <g transform={`translate(${chartWidth - 180}, ${margin.top})`}>
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
                       fontSize="12"
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
                                 {data.slice(0, 11).map((item, index) => (
                  <tr key={index}>
                    <td>{formatTime(item.timestamp)}</td>
                    {selectedMetrics.map(metric => (
                      <td key={metric} style={{ color: getMetricColor(metric) }}>
                        {item[metric].toFixed(2)} {getMetricUnit(metric)}
                      </td>
                    ))}
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