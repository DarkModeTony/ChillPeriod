'use client';

import MobileNav from '@/components/MobileNav';
import Link from 'next/link';

export default function AboutUsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Background Gradient */}
      <div style={{ 
        position: 'fixed', top: '-10%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <MobileNav currentPage="about" />

      <div className="animate-fade-in" style={{ paddingTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', position: 'relative' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)' }}>
            About <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ChillPeriod</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The ultimate student companion app. Track attendance, manage tasks, explore spots, and coordinate mass bunks — all in one place.
          </p>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎯</span> Our Mission
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0' }}>
            College life is a delicate balance between academics and having fun. ChillPeriod was built to eliminate the stress of tracking minimum attendance requirements so that students can focus on what matters most. Whether you need to figure out if it's safe to bunk, find your next lecture's classroom, or coordinate a mass bunk with your entire class, ChillPeriod calculates the math so you don't have to.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Smart Attendance</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
              Say goodbye to spreadsheets. Our dynamic GitHub-style heatmap visualizes your safe zones, caution zones, and danger zones instantly.
            </p>
          </div>

          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '16px' }}>🚨</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Cascading Bunks</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
              Initiate a mass bunk with a single click. Friends get notified, and if they join, their friends get notified too — coordinating entire classes effortlessly.
            </p>
          </div>

          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Offline Syllabus</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
              A fully integrated B.Tech syllabus viewer that works offline. Check off your syllabus progress, access PYQs, study materials, and video lectures.
            </p>
          </div>

          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '16px' }}>🤖</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Discord Native</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
              Don't want to open the web app? Perform all major actions — including adding attendance, checking tasks, and finding chill spots — directly via our Discord Bot slash commands.
            </p>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '48px', padding: '40px', background: 'rgba(139,92,246,0.05)', borderRadius: '24px', border: '1px solid rgba(139,92,246,0.1)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Ready to stop worrying about 75%?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '24px' }}>
            Join thousands of students claiming their academic freedom.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/attendance" style={{ 
              padding: '12px 24px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', 
              color: 'white', borderRadius: '12px', fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(139,92,246,0.3)'
            }}>
              Go to Dashboard
            </Link>
            <Link href="/docs" style={{ 
              padding: '12px 24px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', borderRadius: '12px', fontWeight: 600, textDecoration: 'none'
            }}>
              Read the Docs
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
