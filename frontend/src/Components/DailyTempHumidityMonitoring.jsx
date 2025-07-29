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
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import './DailyTempHumidityMonitoring.css';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DailyTempHumidityMonitoring = ({ farmId = 1 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/daily-temp-humidity-monitoring/${farmId}`);
        
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError('데이터를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('일일 온습도 모니터링 데이터 조회 오류:', err);
        setError('서버 연결 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [farmId]);

  if (loading) {
    return (
      <div className="daily-monitoring-card">
        <div className="daily-monitoring-title">일일 온습도 모니터링</div>
        <div className="daily-monitoring-loading">
          <div className="loading-spinner"></div>
          <div>데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-monitoring-card">
        <div className="daily-monitoring-title">일일 온습도 모니터링</div>
        <div className="daily-monitoring-error">
          <div>⚠️ {error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="daily-monitoring-card">
        <div className="daily-monitoring-title">일일 온습도 모니터링</div>
        <div className="daily-monitoring-error">
          <div>데이터가 없습니다.</div>
        </div>
      </div>
    );
  }

  // Chart.js 데이터 구성
  const chartData = {
    labels: data.temperature.map(item => item.time),
    datasets: [
      {
        label: '온도 (°C)',
        data: data.temperature.map(item => item.value),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: '습도 (%)',
        data: data.humidity.map(item => item.value),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

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
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `시간: ${context[0].label}`;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('온도')) {
              return `${label}: ${value}°C`;
            } else if (label.includes('습도')) {
              return `${label}: ${value}%`;
            }
            return `${label}: ${value}`;
          }
        }
      }
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
        ticks: {
          maxTicksLimit: 12,
          font: {
            size: 10
          }
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: '온도 (°C)',
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
          color: '#ef4444',
          font: {
            size: 10
          }
        },
        min: Math.min(...data.temperature.map(item => item.value)) - 2,
        max: Math.max(...data.temperature.map(item => item.value)) + 2
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: '습도 (%)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#3b82f6',
          font: {
            size: 10
          }
        },
        min: Math.min(...data.humidity.map(item => item.value)) - 5,
        max: Math.max(...data.humidity.map(item => item.value)) + 5
      }
    }
  };

  return (
    <div className="daily-monitoring-card">
      <div className="daily-monitoring-header">
        <div className="daily-monitoring-title">일일 온습도 모니터링</div>
        <div className="daily-monitoring-stats">
          <div className="stat-item">
            <span className="stat-label">평균 온도:</span>
            <span className="stat-value temp">{data.stats.temperature.average}°C</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">평균 습도:</span>
            <span className="stat-value humid">{data.stats.humidity.average}%</span>
          </div>
        </div>
      </div>
      
      <div className="daily-monitoring-chart">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="daily-monitoring-summary">
        <div className="summary-item">
          <span className="summary-label">최고 온도:</span>
          <span className="summary-value temp">{data.stats.temperature.max}°C</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">최저 온도:</span>
          <span className="summary-value temp">{data.stats.temperature.min}°C</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">최고 습도:</span>
          <span className="summary-value humid">{data.stats.humidity.max}%</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">최저 습도:</span>
          <span className="summary-value humid">{data.stats.humidity.min}%</span>
        </div>
      </div>
    </div>
  );
};

export default DailyTempHumidityMonitoring; 