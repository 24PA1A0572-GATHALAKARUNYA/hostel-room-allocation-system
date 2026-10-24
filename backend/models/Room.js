const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [10, 'Capacity cannot exceed 10'],
    },
    occupiedBeds: {
      type: Number,
      default: 0,
      min: 0,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: [0, 'Floor cannot be negative'],
    },
    type: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'General'],
      default: 'General',
    },
  },
  { timestamps: true }
);

// Virtual: available beds
roomSchema.virtual('availableBeds').get(function () {
  return this.capacity - this.occupiedBeds;
});

// Virtual: isAvailable
roomSchema.virtual('isAvailable').get(function () {
  return this.occupiedBeds < this.capacity;
});

roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema);
