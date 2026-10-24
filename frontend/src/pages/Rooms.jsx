import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';
import { useToast } from '../App';

const EMPTY_FORM = { roomNumber: '', capacity: '', floor: '', type: 'General' };

const ROOM_TYPES = ['Single', 'Double', 'Triple', 'General'];

function RoomForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial
    ? { roomNumber: initial.roomNumber, capacity: initial.capacity, floor: initial.floor, type: initial.type }
    : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.roomNumber.trim()) e.roomNumber = 'Room number is required';
    if (!form.capacity || form.capacity < 1 || form.capacity > 10) e.capacity = 'Capacity must be 1–10';
    if (form.floor === '' || form.floor < 0) e.floor = 'Floor number is required (0 for ground)';
    if (!form.type) e.type = 'Room type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, capacity: Number(form.capacity), floor: Number(form.floor) });
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="r-roomNum">Room Number *</label>
          <input id="r-roomNum" className={`form-control ${errors.roomNumber ? 'error' : ''}`}
            value={form.roomNumber} onChange={handle('roomNumber')} placeholder="e.g. A101" />
          {errors.roomNumber && <span className="field-error">{errors.roomNumber}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="r-type">Room Type *</label>
          <select id="r-type" className={`form-control ${errors.type ? 'error' : ''}`}
            value={form.type} onChange={handle('type')}>
            {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.type && <span className="field-error">{errors.type}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="r-capacity">Bed Capacity *</label>
          <input id="r-capacity" type="number" min={1} max={10}
            className={`form-control ${errors.capacity ? 'error' : ''}`}
            value={form.capacity} onChange={handle('capacity')} placeholder="1–10" />
          {errors.capacity && <span className="field-error">{errors.capacity}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="r-floor">Floor Number *</label>
          <input id="r-floor" type="number" min={0}
            className={`form-control ${errors.floor ? 'error' : ''}`}
            value={form.floor} onChange={handle('floor')} placeholder="0 = Ground floor" />
          {errors.floor && <span className="field-error">{errors.floor}</span>}
        </div>
      </div>

      <div className="modal-footer" style={{ padding: '16px 0 0' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial ? 'Update Room' : 'Add Room'}
        </button>
      </div>
    </form>
  );
}

function OccupancyBar({ occupied, capacity }) {
  const pct = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
  const color = pct >= 100 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="occ-bar-bg">
        <div className="occ-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
        {occupied}/{capacity}
      </span>
    </div>
  );
}

export default function Rooms() {
  const toast = useToast();
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchRooms = useCallback(() => {
    setLoading(true);
    api.get('/rooms', { params: { search } })
      .then((res) => setRooms(res.data.data))
      .catch(() => toast('Failed to load rooms', 'error'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const openAdd  = () => { setSelected(null); setModal('add'); };
  const openEdit = (r) => { setSelected(r); setModal('edit'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await api.post('/rooms', form);
      toast('Room added successfully', 'success');
      closeModal();
      fetchRooms();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add room', 'error');
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/rooms/${selected._id}`, form);
      toast('Room updated successfully', 'success');
      closeModal();
      fetchRooms();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update room', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete room "${r.roomNumber}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/rooms/${r._id}`);
      toast('Room deleted successfully', 'success');
      fetchRooms();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete room', 'error');
    }
  };

  const statusBadge = (r) => {
    if (r.occupiedBeds >= r.capacity) return <span className="badge badge-red">Full</span>;
    if (r.occupiedBeds === 0) return <span className="badge badge-green">Empty</span>;
    return <span className="badge badge-orange">Partial</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rooms</h1>
          <p className="page-subtitle">Manage hostel rooms and bed availability</p>
        </div>
        <button className="btn btn-primary" id="add-room-btn" onClick={openAdd}>
          + Add Room
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <div className="table-title">Room List</div>
            <div className="table-count">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</div>
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search rooms..." />
        </div>

        {loading ? (
          <Spinner />
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏠</div>
            <h3>No rooms found</h3>
            <p>{search ? 'Try a different search term.' : 'Click "Add Room" to get started.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Room No.</th>
                  <th>Type</th>
                  <th>Floor</th>
                  <th>Occupancy</th>
                  <th>Available Beds</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td><strong>{r.roomNumber}</strong></td>
                    <td>{r.type}</td>
                    <td>Floor {r.floor}</td>
                    <td><OccupancyBar occupied={r.occupiedBeds} capacity={r.capacity} /></td>
                    <td>
                      <strong style={{ color: r.availableBeds === 0 ? '#ef4444' : '#16a34a' }}>
                        {r.availableBeds}
                      </strong>
                    </td>
                    <td>{statusBadge(r)}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-warning btn-sm" onClick={() => openEdit(r)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'add' && (
        <Modal title="Add New Room" onClose={closeModal}>
          <RoomForm onSubmit={handleAdd} onCancel={closeModal} loading={saving} />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title="Edit Room" onClose={closeModal}>
          <RoomForm initial={selected} onSubmit={handleEdit} onCancel={closeModal} loading={saving} />
        </Modal>
      )}
    </div>
  );
}
