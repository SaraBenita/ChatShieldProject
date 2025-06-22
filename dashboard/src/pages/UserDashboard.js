import{useContext} from 'react';
import MessageDashboardWrapper from '../components/MessageDashboardWrapper';
import { UserContext } from "../context/userContext";

function UserDashboard() {
  const { user } = useContext(UserContext);
  if (!user?.email)
  {
    return (
        <div className="d-flex justify-content-center pt-5">
          <div className="card shadow p-4" style={{ minWidth: 350 }}>
            <div className="card-body text-center">
              <p className="card-text">Loading...</p>
            </div>
          </div>
        </div>
      );
  }

  return <MessageDashboardWrapper title="My Message Alerts" email={user.email} />;
}

export default UserDashboard;
