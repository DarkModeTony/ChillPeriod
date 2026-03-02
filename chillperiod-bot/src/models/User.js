import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    // Auth identifiers
    email: { type: String, unique: true, sparse: true },
    discordId: { type: String, unique: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },

    // Profile info
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    image: String,
    college: String,
    semester: Number,
    section: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    group: { type: String, enum: ['G1', 'G2'], default: null },

    // Social
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    socialLinks: {
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        leetcode: { type: String, default: '' },
        codeforces: { type: String, default: '' }
    },

    // Progression
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    // Attendance stats
    totalClasses: { type: Number, default: 0 },
    attendedClasses: { type: Number, default: 0 },
    totalBunks: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },

    // Favorite spot
    favoriteSpot: {
        name: String,
        emoji: String
    },

    // Settings
    isPublic: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    targetPercentage: { type: Number, default: 75 },
    hasCompletedOnboarding: { type: Boolean, default: false },

    // Courses & Attendance
    courses: [{
        name: { type: String, required: true },
        code: String,
        type: { type: String, enum: ['Theory', 'Lab'], default: 'Theory' },
        totalClasses: { type: Number, default: 0 },
        attendedClasses: { type: Number, default: 0 },
        targetPercentage: { type: Number, default: 75 }
    }],
    
    attendanceLog: [{
        date: { type: String, required: true }, // Format: YYYY-MM-DD
        actions: [{
            courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
            status: { type: String, enum: ['attended', 'bunked'], required: true },
            timestamp: { type: Date, default: Date.now }
        }]
    }]
}, {
    timestamps: true
});

// Indexes for performance
userSchema.index({ totalBunks: -1 }); // Leaderboard sorting
userSchema.index({ "courses.code": 1 }); // Course lookups

// Calculate current attendance percentage
userSchema.virtual('attendancePercentage').get(function() {
    if (this.totalClasses === 0) return 100;
    return Math.round((this.attendedClasses / this.totalClasses) * 100);
});

userSchema.virtual('followerCount').get(function() {
    return this.followers?.length || 0;
});

userSchema.virtual('followingCount').get(function() {
    return this.following?.length || 0;
});

// Calculate how many classes can be skipped (Global) 
userSchema.virtual('safeToSkip').get(function() {
    const { totalClasses, attendedClasses } = this;
    const requiredPercentage = this.targetPercentage || 75;
    if (totalClasses === 0) return 0;
    
    const minAttended = Math.ceil((requiredPercentage / 100) * totalClasses);
    return Math.max(0, attendedClasses - minAttended);
});

// Get bunk title based on total bunks
userSchema.methods.getBunkTitle = function() {
  const bunks = this.totalBunks;
  if (bunks >= 100) return { title: 'Bunk Legend', emoji: '👑' };
  if (bunks >= 50) return { title: 'Bunk King', emoji: '🏆' };
  if (bunks >= 25) return { title: 'Serial Skipper', emoji: '😴' };
  if (bunks >= 10) return { title: 'Chill Master', emoji: '😎' };
  if (bunks >= 5) return { title: 'Casual Bunker', emoji: '🌴' };
  return { title: 'Rookie', emoji: '🌱' };
};

// Helper to get status for a single course
userSchema.methods.getCourseStatus = function(course) {
    const percentage = course.totalClasses > 0 ? (course.attendedClasses / course.totalClasses) * 100 : 100;
    const required = course.targetPercentage || this.targetPercentage || 75;
    
    const safeToBunk = Math.max(0, Math.floor((course.attendedClasses * 100 / required) - course.totalClasses));
    const needToAttend = Math.max(0, Math.ceil((required * course.totalClasses - 100 * course.attendedClasses) / (100 - required)));

    if (percentage >= required + 10) return { status: 'safe', color: 0x10B981, emoji: '🟢', message: `Safe! Can bunk ${safeToBunk} more.`, safeToBunk };
    if (percentage >= required) return { status: 'caution', color: 0xF59E0B, emoji: '🟡', message: `Careful! Can bunk ${safeToBunk} more.`, safeToBunk };
    return { status: 'danger', color: 0xEF4444, emoji: '🔴', message: `Danger! Attend ${needToAttend} classes!`, needToAttend };
};

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model('User', userSchema);
