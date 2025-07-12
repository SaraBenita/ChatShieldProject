import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import NavBar from './components/NavBar';
import {UserProvider} from './context/userContext';
import DashboardRouter from './routes/DashboardRouter';
import UserDashboard from './pages/UserDashboard';
import SharedDashboard from './pages/SharedDashboard';
import StatisticsDashboard from './pages/StatisticsDashboard';
import ChildMonitoringPage from './pages/ChildMonitoringPage';

function App() {
  return (
    <UserProvider>
    <Router>
      <>
        <NavBar />
        <Routes>   
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/my-dashboard" element={<UserDashboard />} />
          <Route path="/shared-dashboard" element={<SharedDashboard />} />
          <Route path="/child-monitoring" element={<ChildMonitoringPage />} />
          <Route path="/statistics" element={<StatisticsDashboard />} />
        </Routes>
      </>
    </Router>
    </UserProvider>
  );
}

export default App;