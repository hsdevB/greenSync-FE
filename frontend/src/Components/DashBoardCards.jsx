import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
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

const DashBoardCards = () => (
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
);

export default DashBoardCards;