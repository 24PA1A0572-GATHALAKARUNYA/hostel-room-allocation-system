import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';
import { useToast } from '../App';

const EMPTY_FORM = {
  studentId: '', name: '', department: '', year: '', phone: '', email: '',
};

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics', 'Mechanical',
  'Civil', 'Electrical', 'Chemical', 'Biotechnology', 'Mathematics', 'Physics', 'Other',
];

function StudentForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.studentId.trim()) e.studentId = 'Student ID is required';
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.department.trim()) e.department = 'Department is required';
    if (!form.year || form.year < 1 || form.year > 4) e.year = 'Year must be 1–4';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Phone must be 10 digits';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="s-studentId">Student ID *</label>
          <input id="s-studentId" className={`form-control ${errors.studentId ? 'error' : ''}`}
            value={form.studentId} onChange={handle('studentId')} placeholder="e.g. CS2024001" />
          {errors.studentId && <span className="field-error">{errors.studentId}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="s-name">Full Name *</label>
          <input id="s-name" className={`form-control ${errors.name ? 'error' : ''}`}
            value={form.name} onChange={handle('name')} placeholder="Enter full name" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="s-dept">Department *</label>
          <select id="s-dept" className={`form-control ${errors.department ? 'error' : ''}`}
            value={form.department} onChange={handle('department')}>
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <span className="field-error">{errors.department}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="s-year">Year *</label>
          <select id="s-year" className={`form-control ${errors.year ? 'error' : ''}`}
            value={form.year} onChange={handle('year')}>
            <option value="">Select year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          {errors.year && <span className="field-error">{errors.year}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="s-phone">Phone Number *</label>
          <input id="s-phone" className={`form-control ${errors.phone ? 'error' : ''}`}
            value={form.phone} onChange={handle('phone')} placeholder="10-digit number" maxLength={10} />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="s-email">Email Address *</label>
          <input id="s-email" type="email" className={`form-control ${errors.email ? 'error' : ''}`}
            value={form.email} onChange={handle('email')} placeholder="student@college.edu" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
      </div>

      <div className="modal-footer" style={{ padding: '16px 0 0' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial ? 'Update Student' : 'Add Student'}
        </button>
      </div>
    </form>
  );
}

export default function Students() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null); // null | 'add' | 'edit'
  const [selected, setSelected] = useState(null);

  const fetchStudents = useCallback(() => {
    setLoading(true);
    api.get('/students', { params: { search } })
      .then((res) => setStudents(res.data.data))
      .catch(() => toast('Failed to load students', 'error'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openAdd  = () => { setSelected(null); setModal('add'); };
  const openEdit = (s) => { setSelected(s); setModal('edit'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await api.post('/students', form);
      toast('Student added successfully', 'success');
      closeModal();
      fetchStudents();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add student', 'error');
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/students/${selected._id}`, form);
      toast('Student updated successfully', 'success');
      closeModal();
      fetchStudents();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update student', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete student "${s.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/students/${s._id}`);
      toast('Student deleted successfully', 'success');
      fetchStudents();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete student', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">Manage student records</p>
        </div>
        <button className="btn btn-primary" id="add-student-btn" onClick={openAdd}>
          + Add Student
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <div className="table-title">Student List</div>
            <div className="table-count">{students.length} record{students.length !== 1 ? 's' : ''}</div>
          </div>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search students..."
          />
        </div>

        {loading ? (
          <Spinner />
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍🎓</div>
            <h3>No students found</h3>
            <p>{search ? 'Try a different search term.' : 'Click "Add Student" to get started.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s._id}>
                    <td>{i + 1}</td>
                    <td><strong>{s.studentId}</strong></td>
                    <td>{s.name}</td>
                    <td>{s.department}</td>
                    <td>Year {s.year}</td>
                    <td>{s.phone}</td>
                    <td>{s.email}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-warning btn-sm" onClick={() => openEdit(s)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s)}>
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
        <Modal title="Add New Student" onClose={closeModal}>
          <StudentForm onSubmit={handleAdd} onCancel={closeModal} loading={saving} />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title="Edit Student" onClose={closeModal}>
          <StudentForm
            initial={selected}
            onSubmit={handleEdit}
            onCancel={closeModal}
            loading={saving}
          />
        </Modal>
      )}
    </div>
  );
}
