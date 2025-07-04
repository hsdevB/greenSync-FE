import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { Thermometer, Activity, Droplets, Sun, Zap } from "lucide-react";
import "./DashBoardCards.css";

const waterData = [
  { time: "0:00", value: 30 }, { time: "2:00", value: 50 }, { time: "4:00", value: 40 },
  { time: "6:00", value: 60 }, { time: "8:00", value: 80 }, { time: "10:00", value: 70 },
  { time: "12:00", value: 90 }, { time: "14:00", value: 100 }, { time: "16:00", value: 110 },
  { time: "18:00", value: 80 }, { time: "20:00", value: 60 }, { time: "22:00", value: 40 }
];

const nutrientDayData = [
  { day: "1일", value: 80 }, { day: "2일", value: 100 }, { day: "3일", value: 70 },
  { day: "4일", value: 120 }, { day: "5일", value: 110 }, { day: "6일", value: 90 }, { day: "7일", value: 95 }
];

const tempHumidData = [
  { time: "0:00", temp: 21, humid: 60 },
  { time: "4:00", temp: 20, humid: 62 },
  { time: "8:00", temp: 22, humid: 58 },
  { time: "12:00", temp: 24, humid: 55 },
  { time: "16:00", temp: 25, humid: 53 },
  { time: "20:00", temp: 23, humid: 61 }
];

const nutrientHourData = [
  { time: "0:00", value: 10 }, { time: "4:00", value: 20 }, { time: "8:00", value: 18 },
  { time: "12:00", value: 19 }, { time: "16:00", value: 15 }, { time: "20:00", value: 13 }
];

const growthData = [
  { value: 8 }, { value: 8 }, { value: 8 }, { value: 8 }, { value: 8 }, { value: 8 }, { value: 8 }, { value: 8 }
];
const temperatureData = [
  { time: "00:00", temp: 15 }, { time: "04:00", temp: 18 }, { time: "08:00", temp: 20 }, { time: "12:00", temp: 22 }, { time: "16:00", temp: 25 }, { time: "20:00", temp: 24 }, { time: "24:00", temp: 20 }
];
const humidityPieData = [
  { value: 55, color: "#3b82f6" }, { value: 45, color: "#e5e7eb" }
];
const ecValue = 1.8;
const phValue = 6.2;

