const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    trim: true,
    required: [true, 'Please type a review'],
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1.0'],
    max: [5, 'Rating must be at least 5.0'],
    required: [true, 'A review must have a rating'],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

reviewSchema.pre(/find/, function () {
  this.populate({ path: 'user', select: 'name photo' });
});

module.exports = mongoose.model('Review', reviewSchema);
