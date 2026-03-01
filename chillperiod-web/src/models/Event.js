import mongoose from 'mongoose';

// Re-use the same schema for both the Web App and Discord Bot
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 150 },
  description: { type: String, trim: true, maxLength: 1000 },
  category: { 
    type: String, 
    required: true, 
    enum: ['Hackathon', 'Cultural Fest', 'Concert', 'Movie', 'Standup', 'Workshop', 'Sports', 'Party', 'Other'], 
    index: true 
  },
  date: { type: Date, required: true },
  time: { type: String, trim: true }, // e.g., "6:00 PM"
  venue: { type: String, required: true, trim: true },
  college: { type: String, default: 'Citywide', index: true }, // Filter for college-specific events
  address: { type: String, trim: true },
  coordinates: { lat: Number, lng: Number }, // Optional for map feature
  
  price: { type: String, default: 'Free', trim: true }, // e.g., "Free", "₹499 onwards"
  bookingUrl: { type: String, trim: true }, // Link to BMS, Paytm Insider, Devfolio
  posterUrl: { type: String, trim: true }, // Link to event image
  source: { type: String, enum: ['Community', 'Unstop', 'Devfolio', 'TMDB', 'Admin'], default: 'Community' },
  
  addedBy: { discordId: String, username: String, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'} },
  
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }, // Useful for admin-approved fests
  
  reports: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, enum: ['spam', 'inaccurate', 'inappropriate', 'canceled', 'other'], required: true },
    detail: { type: String, maxLength: 300 },
    createdAt: { type: Date, default: Date.now }
  }],
  reportCount: { type: Number, default: 0 }
}, { timestamps: true });

eventSchema.virtual('score').get(function() {
  return this.upvotes - this.downvotes;
});

// Avoid OverwriteModelError in Next.js hot-reloading
export default mongoose.models.Event || mongoose.model('Event', eventSchema);
