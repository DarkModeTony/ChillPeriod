import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Note from '@/models/Note';

export async function PUT(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const { id } = await params;

  const note = await Note.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: body },
    { new: true }
  );

  if (!note) {
    return Response.json({ error: 'Note not found' }, { status: 404 });
  }

  return Response.json(note);
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;

  const note = await Note.findOneAndDelete({ _id: id, userId: session.user.id });
  if (!note) {
    return Response.json({ error: 'Note not found' }, { status: 404 });
  }

  return Response.json({ success: true });
}
