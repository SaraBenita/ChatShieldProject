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
      setIsAuthenticated(false); // הוסיפי שורה זו
      return;
    }

    axios.get('http://localhost:5000/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
      params: { phone: userPhone }
    }).then((res) => {
      setUser(res.data.user);
      setIsAuthenticated(true); // הוסיפי שורה זו
      console.log('User profile fetched:', res.data.user);
    }).catch((error) => {
      setUser(null);
      setIsAuthenticated(false); // הוסיפי שורה זו
    });
  }, [userPhone]);

  // חשוב: להעביר את כל הערכים בפרובידר
  return (
    <UserContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      userPhone,
      setUserPhone
    }}>
      {children}
    </UserContext.Provider>
  );
}