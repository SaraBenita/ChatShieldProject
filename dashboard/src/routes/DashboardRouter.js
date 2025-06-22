// DashboardRouter.jsx
import React, { useContext, useState,useEffect} from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/userContext";

function DashboardRouter() {
  const { user } = useContext(UserContext);
  
  const [ready, setReady] = useState(false);

  useEffect(() => {
    console.log("DashboardRouter useEffect - Current user:", user);
    if (user) setReady(true);
  }, [user]);

  if (!ready) {
    console.log("DashboardRouter - Not ready, user:", user);
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

  const via = user?.registeredVia;
  const linked = user?.linkedEmails ?? [];

  if (via?.includes('Extension'))  {
    console.log("DashboardRouter - Routing to my-dashboard");
    return <Navigate to="/my-dashboard" />;
  }

  if (linked.length > 0) {
    console.log("DashboardRouter - Routing to shared-dashboard");
    return <Navigate to="/shared-dashboard" />;
  }

  console.log("DashboardRouter - No conditions met, showing no dashboards message");
  return (
    <div className="d-flex justify-content-center pt-5">
      <div className="card shadow p-4" style={{ minWidth: 350 }}>
        <div className="card-body text-center">
          <h5 className="card-title mb-3">No Dashboards</h5>
          <p className="card-text">You have no dashboards available.</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardRouter;
