import { Line } from 'react-chartjs-2';

const YieldPredictionChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [{
      label: '예측 수확량 (kg)',
      data: data.map(item => item.yield),
      borderColor: 'green',
      tension: 0.4,
    }]
  };

  return <Line data={chartData} />;
};

export default YieldPredictionChart;