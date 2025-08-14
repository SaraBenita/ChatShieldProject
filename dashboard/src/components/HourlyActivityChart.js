// HourlyActivityChart.js
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function HourlyActivityChart({ hourlyData }) {
    if (!hourlyData) {
    return null; // אפשר גם להחזיר ספינר/טקסט זמני
  }
  const data = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Messages by Hour',
        data: hourlyData,
        backgroundColor: '#36a2eb',
      },
    ],
  };

  return (
    <div className="mt-4">
      <h5 className="mb-3">Hourly Message Activity</h5>
      <Bar data={data} />
    </div>
  );
}

export default HourlyActivityChart;
