// DailyRiskChart.js
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function DailyRiskChart({ dataPoints }) {
  if (!dataPoints) {
    return null; // אפשר גם להחזיר ספינר/טקסט זמני
  }
  const data = {
    labels: dataPoints.map(item => item.date),
    datasets: [
      {
        label: 'Sensitive Messages per Day',
        data: dataPoints.map(item => item.sensitive),
        fill: false,
        borderColor: '#ff6384',
        backgroundColor: '#ff6384',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="mt-4">
      <h5 className="mb-3">Daily Sensitive Message Trend</h5>
      <Line data={data} />
    </div>
  );
}

export default DailyRiskChart;
