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
        setWeather({
          main: data.weather?.[0]?.main, // 날씨 상태
          desc: data.weather?.[0]?.description, // 날씨 설명
          icon: data.weather?.[0]?.icon, // 날씨 아이콘
          temp: data.main?.temp, // 온도
          rain: data.rain?.['1h'] ?? 0, // 1시간 강수량
        });
      });
  }, []);

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-section">
        {weather?.icon ? (
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt="날씨 아이콘"
            style={{ width: 36, height: 36, marginRight: 8, verticalAlign: "middle" }}
          />
        ) : (
          <span style={{ fontSize: 32, color: "#3b82f6", marginRight: 8 }}>☁️</span>
        )}
        <h3 className="dashboard-card-title">현재 날씨</h3>
      </div>
      <div className="dashboard-card-value">
        {weather?.main || "로딩중"}
      </div>
      <div className="dashboard-card-desc">
        {weather?.desc || "기상청 API 연동 필요"}
      </div>
    </div>
  );
}