// src/lib/events/fetchers.js

export async function fetchUnstopHackathons() {
  try {
    const url = "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=15&page=1&state=Delhi&oppstatus=open";
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } });
    if (!res.ok) return [];
    
    const json = await res.json();
    const items = json?.data?.data || [];
    
    return items.map(item => ({
      _id: `unstop_${item.id}`,
      title: item.title,
      description: item.seo_description || `Hosted by ${item.organization}`,
      category: 'Hackathon',
      date: item.start_date ? new Date(item.start_date) : new Date(),
      time: 'TBA',
      venue: item.jobLocation || 'Delhi NCR / Online',
      college: item.organization || 'Citywide',
      price: 'Free',
      bookingUrl: `https://unstop.com/${item.public_url}`,
      posterUrl: item.logoUrl2 || item.banner_mobile_image || 'https://unstop.com/images/unstop-logo.svg',
      source: 'Unstop',
      verified: true,
      upvotes: Math.floor(Math.random() * 20) + 10, // Simulated engagement for UI
      downvotes: 0
    }));
  } catch (error) {
    console.error("Error fetching Unstop Hackathons:", error);
    return [];
  }
}

export async function fetchUnstopCulturalFests() {
  try {
    const url = "https://unstop.com/api/public/opportunity/search-result?opportunity=all&type=cultural&per_page=15&page=1&state=Delhi&oppstatus=open";
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } });
    if (!res.ok) return [];
    
    const json = await res.json();
    const items = json?.data?.data || [];
    
    return items.map(item => ({
      _id: `unstop_cult_${item.id}`,
      title: item.title,
      description: item.seo_description || `Cultural Fest by ${item.organization}`,
      category: 'Cultural Fest',
      date: item.start_date ? new Date(item.start_date) : new Date(),
      time: 'TBA',
      venue: item.jobLocation || 'Delhi NCR',
      college: item.organization || 'Citywide',
      price: 'Varies',
      bookingUrl: `https://unstop.com/${item.public_url}`,
      posterUrl: item.logoUrl2 || item.banner_mobile_image || 'https://unstop.com/images/unstop-logo.svg',
      source: 'Unstop',
      verified: true,
      upvotes: Math.floor(Math.random() * 50) + 20,
      downvotes: 0
    }));
  } catch (error) {
    console.error("Error fetching Unstop Cultural Fests:", error);
    return [];
  }
}

export async function fetchDevfolioHackathons() {
  try {
    const url = "https://api.devfolio.co/api/search/hackathons";
    const payload = {
      query: "",
      type: ["open"],
      location: ["India", "Delhi", "New Delhi", "Noida", "Gurugram"],
      from: 0,
      size: 10
    };
    const res = await fetch(url, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify(payload),
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    
    const json = await res.json();
    const hits = json?.hits?.hits || [];
    
    return hits.map(hit => {
      const e = hit._source;
      return {
        _id: `devfolio_${e.uuid || hit._id}`,
        title: e.name,
        description: e.description || e.tagline || 'Hackathon hosted on Devfolio',
        category: 'Hackathon',
        date: e.starts_at ? new Date(e.starts_at) : new Date(),
        time: 'TBA',
        venue: e.location || 'Delhi NCR / Online',
        college: 'Citywide',
        price: 'Free',
        bookingUrl: e.slug ? `https://${e.slug}.devfolio.co/` : 'https://devfolio.co/hackathons',
        posterUrl: e.cover_img || e.logo || 'https://assets.devfolio.co/devfolio-logo-blue.svg',
        source: 'Devfolio',
        verified: true,
        upvotes: Math.floor(Math.random() * 30) + 15,
        downvotes: 0
      };
    });
  } catch (error) {
    console.error("Error fetching Devfolio:", error);
    return [];
  }
}

export async function fetchNowPlayingMovies() {
  try {
    // TMDB API requires an API key. 
    // We will use a public NEXT_PUBLIC_TMDB_API_KEY if available, else return fallback/empty
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY;
    if (!apiKey) {
      console.warn("TMDB API key not found. Skipping movies fetch.");
      return [];
    }
    
    const url = `https://api.themoviedb.org/3/movie/now_playing?region=IN&api_key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    
    const json = await res.json();
    const results = json?.results || [];
    
    return results.slice(0, 15).map(movie => ({
      _id: `tmdb_${movie.id}`,
      title: movie.title,
      description: movie.overview,
      category: 'Movie',
      date: new Date(), // Movies are "now playing", so we set date to today
      time: 'Multiple Shows',
      venue: 'Nearby Theaters',
      college: 'Citywide',
      price: '₹200 onwards',
      // We append a generic BookMyShow NCR search link
      bookingUrl: `https://in.bookmyshow.com/explore/movies-delhi-ncr`,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750',
      source: 'TMDB',
      verified: true,
      upvotes: Math.floor(movie.popularity) || Math.floor(Math.random() * 100),
      downvotes: 0
    }));
  } catch (error) {
    console.error("Error fetching TMDB Movies:", error);
    return [];
  }
}
