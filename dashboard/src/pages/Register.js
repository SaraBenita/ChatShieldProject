import React, { useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';  // תיקון הייבוא
import axios from 'axios';
import {UserContext} from '../context/userContext';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsAuthenticated, setUserEmail } = useContext(UserContext);
  const navigate = useNavigate();  // הוספת useNavigate

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/user/registerByDashboard', { name, email, password, registrationDate: new Date() });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userEmail', email); // הוסיפי שורה זו
      setIsAuthenticated(true); // עדכון הסטטוס של המשתמש
      setUserEmail(email);
      navigate('/dashboard'); // נווט לדף הלוח בקרה לאחר ההרשמה המוצלחת
    } catch (error) {
      alert('Registration failed: ' + error.response.data.message);
    }
  };
  

  return (
    <>
      <div className="container-fluid mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body p-5">
                <h2 className="text-center mb-5">Register</h2>
                <form onSubmit={handleRegister}>
                  <div className="form-group mb-4">
                    <label htmlFor="registerName" className="mb-3">Name</label>
                    <input
                      id="registerName"
                      type="text"
                      className="form-control py-2"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group mb-4">
                    <label htmlFor="registerEmail" className="mb-3">Email</label>
                    <input
                      id="registerEmail"
                      type="email"
                      className="form-control py-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group mb-5">
                    <label htmlFor="registerPassword" className="mb-3">Password</label>
                    <input
                      id="registerPassword"
                      type="password"
                      className="form-control py-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100">Register</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;