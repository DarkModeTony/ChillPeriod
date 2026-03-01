import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { action } = await req.json(); // 'up' or 'down'
    const eventId = params.id;

    if (!eventId || !action || !['up', 'down'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
    }

    await dbConnect();
    
    // We update the votes directly
    // Ideally we would track user votes to prevent double voting, like we do for spots,
    // but for MVP we will keep it simple increment/decrement
    const updateQuery = action === 'up' ? { $inc: { upvotes: 1 } } : { $inc: { downvotes: 1 } };

    const event = await Event.findByIdAndUpdate(
      eventId,
      updateQuery,
      { new: true }
    );

    if (!event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
    }

    // Return calculated score
    const score = event.upvotes - event.downvotes;

    return new Response(JSON.stringify({ success: true, score, event }), { status: 200 });

  } catch (error) {
    console.error('Error voting on event:', error);
    return new Response(JSON.stringify({ error: 'Failed to vote on event' }), { status: 500 });
  }
}
