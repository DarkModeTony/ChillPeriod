import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    trim: true,
    maxLength: 200,
    default: 'Untitled Note'
  },
  content: {
    type: String,
    default: ''
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'default' // 'default', 'purple', 'cyan', 'pink', 'green', 'yellow'
  }
}, {
  timestamps: true
});

NoteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

export default mongoose.models?.Note || mongoose.model('Note', NoteSchema);
