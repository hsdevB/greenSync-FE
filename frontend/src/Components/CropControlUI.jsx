import React, { useState } from 'react';
import './CropControlUI.css';
import YieldPredictionChart from './YieldPredictionChart';

const CropControlUI = () => {
  const [crop, setCrop] = useState("토마토");
  const [inputData, setInputData] = useState({
    온도: 24,
    습도: 70,
    CO2: 400,
    조도: 30000
  });
  const [prediction, setPrediction] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: parseFloat(value) });
  };

  const predictYield = async () => {
    const res = await fetch(`/api/predict?crop=${crop}`, {
      method: "POST",
      body: JSON.stringify(inputData),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    setPrediction(data);
  };

  return (
    <div className="crop-ui-container">
      <h2 className="title">작물 제어 및 수확 예측 시스템</h2>
      <div className="form-group">
        <label>작물 선택</label>
        <select value={crop} onChange={e => setCrop(e.target.value)}>
          <option>토마토</option>
          <option>파프리카</option>
        </select>
      </div>

      <div className="form-grid">
        <div className="form-item">
          <label>온도 (℃)</label>
          <input type="number" name="온도" value={inputData.온도} onChange={handleInputChange} />
        </div>
        <div className="form-item">
          <label>습도 (%)</label>
          <input type="number" name="습도" value={inputData.습도} onChange={handleInputChange} />
        </div>
        <div className="form-item">
          <label>CO2 (ppm)</label>
          <input type="number" name="CO2" value={inputData.CO2} onChange={handleInputChange} />
        </div>
        <div className="form-item">
          <label>조도 (lux)</label>
          <input type="number" name="조도" value={inputData.조도} onChange={handleInputChange} />
        </div>
      </div>

      <button className="predict-button" onClick={predictYield}>수확량 예측</button>

      {prediction && (
        <div className="result-section">
          <h3>예측 수확량: {prediction.predicted.toFixed(2)} kg</h3>
          <YieldPredictionChart data={prediction.chartData} />
        </div>
      )}
    </div>
  );
};

export default CropControlUI;
