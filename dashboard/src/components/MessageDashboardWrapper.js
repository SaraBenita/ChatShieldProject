import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MessageTable from './MessageTable';

function MessageDashboardWrapper({ email, title }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

       const response = await axios.get('http://localhost:5000/messages/getMessages', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            email
        }  // שליחת האימייל בבקשה
      });

        setMessages(response.data.messages || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    if (email !== null) {
      fetchMessages();
    }
  }, [email]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">{title}</h2>

      {loading && <p>Loading messages...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && messages.length === 0 && <p>No alerts found.</p>}
      {!loading && messages.length > 0 && <MessageTable messages={messages} />}
    </div>
  );
}

export default MessageDashboardWrapper;
