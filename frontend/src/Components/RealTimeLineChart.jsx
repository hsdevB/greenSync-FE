import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import useIotWebSocket from "../api/UseIotWebSocket";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WS_URL = "ws://192.168.0.33:3001"; // 실제 WebSocket 주소로 변경

export default function RealTimeLineChart() {
  const iotData = useIotWebSocket(WS_URL);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (iotData && iotData.inTp !== undefined && iotData.inHd !== undefined && iotData.acSlrdQy !== undefined) {
      setChartData(prev => [
        ...prev.slice(-19), // 최근 20개만 유지
        {
          time: new Date().toLocaleTimeString(),
          temperature: iotData.inTp,
          humidity: iotData.inHd,
          illuminance: iotData.acSlrdQy,
        }
      ]);
    }
  }, [iotData]);

  const data = {
    labels: chartData.map(d => d.time),
    datasets: [
      {
        label: "온도(°C)",
        data: chartData.map(d => d.temperature),
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
        fill: false,
        tension: 0.3,
      },
      {
        label: "습도(%)",
        data: chartData.map(d => d.humidity),
        borderColor: "rgba(54,162,235,1)",
        backgroundColor: "rgba(54,162,235,0.2)",
        fill: false,
        tension: 0.3,
      },
      {
        label: "조도(μmol/m²/s)",
        data: chartData.map(d => d.illuminance),
        borderColor: "rgba(255,206,86,1)",
        backgroundColor: "rgba(255,206,86,0.2)",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ width: "100%", maxWidth: 700 }}>
      <Line data={data} />
    </div>
  );
} 