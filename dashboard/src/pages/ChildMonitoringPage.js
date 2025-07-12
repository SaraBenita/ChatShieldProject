import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../context/userContext';

function ChildMonitoringPage() {
  const { user } = useContext(UserContext);
  const [visibleVNCs, setVisibleVNCs] = useState({});
  const [containerStatuses, setContainerStatuses] = useState({});
  const token = localStorage.getItem('token');

  const fetchStatuses = async () => {
    const statuses = {};
    for (const email of user.linkedEmails) {
      try {
        const res = await axios.get(`http://localhost:5000/monitor/status?email=${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        statuses[email] = res.data.isRunning;
      } catch {
        statuses[email] = false;
      }
    }
    setContainerStatuses(statuses);
  };

  useEffect(() => {
    if (user?.linkedEmails?.length) {
      fetchStatuses();
    }
  }, [user]);

  const startMonitoring = async (email, index) => {
    if (containerStatuses[email]) {
      alert(`${email} container is already running.`);
      return;
    }
    try {
      await axios.post('http://localhost:5000/monitor/start', { email, index }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Monitoring started for ${email}`);
      fetchStatuses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start container');
    }
  };

  const stopMonitoring = async (email) => {
    if (!containerStatuses[email]) {
      alert(`${email} container is not running.`);
      return;
    }
    try {
      await axios.post('http://localhost:5000/monitor/stop', { email }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Monitoring stopped for ${email}`);
      fetchStatuses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to stop container');
    }
  };

  const toggleVNC = (email) => {
    setVisibleVNCs((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Monitoring Linked Account</h3>
      {user?.linkedEmails?.length ? (
        <div className="row g-4">
          {user.linkedEmails.map((email, idx) => {
            const port = 6080 + idx;
            const isRunning = containerStatuses[email];

            return (
              <div className="col-12" key={email}>
                <div className="p-3 border rounded bg-white shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>{email}</strong>
                    <div>
                      <button
                        className={`btn btn-sm me-2 btn-primary ${isRunning ? 'disabled' : ''}`}
                        disabled={isRunning}
                        onClick={() => startMonitoring(email, idx)}
                        style={isRunning ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        Start Monitoring
                      </button>
                      <button
                        className={`btn btn-sm me-2 btn-danger ${!isRunning ? 'disabled' : ''}`}
                        disabled={!isRunning}
                        onClick={() => stopMonitoring(email)}
                        style={!isRunning ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        Stop Monitoring
                      </button>
                      <button
                        className={`btn btn-sm btn-outline-secondary ${!isRunning ? 'disabled' : ''}`}
                        disabled={!isRunning}
                        onClick={() => toggleVNC(email)}
                        style={!isRunning ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {visibleVNCs[email] ? 'Hide VNC' : 'Show VNC'}
                      </button>
                    </div>
                  </div>
                  {visibleVNCs[email] && isRunning && (
                    <div className="border mt-3" style={{ height: '500px' }}>
                      <iframe
                        src={`http://localhost:${port}/vnc.html?autoconnect=true&resize=scale`}
                        title={`VNC for ${email}`}
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
