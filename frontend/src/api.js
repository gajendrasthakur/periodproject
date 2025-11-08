// update BASE_URL if backend runs elsewhere
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function apiPost(path, body = {}, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function apiGet(path, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  return res.json();
}
