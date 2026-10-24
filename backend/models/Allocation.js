const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    allocationDate: {
      type: Date,
      default: Date.now,
    },
    vacatedDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'vacated'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Allocation', allocationSchema);
