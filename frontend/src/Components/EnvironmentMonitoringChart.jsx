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

const EnvironmentMonitoringChart = ({ farmId = 1 }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 여러 센서 데이터를 병렬로 가져오기
        const [tempResponse, humidityResponse, co2Response] = await Promise.all([
          axios.get(`/sensor/temperature/${farmId}`),
          axios.get(`/sensor/humidity/${farmId}`),
          axios.get(`/sensor/carbonDioxide/${farmId}`)
        ]);
        
        // 시간대별 데이터 생성 (실제로는 API에서 받아와야 함)
        const timeLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        
        // 임시 데이터 (실제로는 API에서 받아와야 함)
        const temperatures = [20, 22, 24, 26, 25, 23];
        const humidities = [65, 68, 62, 58, 60, 63];
        const co2Levels = [400, 420, 450, 480, 460, 430];
        
        const chartDataConfig = {
          labels: timeLabels,
          datasets: [
            {
              label: '온도 (°C)',
              data: temperatures,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              yAxisID: 'y',
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: '습도 (%)',
              data: humidities,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              yAxisID: 'y1',
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'CO₂ (ppm)',
              data: co2Levels,
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
        console.error('환경 모니터링 데이터 조회 오류:', err);
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
        text: '환경 조건 통합 모니터링',
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
        },
        min: 0,
        max: 40
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
        },
        ticks: {
          color: '#3b82f6',
        },
        min: 0,
        max: 100
      },
      y2: {
        type: 'linear',
        display: false,
        title: {
          display: true,
          text: 'CO₂ (ppm)',
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
        min: 300,
        max: 600
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
        <div className="dashboard-graph-title">환경 조건 통합 모니터링</div>
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
      <div className="dashboard-graph-title">환경 조건 통합 모니터링</div>
      <div style={{ height: '200px', position: 'relative' }}>
        {chartData && <Line options={options} data={chartData} />}
      </div>
    </div>
  );
};

export default EnvironmentMonitoringChart; 