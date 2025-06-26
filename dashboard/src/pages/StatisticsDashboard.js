// StatisticsDashboard.js
import React, { useContext, useEffect, useState, useRef,useCallback } from 'react';
import { UserContext } from '../context/userContext';
import StatsSummaryCard from '../components/StatsSummaryCard';
import LabelPieChart from '../components/LabelPieChart';
import DailyRiskChart from '../components/DailyRiskChart';
import HourlyActivityChart from '../components/HourlyActivityChart';
import axios from 'axios';

function StatisticsDashboard() {
  const { user } = useContext(UserContext);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef();


const fetchStats = useCallback(async () => {
  if (!selectedEmail) return;
  try {
    setError(null);
    setLoading(true);
    const token = localStorage.getItem('token');

    const res = await axios.get('http://localhost:5000/messages/stats', {
      headers: { Authorization: `Bearer ${token}` },
      params: { email: selectedEmail }
    });

    setStats(res.data);
  } catch (err) {
    console.error("Error fetching stats:", err);
    setError('Failed to fetch stats');
  } finally {
    setLoading(false);
  }
}, [selectedEmail]);


  useEffect(() => {
    if (!user) return;

    // set default to current user if they have Extension access
    if (user.registeredVia?.includes('Extension')) {
      setSelectedEmail(user.email);
    } else if (user.registeredVia?.includes('dashboard') && user.linkedEmails?.length > 0) {
      setSelectedEmail(user.linkedEmails[0]);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedEmail) return;
    fetchStats();
    intervalRef.current = setInterval(fetchStats, 10000); // every 10 seconds
    return () => clearInterval(intervalRef.current);
  }, [selectedEmail,fetchStats]);

  // build options for the select input
  const getEmailOptions = () => {
    const options = [];
    if (user?.registeredVia?.includes('Extension')) {
      options.push({ label: `My Account (${user.email})`, value: user.email });
    }
    if (user?.linkedEmails?.length > 0) {
      user.linkedEmails.forEach(email => {
        options.push({ label: email, value: email });
      });
    }
    return options;
  };

  const emailOptions = getEmailOptions();

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Statistics & Insights</h2>

      {emailOptions.length > 1 && (
        <div className="mb-3">
          <label htmlFor="emailSelect" className="form-label">Select Account:</label>
          <select
            id="emailSelect"
            className="form-select"
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
          >
            {emailOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <p>Loading statistics...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {stats && (
        <>
            <StatsSummaryCard
            sensitiveCount={stats.sensitiveCount}
            labels={stats.labels}
            />
           <LabelPieChart labelsData={stats.labels} />
           <DailyRiskChart dataPoints={stats.dailyRisk} />
           <HourlyActivityChart hourlyData={stats.hourlyActivity} />
        </>
       )}
    </div>
  );
}

export default StatisticsDashboard;
