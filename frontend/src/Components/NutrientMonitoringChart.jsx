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

const NutrientMonitoringChart = ({ farmId = 1 }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 영양분 데이터 가져오기
        const nutrientResponse = await axios.get(`/sensor/nutrient/${farmId}`);
        
        // 시간대별 데이터 생성 (실제로는 API에서 받아와야 함)
        const timeLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        
        // 임시 데이터 (실제로는 API에서 받아와야 함)
        const phValues = [6.2, 6.1, 6.3, 6.0, 6.2, 6.1];
        const ecValues = [1.8, 1.9, 1.7, 2.0, 1.8, 1.9];
        
        const chartDataConfig = {
          labels: timeLabels,
          datasets: [
            {
              label: 'pH',
              data: phValues,
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              yAxisID: 'y',
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'EC (mS/cm)',
              data: ecValues,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              yAxisID: 'y1',
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        };
        
        setChartData(chartDataConfig);
      } catch (err) {
        console.error('영양분 모니터링 데이터 조회 오류:', err);
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
        text: '영양분 관리 모니터링',
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
            if (label.includes('pH')) {
              return `${label}: ${value}`;
            } else if (label.includes('EC')) {
              return `${label}: ${value} mS/cm`;
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
          text: 'pH',
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
          color: '#8b5cf6',
        },
        min: 5.5,
        max: 7.0
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'EC (mS/cm)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#f59e0b',
        },
        min: 1.0,
        max: 3.0
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
        <div className="dashboard-graph-title">영양분 관리 모니터링</div>
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
      <div className="dashboard-graph-title">영양분 관리 모니터링</div>
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
        <span>pH 최적 범위: 5.5-6.5</span>
        <span>EC 최적 범위: 1.5-2.5 mS/cm</span>
      </div>
    </div>
  );
};

export default NutrientMonitoringChart; 