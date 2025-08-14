import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';  // תיקון הייבוא
import axios from 'axios';
import { UserContext } from '../context/userContext';

function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { isAuthenticated, setIsAuthenticated, setUserPhone } = useContext(UserContext);
  const navigate = useNavigate();  // הוספת useNavigate
  // אם כבר מחובר, להפנות ל-dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/user/loginByDashboard', { phone, password });
      console.log('Login successful:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userPhone', phone); // הוסיפי שורה זו
      setIsAuthenticated(true); // עדכון הסטטוס של המשתמש
      setUserPhone(phone); // עדכון האימייל של המשתמש
      navigate('/dashboard');

    } catch (error) {
      alert('Login failed: ' + error.response.data.message);
    }
  };

  return (
    <>
      <div className="container-fluid mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body p-5">
                <h2 className="text-center mb-5">Login</h2>
                <form onSubmit={handleLogin}>
                  <div className="form-group mb-4">
                    <label htmlFor="loginPhone" className="mb-3">Phone Number</label>
                    <input id="loginPhone" type="tel" className="form-control py-2" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div className="form-group mb-5">
                    <label htmlFor="loginPassword" className="mb-3">Password</label>
                    <input
                      id="loginPassword"
                      type="password"
                      className="form-control py-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100">Login</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;