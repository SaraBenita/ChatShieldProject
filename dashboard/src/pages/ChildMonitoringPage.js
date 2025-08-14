import React, { useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { UserContext } from '../context/userContext';

function ChildMonitoringPage() {
  const { user } = useContext(UserContext);
  const [visibleVNCs, setVisibleVNCs] = useState({});
  const [containerStatuses, setContainerStatuses] = useState({});
  const token = localStorage.getItem('token');

  const fetchStatuses = useCallback(async () => {
    const statuses = {};
    for (const phone of user.linkedPhones) {
      try {
        const res = await axios.get(`http://localhost:5000/monitor/status?phone=${phone}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        statuses[phone] = res.data.isRunning;
      } catch {
        statuses[phone] = false;
      }
    }
    setContainerStatuses(statuses);
  }, [user, token]);

  useEffect(() => {
    if (user?.linkedPhones?.length) {
      fetchStatuses();
    }
  }, [user, fetchStatuses]);

  const startMonitoring = async (phone, index) => {
    if (containerStatuses[phone]) {
      alert(`${phone} container is already running.`);
      return;
    }
    try {
      await axios.post('http://localhost:5000/monitor/start', { phone, index }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Monitoring started for ${phone}`);
      fetchStatuses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start container');
    }
  };

  const stopMonitoring = async (phone) => {
    if (!containerStatuses[phone]) {
      alert(`${phone} container is not running.`);
      return;
    }
    try {
      await axios.post('http://localhost:5000/monitor/stop', { phone }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Monitoring stopped for ${phone}`);
      fetchStatuses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to stop container');
    }
  };

  const toggleVNC = (phone) => {
    setVisibleVNCs((prev) => ({
      ...prev,
      [phone]: !prev[phone],
    }));
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Monitoring Linked Account</h3>
      {user?.linkedPhones?.length ? (
        <div className="row g-4">
          {user.linkedPhones.map((phone, idx) => {
            const port = 6080 + idx;
            const isRunning = containerStatuses[phone];

            return (
              <div className="col-12" key={phone}>
                <div className="p-3 border rounded bg-white shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>{phone}</strong>
                    <div>
                      <button
                        className={`btn btn-sm me-2 btn-primary ${isRunning ? 'disabled' : ''}`}
                        disabled={isRunning}
                        onClick={() => startMonitoring(phone, idx)}
                        style={isRunning ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        Start Monitoring
                      </button>
                      <button
                        className={`btn btn-sm me-2 btn-danger ${!isRunning ? 'disabled' : ''}`}
                        disabled={!isRunning}
                        onClick={() => stopMonitoring(phone)}
                        style={!isRunning ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        Stop Monitoring
                      </button>
                      <button
                        className={`btn btn-sm btn-outline-secondary ${!isRunning ? 'disabled' : ''}`}
                        disabled={!isRunning}
                        onClick={() => toggleVNC(phone)}
                        style={!isRunning ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {visibleVNCs[phone] ? 'Hide VNC' : 'Show VNC'}
                      </button>
                    </div>
                  </div>
                  {visibleVNCs[phone] && isRunning && (
                    <div className="border mt-3" style={{ height: '500px' }}>
                      <iframe
                        src={`http://localhost:${port}/vnc.html?autoconnect=true&resize=scale`}
                        title={`VNC for ${phone}`}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No linked accounts available for monitoring.</p>
      )}
    </div>
  );
}

export default ChildMonitoringPage;
