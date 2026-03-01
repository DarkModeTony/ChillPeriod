'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import NotificationPanel from './NotificationPanel';

export default function MobileNav({ currentPage = 'home' }) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications?unread=true');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (e) { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-primary)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
            ChillPeriod
          </Link>
          
          {/* Desktop Links */}
          {/* Desktop Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginLeft: 'auto', justifyContent: 'flex-end' }} className="desktop-nav">
            
            {status === 'authenticated' && (
              <>
                <ThemeToggle />
                <Link href="/spots" style={{ color: currentPage === 'spots' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: currentPage === 'spots' ? 500 : 400, textDecoration: 'none' }}>Explore</Link>
                <Link href="/attendance" style={{ color: currentPage === 'attendance' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: currentPage === 'attendance' ? 500 : 400, textDecoration: 'none' }}>Attendance</Link>
                <Link href="/tasks" style={{ color: currentPage === 'tasks' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: currentPage === 'tasks' ? 500 : 400, textDecoration: 'none' }}>Tasks</Link>
                <Link href="/timetable" style={{ color: currentPage === 'timetable' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: currentPage === 'timetable' ? 500 : 400, textDecoration: 'none' }}>Timetable</Link>
                <Link href="/syllabus" style={{ color: currentPage === 'syllabus' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: currentPage === 'syllabus' ? 500 : 400, textDecoration: 'none' }}>Syllabus</Link>
                <Link href="/leaderboard" style={{ color: currentPage === 'leaderboard' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: currentPage === 'leaderboard' ? 500 : 400, textDecoration: 'none' }}>🏆</Link>
                <Link href="/search" style={{ color: currentPage === 'search' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: currentPage === 'search' ? 500 : 400, textDecoration: 'none' }}>🔍</Link>
                <button onClick={() => setIsNotifOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', position: 'relative', fontSize: '16px', padding: '4px' }}>
                  🔔
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 700, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <Link href="/profile" style={{ color: currentPage === 'profile' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: currentPage === 'profile' ? 500 : 400, textDecoration: 'none' }}>Profile</Link>
                
                {session?.user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#10b981' }}>{session.user.name?.split(' ')[0] || 'User'}</span>
                    </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          {status === 'authenticated' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="mobile-theme-toggle" style={{ display: 'none', marginRight: '8px' }}>
                <ThemeToggle />
              </div>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                  display: 'none',
                  background: 'none', border: 'none', color: 'var(--text-primary)', 
                  fontSize: '24px', cursor: 'pointer', padding: '8px'
                }}
                className="mobile-hamburger"
                aria-label="Toggle menu"
              >
                {isOpen ? '✕' : '☰'}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          style={{ 
            position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0,
            background: 'var(--bg-primary)', 
            backdropFilter: 'blur(12px)',
            zIndex: 40, padding: '24px',
            display: 'none',
            overflowY: 'auto',
            paddingBottom: '120px'
          }}
          className="mobile-menu"
          onClick={() => setIsOpen(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Link 
              href="/profile" 
              style={{ 
                color: currentPage === 'profile' ? '#8b5cf6' : 'var(--text-primary)', 
                fontSize: '20px', fontWeight: 600, textDecoration: 'none',
                padding: '16px', background: 'var(--bg-tertiary)',
                borderRadius: '12px', textAlign: 'center'
              }}
            >
              👤 Profile
            </Link>
            <Link 
              href="/spots" 
              style={{ 
                color: currentPage === 'spots' ? '#8b5cf6' : 'var(--text-primary)', 
                fontSize: '20px', fontWeight: 600, textDecoration: 'none',
                padding: '16px', background: 'var(--bg-tertiary)',
                borderRadius: '12px', textAlign: 'center'
              }}
            >
              🧭 Explore
            </Link>
            <Link 
              href="/attendance" 
              style={{ 
                color: currentPage === 'attendance' ? '#8b5cf6' : 'var(--text-primary)', 
                fontSize: '20px', fontWeight: 600, textDecoration: 'none',
                padding: '16px', background: 'var(--bg-tertiary)',
                borderRadius: '12px', textAlign: 'center'
              }}
            >
              📊 Attendance
            </Link>
            <Link 
              href="/tasks" 
              style={{ 
                color: currentPage === 'tasks' ? '#8b5cf6' : 'var(--text-primary)', 
                fontSize: '20px', fontWeight: 600, textDecoration: 'none',
                padding: '16px', background: 'var(--bg-tertiary)',
                borderRadius: '12px', textAlign: 'center'
              }}
            >
              ✅ Tasks
            </Link>
            <Link 
              href="/timetable" 
              style={{ 
                color: currentPage === 'timetable' ? '#8b5cf6' : 'var(--text-primary)', 
                fontSize: '20px', fontWeight: 600, textDecoration: 'none',
                padding: '16px', background: 'var(--bg-tertiary)',
                borderRadius: '12px', textAlign: 'center'
              }}
            >
              📅 Timetable
            </Link>
            <Link 
              href="/syllabus" 
              style={{ 
                color: currentPage === 'syllabus' ? '#8b5cf6' : 'var(--text-primary)', 
                fontSize: '20px', fontWeight: 600, textDecoration: 'none',
                padding: '16px', background: 'var(--bg-tertiary)',
                borderRadius: '12px', textAlign: 'center'
              }}
            >
              📚 Syllabus
            </Link>
            <Link 
              href="/leaderboard" 
              style={{ 
                color: currentPage === 'leaderboard' ? '#8b5cf6' : 'var(--text-primary)', 
                fontSize: '20px', fontWeight: 600, textDecoration: 'none',
                padding: '16px', background: 'var(--bg-tertiary)',
                borderRadius: '12px', textAlign: 'center'
              }}
            >
              🏆 Leaderboard
            </Link>
            <Link 
              href="/search" 
              style={{ 
                color: currentPage === 'search' ? '#8b5cf6' : 'var(--text-primary)', 
                fontSize: '20px', fontWeight: 600, textDecoration: 'none',
                padding: '16px', background: 'var(--bg-tertiary)',
                borderRadius: '12px', textAlign: 'center'
              }}
            >
              🔍 Find Friends
            </Link>
            <button 
              onClick={() => { setIsOpen(false); setIsNotifOpen(true); }}
              style={{ 
                color: 'var(--text-primary)', width: '100%',
                fontSize: '20px', fontWeight: 600,
                padding: '16px', background: 'var(--bg-tertiary)',
                borderRadius: '12px', textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                border: 'none', cursor: 'pointer'
              }}
            >
              🔔 Notifications
              {unreadCount > 0 && (
                <span style={{ background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{ 
                width: '100%',
                color: '#ef4444', 
                fontSize: '20px', fontWeight: 600, 
                padding: '16px', background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '12px', textAlign: 'center',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer'
              }}
            >
              🚪 Logout
            </button>
            <Link 
              href="/attendance" 
              style={{ 
                padding: '16px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', 
                color: 'white', borderRadius: '12px', fontWeight: 600, fontSize: '18px',
                textDecoration: 'none', textAlign: 'center'
              }}
            >
              Get Started →
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-hamburger {
            display: block !important;
          }
          .mobile-menu {
            display: block !important;
          }
          .mobile-theme-toggle {
            display: block !important;
          }
        }
      `}</style>

      <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
}