const DashBoardCards = () => (
  <div>
    {/* 상단 카드들 */}
    <div className="dashboard-cards-row">
      {/* 조도 */}
      <div className="dashboard-card">
        <div className="dashboard-card-value orange">904</div>
        <div className="dashboard-card-unit">lux</div>
        <div className="dashboard-card-label">조도</div>
      </div>
      {/* CO2 */}
      <div className="dashboard-card">
        <div className="dashboard-card-value green">479</div>
        <div className="dashboard-card-unit">ppm</div>
        <div className="dashboard-card-label">CO2</div>
      </div>
      {/* 습윤 */}
      <div className="dashboard-card">
        <div className="dashboard-card-value">습윤</div>
        <div className="dashboard-card-unit">토양 상태</div>
      </div>
      {/* 생육 예측 차트 */}
      <div className="dashboard-card">
        <div className="dashboard-predict-label">생육 예측: 94.2%</div>
        <div className="dashboard-predict-bad">● 부실생 예측: 3.1%</div>
        <div className="dashboard-predict-good">● 성장 속도: 예상보다 8% 빠름</div>
        <ResponsiveContainer width="100%" height={60}>
          <BarChart data={growthData}>
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
        <button className="dashboard-predict-btn">새 품종 시뮬레이션</button>
      </div>
    </div>
    {/* 메인 차트 영역 - 2분할로 넓게 */}
    <div className="dashboard-main-charts-row">
      {/* 온도 모니터링 */}
      <div className="dashboard-card">
        <div className="dashboard-card-section">
          <Thermometer className="dashboard-card-icon red" />
          <h3 className="dashboard-card-title">온도 모니터링</h3>
        </div>
        <div className="dashboard-card-value red">24.7°C</div>
        <div className="dashboard-card-status">최적</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={temperatureData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis domain={[10, 30]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* 전기전도도 + pH 수치 합친 카드 */}
      <div className="dashboard-card">
        {/* 전기전도도 */}
        <div className="dashboard-card-section" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Zap className="dashboard-card-icon yellow" />
            <h3 className="dashboard-card-title">전기전도도</h3>
          </div>
        </div>
        <div className="dashboard-card-status">EC 값</div>
        <div className="dashboard-gauge-wrap large">
          <svg className="dashboard-gauge large" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" stroke="#e5e7eb" strokeWidth="3" fill="none" />
            <circle cx="16" cy="16" r="14" stroke="#f59e0b" strokeWidth="3" fill="none" strokeDasharray={`${(ecValue / 3) * 87.96} 87.96`} />
          </svg>
          <div className="dashboard-gauge-center large">
            <div className="dashboard-gauge-value yellow">{ecValue}</div>
            <div className="dashboard-gauge-label">mS/cm</div>
          </div>
        </div>
        <div className="dashboard-gauge-desc">
          <div>EC 수치</div>
          <div className="dashboard-gauge-range">적정: 1.2-2.0</div>
        </div>
        {/* pH 수치 */}
        <div className="dashboard-card-section" style={{ marginTop: "18px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="dashboard-ph-dot large"></div>
            <h3 className="dashboard-card-title">pH 수치</h3>
          </div>
        </div>
        <div className="dashboard-card-status">산도 측정</div>
        <div className="dashboard-gauge-wrap large">
          <svg className="dashboard-gauge large" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" stroke="#e5e7eb" strokeWidth="3" fill="none" />
            <circle cx="16" cy="16" r="14" stroke="#10b981" strokeWidth="3" fill="none" strokeDasharray={`${((phValue - 5) / 3) * 87.96} 87.96`} />
          </svg>
          <div className="dashboard-gauge-center large">
            <div className="dashboard-gauge-value green">{phValue}</div>
            <div className="dashboard-gauge-label">pH</div>
          </div>
        </div>
        <div className="dashboard-gauge-desc">
          <div>pH 레벨</div>
          <div className="dashboard-gauge-range">적정: 5.5-7.5</div>
        </div>
      </div>
    </div>
    {/* 하단 카드들 */}
    <div className="dashboard-cards-row">
      {/* 습도 관리 */}
      <div className="dashboard-card">
        <div className="dashboard-card-section">
          <Droplets className="dashboard-card-icon blue" />
          <h3 className="dashboard-card-title">습도 관리</h3>
        </div>
        <div className="dashboard-card-value blue">55%</div>
        <div className="dashboard-card-status">습도</div>
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie data={humidityPieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value">
              {humidityPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="dashboard-card-desc">목표 습도 60-70%</div>
      </div>
      {/* 광량 */}
      <div className="dashboard-card">
        <div className="dashboard-card-section">
          <Sun className="dashboard-card-icon yellow" />
          <h3 className="dashboard-card-title">광량</h3>
        </div>
        <div className="dashboard-card-status">조도 센서</div>
        <div className="dashboard-card-value yellow">850</div>
        <div className="dashboard-card-status">μmol/m²/s</div>
        <div className="dashboard-card-desc">DLI 18.5 mol/m²/d</div>
        <div className="dashboard-bar-bg"><div className="dashboard-bar-fill"></div></div>
      </div>
    </div>
    {/* 기존 하단 그래프들(일일 총 급수량 등) */}
    <div className="dashboard-graph-grid">
      {/* 일일 총 급수량 */}
      <div className="dashboard-graph-card">
        <div className="dashboard-graph-title">일일 총 급수량</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={waterData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* 일일 양액 급여량 */}
      <div className="dashboard-graph-card">
        <div className="dashboard-graph-title">일일 양액 급여량</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={nutrientDayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Bar dataKey="value" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* 일일 온/습도 모니터링 */}
      <div className="dashboard-graph-card">
        <div className="dashboard-graph-title">일일 온/습도 모니터링</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={tempHumidData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" fontSize={10} />
            <YAxis yAxisId="left" fontSize={10} />
            <YAxis yAxisId="right" orientation="right" fontSize={10} />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="humid" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <div className="dashboard-graph-desc">
          평균 온도 <span style={{ color: "#ef4444" }}>23.8°C</span> / 평균 습도 <span style={{ color: "#3b82f6" }}>60.3%</span>
        </div>
      </div>
      {/* 일일 양액 급여량 (시간별) */}
      <div className="dashboard-graph-card">
        <div className="dashboard-graph-title">일일 양액 급여량</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={nutrientHourData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Bar dataKey="value" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
        <div className="dashboard-graph-desc">
          일평균 양액량 <span style={{ color: "#22c55e" }}>88.0L</span> / 평균 EC <span style={{ color: "#3b82f6" }}>1.87</span> / 평균 pH <span style={{ color: "#10b981" }}>6.18</span>
        </div>
      </div>
    </div>
  </div>
);

export default DashBoardCards;