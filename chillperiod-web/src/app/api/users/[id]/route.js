import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { auth } from '@/auth';
import { isValidObjectId } from '@/lib/security/sanitize';
import { userUpdateSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic'; // Prevent Next.js from caching this API route

// GET /api/users/[id] — Get user profile (public)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // SECURITY: Validate ObjectId format before querying
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findById(id)
      .select('-email -googleId -discordId')
      .populate('followers', 'name image')
      .populate('following', 'name image')
      .lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Calculate stats dynamically from courses
    if (user.courses && Array.isArray(user.courses)) {
      user.totalClasses = user.courses.reduce((sum, course) => sum + (course.totalClasses || 0), 0);
      user.attendedClasses = user.courses.reduce((sum, course) => sum + (course.attendedClasses || 0), 0);
      user.totalBunks = user.totalClasses - user.attendedClasses;
    }

    user.attendancePercentage = user.totalClasses > 0 
      ? Math.round((user.attendedClasses / user.totalClasses) * 100) 
      : 0;
    user.followerCount = user.followers?.length || 0;
    user.followingCount = user.following?.length || 0;

    // We keep user.followers array so the frontend can check `data.followers.some(f => f._id === session.user.id)`
    
    // lean() bypasses Mongoose defaults, so old users might have undefined XP/Level
    user.xp = user.xp || 0;
    user.level = user.level || 1;

    return NextResponse.json(user);
  } catch (error) {
    console.error('[user GET]', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/users/[id] — Update user profile (auth + ownership required)
// SECURITY: Only the user themselves (or an admin) can update their profile
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    // SECURITY: Require authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    // SECURITY: Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // SECURITY: Ownership check — only allow users to update their own profile (or admin)
    if (session.user.id !== id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: you can only update your own profile' }, { status: 403 });
    }

    const body = await request.json();

    // SECURITY: Validate body with Zod schema (rejects unexpected fields via .strict())
    const result = userUpdateSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details: fieldErrors }, { status: 400 });
    }

    const validatedData = result.data;
    const updates = {};

    // Handle username update with uniqueness check
    if (validatedData.username) {
      const existingUser = await User.findOne({ username: validatedData.username });
      if (existingUser && existingUser._id.toString() !== id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
      updates.username = validatedData.username;
    }
    
    // Only allow updating whitelisted fields
    const allowedFields = ['name', 'college', 'semester', 'section', 'group', 'favoriteSpot', 'isPublic', 'notificationsEnabled', 'targetPercentage', 'customTimetable', 'socialLinks'];
    
    for (const field of allowedFields) {
      if (validatedData[field] !== undefined) {
        updates[field] = validatedData[field];
      }
    }

    // Handle customTimetable null (delete) vs object (set)
    const updateQuery = {};
    if (validatedData.customTimetable === null) {
      updateQuery.$unset = { customTimetable: 1 };
      delete updates.customTimetable;
    }
    if (Object.keys(updates).length > 0) {
      updateQuery.$set = updates;
    }
    
    const user = await User.findByIdAndUpdate(id, updateQuery, { new: true });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }
    console.error('[user PATCH]', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
