import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event.js';
import { 
  fetchUnstopHackathons, 
  fetchUnstopCulturalFests, 
  fetchDevfolioHackathons, 
  fetchNowPlayingMovies 
} from '@/lib/events/fetchers';

export async function GET(req) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const college = searchParams.get('college');
    
    // 1. Fetch Custom Events from our MongoDB
    let dbQuery = {};
    if (category && category !== 'All') {
        dbQuery.category = category;
    }
    // For now, if college is passed, we get that college + Citywide
    if (college) {
        dbQuery.$or = [{ college: college }, { college: 'Citywide' }];
    }
    
    // Filter out very old events (keep within last 2 days)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    dbQuery.date = { $gte: twoDaysAgo };
    
    const dbEvents = await Event.find(dbQuery)
      .sort({ date: 1 })
      .lean();
      
    // Format MongoDB events to match our UI Card structure
    const formattedDbEvents = dbEvents.map(e => ({
      ...e,
      _id: e._id.toString()
    }));

    // If a specific college is selected, we might want to prioritize DB events
    // If the category is strictly something we don't scrape, we can skip scraping
    const shouldFetchScrapes = !category || category === 'All' || ['Hackathon', 'Cultural Fest', 'Movie'].includes(category);
    
    let externalEvents = [];
    
    if (shouldFetchScrapes) {
      // 2. Fetch Automatically from our External APIs concurrently
      const fetchPromises = [];
      
      if (!category || category === 'All' || category === 'Hackathon') {
          fetchPromises.push(fetchUnstopHackathons());
          fetchPromises.push(fetchDevfolioHackathons());
      }
      
      if (!category || category === 'All' || category === 'Cultural Fest') {
          fetchPromises.push(fetchUnstopCulturalFests());
      }
      
      if (!category || category === 'All' || category === 'Movie') {
          fetchPromises.push(fetchNowPlayingMovies());
      }
      
      const results = await Promise.allSettled(fetchPromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
           externalEvents = [...externalEvents, ...result.value];
        } else if (result.status === 'rejected') {
           console.error("Failed to fetch an external events source:", result.reason);
        }
      });
    }

    // 3. Merge and Sort
    // We intertwine them but mostly sort by Date.
    // TMDB movies don't have exact accurate times, so we sprinkle them occasionally among DB events.
    
    let allEvents = [...formattedDbEvents, ...externalEvents];
    
    // Deduplicate just in case Unstop/Devfolio returns duplicates
    const seen = new Set();
    allEvents = allEvents.filter(e => {
        const id = e.title?.toLowerCase().trim(); // crude dedupe
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
    
    // Final Sort: Earliest Date first, but we want popular ones to float up a bit
    // Simple heuristic: Date primarily, then Upvotes
    allEvents.sort((a, b) => {
        const aDate = new Date(a.date).getTime();
        const bDate = new Date(b.date).getTime();
        
        // If dates are within same day (approximated), sort by upvotes
        if (Math.abs(aDate - bDate) < 86400000) {
             const aScore = a.upvotes - (a.downvotes || 0);
             const bScore = b.upvotes - (b.downvotes || 0);
             return bScore - aScore; // Highest score first
        }
        
        return aDate - bDate; // Earliest first
    });

    return new Response(JSON.stringify(allEvents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch events' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
   try {
     await dbConnect();
     const body = await req.json();
     
     // Basic validation
     if (!body.title || !body.venue || !body.date || !body.category) {
       return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
     }
     
     const newEvent = new Event({
       ...body,
       date: new Date(body.date),
       source: body.source || 'Community'
     });
     
     await newEvent.save();
     
     return new Response(JSON.stringify({ success: true, event: newEvent }), { status: 201 });
   } catch (error) {
     console.error('Error creating event:', error);
     return new Response(JSON.stringify({ error: 'Failed to create event' }), { status: 500 });
   }
}
