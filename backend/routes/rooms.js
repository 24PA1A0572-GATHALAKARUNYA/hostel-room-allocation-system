const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Allocation = require('../models/Allocation');

// GET /api/rooms?search=
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query = {
        $or: [{ roomNumber: regex }, { type: regex }],
      };
      // Also search by floor if numeric
      const floorNum = parseInt(search);
      if (!isNaN(floorNum)) {
        query.$or.push({ floor: floorNum });
      }
    }
    const rooms = await Room.find(query).sort({ roomNumber: 1 });
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
});

// GET /api/rooms/:id
router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
});

// POST /api/rooms
router.post('/', async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room, message: 'Room added successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/rooms/:id
router.put('/:id', async (req, res, next) => {
  try {
    // Don't allow manually setting occupiedBeds via this endpoint
    const { occupiedBeds, ...updateData } = req.body;

    const room = await Room.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // If new capacity is less than current occupiedBeds, reject
    if (room.capacity < room.occupiedBeds) {
      return res.status(400).json({
        success: false,
        message: `Cannot set capacity below current occupancy (${room.occupiedBeds} beds occupied)`,
      });
    }

    res.json({ success: true, data: room, message: 'Room updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/rooms/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // Guard: cannot delete if active allocation exists
    const activeAllocation = await Allocation.findOne({
      room: req.params.id,
      status: 'active',
    });
    if (activeAllocation) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active allocations. Please vacate all students first.',
      });
    }

    await room.deleteOne();
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
