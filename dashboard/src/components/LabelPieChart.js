// LabelPieChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

function LabelPieChart({ labelsData }) {
    if (!labelsData) {
    return null; // אפשר גם להחזיר ספינר/טקסט זמני
  }
  const categoryNames = {
    "Personal Information": "Personal Info",
    "Location/Activity": "Location / Activity",
    "Financial Information": "Financial Info",
    "Social Media Activity": "Social Media"
  };

  const filteredLabels = Object.entries(labelsData).filter(([_, count]) => count > 0);

  const data = {
    labels: filteredLabels.map(([label]) => categoryNames[label] || label),
    datasets: [
      {
        label: 'Sensitive Messages',
        data: filteredLabels.map(([_, count]) => count),
        backgroundColor: [
          '#ff6384', // pink/red
          '#36a2eb', // blue
          '#ffcd56', // yellow
          '#4bc0c0', // teal
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="mt-4">
      <h5 className="mb-3">Label Distribution</h5>
      <Pie data={data} />
    </div>
  );
}

export default LabelPieChart;
