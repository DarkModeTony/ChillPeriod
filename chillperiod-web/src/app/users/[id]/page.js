'use client';

import MobileNav from '@/components/MobileNav';
import AttendanceHeatmap from '@/components/AttendanceHeatmap';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

export default function UserProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    // Only fetch user when session loading is finished (either authenticated or null)
    if (session !== undefined) {
      fetchUser();
    }
  }, [id, session]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        // Check if current user follows this user
        if (session?.user?.id && data.followers && Array.isArray(data.followers)) {
          const myId = String(session.user.id).trim();
          const alreadyFollowing = data.followers.some(f => {
            // Handle all possible formats: populated object, raw ObjectId, plain string
            const rawId = f?._id || f?.id || f;
            const fId = typeof rawId === 'object' ? String(rawId.$oid || rawId._id || rawId) : String(rawId);
            return fId.trim() === myId;
          });
          setIsFollowing(alreadyFollowing);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!session?.user) {
      window.location.href = '/login';
      return;
    }

    setFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`/api/users/${id}/follow`, { method });
      
      if (res.ok) {
        setIsFollowing(!isFollowing);
        setUser(prev => ({
          ...prev,
          followerCount: prev.followerCount + (isFollowing ? -1 : 1)
        }));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
    setFollowLoading(false);
  };

  // Mock user for demo
  const mockUser = {
    name: 'Demo User',
    username: 'demouser',
    college: 'Delhi University',
    totalBunks: 42,
    attendedClasses: 48,
    totalClasses: 60,
    attendancePercentage: 80,
    followerCount: 23,
    followingCount: 15,
    favoriteSpot: { name: 'Central Park', emoji: '🌳' },
    isPublic: true,
    xp: 0,
    level: 1
  };

  const displayUser = user || mockUser;
  const isOwnProfile = session?.user?.id === id;

  // Calculate Progress to next level
  const xp = displayUser.xp || 0;
  const level = displayUser.level || 1;
  const currentLevelXp = Math.pow(level - 1, 2) * 10;
  const nextLevelXp = Math.pow(level, 2) * 10;
  const xpIntoLevel = xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const progressPercentage = xpNeededForLevel > 0 
    ? Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForLevel) * 100))
    : 0;


  // Bunk title logic
  const getBunkTitle = (bunks) => {
    if (bunks >= 100) return { title: 'Bunk Legend', emoji: '👑' };
    if (bunks >= 50) return { title: 'Bunk King', emoji: '🏆' };
    if (bunks >= 25) return { title: 'Serial Skipper', emoji: '😴' };
    if (bunks >= 10) return { title: 'Chill Master', emoji: '😎' };
    if (bunks >= 5) return { title: 'Casual Bunker', emoji: '🌴' };
    return { title: 'Rookie', emoji: '🌱' };
  };

  const bunkTitle = getBunkTitle(displayUser.totalBunks || 0);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <MobileNav currentPage="profile" />

      <div style={{ paddingTop: '80px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>

          {/* Profile Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {/* Avatar */}
            <div style={{ 
              width: '100px', height: '100px', margin: '0 auto 16px auto',
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              padding: '3px'
            }}>
              <div style={{ 
                width: '100%', height: '100%', borderRadius: '50%', 
                background: 'var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px', overflow: 'hidden'
              }}>
                {displayUser.image ? (
                  <img src={displayUser.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '👤'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {displayUser.name}
              </h1>
            </div>
            
            {displayUser.username && (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                @{displayUser.username}
              </p>
            )}

            {displayUser.college && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                📍 {displayUser.college}
              </p>
            )}

            {displayUser.socialLinks && (displayUser.socialLinks.instagram || displayUser.socialLinks.linkedin || displayUser.socialLinks.leetcode || displayUser.socialLinks.codeforces) && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
                {displayUser.socialLinks.instagram && <a href={displayUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#e1306c', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', width: '40px', height: '40px', borderRadius: '50%', textDecoration: 'none', transition: 'opacity 0.2s', opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.9}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>}
                {displayUser.socialLinks.linkedin && <a href={displayUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', width: '40px', height: '40px', borderRadius: '50%', textDecoration: 'none', transition: 'opacity 0.2s', opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.9}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>}
                {displayUser.socialLinks.leetcode && <a href={displayUser.socialLinks.leetcode} target="_blank" rel="noopener noreferrer" style={{ color: '#FFA116', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', width: '40px', height: '40px', borderRadius: '50%', textDecoration: 'none', transition: 'opacity 0.2s', opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.9}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.939 5.939 0 0 0 1.271 1.543l3.995 3.926a5.23 5.23 0 0 0 3.79 1.657 5.231 5.231 0 0 0 3.787-1.658l2.112-2.075a1.37 1.37 0 0 0 0-1.925 1.365 1.365 0 0 0-1.922 0l-2.112 2.075c-.468.459-1.133.736-1.802.736s-1.333-.277-1.802-.736l-3.995-3.926a3.179 3.179 0 0 1-.605-.733 3.328 3.328 0 0 1-.413-1.079 3.15 3.15 0 0 1-.12-1.059 3.24 3.24 0 0 1 .595-1.54l3.818-4.08 5.35-5.733a1.365 1.365 0 0 0 0-1.922 1.363 1.363 0 0 0-.96-.441zM7.336 17.863a1.368 1.368 0 0 0-.96 2.328l2.094 2.057c.84.825 2.049 1.319 3.342 1.319s2.502-.494 3.342-1.319l2.094-2.057a1.364 1.364 0 0 0 0-1.925 1.356 1.356 0 0 0-1.916 0l-2.094 2.057c-.468.459-1.133.736-1.802.736s-1.333-.277-1.802-.736l-2.094-2.057a1.363 1.363 0 0 0-.964-.403zM22.062 10.648a1.366 1.366 0 0 0-.96.441l-2.128 2.092a1.365 1.365 0 0 0 0 1.925 1.363 1.363 0 0 0 1.925 0l2.128-2.092a1.365 1.365 0 0 0 0-1.925 1.361 1.361 0 0 0-.965-.441zm-10.02 1.636a1.368 1.368 0 0 0-.96 2.327l5.244 5.152a1.365 1.365 0 0 0 1.92 0 1.363 1.363 0 0 0 0-1.922l-5.244-5.152a1.363 1.363 0 0 0-.96-.405z"/>
                  </svg>
                </a>}
                {displayUser.socialLinks.codeforces && <a href={displayUser.socialLinks.codeforces} target="_blank" rel="noopener noreferrer" style={{ color: '#1F8ACB', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', width: '40px', height: '40px', borderRadius: '50%', textDecoration: 'none', transition: 'opacity 0.2s', opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.9}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-15c0-.828.672-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z"/>
                  </svg>
                </a>}
              </div>
            )}

            {/* XP Progress Bar */}
            <div style={{ maxWidth: '300px', margin: '0 auto 20px auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', 
                    padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                  }}>
                    Lv {level}
                  </div>
                  <span>XP: {xp} / {nextLevelXp}</span>
                </div>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${progressPercentage}%`, height: '100%', 
                  background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                  borderRadius: '4px', transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>

            {/* Bunk Title Badge */}
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px',
              marginBottom: '16px'
            }}>
              <span>{bunkTitle.emoji}</span>
              <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 500 }}>{bunkTitle.title}</span>
            </div>

            {/* Follow Button */}
            {!isOwnProfile && (
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  style={{
                    padding: '12px 32px', border: 'none', borderRadius: '12px',
                    fontWeight: 600, fontSize: '15px', cursor: followLoading ? 'wait' : 'pointer',
                    background: isFollowing ? 'var(--bg-tertiary)' : '#8b5cf6',
                    color: isFollowing ? 'var(--text-secondary)' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  {followLoading ? '...' : isFollowing ? 'Following ✓' : 'Follow +'}
                </button>
              </div>
            )}

            {isOwnProfile && (
              <Link href="/profile" style={{
                display: 'inline-block', marginTop: '8px',
                padding: '10px 24px', background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)', borderRadius: '10px',
                color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none'
              }}>
                ✏️ Edit Profile
              </Link>
            )}
          </div>

          {/* Follower Stats */}
          <div style={{ 
            display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px',
            padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)',
            borderRadius: '14px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '20px', color: 'var(--text-primary)' }}>
                {displayUser.followerCount || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Followers</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '20px', color: 'var(--text-primary)' }}>
                {displayUser.followingCount || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Following</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
              borderRadius: '14px', padding: '16px', textAlign: 'center' 
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                {displayUser.attendancePercentage || 0}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Attendance</div>
            </div>
            <div style={{ 
              background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
              borderRadius: '14px', padding: '16px', textAlign: 'center' 
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {displayUser.totalBunks || 0}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Bunks</div>
            </div>
            <div style={{ 
              background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
              borderRadius: '14px', padding: '16px', textAlign: 'center' 
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {displayUser.attendedClasses || 0}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Attended</div>
            </div>
          </div>

          {/* Attendance Heatmap */}
          {(() => {
            // Transform array format to object format for the heatmap
            const logMap = {};
            const rawLog = displayUser.attendanceLog || [];
            if (Array.isArray(rawLog)) {
              rawLog.forEach(day => {
                if (!day.date || !day.actions) return;
                let attended = 0, bunked = 0;
                day.actions.forEach(a => {
                  if (a.status === 'attended') attended++;
                  if (a.status === 'bunked') bunked++;
                });
                if (attended > 0 || bunked > 0) {
                  logMap[day.date] = { attended, bunked };
                }
              });
            }
            return <AttendanceHeatmap attendanceLog={logMap} />;
          })()}

          {/* Favorite Spot */}
          {displayUser.favoriteSpot?.name && (
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '16px', padding: '20px', marginBottom: '24px'
            }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Favorite Bunking Spot
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{displayUser.favoriteSpot.emoji || '📍'}</span>
                <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {displayUser.favoriteSpot.name}
                </span>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/leaderboard" style={{ 
              flex: 1, padding: '14px', background: 'var(--card-bg)', 
              border: '1px solid var(--border-color)', borderRadius: '12px',
              textAlign: 'center', textDecoration: 'none', color: 'var(--text-primary)',
              fontWeight: 500, fontSize: '14px'
            }}>
              🏆 View Leaderboard
            </Link>
            <Link href="/spots" style={{ 
              flex: 1, padding: '14px', background: 'var(--card-bg)', 
              border: '1px solid var(--border-color)', borderRadius: '12px',
              textAlign: 'center', textDecoration: 'none', color: 'var(--text-primary)',
              fontWeight: 500, fontSize: '14px'
            }}>
              📍 Find Spots
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
