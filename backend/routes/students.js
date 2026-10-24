const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Allocation = require('../models/Allocation');

// GET /api/students?search=
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query = {
        $or: [
          { studentId: regex },
          { name: regex },
          { department: regex },
          { email: regex },
          { phone: regex },
        ],
      };
    }
    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
});

// POST /api/students
router.post('/', async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student, message: 'Student added successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/students/:id
router.put('/:id', async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student, message: 'Student updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Guard: cannot delete if active allocation exists
    const activeAllocation = await Allocation.findOne({
      student: req.params.id,
      status: 'active',
    });
    if (activeAllocation) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete student with an active room allocation. Please vacate the room first.',
      });
    }

    await student.deleteOne();
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
