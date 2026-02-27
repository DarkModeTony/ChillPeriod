import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectMongo from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/lib/models/User';

// GET all tasks for the logged in user
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    
    // Parse query params for filtering
    const { searchParams } = new URL(request.url);
    const completedFilter = searchParams.get('completed');
    const priorityFilter = searchParams.get('priority');
    
    // Build query object
    const query = { userId: session.user.id };
    
    if (completedFilter !== null) {
      query.completed = completedFilter === 'true';
    }
    
    if (priorityFilter) {
      query.priority = priorityFilter;
    }

    const tasks = await Task.find(query)
      .sort({ pinned: -1, dueDate: 1, createdAt: -1 })
      .populate('collaborators', 'name username image discordId avatar');
      
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// CREATE a new task
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    await connectMongo();
    
    const newTask = new Task({
      userId: session.user.id,
      title: data.title,
      description: data.description || '',
      completed: !!data.completed,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority || 'Medium',
      tags: data.tags || [],
      subjectLink: data.subjectLink || '',
      collaborators: data.collaborators || [],
      subtasks: (data.subtasks || []).map(s => ({ title: s.title || s, completed: false })),
      pinned: !!data.pinned
    });

    const savedTask = await newTask.save();
    
    // Populate before returning so frontend gets populated ref
    const populatedTask = await Task.findById(savedTask._id)
      .populate('collaborators', 'name username image discordId avatar');

    // Award XP to the creator
    const user = await User.findById(session.user.id);
    if (user) {
      user.xp += 5;
      user.level = Math.floor(Math.sqrt(user.xp / 10)) + 1;
      await user.save();
    }

    return NextResponse.json(populatedTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
