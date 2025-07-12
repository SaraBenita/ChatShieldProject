import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/userContext';
import MessageDashboardWrapper from '../components/MessageDashboardWrapper';

function SharedDashboard() {
  const { user } = useContext(UserContext);
  const [selectedEmail, setSelectedEmail] = useState('');

  useEffect(() => {
    if (user?.linkedEmails?.length > 0) {
      setSelectedEmail(user.linkedEmails[0]);
    }
  }, [user]);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Linked Accounts Massage History</h2>

      {user?.linkedEmails?.length > 1 && (
        <div className="mb-3">
          <label htmlFor="emailSelect" className="form-label">
            Select account to view:
          </label>
          <select
            id="emailSelect"
            className="form-select"
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
          >
            {user.linkedEmails.map((email) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedEmail && (
        <MessageDashboardWrapper
          title={`Messages for ${selectedEmail}`}
          email={selectedEmail}
        />
      )}
    </div>
  );
}

export default SharedDashboard;
