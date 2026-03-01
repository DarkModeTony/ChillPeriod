'use client';
import { useState } from 'react';

const categoryEmojis = {
  'Hackathon': '💻',
  'Cultural Fest': '🎭',
  'Concert': '🎤',
  'Movie': '🍿',
  'Standup': '🎙️',
  'Workshop': '🛠️',
  'Sports': '⚽',
  'Party': '🎉',
  'Other': '📍'
};

const categoryColors = {
  'Hackathon': '#10b981',      // Emerald
  'Cultural Fest': '#f59e0b',  // Amber
  'Concert': '#8b5cf6',        // Violet
  'Movie': '#ef4444',          // Red
  'Standup': '#3b82f6',        // Blue
  'Workshop': '#6366f1',       // Indigo
  'Sports': '#14b8a6',          // Teal
  'Party': '#ec4899',          // Pink
  'Other': '#6b7280'           // Gray
};

export default function EventCard({ event, onVote, onReport }) {
  const [isHovered, setIsHovered] = useState(false);
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  const categoryColor = categoryColors[event.category] || categoryColors['Other'];

  return (
    <div 
      className="event-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${isHovered ? categoryColor + '80' : 'var(--border-color)'}`,
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? `0 12px 24px -8px ${categoryColor}40` : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Date Badge */}
      <div style={{
        position: 'absolute',
        top: '12px', right: '12px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '14px',
        zIndex: 2,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {formattedDate}
      </div>

      {/* Poster Image */}
      <div style={{
        width: '100%',
        height: '200px',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-tertiary)'
      }}>
        <img 
          src={event.posterUrl || 'https://via.placeholder.com/400x200'}
          alt={event.title}
          style={{
             width: '100%',
             height: '100%',
             objectFit: 'cover',
             transition: 'transform 0.5s ease',
             transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200' }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 100%)',
          height: '60px'
        }}/>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ 
                background: `${categoryColor}20`, 
                color: categoryColor, 
                padding: '4px 8px', 
                borderRadius: '6px', 
                fontSize: '12px', 
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                {categoryEmojis[event.category] || categoryEmojis['Other']} {event.category}
            </span>
            {event.verified && (
               <span style={{ color: '#10b981', fontSize: '14px', display: 'flex', alignItems: 'center' }} title="Verified Event">
                 ✅
               </span>
            )}
        </div>

        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.3' }}>
            {event.title}
        </h3>
        
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.description}
        </p>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
               📍 <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.venue} • {event.college === 'Citywide' ? 'Public' : event.college}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    🪙 {event.price || 'Free'}
                 </div>
                 
                 {/* Votes & Actions */}
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                       onClick={(e) => onVote(event._id, 'up', e)}
                       style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-primary)', transition: 'background 0.2s' }}
                       className="hover-bg-action"
                    >
                       🔥 {event.score || (event.upvotes - Math.abs(event.downvotes || 0))}
                    </button>
                    {(event.source === 'Unstop' || event.source === 'Devfolio' || event.source === 'TMDB') && (
                       <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>via {event.source}</span>
                    )}
                 </div>
            </div>
        </div>

        {event.bookingUrl && (
            <a 
               href={event.bookingUrl}
               target="_blank"
               rel="noopener noreferrer"
               style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '16px',
                  padding: '10px',
                  background: isHovered ? `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)` : 'var(--bg-tertiary)',
                  color: isHovered ? 'white' : 'var(--text-primary)',
                  textAlign: 'center',
                  borderRadius: '10px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${isHovered ? 'transparent' : 'var(--border-color)'}`
               }}
            >
               {event.category === 'Movie' ? 'Book Tickets' : 'Register Now'}
            </a>
        )}
      </div>
    </div>
  );
}
