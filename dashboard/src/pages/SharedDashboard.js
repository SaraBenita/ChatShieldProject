// SharedDashboard.js
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/userContext';
import MessageDashboardWrapper from '../components/MessageDashboardWrapper';

function SharedDashboard() {
  const { user } = useContext(UserContext);
  const [selectedPhone, setSelectedPhone] = useState('');

  useEffect(() => {
    if (user?.linkedPhonesDetails?.length > 0) {
      setSelectedPhone(user.linkedPhonesDetails[0].phone);
    }
  }, [user]);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Linked Accounts Message History</h2>

      {user?.linkedPhonesDetails?.length > 1 && (
        <div className="mb-3">
          <label htmlFor="phoneSelect" className="form-label">
            Select account to view:
          </label>
          <select
            id="phoneSelect"
            className="form-select"
            value={selectedPhone}
            onChange={(e) => setSelectedPhone(e.target.value)}
          >
            {user.linkedPhonesDetails.map(({ phone, name }) => (
              <option key={phone} value={phone}>{name} ({phone})</option>
            ))}
            <option value="ALL">ALL</option>
          </select>
        </div>
      )}

      {selectedPhone && (
        <MessageDashboardWrapper
          title={`Messages for ${selectedPhone}`}
          phones={selectedPhone === 'ALL' ? user.linkedPhonesDetails.map(p => p.phone) : [selectedPhone]}
        />
      )}
    </div>
  );
}

export default SharedDashboard;
