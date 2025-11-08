import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../api';

export default function Signup({ setToken, setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const res = await apiPost('/api/auth/signup', { name, email, password });
    if (res.error) return setErr(res.error);
    setToken(res.token);
    setUser(res.user);
    nav('/');
  };

  return (
    <form onSubmit={submit} className="form">
      <h2>Signup</h2>
      {err && <div className="error">{err}</div>}
      <label>Name<input value={name} onChange={e => setName(e.target.value)} required /></label>
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      <button type="submit">Create account</button>
    </form>
  );
}
