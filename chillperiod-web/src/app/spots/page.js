'use client';

import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import EventCard from '@/components/EventCard';
import { useState, useEffect } from 'react';
import { COLLEGES, findCollege } from '@/lib/data/colleges';

const categoryEmojis = { 
  cafe: '☕', restaurant: '🍕', street_food: '🌭', 
  park: '🌳', library: '📚', shopping: '🛍️', 
  gaming: '🎮', sweet_shop: '🍬', other: '📍' 
};

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'places'
  
  // Spots State
  const [spots, setSpots] = useState([]);
  const [isLoadingSpots, setIsLoadingSpots] = useState(true);
  
  // Events State
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
  // Shared UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ reason: 'inaccurate', detail: '' });
  const [reportingSpotId, setReportingSpotId] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewHover, setReviewHover] = useState(0);
  const [spotReviews, setSpotReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [newSpot, setNewSpot] = useState({
    name: '', description: '', category: 'cafe', vibe: 'social', budget: 'moderate', 
    address: '', googleMapsUrl: '', distance: ''
  });

  // User college state
  const [userCollege, setUserCollege] = useState(null);
  const [collegeCoords, setCollegeCoords] = useState(null);

  useEffect(() => {
    fetchSpots();
    fetchEvents();
    fetchUserCollege();
  }, []);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) setEvents(await res.json());
    } catch (error) {
       console.error('Failed to fetch API events', error);
    } finally {
       setIsLoadingEvents(false);
    }
  };

  const fetchUserCollege = async () => {
    try {
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const user = await res.json();
        if (user.college) {
          const college = findCollege(user.college);
          if (college) {
            setUserCollege(college);
            setCollegeCoords({ lat: college.lat, lng: college.lng });
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch user college', err);
    }
  };

  const fetchSpots = async () => {
    setIsLoadingSpots(true);
    try {
      const res = await fetch('/api/spots');
      if (res.ok) {
        const data = await res.json();
        if (data.length === 0) {
            await fetch('/api/seed');
            const seededRes = await fetch('/api/spots');
            if (seededRes.ok) setSpots(await seededRes.json());
        } else {
            setSpots(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch API spots', error);
    } finally {
      setIsLoadingSpots(false);
    }
  };

  const handleEventVote = async (eventId, action, e) => {
    e.stopPropagation();
    // Optimistic Update for Events
    setEvents(prev => prev.map(ev => {
      if (ev._id === eventId) {
         let newUpvotes = ev.upvotes || 0;
         let newDownvotes = ev.downvotes || 0;
         if (action === 'up') newUpvotes++;
         else newDownvotes++;
         return { ...ev, upvotes: newUpvotes, downvotes: newDownvotes, score: newUpvotes - newDownvotes };
      }
      return ev;
    }));

    try {
      await fetch(`/api/events/${eventId}/vote`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ action })
      });
    } catch (error) {
       console.error('Event Vote error', error);
    }
  };

  const handleVote = async (spotId, action, e) => {
    e.stopPropagation();
    
    // Optimistic Update
    setSpots(prev => prev.map(s => {
        if (s._id === spotId) {
            let newUpvotes = s.upvotes || 0;
            let newDownvotes = s.downvotes || 0;
            let newIsUpvoted = s.isUpvoted;
            let newIsDownvoted = s.isDownvoted;

            if (action === 'upvote') {
                if (newIsUpvoted) {
                    newUpvotes--;
                    newIsUpvoted = false;
                } else {
                    newUpvotes++;
                    newIsUpvoted = true;
                    if (newIsDownvoted) {
                        newDownvotes--;
                        newIsDownvoted = false;
                    }
                }
            } else if (action === 'downvote') {
                if (newIsDownvoted) {
                    newDownvotes--;
                    newIsDownvoted = false;
                } else {
                    newDownvotes++;
                    newIsDownvoted = true;
                    if (newIsUpvoted) {
                        newUpvotes--;
                        newIsUpvoted = false;
                    }
                }
            }

            return {
                ...s,
                upvotes: newUpvotes,
                downvotes: newDownvotes,
                isUpvoted: newIsUpvoted,
                isDownvoted: newIsDownvoted
            };
        }
        return s;
    }));

    // Update selectedSpot if open
    if (selectedSpot && selectedSpot._id === spotId) {
        setSelectedSpot(prev => {
            // Simplified logic: just sync with spots state in next render or manually update here
            // To keep it simple, we'll let the user see the update in the list background or close/reopen
            // But let's try to update it here too for better UX
             let newUpvotes = prev.upvotes || 0;
            let newDownvotes = prev.downvotes || 0;
            let newIsUpvoted = prev.isUpvoted;
            let newIsDownvoted = prev.isDownvoted;

            if (action === 'upvote') {
                if (newIsUpvoted) { newUpvotes--; newIsUpvoted = false; } 
                else { newUpvotes++; newIsUpvoted = true; if (newIsDownvoted) { newDownvotes--; newIsDownvoted = false; } }
            } else if (action === 'downvote') {
                if (newIsDownvoted) { newDownvotes--; newIsDownvoted = false; } 
                else { newDownvotes++; newIsDownvoted = true; if (newIsUpvoted) { newUpvotes--; newIsUpvoted = false; } }
            }
            return { ...prev, upvotes: newUpvotes, downvotes: newDownvotes, isUpvoted: newIsUpvoted, isDownvoted: newIsDownvoted };
        });
    }

    try {
        const res = await fetch('/api/spots/upvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spotId, action })
        });
        
        if (!res.ok) {
             console.error('Vote failed');
             // Could revert state here
        }
    } catch (error) {
        console.error('Vote error', error);
    }
  };

  const handleCheckin = async (spotId, e) => {
    if (e) e.stopPropagation();

    // Optimistic update
    setSpots(prev => prev.map(s => {
      if (s._id === spotId) {
        const wasCheckedIn = s.isCheckedIn;
        return {
          ...s,
          isCheckedIn: !wasCheckedIn,
          activeCheckinCount: wasCheckedIn
            ? Math.max(0, (s.activeCheckinCount || 1) - 1)
            : (s.activeCheckinCount || 0) + 1
        };
      }
      // If checking IN to this spot, check OUT from others
      if (!spots.find(sp => sp._id === spotId)?.isCheckedIn && s.isCheckedIn) {
        return { ...s, isCheckedIn: false, activeCheckinCount: Math.max(0, (s.activeCheckinCount || 1) - 1) };
      }
      return s;
    }));

    if (selectedSpot && selectedSpot._id === spotId) {
      setSelectedSpot(prev => ({
        ...prev,
        isCheckedIn: !prev.isCheckedIn,
        activeCheckinCount: prev.isCheckedIn
          ? Math.max(0, (prev.activeCheckinCount || 1) - 1)
          : (prev.activeCheckinCount || 0) + 1
      }));
    }

    try {
      await fetch(`/api/spots/${spotId}/checkin`, { method: 'POST' });
    } catch (error) {
      console.error('Check-in error', error);
    }
  };

  const handleReport = async () => {
    if (!reportingSpotId) return;
    try {
      const res = await fetch(`/api/spots/${reportingSpotId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
          setReportData({ reason: 'inaccurate', detail: '' });
          setReportingSpotId(null);
        }, 1500);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to report');
      }
    } catch (error) {
      console.error('Report error', error);
    }
  };

  const [isMapLoading, setIsMapLoading] = useState(false);

  const fetchSpotsFromMap = async () => {
    if (!collegeCoords) {
      alert('Please set your college in your profile first!');
      return;
    }

    setIsMapLoading(true);

    try {
      // Single Overpass query — fetches all categories at once within 7km
      const res = await fetch(
        `/api/spots/search?lat=${collegeCoords.lat}&lng=${collegeCoords.lng}&radius=7000`
      );

      if (!res.ok) {
        const err = await res.json();
        console.error('Search failed:', err);
        alert('Failed to fetch spots from map.');
        return;
      }

      const overpassSpots = await res.json();

      if (overpassSpots.length === 0) {
        alert('No spots found near your college. Try adding manually!');
        return;
      }

      // Smart vibe/budget assignment based on category
      const vibeMap = {
        cafe: 'social', restaurant: 'social', street_food: 'social',
        park: 'nature', library: 'productive', gaming: 'social',
        sweet_shop: 'social', shopping: 'social'
      };
      const budgetMap = {
        park: 'free', library: 'free', street_food: 'cheap',
        cafe: 'moderate', restaurant: 'moderate', gaming: 'moderate',
        sweet_shop: 'cheap', shopping: 'moderate'
      };

      const rawSpots = overpassSpots.map(item => ({
        name: item.name,
        description: `📍 Discovered via OpenStreetMap${item.cuisine ? ' • ' + item.cuisine : ''}`,
        category: item.category,
        vibe: vibeMap[item.category] || 'social',
        budget: budgetMap[item.category] || 'moderate',
        distance: item.distance,
        address: item.address,
        lat: item.lat,
        lng: item.lng,
        googleMapsUrl: item.googleMapsUrl
      }));

      // Limit to max 500 spots to avoid Zod schema validation errors
      const limitedSpots = rawSpots.slice(0, 500);

      // Persist to DB with college tag
      const importRes = await fetch('/api/spots/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spots: limitedSpots, college: userCollege?.key || 'BPIT' })
      });

      if (importRes.ok) {
        const { savedSpots } = await importRes.json();
        setSpots(prev => {
          const existingIds = new Set(prev.map(s => s._id));
          const newSpots = savedSpots.filter(s => !existingIds.has(s._id));
          if (newSpots.length === 0) {
            alert('No new spots found — all already in database!');
            return prev;
          }
          alert(`🎉 Added ${newSpots.length} new spots near your college!`);
          return [...prev, ...newSpots];
        });
      } else {
        const errData = await importRes.json().catch(() => ({ error: importRes.statusText }));
        console.warn('Import failed:', errData.error || errData);
        if (importRes.status === 403) {
           alert('Only admins can import spots directly from the map. Try adding them manually!');
        } else if (errData.details) {
           const issues = errData.details.map(d => `${d.field}: ${d.message}`).join('\\n');
           alert(`Validation failed:\\n${issues}`);
        } else {
           alert(`Failed to save spots: ${errData.error || 'Unknown error'}`);
        }
      }

    } catch (error) {
      console.error('Map fetch failed', error);
      alert('Failed to fetch from maps.');
    } finally {
      setIsMapLoading(false);
    }
  };

  const handleAddSpot = async () => {
    if (!newSpot.name || !newSpot.address) return;

    try {
      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSpot, college: userCollege?.key || 'BPIT' })
      });

      if (res.ok) {
        const addedSpot = await res.json();
        setSpots(prev => [addedSpot, ...prev]);
        setShowAddModal(false);
        setNewSpot({
          name: '', description: '', category: 'cafe', vibe: 'social', budget: 'moderate', 
          address: '', googleMapsUrl: '', distance: ''
        });
      }
    } catch (error) {
      console.error('Failed to add spot', error);
    }
  };
  const [filter, setFilter] = useState({ category: 'all', vibe: 'all', budget: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredSpots = spots.filter(spot => {
    if (filter.category !== 'all' && spot.category !== filter.category) return false;
    if (filter.vibe !== 'all' && spot.vibe !== filter.vibe) return false;
    if (filter.budget !== 'all' && spot.budget !== filter.budget) return false;
    if (searchQuery && !spot.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredEvents = events.filter(event => {
    // simplified category matching for events if needed
    if (filter.category !== 'all' && event.category?.toLowerCase() !== filter.category) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const [selectedSpot, setSelectedSpot] = useState(null);

  const fetchReviews = async (spotId) => {
    setIsLoadingReviews(true);
    try {
      const res = await fetch(`/api/spots/${spotId}/review`);
      if (res.ok) {
        const data = await res.json();
        setSpotReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSelectSpot = (spot) => {
    setSelectedSpot(spot);
    setReviewRating(0);
    setReviewText('');
    setReviewHover(0);
    fetchReviews(spot._id);
  };

  const handleSubmitReview = async () => {
    if (!selectedSpot || !reviewRating) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/spots/${selectedSpot._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, text: reviewText })
      });
      if (res.ok) {
        const data = await res.json();
        // Update spot avgRating/reviewCount in local state
        setSpots(prev => prev.map(s =>
          s._id === selectedSpot._id ? { ...s, avgRating: data.avgRating, reviewCount: data.reviewCount } : s
        ));
        setSelectedSpot(prev => ({ ...prev, avgRating: data.avgRating, reviewCount: data.reviewCount }));
        setReviewRating(0);
        setReviewText('');
        fetchReviews(selectedSpot._id);
      }
    } catch (err) {
      console.error('Submit review failed', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderStars = (rating, size = '14px') => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#f59e0b' : 'var(--text-secondary)', fontSize: size }}>★</span>
    ));
  };

  const openGoogleMaps = (spot) => {
    if (spot.googleMapsUrl) {
      window.open(spot.googleMapsUrl, '_blank');
    } else {
      const query = encodeURIComponent(`${spot.name} ${spot.address}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <MobileNav currentPage="spots" />

      {/* Main Content */}
      <div style={{ paddingTop: '80px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Header - Centered */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
              🧭 <span style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Explore</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Discover events, movies, and places near you</p>
          </div>

          {/* TABS (Events vs Places) */}
          <div style={{
             display: 'flex', justifyContent: 'center', marginBottom: '32px'
          }}>
             <div style={{
                display: 'inline-flex', background: 'var(--bg-secondary)', 
                borderRadius: '16px', padding: '6px', border: '1px solid var(--border-color)'
             }}>
                <button 
                  onClick={() => setActiveTab('events')}
                  style={{
                    padding: '10px 24px', borderRadius: '12px', border: 'none',
                    fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s',
                    background: activeTab === 'events' ? 'var(--text-primary)' : 'transparent',
                    color: activeTab === 'events' ? 'var(--bg-primary)' : 'var(--text-secondary)'
                  }}
                >
                  🎟️ Events & Shows
                </button>
                <button 
                  onClick={() => setActiveTab('places')}
                  style={{
                    padding: '10px 24px', borderRadius: '12px', border: 'none',
                    fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s',
                    background: activeTab === 'places' ? 'var(--text-primary)' : 'transparent',
                    color: activeTab === 'places' ? 'var(--bg-primary)' : 'var(--text-secondary)'
                  }}
                >
                  📍 Hangout Spots
                </button>
             </div>
          </div>

          {/* Search & Filters */}
          <div style={{ 
            maxWidth: '800px', margin: '0 auto 32px auto',
            background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px'
          }}>
            <input
              type="text"
              placeholder={activeTab === 'events' ? "🔍 Search events, movies, concerts..." : "🔍 Search places..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '12px 16px', marginBottom: '16px',
                background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
              }}
            />
            
            {activeTab === 'places' && (
              <div id="filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <select
                value={filter.category}
                onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                style={{ padding: '10px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px' }}
              >
                <option value="all">All Categories</option>
                <option value="cafe">☕ Cafes</option>
                <option value="restaurant">🍕 Restaurants</option>
                <option value="street_food">🌭 Street Food</option>
                <option value="park">🌳 Parks</option>
                <option value="shopping">🛍️ Shopping</option>
                <option value="gaming">🎮 Gaming</option>
                <option value="sweet_shop">🍬 Sweet Shop</option>
                <option value="library">📚 Library</option>
              </select>
              <select
                value={filter.vibe}
                onChange={(e) => setFilter(prev => ({ ...prev, vibe: e.target.value }))}
                style={{ padding: '10px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px' }}
              >
                <option value="all">All Vibes</option>
                <option value="social">🎉 Social</option>
                <option value="quiet">🤫 Quiet</option>
                <option value="productive">💻 Productive</option>
                <option value="romantic">🌹 Romantic</option>
                <option value="nature">🍃 Nature</option>
                <option value="late_night">🌙 Late Night</option>
              </select>
              <select
                value={filter.budget}
                onChange={(e) => setFilter(prev => ({ ...prev, budget: e.target.value }))}
                style={{ padding: '10px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px' }}
              >
                <option value="all">All Budgets</option>
                <option value="free">💚 Free</option>
                <option value="broke">💸 Broke</option>
                <option value="cheap">💵 Cheap</option>
                <option value="moderate">💵💵 Moderate</option>
                <option value="expensive">💰 Expensive</option>
                <option value="luxury">💎 Luxury</option>
              </select>
            </div>
            )}
            
            {activeTab === 'events' && (
              <div id="filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <select
                  value={filter.category}
                  onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                  style={{ padding: '10px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px' }}
                >
                  <option value="all">All Events</option>
                  <option value="hackathon">💻 Hackathons</option>
                  <option value="movie">🍿 Movies</option>
                  <option value="cultural fest">🎭 Cultural Fests</option>
                  <option value="concert">🎤 Concerts</option>
                </select>
              </div>
            )}
            
          </div>

          {/* Results Count - Centered */}
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Found <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeTab === 'events' ? filteredEvents.length : filteredSpots.length}</span> results
          </p>

          {/* Main Grid */}
          <div id="spots-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '24px',
            maxWidth: '1100px',
            margin: '0 auto'
          }}>
            {activeTab === 'events' && isLoadingEvents && (
               <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading live events...</div>
            )}
            {activeTab === 'events' && !isLoadingEvents && filteredEvents.map(event => (
              <EventCard 
                 key={event._id} 
                 event={event} 
                 onVote={handleEventVote} 
                 onReport={() => console.log('Report Event')} 
              />
            ))}

            {activeTab === 'places' && isLoadingSpots && (
               <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading spots...</div>
            )}
            {activeTab === 'places' && !isLoadingSpots && filteredSpots.map(spot => (
              <div 
                key={spot._id} 
                onClick={() => handleSelectSpot(spot)}
                style={{ 
                  background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px',
                  transition: 'all 0.3s', cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{categoryEmojis[spot.category] || '📍'}</span>
                    <div>
                      <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>{spot.name}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{spot.distance}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {spot.activeCheckinCount > 0 && (
                      <span style={{
                        fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
                        background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600,
                        animation: 'pulse 2s infinite'
                      }}>
                        📍 {spot.activeCheckinCount} here
                      </span>
                    )}
                    <button
                        onClick={(e) => handleVote(spot._id, 'upvote', e)}
                        style={{ 
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: spot.isUpvoted ? '#10b981' : 'var(--text-secondary)',
                            fontWeight: spot.isUpvoted ? 700 : 400
                        }}
                    >
                        👍 {spot.upvotes || 0}
                    </button>
                    <button
                        onClick={(e) => handleVote(spot._id, 'downvote', e)}
                        style={{ 
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: spot.isDownvoted ? '#ef4444' : 'var(--text-secondary)',
                            fontWeight: spot.isDownvoted ? 700 : 400
                        }}
                    >
                        👎 {spot.downvotes || 0}
                    </button>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px', lineHeight: 1.5 }}>{spot.description}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span style={{ 
                    fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
                    background: 'rgba(139,92,246,0.1)', color: '#a78bfa', textTransform: 'capitalize'
                  }}>
                    ✨ {spot.vibe.replace('_', ' ')}
                  </span>
                  <span style={{ 
                    fontSize: '11px', padding: '4px 10px', borderRadius: '20px', 
                    background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', textTransform: 'capitalize' 
                  }}>
                    💰 {spot.budget}
                  </span>
                </div>
                {/* Star rating */}
                {spot.avgRating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex' }}>{renderStars(spot.avgRating, '13px')}</div>
                    <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>{spot.avgRating}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>({spot.reviewCount})</span>
                  </div>
                )}
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📍 {spot.address}</p>
              </div>
            ))}
          </div>

            {activeTab === 'places' && (
              <div style={{ 
                maxWidth: '600px', margin: '48px auto 0 auto', textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(88,28,135,0.3), rgba(6,78,59,0.3))',
                border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', padding: '32px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Know a great chill spot?</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                  Share it with the community! Add it directly here.
                </p>
                <button onClick={() => setShowAddModal(true)} style={{ 
                  padding: '12px 24px', background: '#8b5cf6', color: 'white', border: 'none',
                  borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '14px',
                  marginRight: '12px'
                }}>
                  ➕ Add New Spot
                </button>
                <button onClick={fetchSpotsFromMap} disabled={isMapLoading} style={{ 
                  padding: '12px 24px', background: 'transparent', color: '#8b5cf6', border: '1px solid #8b5cf6',
                  borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '14px'
                }}>
                  {isMapLoading ? '🗺️ Searching...' : '🌍 Fetch from Maps'}
                </button>
              </div>
            )}
            
            {activeTab === 'events' && (
              <div style={{ 
                maxWidth: '600px', margin: '48px auto 0 auto', textAlign: 'center',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)', borderRadius: '20px', padding: '32px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Organizing an Event?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                  List your college fest, private party, or standup gig here!
                </p>
                <button onClick={() => { /* Wait for 'Add Event Modal' */ alert('Coming soon!') }} style={{ 
                  padding: '12px 24px', background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none',
                  borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '14px'
                }}>
                  ➕ List an Event
                </button>
              </div>
            )}

          {/* Add Spot Modal */}
          {showAddModal && (
            <div style={{ 
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
            }} onClick={() => setShowAddModal(false)}>
              <div style={{ 
                background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', 
                padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto'
              }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px', textAlign: 'center' }}>
                  📍 Add New Spot
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Spot Name *</label>
                    <input type="text" value={newSpot.name} onChange={e => setNewSpot({ ...newSpot, name: e.target.value })}
                      placeholder="e.g. Hidden Cafe"
                      style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Description</label>
                    <textarea value={newSpot.description} onChange={e => setNewSpot({ ...newSpot, description: e.target.value })}
                      placeholder="What makes this place special?"
                      style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', minHeight: '80px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Category</label>
                      <select value={newSpot.category} onChange={e => setNewSpot({ ...newSpot, category: e.target.value })}
                        style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
                      >
                        <option value="cafe">☕ Cafe</option>
                        <option value="restaurant">🍕 Restaurant</option>
                        <option value="street_food">🌭 Street Food</option>
                        <option value="park">🌳 Park</option>
                        <option value="shopping">🛍️ Shopping</option>
                        <option value="gaming">🎮 Gaming</option>
                        <option value="sweet_shop">🍬 Sweet Shop</option>
                        <option value="library">📚 Library</option>
                        <option value="other">📍 Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Distance</label>
                      <input type="text" value={newSpot.distance} onChange={e => setNewSpot({ ...newSpot, distance: e.target.value })}
                        placeholder="e.g. 10 min walk"
                        style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Vibe</label>
                      <select value={newSpot.vibe} onChange={e => setNewSpot({ ...newSpot, vibe: e.target.value })}
                        style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
                      >
                        <option value="social">🎉 Social</option>
                        <option value="quiet">🤫 Quiet</option>
                        <option value="productive">💻 Productive</option>
                        <option value="romantic">🌹 Romantic</option>
                        <option value="nature">🍃 Nature</option>
                        <option value="late_night">🌙 Late Night</option>
                        <option value="both">🎭 Both</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Budget</label>
                      <select value={newSpot.budget} onChange={e => setNewSpot({ ...newSpot, budget: e.target.value })}
                        style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
                      >
                        <option value="free">💚 Free</option>
                        <option value="broke">💸 Broke</option>
                        <option value="cheap">💵 Cheap</option>
                        <option value="moderate">💵💵 Moderate</option>
                        <option value="expensive">💰 Expensive</option>
                        <option value="luxury">💎 Luxury</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Address / Location *</label>
                    <input type="text" value={newSpot.address} onChange={e => setNewSpot({ ...newSpot, address: e.target.value })}
                      placeholder="Street address or Area"
                      style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Google Maps Link (Optional)</label>
                    <input type="text" value={newSpot.googleMapsUrl} onChange={e => setNewSpot({ ...newSpot, googleMapsUrl: e.target.value })}
                      placeholder="Paste link from Google Maps to auto-set location"
                      style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
                    />
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Tip: Paste a Google Maps link to help others find it exactly!
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '12px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                    <button onClick={handleAddSpot} style={{ flex: 1, padding: '12px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 }}>Add Spot</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Spot Details Popup */}
          {selectedSpot && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 110,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
            }} onClick={() => setSelectedSpot(null)}>
              <div style={{
                background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px',
                padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative',
                animation: 'fadeIn 0.2s ease-out'
              }} onClick={e => e.stopPropagation()}>
                
                <button onClick={() => setSelectedSpot(null)} style={{
                  position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none',
                  color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer'
                }}>×</button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>{categoryEmojis[selectedSpot.category]}</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {selectedSpot.name}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>{selectedSpot.distance}</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <span style={{ 
                    fontSize: '13px', padding: '6px 14px', borderRadius: '20px',
                    background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
                    textTransform: 'capitalize'
                  }}>
                    ✨ {selectedSpot.vibe.replace('_', ' ')}
                  </span>
                  <span style={{ 
                    fontSize: '13px', padding: '6px 14px', borderRadius: '20px', 
                    background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                    textTransform: 'capitalize'
                  }}>
                    💰 {selectedSpot.budget.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                    👍 {selectedSpot.upvotes} Upvotes
                  </span>
                </div>

                <p style={{ 
                    color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.6, textAlign: 'center',
                    marginBottom: '24px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px'
                }}>
                    {selectedSpot.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px', justifyContent: 'center' }}>
                        <span>📍 {selectedSpot.address}</span>
                    </div>

                    {/* Check-in badge */}
                    {selectedSpot.activeCheckinCount > 0 && (
                      <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>
                          📍 {selectedSpot.activeCheckinCount} {selectedSpot.activeCheckinCount === 1 ? 'person' : 'people'} here now
                        </span>
                      </div>
                    )}

                    {/* I'm Here button */}
                    <button
                        onClick={(e) => handleCheckin(selectedSpot._id, e)}
                        style={{
                          width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '14px',
                          cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          background: selectedSpot.isCheckedIn ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                          border: selectedSpot.isCheckedIn ? '2px solid #10b981' : '1px solid var(--border-color)',
                          color: selectedSpot.isCheckedIn ? '#10b981' : 'var(--text-primary)',
                        }}
                    >
                        {selectedSpot.isCheckedIn ? '✓ Checked In' : '📍 I\'m Here'}
                    </button>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                          onClick={(e) => handleVote(selectedSpot._id, 'upvote', e)}
                          style={{ 
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '10px',
                            background: selectedSpot.isUpvoted ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                            border: selectedSpot.isUpvoted ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border-color)',
                            borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                      >
                          <span style={{ fontSize: '14px' }}>{selectedSpot.isUpvoted ? '💚' : '👍'}</span>
                          <span style={{ color: selectedSpot.isUpvoted ? '#10b981' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>{selectedSpot.upvotes || 0}</span>
                      </button>
                      <button
                          onClick={(e) => handleVote(selectedSpot._id, 'downvote', e)}
                          style={{ 
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '10px',
                            background: selectedSpot.isDownvoted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                            border: selectedSpot.isDownvoted ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border-color)',
                            borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                      >
                          <span style={{ fontSize: '14px' }}>👎</span>
                          <span style={{ color: selectedSpot.isDownvoted ? '#ef4444' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>{selectedSpot.downvotes || 0}</span>
                      </button>
                    </div>

                    <button 
                        onClick={() => openGoogleMaps(selectedSpot)}
                        style={{
                            width: '100%', padding: '14px', background: '#8b5cf6', color: 'white',
                            border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '16px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span>🗺️</span> Open in Google Maps
                    </button>

                    {/* Reviews Section */}
                    <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                        ⭐ Reviews {selectedSpot.reviewCount > 0 && <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)' }}>({selectedSpot.avgRating} avg · {selectedSpot.reviewCount} reviews)</span>}
                      </h4>

                      {/* Write a Review */}
                      <div style={{
                        background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '16px', marginBottom: '16px'
                      }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Rate this spot</p>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setReviewHover(star)}
                              onMouseLeave={() => setReviewHover(0)}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                                fontSize: '24px', transition: 'transform 0.1s',
                                color: star <= (reviewHover || reviewRating) ? '#f59e0b' : 'var(--text-secondary)',
                                transform: star <= (reviewHover || reviewRating) ? 'scale(1.2)' : 'scale(1)'
                              }}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your experience... (optional)"
                          maxLength={300}
                          style={{
                            width: '100%', padding: '10px', background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)', borderRadius: '8px',
                            color: 'var(--text-primary)', fontSize: '13px', minHeight: '60px', resize: 'vertical'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{reviewText.length}/300</span>
                          <button
                            onClick={handleSubmitReview}
                            disabled={!reviewRating || reviewSubmitting}
                            style={{
                              padding: '8px 20px', borderRadius: '8px', border: 'none',
                              background: reviewRating ? '#f59e0b' : 'var(--bg-tertiary)',
                              color: reviewRating ? '#000' : 'var(--text-secondary)',
                              fontWeight: 600, fontSize: '13px', cursor: reviewRating ? 'pointer' : 'default',
                              opacity: reviewSubmitting ? 0.6 : 1
                            }}
                          >
                            {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                          </button>
                        </div>
                      </div>

                      {/* Review List */}
                      {isLoadingReviews ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', padding: '12px' }}>Loading reviews...</p>
                      ) : spotReviews.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                          {spotReviews.map((review, idx) => (
                            <div key={idx} style={{
                              padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {review.userImage && (
                                    <img src={review.userImage} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                                  )}
                                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{review.userName}</span>
                                </div>
                                <div style={{ display: 'flex' }}>{renderStars(review.rating, '12px')}</div>
                              </div>
                              {review.text && (
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{review.text}</p>
                              )}
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', opacity: 0.6 }}>
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', padding: '8px' }}>No reviews yet. Be the first!</p>
                      )}
                    </div>

                    {/* Report button */}
                    <button
                        onClick={() => {
                          setReportingSpotId(selectedSpot._id);
                          setShowReportModal(true);
                        }}
                        style={{
                          width: '100%', padding: '10px', background: 'transparent',
                          border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
                          color: '#ef4444', fontSize: '13px', cursor: 'pointer',
                          opacity: 0.7, transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                    >
                        ⚠️ Report this spot
                    </button>
                </div>
              </div>
            </div>
          )}

          {/* Report Modal */}
          {showReportModal && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 120,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
            }} onClick={() => { setShowReportModal(false); setReportSuccess(false); }}>
              <div style={{
                background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px',
                padding: '32px', maxWidth: '420px', width: '100%', animation: 'fadeIn 0.2s ease-out'
              }} onClick={e => e.stopPropagation()}>
                {reportSuccess ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <h3 style={{ color: '#10b981', fontSize: '20px', fontWeight: 600 }}>Report Submitted</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Thanks for helping keep spots accurate!</p>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '20px', textAlign: 'center' }}>
                      ⚠️ Report Spot
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Reason</label>
                        <select value={reportData.reason} onChange={e => setReportData({ ...reportData, reason: e.target.value })}
                          style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
                        >
                          <option value="closed">🚫 Permanently Closed</option>
                          <option value="inaccurate">📍 Inaccurate Info</option>
                          <option value="spam">🗑️ Spam / Fake</option>
                          <option value="inappropriate">⛔ Inappropriate</option>
                          <option value="other">📝 Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Details (optional)</label>
                        <textarea value={reportData.detail} onChange={e => setReportData({ ...reportData, detail: e.target.value })}
                          placeholder="Tell us more..."
                          maxLength={300}
                          style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', minHeight: '80px', resize: 'vertical' }}
                        />
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'right' }}>{reportData.detail.length}/300</p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowReportModal(false)} style={{ flex: 1, padding: '12px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                        <button onClick={handleReport} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 }}>Submit Report</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        @media (max-width: 768px) {
          #filters {
            flex-direction: column !important;
          }
          
          #filters select {
            width: 100%;
          }
          
          #spots-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
