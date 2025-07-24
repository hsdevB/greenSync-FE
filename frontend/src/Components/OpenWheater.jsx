import React, { useEffect, useState } from "react";

const OPENWEATHER_API_KEY = "58ae922a8ae59948dca89a2e0120c426";
const CITY = "Seoul";
const LANG = "kr";
const UNITS = "metric";

export default function OpenWeather() {
  const [weather, setWeather] = useState(null);

  // 날씨 데이터 가져오기
  useEffect(() => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${OPENWEATHER_API_KEY}&lang=${LANG}&units=${UNITS}`)
      .then(res => res.json())
      .then(data => {
        console.log('OpenWeather API 응답:', data);
        setWeather({
          main: data.weather?.[0]?.main, // 날씨 상태
          desc: data.weather?.[0]?.description, // 날씨 설명
          icon: data.weather?.[0]?.icon, // 날씨 아이콘
          temp: data.main?.temp, // 온도
          rain: data.rain?.['1h'] ?? 0, // 1시간 강수량
        });
      })
      .catch(error => {
        console.error('OpenWeather API 오류:', error);
      });
  }, []);

  return (
    <div className="dashboard-card" style={{ minHeight: 180 }}>
      <div className="dashboard-card-section">
        {weather?.icon ? (
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt="날씨 아이콘"
              style={{ 
                width: 32, 
                height: 32,
                display: "block"
              }}
              onError={(e) => {
                console.log('날씨 아이콘 로드 실패:', e.target.src);
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <span style={{ fontSize: 24, color: "#3b82f6", marginRight: 8 }}>☁️</span>
        )}
        <h3 className="dashboard-card-title">현재 날씨</h3>
      </div>
      <div className="dashboard-card-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#222' }}>
        {weather?.main || "--"}
      </div>
      <div className="dashboard-card-unit" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '4px' }}>
        {weather?.temp !== undefined ? `${weather.temp} ℃` : ''}
      </div>
      <div className="dashboard-card-desc">
        {weather?.desc || "기상청 API 연동 필요"}
      </div>
      <div className="dashboard-gradient-bar" style={{ 
        height: '4px', 
        borderRadius: '2px', 
        marginTop: '8px',
        width: '100%'
      }}></div>
    </div>
  );
}