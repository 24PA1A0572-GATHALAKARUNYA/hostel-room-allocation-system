const express = require('express');
const router = express.Router();
const Allocation = require('../models/Allocation');
const Room = require('../models/Room');
const Student = require('../models/Student');

// GET /api/allocations — all active allocations
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;

    let allocations = await Allocation.find({ status: 'active' })
      .populate('student', 'studentId name department year phone email')
      .populate('room', 'roomNumber floor type capacity occupiedBeds')
      .sort({ allocationDate: -1 });

    // Filter by search on populated fields
    if (search) {
      const lower = search.toLowerCase();
      allocations = allocations.filter((a) => {
        const s = a.student;
        const r = a.room;
        return (
          s?.studentId?.toLowerCase().includes(lower) ||
          s?.name?.toLowerCase().includes(lower) ||
          r?.roomNumber?.toLowerCase().includes(lower) ||
          s?.department?.toLowerCase().includes(lower)
        );
      });
    }

    res.json({ success: true, data: allocations });
  } catch (err) {
    next(err);
  }
});

// POST /api/allocations — allocate a room to a student
router.post('/', async (req, res, next) => {
  try {
    const { studentId, roomId } = req.body;

    if (!studentId || !roomId) {
      return res.status(400).json({ success: false, message: 'Student and room are required' });
    }

    // Check student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Duplicate check: student already has an active allocation
    const existing = await Allocation.findOne({ student: studentId, status: 'active' });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Student already has an active room allocation. Vacate the current room first.',
      });
    }

    // Room full check
    if (room.occupiedBeds >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is full (${room.capacity}/${room.capacity} beds occupied)`,
      });
    }

    // Create allocation
    const allocation = await Allocation.create({
      student: studentId,
      room: roomId,
      status: 'active',
    });

    // Increment room occupancy
    await Room.findByIdAndUpdate(roomId, { $inc: { occupiedBeds: 1 } });

    const populated = await allocation.populate([
      { path: 'student', select: 'studentId name department year phone email' },
      { path: 'room', select: 'roomNumber floor type capacity occupiedBeds' },
    ]);

    res.status(201).json({
      success: true,
      data: populated,
      message: `Room ${room.roomNumber} allocated to ${student.name} successfully`,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/allocations/:id/vacate — vacate a room
router.put('/:id/vacate', async (req, res, next) => {
  try {
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }
    if (allocation.status === 'vacated') {
      return res.status(400).json({ success: false, message: 'Room is already vacated' });
    }

    // Update allocation status
    allocation.status = 'vacated';
    allocation.vacatedDate = new Date();
    await allocation.save();

    // Decrement room occupancy (ensure it doesn't go below 0)
    await Room.findByIdAndUpdate(allocation.room, {
      $inc: { occupiedBeds: -1 },
    });

    res.json({ success: true, message: 'Room vacated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
