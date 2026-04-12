const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  genre:        [{ type: String }],
  language:     { type: String, required: true },
  rating:       { type: Number, default: 0, min: 0, max: 10 },
  votes:        { type: String, default: '0' },
  duration:     { type: String, required: true },
  releaseDate:  { type: String, required: true },
  poster:       { type: String, default: '' },
  backdrop:     { type: String, default: '' },
  description:  { type: String, default: '' },
  cast:         [{ type: String }],
  director:     { type: String, default: '' },
  pointsReward: { type: Number, default: 50 },
  price: {
    regular:  { type: Number, default: 200 },
    premium:  { type: Number, default: 350 },
    recliner: { type: Number, default: 600 },
  },
  badge:    { type: String, default: '' },
  trending: { type: Boolean, default: false },
  type:     { type: String, enum: ['movie', 'show', 'event'], default: 'movie' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// ✅ NO text index — using regex search instead to avoid 'language' keyword conflict

module.exports = mongoose.model('Movie', movieSchema)