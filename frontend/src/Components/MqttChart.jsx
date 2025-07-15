import React, { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, CategoryScale } from "chart.js";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale);

const MqttChart = ({ topic = "farm/001/sensor/temperature" }) => {
  const [dataPoints, setDataPoints] = useState([]);
  const [labels, setLabels] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const mqttUrl = "ws://localhost:9001";
    const options = {
      clean: true,
      connectTimeout: 4000,
      clientId: `mqtt_chart_${Math.random().toString(16).slice(3)}`,
    };
    const client = mqtt.connect(mqttUrl, options);
    clientRef.current = client;

    client.on("connect", () => {
      setIsConnected(true);
      client.subscribe(topic);
    });

    client.on("message", (recvTopic, message) => {
      if (recvTopic === topic) {
        const value = parseFloat(message.toString());
        setDataPoints((prev) => [...prev.slice(-19), value]);
        setLabels((prev) => [
          ...prev.slice(-19),
          new Date().toLocaleTimeString().slice(3, 8),
        ]);
      }
    });

    return () => {
      client.end();
    };
  }, [topic]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "온도(℃)",
        data: dataPoints,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.2,
      },
    ],
  };

  return (
    <div style={{ width: 500, margin: "0 auto" }}>
      <h3>실시간 온도 차트 (MQTT)</h3>
      <p>MQTT 연결 상태: {isConnected ? "✅ 연결됨" : "❌ 끊김"}</p>
      <Line data={chartData} />
    </div>
  );
};

export default MqttChart;