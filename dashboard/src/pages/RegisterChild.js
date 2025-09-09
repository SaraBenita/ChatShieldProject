import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/userContext';

function RegisterChild() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { user, refreshUser } = useContext(UserContext);
  const navigate = useNavigate();

  

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info text-center">
          Loading user info...
        </div>
      </div>
    );
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/user/registerByExtension', {
        name,
        phone,
        password,
        linkedPhones: [user.phone], 
        privacyAccepted: false,
        registrationDate: new Date()
      });
      await refreshUser(); 
      alert('Child registered successfully!');
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body p-5">
              <h2 className="text-center mb-5">Register Child</h2>
              <form onSubmit={handleRegister} autoComplete="off">
                <div className="form-group mb-4">
                  <label htmlFor="registerName" className="mb-3">Child Name</label>
                  <input
                    id="registerName"
                    type="text"
                    className="form-control py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="form-group mb-4">
                  <label htmlFor="registerPhone" className="mb-3">Child Phone</label>
                  <input
                    id="registerPhone"
                    name="registerChildPhone"
                    type="tel"
                    className="form-control py-2"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="form-group mb-5">
                  <label htmlFor="registerPassword" className="mb-3">Child Password</label>
                  <input
                    id="registerPassword"
                    type="password"
                    className="form-control py-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group mb-4">
                  <label htmlFor="linkedPhones" className="mb-3">Parent Phone (Linked)</label>
                  <input
                    id="linkedPhones"
                    name="registerChildPassword"
                    type="tel"
                    className="form-control py-2"
                    value={user.phone}
                    disabled
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100">Register Child</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterChild;