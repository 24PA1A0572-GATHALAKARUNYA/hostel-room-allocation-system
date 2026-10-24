import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';
import { useToast } from '../App';

function AllocateForm({ onSubmit, onCancel, loading }) {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms]       = useState([]);
  const [form, setForm]         = useState({ studentId: '', roomId: '' });
  const [errors, setErrors]     = useState({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/students'), api.get('/rooms')])
      .then(([sRes, rRes]) => {
        setStudents(sRes.data.data);
        // Only show rooms that have available beds
        setRooms(rRes.data.data.filter((r) => r.availableBeds > 0));
      })
      .finally(() => setFetching(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.studentId) e.studentId = 'Please select a student';
    if (!form.roomId) e.roomId = 'Please select a room';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  if (fetching) return <Spinner />;

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid single">
        <div className="form-group">
          <label htmlFor="a-student">Select Student *</label>
          <select id="a-student" className={`form-control ${errors.studentId ? 'error' : ''}`}
            value={form.studentId} onChange={handle('studentId')}>
            <option value="">-- Choose a student --</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.studentId} — {s.name} ({s.department}, Year {s.year})
              </option>
            ))}
          </select>
          {errors.studentId && <span className="field-error">{errors.studentId}</span>}
          {students.length === 0 && (
            <span className="field-error">No students found. Add students first.</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="a-room">Select Available Room *</label>
          <select id="a-room" className={`form-control ${errors.roomId ? 'error' : ''}`}
            value={form.roomId} onChange={handle('roomId')}>
            <option value="">-- Choose a room --</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.roomNumber} — Floor {r.floor} | {r.type} | {r.availableBeds} bed{r.availableBeds !== 1 ? 's' : ''} free
              </option>
            ))}
          </select>
          {errors.roomId && <span className="field-error">{errors.roomId}</span>}
          {rooms.length === 0 && (
            <span className="field-error">No available rooms. Add rooms or free up space first.</span>
          )}
        </div>
      </div>

      <div className="modal-footer" style={{ padding: '16px 0 0' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || students.length === 0 || rooms.length === 0}
        >
          {loading ? 'Allocating...' : 'Allocate Room'}
        </button>
      </div>
    </form>
  );
}

export default function Allocations() {
  const toast = useToast();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState('');
  const [showModal, setShowModal]     = useState(false);

  const fetchAllocations = useCallback(() => {
    setLoading(true);
    api.get('/allocations', { params: { search } })
      .then((res) => setAllocations(res.data.data))
      .catch(() => toast('Failed to load allocations', 'error'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchAllocations(); }, [fetchAllocations]);

  const handleAllocate = async (form) => {
    setSaving(true);
    try {
      const res = await api.post('/allocations', form);
      toast(res.data.message || 'Room allocated successfully', 'success');
      setShowModal(false);
      fetchAllocations();
    } catch (err) {
      toast(err.response?.data?.message || 'Allocation failed', 'error');
    } finally { setSaving(false); }
  };

  const handleVacate = async (alloc) => {
    const name = alloc.student?.name || 'this student';
    const room = alloc.room?.roomNumber || 'this room';
    if (!window.confirm(`Vacate room ${room} for ${name}?`)) return;
    try {
      await api.put(`/allocations/${alloc._id}/vacate`);
      toast('Room vacated successfully', 'success');
      fetchAllocations();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to vacate room', 'error');
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Allocations</h1>
          <p className="page-subtitle">Manage room allocations and vacate students</p>
        </div>
        <button className="btn btn-primary" id="allocate-room-btn" onClick={() => setShowModal(true)}>
          + Allocate Room
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <div className="table-title">Active Allocations</div>
            <div className="table-count">
              {allocations.length} active allocation{allocations.length !== 1 ? 's' : ''}
            </div>
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search allocations..." />
        </div>

        {loading ? (
          <Spinner />
        ) : allocations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No active allocations</h3>
            <p>
              {search
                ? 'No results for your search.'
                : 'Click "Allocate Room" to assign a student to a room.'}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Room No.</th>
                  <th>Floor</th>
                  <th>Room Type</th>
                  <th>Allocated On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a, i) => (
                  <tr key={a._id}>
                    <td>{i + 1}</td>
                    <td><strong>{a.student?.studentId}</strong></td>
                    <td>{a.student?.name}</td>
                    <td>{a.student?.department}</td>
                    <td><strong>{a.room?.roomNumber}</strong></td>
                    <td>Floor {a.room?.floor}</td>
                    <td>{a.room?.type}</td>
                    <td>{formatDate(a.allocationDate)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        id={`vacate-btn-${a._id}`}
                        onClick={() => handleVacate(a)}
                      >
                        Vacate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Allocate Room to Student" onClose={() => setShowModal(false)}>
          <AllocateForm
            onSubmit={handleAllocate}
            onCancel={() => setShowModal(false)}
            loading={saving}
          />
        </Modal>
      )}
    </div>
  );
}
