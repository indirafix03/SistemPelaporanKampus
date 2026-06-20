import React, { createContext, useState, useContext, useEffect } from 'react';

// Buat context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'mahasiswa' atau 'admin'
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cek token saat mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');

    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
      setIsAuthenticated(true);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Ambil data user terbaru dari backend
      fetch("http://127.0.0.1:8000/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${storedToken}`
        }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Sesi telah berakhir");
      })
      .then(userData => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.role) {
          setRole(userData.role);
          localStorage.setItem('role', userData.role);
        }
      })
      .catch(err => {
        console.error("Gagal memperbarui profil user:", err);
      });
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (userData, userRole, token) => {
    setUser(userData);
    setToken(token);
    setRole(userRole);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ user, role, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook untuk menggunakan context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan dalam AuthProvider');
  }
  return context;
}
