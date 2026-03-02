import { z } from 'zod';

// ============================================================
// Shared primitives
// ============================================================

/** Validates a 24-char hex MongoDB ObjectId */
export const mongoIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID format');

// ============================================================
// Spots
// ============================================================

export const spotCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().default(''),
  category: z.enum(['cafe', 'park', 'restaurant', 'library', 'shopping', 'street_food', 'sweet_shop', 'gaming', 'mall', 'other']),
  vibe: z.enum(['quiet', 'social', 'both', 'productive', 'romantic', 'late_night', 'nature']).optional(),
  budget: z.enum(['free', 'cheap', 'moderate', 'expensive']).optional(),
  distance: z.string().max(50).optional().default(''),
  address: z.string().max(200).optional().default(''),
  googleMapsUrl: z.string().max(500).optional().default(''),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

export const spotImportSchema = z.object({
  spots: z.array(spotCreateSchema).min(1).max(500),
  college: z.string().max(100).optional(),
});

// ============================================================
// Votes
// ============================================================

export const spotReportSchema = z.object({
  reason: z.enum(['closed', 'inaccurate', 'spam', 'inappropriate', 'other']),
  detail: z.string().max(300).optional().default(''),
}).strict();

export const spotReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(300).optional().default(''),
}).strict();

export const voteSchema = z.object({
  spotId: z.string().min(1),
  type: z.enum(['upvote', 'downvote']),
}).strict();

export const voteActionSchema = z.object({
  spotId: mongoIdSchema,
  action: z.enum(['upvote', 'downvote']),
}).strict();

// ============================================================
// Attendance
// ============================================================

export const attendanceSchema = z.object({
  courseId: mongoIdSchema,
  status: z.enum(['attended', 'bunked', 'none']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  occurrenceIndex: z.number().int().min(0).optional(),
}).strict();

// ============================================================
// Courses
// ============================================================

export const courseCreateSchema = z.object({
  name: z.string().min(1, 'Course name is required').max(100),
  code: z.string().max(20).optional().default(''),
  type: z.enum(['Theory', 'Lab']).optional().default('Theory'),
  totalClasses: z.number().int().min(0).max(9999).optional().default(0),
  attendedClasses: z.number().int().min(0).max(9999).optional().default(0),
  targetPercentage: z.number().int().min(0).max(100).optional().default(75),
}).strict();

export const courseUpdateSchema = z.object({
  courseId: mongoIdSchema,
  name: z.string().min(1).max(100).optional(),
  code: z.string().max(20).optional(),
  type: z.enum(['Theory', 'Lab']).optional(),
  totalClasses: z.number().int().min(0).max(9999).optional(),
  attendedClasses: z.number().int().min(0).max(9999).optional(),
}).strict();

// ============================================================
// Users
// ============================================================

const customTimetableSlotSchema = z.object({
  slot: z.number().int().min(1).max(12),
  type: z.enum(['THEORY', 'LAB', 'BREAK', 'ACTIVITY']),
  subject: z.string().max(100).optional().default(''),
});

const customTimetableSchema = z.object({
  timeSlots: z.array(z.object({
    slot: z.number().int().min(1).max(12),
    time: z.string().max(20),
  })).min(1).max(12),
  schedule: z.record(
    z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    z.array(customTimetableSlotSchema).max(12)
  ),
});

export const userUpdateSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, underscores only').optional(),
  name: z.string().min(1).max(50).optional(),
  college: z.string().min(1).max(100).optional(),
  semester: z.number().int().min(1).max(8).optional(),
  section: z.string().min(1).max(10).optional(),
  group: z.enum(['G1', 'G2']).optional().nullable(),
  favoriteSpot: z.object({
    name: z.string().max(100),
    emoji: z.string().max(10),
  }).optional(),
  isPublic: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  targetPercentage: z.number().int().min(0).max(100).optional(),
  customTimetable: customTimetableSchema.optional().nullable(),
  socialLinks: z.object({
    instagram: z.string().max(100).optional(),
    linkedin: z.string().max(100).optional(),
    leetcode: z.string().max(100).optional(),
    codeforces: z.string().max(100).optional(),
  }).optional(),
}).strict();

export const userProfileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
  name: z.string().min(1).max(50),
  RZ_college: z.string().min(1).max(100),
  semester: z.number().int().min(1).max(8),
  section: z.string().min(1).max(10),
  group: z.enum(['G1', 'G2']),
}).strict();

// ============================================================
// Notifications
// ============================================================

export const notificationPatchSchema = z.object({
  markAll: z.boolean().optional(),
  notificationId: mongoIdSchema.optional(),
}).strict().refine(
  data => data.markAll || data.notificationId,
  { message: 'Either markAll or notificationId must be provided' }
);
