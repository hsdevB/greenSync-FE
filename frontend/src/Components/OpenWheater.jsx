import React, { useEffect, useState } from "react";
import axios from "axios";
const BACKEND_IP_ADDRESS = '192.168.0.33';
export default function OpenWeather() {
  const [weather, setWeather] = useState(null);

  // 날씨 데이터 가져오기
  useEffect(() => {
    axios.get(`http://${BACKEND_IP_ADDRESS}:3000/weather/raw`)
      .then(response => {
        const data = response.data;
        setWeather({
          main: data.weatherInfo?.main || "데이터가 없습니다", // 날씨 상태
          desc: data.weatherInfo?.description || "데이터가 없습니다", // 날씨 설명
          icon: data.weatherInfo?.icon || "데이터가 없습니다", // 날씨 아이콘
          temp: data.weatherInfo?.temperature || "데이터가 없습니다", // 온도
          rain: data.weatherInfo?.rainInfo || 0, // 1시간 강수량
        });
      })
      .catch(error => {
        console.error('Weather API 오류:', error);
      });
  }, []);

  // 날씨 아이콘을 이모티콘으로 변환하는 함수
  const getWeatherEmoji = (weatherMain) => {
    switch (weatherMain?.toLowerCase()) {
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'rain':
        return '🌧️';
      case 'snow':
        return '❄️';
      case 'thunderstorm':
        return '⛈️';
      case 'drizzle':
        return '🌦️';
      case 'mist':
      case 'fog':
        return '🌫️';
      default:
        return '🌤️';
    }
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-section">
        <div style={{ display: 'flex', alignItems: 'center'}}>
          {weather?.icon ? (
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt="날씨 아이콘"
              style={{ 
                width: 32, 
                height: 32,
                display: "block"
              }}
              onError={(e) => {
                //console.log('날씨 아이콘 로드 실패:', e.target.src);
                e.target.style.display = 'none';
                // 아이콘 로드 실패 시 이모티콘 표시
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <span 
            style={{ 
              fontSize: 24, 
              color: "#3b82f6", 
              display: weather?.icon ? 'none' : 'block'
            }}
          >
            {getWeatherEmoji(weather?.main)}
          </span>
        </div>
        <h3 className="dashboard-card-title">현재 날씨</h3>
      </div>
      <div className="dashboard-card-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#222' }}>
        {weather?.main || "--"}
      </div>
      <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
        {weather?.temp !== undefined ? `${weather.temp.toFixed(1)} ℃` : ''}
      </div>
      <div className="dashboard-card-desc">
        {weather?.desc || "기상청 API 연동 필요"}
      </div>
    </div>
  );
}