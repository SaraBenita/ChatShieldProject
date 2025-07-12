import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import MessageTable from './MessageTable';

function MessageDashboardWrapper({ email, title }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef();

  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/messages/getMessages', {
        headers: { Authorization: `Bearer ${token}` },
        params: { email }
      });
      setMessages(response.data.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (email !== null) {
      setLoading(true);
      fetchMessages();

      intervalRef.current = setInterval(fetchMessages, 5000);

      return () => clearInterval(intervalRef.current);
    }
  }, [email, fetchMessages]);

  return (
    <div className="container mt-4">
      <h2 className="mb-3 fs-4">{title}</h2>
      {loading && <p>Loading messages...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && messages.length === 0 && <p>No alerts found.</p>}
      {!loading && messages.length > 0 && <MessageTable messages={messages} />}
    </div>
  );
}

export default MessageDashboardWrapper;
