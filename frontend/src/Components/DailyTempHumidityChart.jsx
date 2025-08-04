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

const DailyTempHumidityChart = ({ farmCode }) => {
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 온도와 습도 데이터를 병렬로 가져오기
        const [tempResponse, humidityResponse] = await Promise.all([
          axios.get(`/chart/temperature/daily/${farmCode}`),
          axios.get(`/chart/Humidity/daily/${farmCode}`)
        ]);
        
        const temperatures = tempResponse.data.data.datasets[0].data;
        const humidities = humidityResponse.data.data.datasets[0].data;
        // 더미 데이터 생성 (API가 실패할 경우를 대비)
        // const generateDummyData = () => {
        //   const baseTemp = 22 + Math.random() * 8; // 22-30도
        //   const baseHumid = 60 + Math.random() * 20; // 60-80%
          
        //   return Array.from({ length: 11 }, (_, i) => ({
        //     temp: baseTemp + (Math.sin(i * 0.5) * 3) + (Math.random() * 2 - 1),
        //     humid: baseHumid + (Math.cos(i * 0.5) * 10) + (Math.random() * 5 - 2.5)
        //   }));
        // };
        
        // const dummyData = generateDummyData();
        // const temperatures = dummyData.map(d => Math.round(d.temp * 10) / 10);
        // const humidities = dummyData.map(d => Math.max(0, Math.min(100, Math.round(d.humid * 10) / 10)));
        
        const timeLabels = ['00시', '01시', '02시', '03시', '04시', '05시', '06시', '07시', '08시', '09시', '10시'];
        
        // Chart.js 데이터 형식으로 변환
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
              fill: true,
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
              fill: true,
            },
          ],
        };
        
        setChartData(chartDataConfig);
        
        // 요약 데이터 생성 - 유효한 데이터만 필터링하여 평균 계산
        const validTemperatures = temperatures.filter(temp => temp !== null && temp !== undefined && !isNaN(temp));
        const validHumidities = humidities.filter(humid => humid !== null && humid !== undefined && !isNaN(humid));
        
        const avgTemp = validTemperatures.length > 0 
          ? (validTemperatures.reduce((a, b) => a + b, 0) / validTemperatures.length).toFixed(1)
          : '0.0';
        const avgHumid = validHumidities.length > 0 
          ? (validHumidities.reduce((a, b) => a + b, 0) / validHumidities.length).toFixed(1)
          : '0.0';
        
        setSummary({
          avgTemp: avgTemp,
          avgHumid: avgHumid,
          maxTemp: validTemperatures.length > 0 ? Math.max(...validTemperatures) : 0,
          minTemp: validTemperatures.length > 0 ? Math.min(...validTemperatures) : 0,
          maxHumid: validHumidities.length > 0 ? Math.max(...validHumidities) : 0,
          minHumid: validHumidities.length > 0 ? Math.min(...validHumidities) : 0
        });
        
      } catch (err) {
        console.error('일일 온습도 데이터 조회 오류:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        // 에러가 발생해도 더미 데이터로 그래프 표시
        // const dummyData = Array.from({ length: 11 }, () => ({
        //   temp: 22 + Math.random() * 8,
        //   humid: 60 + Math.random() * 20
        // }));
        
        // const temperatures = dummyData.map(d => Math.round(d.temp * 10) / 10);
        // const humidities = dummyData.map(d => Math.max(0, Math.min(100, Math.round(d.humid * 10) / 10)));
        
        // const timeLabels = ['00시', '01시', '02시', '03시', '04시', '05시', '06시', '07시', '08시', '09시', '10시'];
        
        // const chartDataConfig = {
        //   labels: timeLabels,
        //   datasets: [
        //     {
        //       label: '온도 (°C)',
        //       data: temperatures,
        //       borderColor: '#ef4444',
        //       backgroundColor: 'rgba(239, 68, 68, 0.1)',
        //       yAxisID: 'y',
        //       tension: 0.4,
        //       pointRadius: 4,
        //       pointHoverRadius: 6,
        //       fill: true,
        //     },
        //     {
        //       label: '습도 (%)',
        //       data: humidities,
        //       borderColor: '#3b82f6',
        //       backgroundColor: 'rgba(59, 130, 246, 0.1)',
        //       yAxisID: 'y1',
        //       tension: 0.4,
        //       pointRadius: 4,
        //       pointHoverRadius: 6,
        //       fill: true,
        //     },
        //   ],
        // };
        
        // setChartData(chartDataConfig);
        
        // const avgTemp = (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1);
        // const avgHumid = (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1);
        
        // setSummary({
        //   avgTemp: avgTemp,
        //   avgHumid: avgHumid,
        //   maxTemp: Math.max(...temperatures),
        //   minTemp: Math.min(...temperatures),
        //   maxHumid: Math.max(...humidities),
        //   minHumid: Math.min(...humidities)
        // });
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [farmCode]);

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
        display: false,
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
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#3b82f6',
          font: {
            size: 10
          }
        },
        min: 0,
        max: 100
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-graph-card">
        {/* <div className="dashboard-graph-title">일일 온/습도 모니터링</div> */}
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

  // 에러가 있어도 그래프는 표시하도록 수정
  if (error) {
    console.warn('Chart error:', error);
  }

  return (
    <div className="dashboard-graph-card">
      <div className="dashboard-graph-title">일일 온/습도 모니터링</div>
      <div style={{ height: '250px', position: 'relative' }}>
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