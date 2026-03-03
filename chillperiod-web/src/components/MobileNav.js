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
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto', justifyContent: 'flex-end', position: 'relative' }} className="desktop-nav">
            
            {status === 'authenticated' && (
              <>
                <Link href="/spots" style={{ color: currentPage === 'spots' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: currentPage === 'spots' ? 500 : 400, textDecoration: 'none', fontSize: '15px' }}>Explore</Link>
                <Link href="/attendance" style={{ color: currentPage === 'attendance' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: currentPage === 'attendance' ? 500 : 400, textDecoration: 'none', fontSize: '15px' }}>Attendance</Link>
                <div style={{ marginRight: '8px' }}>
                  <ThemeToggle />
                </div>
                
                {session?.user && (
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.2)', textDecoration: 'none' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#10b981' }}>{session.user.name?.split(' ')[0] || 'User'}</span>
                    </Link>
                )}

                {/* Dropdown Hamburger */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="hamburger-toggle"
                    style={{ 
                      background: 'none', border: 'none', color: 'var(--text-primary)', 
                      cursor: 'pointer', padding: '4px 8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '40px', height: '40px'
                    }}
                    aria-label="Toggle desktop menu"
                  >
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
                        <line x1="3" y1={isOpen ? "12" : "12"} x2="21" y2={isOpen ? "12" : "12"} style={{ transition: 'opacity 0.2s', opacity: isOpen ? 0 : 1 }} />
                        <line x1="3" y1={isOpen ? "12" : "6"} x2="21" y2={isOpen ? "12" : "6"} style={{ transition: 'transform 0.3s ease', transformOrigin: 'center', transform: isOpen ? 'rotate(45deg)' : 'none' }} />
                        <line x1="3" y1={isOpen ? "12" : "18"} x2="21" y2={isOpen ? "12" : "18"} style={{ transition: 'transform 0.3s ease', transformOrigin: 'center', transform: isOpen ? 'rotate(-45deg)' : 'none' }} />
                     </svg>
                  </button>

                {isOpen && (
                    <>
                      {/* Invisible overlay for clicking away */}
                      <div 
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                        onClick={() => setIsOpen(false)}
                      />
                      <div className="desktop-dropdown animate-scale-in" style={{
                        position: 'absolute',
                        top: '56px',
                        right: 0,
                        width: '260px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '20px',
                        padding: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        zIndex: 50,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <button onClick={() => { setIsOpen(false); setIsNotifOpen(true); }} className={`dropdown-item ${isNotifOpen ? 'active' : ''}`}>
                          <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                              <span style={{ fontSize: '20px' }}>🔔</span> Notifications
                            </span>
                            {unreadCount > 0 && (
                              <span style={{ background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </div>
                        </button>
                        <Link href="/leaderboard" onClick={() => setIsOpen(false)} className={`dropdown-item ${currentPage === 'leaderboard' ? 'active' : ''}`}>
                          <span style={{ fontSize: '20px' }}>🏆</span> Leaderboard
                        </Link>
                        <Link href="/tasks" onClick={() => setIsOpen(false)} className={`dropdown-item ${currentPage === 'tasks' ? 'active' : ''}`}>
                          <span style={{ fontSize: '20px' }}>✅</span> Tasks
                        </Link>
                        <Link href="/timetable" onClick={() => setIsOpen(false)} className={`dropdown-item ${currentPage === 'timetable' ? 'active' : ''}`}>
                          <span style={{ fontSize: '20px' }}>📅</span> Timetable
                        </Link>
                        <Link href="/syllabus" onClick={() => setIsOpen(false)} className={`dropdown-item ${currentPage === 'syllabus' ? 'active' : ''}`}>
                          <span style={{ fontSize: '20px' }}>📚</span> Syllabus
                        </Link>
                        
                        <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 8px' }} />
                        
                        <button
                          onClick={() => { setIsOpen(false); signOut({ callbackUrl: '/login' }); }}
                          className="dropdown-item logout"
                        >
                          <span style={{ fontSize: '20px' }}>🚪</span> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
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
        
        .desktop-dropdown {
          animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: top right;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 500;
          font-size: 16px;
          border-radius: 12px;
          transition: all 0.2s ease;
          background: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .dropdown-item:hover {
          background: var(--bg-tertiary);
          transform: translateX(4px);
        }

        .dropdown-item.active {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .dropdown-item.logout {
          color: #ef4444;
        }
        
        .dropdown-item.logout:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
}
