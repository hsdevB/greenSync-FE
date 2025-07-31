import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeatherComparisonChart = ({ farmId = 1 }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 기상 데이터 가져오기
        const weatherResponse = await axios.get(`/weather/mapped`);
        const illuminanceResponse = await axios.get(`/sensor/illuminance/${farmId}`);
        
        // 시간대별 데이터 생성 (실제로는 API에서 받아와야 함)
        const timeLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        
        // 임시 데이터 (실제로는 API에서 받아와야 함)
        const insolationData = [0, 0, 2, 8, 6, 1]; // 일사량 (mol/m²/d)
        const illuminanceData = [0, 0, 500, 80000, 60000, 2000]; // 광량 (lux)
        const windSpeedData = [2.1, 1.8, 2.5, 3.2, 2.8, 2.0]; // 풍속 (m/s)
        
        const chartDataConfig = {
          labels: timeLabels,
          datasets: [
            {
              label: '일사량 (mol/m²/d)',
              data: insolationData,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              yAxisID: 'y',
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: '광량 (lux)',
              data: illuminanceData,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              yAxisID: 'y1',
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: '풍속 (m/s)',
              data: windSpeedData,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              yAxisID: 'y2',
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        };
        
        setChartData(chartDataConfig);
      } catch (err) {
        console.error('기상 조건 분석 데이터 조회 오류:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [farmId]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          },
        },
      },
      title: {
        display: true,
        text: '기상 조건 분석',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('일사량')) {
              return `${label}: ${value} mol/m²/d`;
            } else if (label.includes('광량')) {
              return `${label}: ${value.toLocaleString()} lux`;
            } else if (label.includes('풍속')) {
              return `${label}: ${value} m/s`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '시간',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: '일사량 (mol/m²/d)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#f59e0b',
        },
        min: 0,
        max: 10
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: '광량 (lux)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#3b82f6',
          callback: function(value) {
            return (value / 1000).toFixed(0) + 'k';
          }
        },
        min: 0,
        max: 100000
      },
      y2: {
        type: 'linear',
        display: false,
        title: {
          display: true,
          text: '풍속 (m/s)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#10b981',
        },
        min: 0,
        max: 10
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-graph-card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          color: '#666'
        }}>
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-graph-card">
        <div className="dashboard-graph-title">기상 조건 분석</div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          color: '#ef4444'
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-graph-card">
      <div className="dashboard-graph-title">기상 조건 분석</div>
      <div style={{ height: '200px', position: 'relative' }}>
        {chartData && <Line options={options} data={chartData} />}
      </div>
      <div className="dashboard-graph-desc" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '10px',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <span>일사량: 태양광 에너지</span>
        <span>광량: 조도 측정</span>
        <span>풍속: 공기 순환</span>
      </div>
    </div>
  );
};

export default WeatherComparisonChart; 