import { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { UserContext } from '../context/userContext';
import StatsSummaryCard from '../components/StatsSummaryCard';
import LabelPieChart from '../components/LabelPieChart';
import DailyRiskChart from '../components/DailyRiskChart';
import HourlyActivityChart from '../components/HourlyActivityChart';
import axios from 'axios';

function StatisticsDashboard() {
  const { user } = useContext(UserContext);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef();

  const fetchStats = useCallback(async () => {
    if (!selectedPhone) return;
    try {
      setError(null);
      setLoading(true);
      const token = localStorage.getItem('token');
      const phonesList = [...new Set([user.phone, ...user.linkedPhones])];
      const params = selectedPhone === 'ALL' ? { phones: phonesList.join(',') } : { phone: selectedPhone };
      const res = await axios.get('http://localhost:5000/messages/stats', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [selectedPhone, user]);

  useEffect(() => {
    if (!user) return;
    setSelectedPhone(user.phone);
  }, [user]);

  useEffect(() => {
    if (!selectedPhone) return;
    fetchStats();
    intervalRef.current = setInterval(fetchStats, 10000);
    return () => clearInterval(intervalRef.current);
  }, [selectedPhone, fetchStats]);

  const getPhoneOptions = () => {
    const options = [];
    if (user?.name && user?.phone) {
      options.push({ label: `${user.name} (${user.phone})`, value: user.phone });
    }

    if (user?.linkedPhonesDetails?.length > 0) {
      user.linkedPhonesDetails.forEach(({ phone, name }) => {
        options.push({ label: `${name} (${phone})`, value: phone });
      });
    }

    if (user?.linkedPhonesDetails?.length > 0) {
      options.push({ label: 'ALL', value: 'ALL' });
    }
    return options;
  };

  const phoneOptions = getPhoneOptions();

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Statistics & Insights</h2>

      {phoneOptions.length > 1 && (
        <div className="mb-4">
          <label htmlFor="phoneSelect" className="form-label">Select Account:</label>
          <select
            id="phoneSelect"
            className="form-select"
            value={selectedPhone}
            onChange={(e) => setSelectedPhone(e.target.value)}
          >
            {phoneOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value === user.phone ? `My Account (${user.phone})` : opt.label}
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

          <div className="row g-4 mt-4 mb-5">
            <div className="col-md-4">
              <div className="bg-white rounded shadow-sm p-3 border h-100 chart-card">
                <LabelPieChart labelsData={stats.labels} />
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-white rounded shadow-sm p-3 border h-100 chart-card">
                <DailyRiskChart dataPoints={stats.dailyRisk} />
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-white rounded shadow-sm p-3 border h-100 chart-card">
                <HourlyActivityChart hourlyData={stats.hourlyActivity} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StatisticsDashboard;
