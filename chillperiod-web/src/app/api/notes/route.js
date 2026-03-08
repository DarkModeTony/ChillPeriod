import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Note from '@/models/Note';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const notes = await Note.find({ userId: session.user.id })
    .sort({ isPinned: -1, updatedAt: -1 })
    .lean();

  return Response.json(notes);
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();

  const note = await Note.create({
    userId: session.user.id,
    title: body.title || 'Untitled Note',
    content: body.content || '',
    isPinned: false,
    color: body.color || 'default'
  });

  return Response.json(note, { status: 201 });
}
