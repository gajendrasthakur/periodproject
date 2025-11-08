import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
    if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user');
  }, [token, user]);

  const logout = () => {
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="container">
      <header>
        <h1>Period Portfolio</h1>
        <nav>
          {!token ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          ) : (
            <>
              <span>Hi, {user?.name}</span>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard token={token} />} />
          <Route path="/signup" element={<Signup setToken={setToken} setUser={setUser} />} />
          <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </main>
      <footer>
        <small>Privacy: keep data secure. This is a demo — add encryption for production.</small>
      </footer>
    </div>
  );
}

export default App;
