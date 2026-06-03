import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div>
        {/* Navigasi / Menu Sederhana */}
        <nav style={{ padding: '10px', background: '#eee', display: 'flex', gap: '15px' }}>
          <Link to="/">Beranda</Link>
          <Link to="/login">Login</Link>
        </nav>

        {/* Sistem Routing */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;