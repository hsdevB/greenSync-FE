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

const DailyTempHumidityChart = ({ farmId = 1 }) => {
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/daily-temp-humidity/${farmId}`);
        
        if (response.data.success) {
          const { data, summary } = response.data;
          
          // Chart.js 데이터 형식으로 변환
          const chartDataConfig = {
            labels: data.map(item => item.time),
            datasets: [
              {
                label: '온도 (°C)',
                data: data.map(item => item.temp),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                yAxisID: 'y',
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
              {
                label: '습도 (%)',
                data: data.map(item => item.humid),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          };
          
          setChartData(chartDataConfig);
          setSummary(summary);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('일일 온습도 데이터 조회 오류:', err);
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
          },
        },
      },
      title: {
        display: true,
        text: '일일 온/습도 모니터링',
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
            if (label.includes('온도')) {
              return `${label}: ${value}°C`;
            } else if (label.includes('습도')) {
              return `${label}: ${value}%`;
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
          },
        },
        grid: {
          display: false,
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
          },
        },
        min: 15,
        max: 30,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#ef4444',
        },
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
          },
        },
        min: 40,
        max: 80,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#3b82f6',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="dashboard-graph-card">
        <div className="dashboard-graph-title">일일 온/습도 모니터링</div>
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
        <div className="dashboard-graph-title">일일 온/습도 모니터링</div>
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
      <div className="dashboard-graph-title">일일 온/습도 모니터링</div>
      <div style={{ height: '200px', position: 'relative' }}>
        {chartData && <Line options={options} data={chartData} />}
      </div>
      {summary && (
        <div className="dashboard-graph-desc">
          평균 온도 <span style={{ color: "#ef4444" }}>{summary.avgTemp}°C</span> / 
          평균 습도 <span style={{ color: "#3b82f6" }}>{summary.avgHumid}%</span>
        </div>
      )}
    </div>
  );
};

export default DailyTempHumidityChart; 