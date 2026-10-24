const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Room = require('../models/Room');
const Allocation = require('../models/Allocation');

// GET /api/dashboard
router.get('/', async (req, res, next) => {
  try {
    const [totalStudents, totalRooms, rooms] = await Promise.all([
      Student.countDocuments(),
      Room.countDocuments(),
      Room.find(),
    ]);

    const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const occupiedBeds = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0);
    const availableBeds = totalBeds - occupiedBeds;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
