import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhone, setUserPhone] = useState(() => localStorage.getItem('userPhone'));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !userPhone) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    axios.get('http://localhost:5000/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
      params: { phone: userPhone }
    }).then((res) => {
      setUser(res.data.user);
      setIsAuthenticated(true);
      console.log('User profile fetched:', res.data.user);
    }).catch((error) => {
      setUser(null);
      setIsAuthenticated(false);
    });
  }, [userPhone]);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    await axios.get('http://localhost:5000/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
      params: { phone: userPhone }
    }).then((res) => {
      setUser(res.data.user);
    });
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      userPhone,
      setUserPhone,
      refreshUser
    }}>
      {children}
    </UserContext.Provider>
  );
}