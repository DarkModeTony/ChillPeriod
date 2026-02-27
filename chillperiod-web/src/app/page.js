'use client';

import MobileNav from '@/components/MobileNav';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const emojis = ['😎', '🎉', '🔥', '✨', '🚀'];

  const getStartedLink = status === 'unauthenticated' ? '/login' : '/attendance';

  useEffect(() => {
    const interval = setInterval(() => setCurrentEmoji(prev => (prev + 1) % emojis.length), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Background Gradient */}
      <div style={{ 
        position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Navigation - Using MobileNav component */}
      <MobileNav currentPage="home" />

      {/* Hero Section */}
      <div id="hero-section" className="animate-fade-in" style={{ paddingTop: '140px', paddingBottom: '80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Badge */}
          <div id="badge" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', background: 'rgba(139,92,246,0.1)', 
            border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', marginBottom: '32px'
          }}>
            <span style={{ fontSize: '20px' }}>{emojis[currentEmoji]}</span>
            <span id="badge-text" style={{ color: '#a78bfa', fontSize: '14px' }}>Heatmap + Bunk Together + Custom Timetable!</span>
          </div>

          {/* Heading */}
          <h1 id="hero-heading" style={{ fontSize: '64px', fontWeight: 'bold', lineHeight: 1.1, marginBottom: '24px' }}>
            <span style={{ color: 'var(--text-primary)' }}>Bunk</span>{' '}
            <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Smarter</span>
          </h1>

          <p id="hero-desc" style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: 1.6 }}>
            Track attendance, manage tasks, discover chill spots, generate excuses, and coordinate mass bunks — on web and Discord.
          </p>

          {/* CTA Buttons */}
          <div id="cta-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: 'fit-content', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
              <Link href={getStartedLink} style={{ 
                flex: 1, padding: '16px 24px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', 
                color: 'white', borderRadius: '14px', fontWeight: 600, fontSize: '16px',
                textDecoration: 'none', boxShadow: '0 8px 32px rgba(139,92,246,0.3)',
                whiteSpace: 'nowrap', textAlign: 'center'
              }}>
                Get Started
              </Link>
              <Link href="/spots" style={{ 
                flex: 1, padding: '16px 24px', background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)', color: 'var(--text-primary)', 
                borderRadius: '14px', fontWeight: 600, fontSize: '16px', textDecoration: 'none',
                whiteSpace: 'nowrap', textAlign: 'center'
              }}>
                Find Spots
              </Link>
            </div>
            <a href="https://discord.com/oauth2/authorize?client_id=1468284051839520848&permissions=8&scope=bot+applications.commands" target="_blank" rel="noopener noreferrer" style={{ 
              width: '100%', padding: '16px 32px', background: '#5865F2', 
              color: 'white', borderRadius: '14px', fontWeight: 600, fontSize: '16px',
              textDecoration: 'none', boxShadow: '0 8px 32px rgba(88,101,242,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg> Add to Discord
            </a>
          </div>

          {/* Stats */}
          <div id="stats" style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '64px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-primary)' }}>75%</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Target</div>
            </div>
            <div className="stats-divider" style={{ width: '1px', background: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-primary)' }}>16</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Bot Commands</div>
            </div>
            <div className="stats-divider" style={{ width: '1px', background: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-primary)' }}>15+</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Chill Spots</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 id="features-heading" style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-primary)', textAlign: 'center', marginBottom: '16px' }}>
          Everything you need
        </h2>


        <div id="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            { icon: '📊', title: 'GitHub-Style Heatmap', desc: 'A full-year contribution graph for attendance. Green for attended, red for bunked, streaks and stats at a glance.' },
            { icon: '🤝', title: 'Bunk Together', desc: 'When a friend mass bunks, click Bunk Together — it auto-marks YOUR overlapping classes, not theirs.' },
            { icon: '✅', title: 'Tasks & Productivity', desc: 'Subtasks, pin tasks, search & sort, color-coded tags, calendar view, daily goals, shared tasks, due date reminders, and Pomodoro timer.' },
            { icon: '🤖', title: 'Discord Bot', desc: '16 slash commands — track attendance, find spots, and mass bunk right from Discord.' },
            { icon: '📚', title: 'SyllabusX Integration', desc: 'Real-time B.Tech syllabus with progress tracking, notes, and PYQs.' },
            { icon: '🚨', title: 'Cascading Mass Bunk', desc: 'One-click alert to followers. If they join, their friends get invited too!' },
            { icon: '📅', title: 'Custom Timetable', desc: 'Auto-populated by semester & section, or build your own. Lab groups (G1/G2) supported.' },
            { icon: '🛡️', title: 'Safety Status', desc: 'Know your "Safe", "Caution", and "Danger" attendance zones instantly.' },
            { icon: '😂', title: 'Excuse Generator', desc: 'Random Hinglish excuses in 5 tones — funny, serious, medical, professional, dramatic.' },
            { icon: '📍', title: 'Chill Spots', desc: 'Discover cafes, parks, and gaming zones crowdsourced by students.' },
            { icon: '🏆', title: 'Bunk Leaderboard', desc: 'Compete for the top bunker spot at your college. Rookie to Bunk Legend!' },
            { icon: '👥', title: 'Social Profiles', desc: 'Follow friends, view their heatmap, and track their bunk activity.' },
            { icon: '🔔', title: 'Smart Alerts', desc: 'Get notified before you drop below 75%. Cross-platform web + Push Notifications.' },
          ].map((f, i) => (
            <div key={i} style={{ 
              background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 24px' }}>
        <div id="cta-box" style={{ 
          maxWidth: '700px', margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(88,28,135,0.4), rgba(6,78,59,0.4))',
          border: '1px solid rgba(139,92,246,0.2)', borderRadius: '24px', padding: '48px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
          <h2 id="cta-heading" style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Ready to chill responsibly?</h2>
          <p style={{ color: '#6b7280', marginBottom: '32px' }}>Join students who never stress about attendance again.</p>
          <Link href={getStartedLink} style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '16px 32px', background: 'white', color: 'black', 
            borderRadius: '14px', fontWeight: 600, textDecoration: 'none'
          }}>
            Get Started Free →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '24px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          © 2026 ChillPeriod. Made with ❤️ by <a href="https://github.com/DarkModeTony" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>Tony</a>.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
          Follow me on instagram <a href="https://www.instagram.com/twokney/" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>@twokney</a>.
        </p>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'underline', fontSize: '14px' }}>
              Terms & Conditions
            </Link>
            <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'underline', fontSize: '14px' }}>
              Privacy Policy
            </Link>
            <Link href="/docs" style={{ color: 'var(--text-secondary)', textDecoration: 'underline', fontSize: '14px' }}>
              Documentation
            </Link>
          </div>
      </footer>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          #hero-section {
            padding-top: 100px !important;
            padding-bottom: 40px !important;
          }
          
          #hero-heading {
            font-size: 36px !important;
          }
          
          #hero-desc {
            font-size: 16px !important;
          }
          
          #badge-text {
            font-size: 12px !important;
          }
          
          #stats {
            flex-direction: column !important;
            gap: 24px !important;
            margin-top: 40px !important;
          }
          
          .stats-divider {
            display: none !important;
          }
          
          #features {
            padding: 40px 16px !important;
          }
          
          #features-heading {
            font-size: 28px !important;
          }
          
          #features-grid {
            grid-template-columns: 1fr !important;
          }
          
          #cta-box {
            padding: 32px 24px !important;
          }
          
          #cta-heading {
            font-size: 22px !important;
          }
        }
        
        @media (max-width: 480px) {
          #hero-heading {
            font-size: 32px !important;
          }
          
          #cta-buttons a {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
