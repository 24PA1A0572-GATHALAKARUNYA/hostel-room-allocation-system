import { useEffect, useState } from 'react';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const CARDS = [
  { key: 'totalStudents', label: 'Total Students', icon: '👨‍🎓', color: 'blue' },
  { key: 'totalRooms',    label: 'Total Rooms',    icon: '🏠',  color: 'purple' },
  { key: 'totalBeds',     label: 'Total Beds',     icon: '🛏️',  color: 'green' },
  { key: 'occupiedBeds',  label: 'Occupied Beds',  icon: '🔴',  color: 'orange' },
  { key: 'availableBeds', label: 'Available Beds', icon: '✅',  color: 'green' },
];

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setStats(res.data.data))
      .catch(() => setError('Failed to load dashboard data. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of the hostel room allocation system</p>
        </div>
      </div>

      {loading && <Spinner />}

      {error && (
        <div className="toast toast-error" style={{ marginBottom: 24 }}>❌ {error}</div>
      )}

      {stats && (
        <div className="cards-grid">
          {CARDS.map((card) => (
            <div key={card.key} className="card">
              <div className={`card-icon ${card.color}`}>{card.icon}</div>
              <div className="card-info">
                <div className="card-label">{card.label}</div>
                <div className="card-value">{stats[card.key] ?? 0}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="table-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, color: '#1e293b' }}>
            Quick Summary
          </h2>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Total Students Registered</td><td><strong>{stats.totalStudents}</strong></td></tr>
              <tr><td>Total Rooms Available</td><td><strong>{stats.totalRooms}</strong></td></tr>
              <tr><td>Total Bed Capacity</td><td><strong>{stats.totalBeds}</strong></td></tr>
              <tr><td>Beds Currently Occupied</td><td><strong>{stats.occupiedBeds}</strong></td></tr>
              <tr><td>Beds Currently Free</td><td><strong>{stats.availableBeds}</strong></td></tr>
              <tr>
                <td>Occupancy Rate</td>
                <td>
                  <strong>
                    {stats.totalBeds > 0
                      ? `${Math.round((stats.occupiedBeds / stats.totalBeds) * 100)}%`
                      : '0%'}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
