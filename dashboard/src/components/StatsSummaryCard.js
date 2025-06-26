// StatsSummaryCard.js
import React from 'react';

function StatsSummaryCard({ sensitiveCount, labels }) {
  if (!labels || typeof labels !== 'object') {
    return null; // אפשר גם להחזיר ספינר/טקסט זמני
  }
  const labelDisplayNames = {
    "Personal Information": "Personal Info",
    "Location/Activity": "Location / Activity",
    "Financial Information": "Financial Info",
    "Social Media Activity": "Social Media",
  };

  const getPercentage = (count) => {
    if (sensitiveCount === 0) return "0%";
    return ((count / sensitiveCount) * 100).toFixed(1) + "%";
  };

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3">
      <div className="col">
        <div className="card text-white bg-danger shadow h-100">
          <div className="card-body">
            <h5 className="card-title">Sensitive Messages</h5>
            <p className="card-text fs-3 fw-bold">{sensitiveCount}</p>
          </div>
        </div>
      </div>

      {Object.entries(labels).map(([labelKey, count]) => (
        <div className="col" key={labelKey}>
          <div className="card shadow h-100">
            <div className="card-body">
              <h6 className="card-title mb-2">{labelDisplayNames[labelKey] || labelKey}</h6>
              <p className="card-text fs-4 fw-semibold mb-0">{count}</p>
              <small className="text-muted">{getPercentage(count)} of total</small>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsSummaryCard;
