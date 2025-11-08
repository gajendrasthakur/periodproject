import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, BASE_URL } from '../api';
import { format } from 'date-fns';
import { Toaster, toast } from 'react-hot-toast';
import Modal from './Modal';

export default function Dashboard({ token }) {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [err, setErr] = useState('');
  const [editModal, setEditModal] = useState(null);

  // Fetch all cycles when token exists
  useEffect(() => {
    if (!token) return setLoading(false);
    fetchCycles();
  }, [token]);

  async function fetchCycles() {
    setLoading(true);
    const res = await apiGet('/api/cycles', token);
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
      return;
    }
    setCycles(res.cycles || []);
    setLoading(false);
  }

  // Add a new cycle
  async function addCycle(e) {
    e.preventDefault();
    setErr('');
    if (!startDate || !endDate) return setErr('Both dates required');

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      toast.error('End date must be greater than or equal to start date');
      return;
    }

    const res = await apiPost('/api/cycles', { startDate, endDate }, token);
    if (res.error) return toast.error(res.error);

    toast.success('Cycle added successfully');
    setCycles(prev => [res.cycle, ...prev]);
    setStartDate('');
    setEndDate('');
  }

  // Delete a cycle
  async function deleteCycle(id) {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/cycles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.error) return toast.error(data.error);
      setCycles(prev => prev.filter(c => c._id !== id));
      toast.success('Cycle deleted');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete cycle');
    }
  }

  // Open edit modal
  function openEdit(cycle) {
    setEditModal(cycle);
  }

  // Save edits
  async function handleEditSave() {
    const { startDate, endDate } = editModal;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      toast.error('End date must be greater than or equal to start date');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/cycles/${editModal._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ startDate, endDate })
      });
      const data = await res.json();
      if (data.error) return toast.error(data.error);

      setCycles(prev => prev.map(c => (c._id === editModal._id ? data.cycle : c)));
      toast.success('Cycle updated');
      setEditModal(null);
    } catch (err) {
      console.error('Edit failed:', err);
      toast.error('Failed to update cycle');
    }
  }

  const averageGap = () => {
    const gaps = cycles.map(c => c.gapSincePrevStartDays).filter(g => g != null);
    if (!gaps.length) return '-';
    const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    return `${avg} days`;
  };

  return (
    <div>
      <Toaster position="top-right" />
      {!token && <div>Please login to see your dashboard.</div>}
      {token && (
        <>
          <section className="card">
            <h2>Add period</h2>
            {err && <div className="error">{err}</div>}
            <form onSubmit={addCycle} className="form-inline">
              <label>
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Save</button>
            </form>
          </section>

          <section className="card">
            <h2>Overview</h2>
            <div>Average cycle length: <strong>{averageGap()}</strong></div>
            <div>Total records: <strong>{cycles.length}</strong></div>
          </section>

          <section className="card">
            <h2>History</h2>
            {loading ? (
              <div>Loading…</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Start</th>
                    <th>End</th>
                    <th>Period (days)</th>
                    <th>Gap from prev start (days)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map(c => (
                    <tr key={c._id}>
                      <td>{format(new Date(c.startDate), 'yyyy-MM-dd')}</td>
                      <td>{format(new Date(c.endDate), 'yyyy-MM-dd')}</td>
                      <td>{c.periodDurationDays ?? '-'}</td>
                      <td>{c.gapSincePrevStartDays != null ? c.gapSincePrevStartDays : '-'}</td>
                      <td>
                        <button onClick={() => openEdit(c)}>Edit</button>
                        <button
                          onClick={() => deleteCycle(c._id)}
                          style={{
                            marginLeft: '8px',
                            background: '#cc0000',
                            color: '#fff'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Edit Modal */}
          {editModal && (
            <Modal title="Edit Cycle" onClose={() => setEditModal(null)}>
              <label>
                Start date:
                <input
                  type="date"
                  value={editModal.startDate.slice(0, 10)}
                  onChange={e =>
                    setEditModal({ ...editModal, startDate: e.target.value })
                  }
                />
              </label>
              <label>
                End date:
                <input
                  type="date"
                  value={editModal.endDate.slice(0, 10)}
                  onChange={e =>
                    setEditModal({ ...editModal, endDate: e.target.value })
                  }
                />
              </label>
              <button onClick={handleEditSave}>Save</button>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
