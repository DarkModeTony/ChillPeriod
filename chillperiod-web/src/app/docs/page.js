'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import { useTheme } from '@/contexts/ThemeContext';

import MermaidDiagram from '@/components/MermaidDiagram';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    // ScrollSpy
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 150;
      let current = '';
      sections.forEach(section => {
        if (scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
          current = section.getAttribute('id');
        }
      });
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
         current = sections[sections.length - 1]?.getAttribute('id') || '';
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [theme]);

 

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      
      <MobileNav currentPage="docs" />

      {/* Background Gradient - Matches Home Page */}
      <div style={{
        position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Main Container */}
      <div style={{
          maxWidth: '1600px', margin: '0 auto', padding: '100px 32px 60px 32px',
          display: 'flex', gap: '80px', position: 'relative', zIndex: 1
      }}>

        {/* Sidebar Wrapper - Flex Item (Stretches to match Main height) */}
        <div style={{ width: '260px', flexShrink: 0, alignSelf: 'stretch' }} className="hidden lg:block">
            {/* Sticky Inner - Sticks within the Wrapper */}
            <aside style={{
                position: 'sticky', top: '120px', zIndex: 100,
                height: 'calc(100vh - 140px)', overflowY: 'auto',
                display: 'flex', flexDirection: 'column'
            }} className="scrollbar-hide">
                <h4 style={{
                    fontSize: '12px', fontWeight: 'bold', color: '#8b5cf6',
                    textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px'
                }}>
                    Documentation
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <NavLink id="intro" label="Introduction" active={activeSection} />
                    <NavLink id="tutorial" label="User Guide & Tutorial" active={activeSection} />
                    <NavLink id="architecture" label="Architecture" active={activeSection} />
                    <NavLink id="live-logic" label="Live Social Logic" active={activeSection} />
                    <NavLink id="tech-stack" label="Tech Stack Details" active={activeSection} />
                    <NavLink id="auth" label="Authentication" active={activeSection} />
                    <NavLink id="attendance-logic" label="Attendance Algorithm" active={activeSection} />
                    <NavLink id="database" label="Database Schema" active={activeSection} />
                    <NavLink id="components" label="Component Library" active={activeSection} />
                    <NavLink id="api" label="API Reference" active={activeSection} />
                    <NavLink id="new-features" label="Recent Features" active={activeSection} />
                    <NavLink id="roadmap" label="Future Roadmap" active={activeSection} />
                </div>
            </aside>
        </div>

        {/* Content Area */}
        <main style={{ flex: 1, minWidth: 0, maxWidth: '960px' }}>

            {/* Hero */}
            <section id="intro" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '6px 16px', background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', marginBottom: '24px'
                }}>
                    <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>v2.0.0 — Heatmap + Bunk Together</span>
                </div>

                <h1 style={{
                    fontSize: '64px', fontWeight: 'bold', lineHeight: 1.1, marginBottom: '24px',
                    color: 'var(--text-primary)'
                }}>
                    Bunk <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Smarter.</span>
                </h1>

                <p style={{ fontSize: '20px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px', marginBottom: '48px' }}>
                    ChillPeriod bridges the gap between academic responsibility and social freedom.
                    The technical foundation behind the ultimate student utility platform.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <InfoCard
                        icon="📱" title="Mobile First"
                        desc="Designed for touch. Interactions are fluid, responsive, and natural on all devices."
                    />
                    <InfoCard
                        icon="⚡" title="Real-time Social"
                        desc="Coordinate chills and bunks instantly using live WebSocket polling."
                    />
                </div>
            </section>

             {/* Tutorial Section */}
            <section id="tutorial" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                <SectionTitle title="User Guide & Tutorial" subtitle="A comprehensive guide to everything you can do on ChillPeriod." />
                
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '32px', maxWidth: '800px' }}>
                    Welcome to the ultimate student utility app. This guide walks you through every major feature, showing you how to set up your profile, track your attendance, manage your studies, and use the social features seamlessly.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    
                    {/* 1. Account Setup */}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '28px' }}>1️⃣</span> Profile & Onboarding
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                            When you first log in through Google or Discord, you will go through our Onboarding process. Make sure to:
                        </p>
                        <ul style={{ paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.7, listStyleType: 'disc' }}>
                            <li><strong>Select your College, Semester, Section, and Group:</strong> This is crucial. ChillPeriod uses this information to dynamically construct your custom daily timetable and calculate your attendance limits accurately.</li>
                            <li><strong>Choose a unique Username:</strong> This allows friends to find and follow you efficiently.</li>
                            <li><strong>Discord Link:</strong> If you use Discord, connecting it via the Profile <span style={{fontFamily: 'monospace'}}>⚙️ Settings</span> allows you to trigger attendance and spot commands directly through the ChillPeriod Discord Bot in your community servers.</li>
                        </ul>
                    </div>

                    {/* 2. Attendance & Tracking */}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '28px' }}>2️⃣</span> Attendance & Daily Routine
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                            The <span style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>Attendance Page</span> is your main dashboard. Once your timetable is set:
                        </p>
                         <ul style={{ paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.7, listStyleType: 'disc' }}>
                            <li><strong>Calendar View:</strong> Click any past date on the calendar to log retroactive attendance for subjects scheduled on that day.</li>
                            <li><strong>Today's Classes:</strong> Your daily schedule is automatically populated. You can mark "Present" or "Bunked" with a single click.</li>
                            <li><strong>"Safe to Bunk" Indicator:</strong> ChillPeriod constantly measures your current attendance against the target threshold (e.g., 75%). It will visibly show if you are in the "Safe", "Caution" (close to dropping), or "Danger" (already below) zone.</li>
                            <li><strong>Automatic Sync:</strong> Your stats (Target%, Bunks saved, and Total Attendance) update in real-time based on your clicks.</li>
                            <li><strong>GitHub-Style Heatmap 📊:</strong> A full-year contribution graph right on your dashboard. Green for attended, red for bunked, amber for mixed days. Shows your current streak, best streak, and active days — also visible on friend profiles.</li>
                        </ul>
                    </div>

                     {/* 3. Social & Mass Bunk */}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '28px' }}>3️⃣</span> Live Status & Cascading Mass Bunks
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                            ChillPeriod brings your peer network directly into your routine planning.
                        </p>
                         <ul style={{ paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.7, listStyleType: 'disc' }}>
                            <li><strong>Live Status:</strong> When you mark a class as "Bunked", your status goes live. Friends following you instantly see that you're "Bunking" or "Chilling" in their Friends Activity feed.</li>
                            <li><strong>Mass Bunk Alert 📢:</strong> Next to your classes on the Attendance page, there is a megaphone icon. Clicking this sends a global push notification to everyone following you, asking if they want to join the bunk. If they accept, the alert cascades to their followers, organizing a mass bunk effortlessly.</li>
                            <li><strong>Bunk Together 🤝:</strong> When a friend mass bunks, clicking "Bunk Together" doesn't blindly copy their subjects — it detects the <em>time slots</em> they're bunking and marks <strong>your own classes</strong> that overlap with those time slots. Different timetables? No problem. The system maps friend slots → your schedule automatically.</li>
                            <li><strong>Search & Follow:</strong> Navigate to the 🔍 Find Friends page to search for usernames and build your follower network. <em>Leaderboard</em> points are awarded to the most legendary "bunkers."</li>
                        </ul>
                    </div>
                    
                    {/* 4. Utilities */}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '28px' }}>4️⃣</span> Utilities: Syllabus & Spots
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                            Beyond attendance, the app provides essential tools for the chill but responsible student:
                        </p>
                         <ul style={{ paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.7, listStyleType: 'disc' }}>
                            <li><strong>Chill Spots 📍:</strong> A crowdsourced feed of the best local cafes, parks, and gaming lounges near your campus. When bunking, you can select a Spot, opening Google Maps routing automatically. You can also "Upvote" spots to influence their ranking.</li>
                            <li><strong>Smart Syllabus 📚:</strong> Powered by SyllabusX APIs, you can check off topics you've covered in class. It features one-click links to specific study notes, previous year question papers (PYQs), and required lab experiments.</li>
                            <li><strong>Class Timetable 📅:</strong> A dedicated, easy-to-read view of your week's schedule, segmented by Theory and Lab blocks. Auto-populated by Semester & Section, with support for lab groups (G1/G2) and custom timetable overrides.</li>
                        </ul>
                    </div>
                    
                     {/* 5. Discord Integration */}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#6366f1', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '28px' }}>5️⃣</span> The Discord Bot
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                            You don't even need the website open to log your day. Invite the ChillPeriod bot to your Discord server:
                        </p>
                         <ul style={{ paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.7, listStyleType: 'disc' }}>
                            <li><strong>Slash Commands:</strong> Type <span style={{fontFamily: 'monospace', background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px'}}>/bunk</span>, <span style={{fontFamily: 'monospace', background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px'}}>/attendance</span>, or <span style={{fontFamily: 'monospace', background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px'}}>/spots</span> anywhere in a server.</li>
                            <li><strong>Seamless Syncing:</strong> As long as your profile is linked with Discord, taking action in your server immediately updates the web database.</li>
                            <li><strong>Excuse Generator:</strong> Use <span style={{fontFamily: 'monospace', background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px'}}>/excuse [tone]</span> in Discord to generate a funny, professional, or dramatic excuse for missing class.</li>
                            <li><strong>Task Commands:</strong> Use <span style={{fontFamily: 'monospace', background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px'}}>/tasks</span>, <span style={{fontFamily: 'monospace', background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px'}}>/addtask</span>, and <span style={{fontFamily: 'monospace', background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px'}}>/donetask</span> to manage your to-do list without leaving Discord.</li>
                        </ul>
                    </div>

                    {/* 6. Tasks & Productivity */}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ec4899', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '28px' }}>6️⃣</span> Tasks & Pomodoro
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                            Stay productive beyond the classroom with built-in task management and focus tools:
                        </p>
                         <ul style={{ paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.7, listStyleType: 'disc' }}>
                            <li><strong>Task Lists:</strong> Create and manage to-do items tied to your courses. Mark them complete as you go.</li>
                            <li><strong>Pomodoro Timer:</strong> Built-in study timer with customizable work/break intervals to boost focus.</li>
                            <li><strong>Weekly Analytics:</strong> Track your productivity over time with completion rates and study patterns.</li>
                            <li><strong>Discord Sync:</strong> Tasks created on the web appear in Discord and vice versa — use <span style={{fontFamily: 'monospace', background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px'}}>/tasks</span> to see them anywhere.</li>
                        </ul>
                    </div>

                </div>
            </section>

            {/* Architecture */}
            <section id="architecture" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                <SectionTitle title="System Architecture" subtitle="High-performance hybrid rendering with Next.js App Router." />
                
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '32px', maxWidth: '800px' }}>
                    ChillPeriod leverages the <strong>Next.js 16 App Router</strong> for a seamless blend of server-side rendering (SSR) and client-side interactivity. 
                    Critical pages like the dashboard are pre-rendered on the edge for speed, while dynamic components like the <em>Spots Feed</em> and <em>Live Activity</em> 
                    utilize React Server Components (RSC) to stream data directly from MongoDB Atlas without exposing sensitive API logic to the client.
                </p>

                <div style={{ 
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                    borderRadius: '24px', padding: '40px', overflow: 'hidden',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)'
                }}>
                     <MermaidDiagram chart={`graph TD
Client[Client Browser] --> CDN[Vercel Edge]
CDN --> Static[Assets]
CDN --> Server[Next.js Server]
Server --> Page[SSR Pages]
Server --> API[API Routes]
API --> DB[(MongoDB Atlas)]`} />
                </div>

                <div style={{ marginTop: '48px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px' }}>Deployment Pipeline</h3>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
                        Automated CI/CD implementation using Vercel.
                    </p>
                     <div style={{ 
                        background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                        borderRadius: '24px', padding: '40px', overflow: 'hidden'
                    }}>
                         <MermaidDiagram chart={`flowchart LR
    Dev[Developer] -->|Git Push| Repo[GitHub]
    Repo -->|Webhook| Vercel[Vercel Cloud]
    Vercel -->|Build| Build[Next.js Build]
    Build -->|Success| Edge[Edge Network]
    Build -->|Fail| Notify[Notify Dev]`} />
                    </div>
                </div>
            </section>

            {/* Live Social Logic */}
            <section id="live-logic" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                <SectionTitle title="Live Social Logic" subtitle="State machine driving the real-time status system." />
                
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '32px', maxWidth: '800px' }}>
                    The core of ChillPeriod's social interaction is the <strong>Status State Machine</strong>. Users transition between states based on explicit actions (marking attendance) 
                    or passive checking-in. This logic ensures that the "Live Feed" always reflects the most current and relevant activity of your friend circle.
                </p>

                <div style={{ 
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                    borderRadius: '24px', padding: '40px', overflow: 'hidden',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)'
                }}>
                        <MermaidDiagram chart={`stateDiagram-v2
[*] --> Idle
Idle --> Chilling : Check-in at Spot
Idle --> Bunking : Class Marked Mass Bunk
Chilling --> Idle : 3 Hour Timer Expiry
Bunking --> Idle : End of Day Reset
Chilling --> Bunking : Override Status
Bunking --> Chilling : Override Status`} />
                </div>
            </section>

            {/* Tech Stack */}
            <section id="tech-stack" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                <SectionTitle title="Technology Stack" subtitle="Modern, scalable, and type-safe foundation." />
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    
                    <div style={{ 
                        background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                        borderRadius: '20px', padding: '32px' 
                    }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>⚛️</span> Frontend
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <TechRow name="Next.js 16" desc="App Router architecture using React Server Components for optimal performance and SEO." />
                            <TechRow name="React 19" desc="Leveraging the latest features like Actions and simplified hooks for state management." />
                            <TechRow name="Vanilla CSS" desc="Custom design system with CSS Variables for seamless light/dark mode theming." />
                            <TechRow name="SVG Charts" desc="Custom-built attendance heatmap using SVG for pixel-perfect GitHub-style contribution graphs." />
                            <TechRow name="Framer Motion" desc="Declarative animations for smooth transitions and interactive micro-interactions." />
                        </div>
                    </div>

                     <div style={{ 
                        background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                        borderRadius: '20px', padding: '32px' 
                    }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#06b6d4', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🛠️</span> Backend & Data
                        </h3>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <TechRow name="Mongoose v9" desc="Elegant MongoDB object modeling ensuring strict schema validation and type safety." />
                            <TechRow name="NextAuth v5" desc="Secure, stateless authentication handling Google & Discord OAuth providers." />
                            <TechRow name="MongoDB Atlas" desc="Fully managed cloud database providing scalability and high availability." />
                            <TechRow name="Vercel" desc="Global edge network for deployment, serverless functions, and instant rollbacks." />
                        </div>
                    </div>

                </div>

                <div style={{ marginTop: '48px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px' }}>Data Fetching Strategy</h3>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px', maxWidth: '800px' }}>
                        We use a hybrid data fetching model. <strong>React Server Components (RSC)</strong> handle initial data (user profile, spots list) directly from the DB on the server.
                        <strong>Client Components</strong> use SWR for revalidation and real-time updates (like the 3-minute poll for friends activity), ensuring the UI stays fresh without heavy page reloads.
                    </p>
                     <div style={{ 
                        background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                        borderRadius: '24px', padding: '40px', overflow: 'hidden'
                    }}>
                         <MermaidDiagram chart={`flowchart TD
RSC[Server Component] -->|Direct DB Call| DB[(MongoDB)]
Client[Client Component] -->|SWR Hook| API[API Route]
API -->|Handler| DB
DB -->|JSON| API
API -->|Update| Client
DB -->|Initial HTML| RSC`} />
                    </div>
                </div>
            </section>

             {/* Auth Flow */}
             <section id="auth" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                <SectionTitle title="Authentication" subtitle="Secure, stateless OAuth flow (Google & Discord)." />
                
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '32px', maxWidth: '800px' }}>
                    Authentication is handled entirely via <strong>NextAuth.js v5</strong>. We prioritize security by using HTTP-only cookies to store session JWTs, preventing XSS attacks. 
                    Users can sign in with their Google or Discord accounts. On first login, a User document is automatically upserted into MongoDB, linking their OAuth profile 
                    to a persistent application identity.
                </p>

                <div style={{ 
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                    borderRadius: '24px', padding: '40px', overflow: 'hidden'
                }}>
                    <MermaidDiagram chart={`sequenceDiagram
User->>App: Login
App->>NextAuth: signIn()
NextAuth->>Provider: OAuth
Provider-->>NextAuth: Token
NextAuth->>DB: Upsert User
NextAuth-->>App: Set Cookie`} />
                </div>
            </section>
            
            {/* Attendance Logic */}
             <section id="attendance-logic" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                <SectionTitle title="Attendance Algorithm" subtitle="Logic behind the 'Safe Bunk' calculation." />
                
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '32px', maxWidth: '800px' }}>
                    The system continuously evaluates your attendance percentage against the target threshold (default 75%). 
                    It suggests whether you can safely bunk a class or if you need to attend to avoid debarment.
                </p>

                <div style={{ 
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                    borderRadius: '24px', padding: '40px', overflow: 'hidden'
                }}>
                     <MermaidDiagram chart={`flowchart TD
Start[Class Scheduled] --> Check{Marked Attended?}
Check -->|Yes| Inc[Increment Attended and Total]
Check -->|No| Bunk{Marked Bunk?}
Bunk -->|Yes| IncTotal[Increment Total Only]
Bunk -->|No| Ignore[Ignore / Cancelled]
Inc --> Calc[Calc Percent = Attended / Total]
IncTotal --> Calc
Calc --> Evaluate{Is Percent > 75?}
Evaluate -->|Yes| Safe[Status: Safe to Bunk]
Evaluate -->|No| Danger[Status: Must Attend]`} />
                </div>
            </section>
            
            {/* Database Schema */}
             <section id="database" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                <SectionTitle title="Database Schema" subtitle="User-centric document model tailored for scalability." />
                
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '32px', maxWidth: '800px' }}>
                   Our MongoDB schema is designed around the <strong>User</strong> as the central entity. 
                   <strong>Spots</strong> are stored in a separate collection with geospatial indexing planned for future location-based features. 
                   <strong>Attendance</strong> records are embedded or referenced to allow for efficient aggregation of stats per semester.
                </p>

                <div style={{ 
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                    borderRadius: '24px', padding: '40px', overflow: 'hidden', marginBottom: '48px'
                }}>
                    <MermaidDiagram chart={`classDiagram
class User {
  +String name
  +String email
  +ObjectId[] followers
  +ObjectId[] following
  +Preferences prefs
}
class Spot {
  +String name
  +GeoJson location
  +String[] tags
  +Int visits
}
class Attendance {
  +String subject
  +Int totalClasses
  +Int attended
  +Boolean isLab
}
User "1" --> "*" Attendance : tracks
User "1" --> "*" Spot : upvotes/visits
User "1" --> "*" User : follows`} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <InfoCard 
                        icon="👤" title="User Collection" 
                        desc="Stores profile info, OAuth IDs, and preferences (theme, notifications)." 
                    />
                    <InfoCard 
                        icon="📍" title="Spot Collection" 
                        desc="Contains location data, category types, and vibe tags for hangout spots." 
                    />
                     <InfoCard 
                        icon="📅" title="Timetable Data" 
                        desc="Static JSON structure mapped to user Semester/Section for schedule lookup." 
                    />
                </div>

                 <div style={{ marginTop: '48px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px' }}>Performance & Indexing</h3>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px', maxWidth: '800px' }}>
                        To ensure millisecond-level query times, we utilize specialized indexes:
                    </p>
                    <ul style={{ paddingLeft: '20px', marginTop: '12px', fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, listStyleType: 'disc' }}>
                        <li><strong>Compound Index:</strong> <code>{'{ "email": 1, "provider": 1 }'}</code> for fast OAuth lookups.</li>
                        <li><strong>Geospatial Index:</strong> <code>2dsphere</code> on the Spot collection to query "nearby" locations.</li>
                        <li><strong>TTL Index:</strong> For session cleanup and temporary OTP storage (future feature).</li>
                    </ul>
                </div>
            </section>

             {/* Components */}
            <section id="components" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                <SectionTitle title="Interface Components" subtitle="Reusable UI building blocks." />
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                     <ComponentCard name="TermsModal" desc="Forces acceptance of Terms & Conditions. Implements a strictly controlled modal that cannot be dismissed without explicit agreement, ensuring legal compliance during onboarding." />
                     <ComponentCard name="Navbar" desc="Responsive navigation bar that adapts to mobile and desktop views. Features a hamburger menu, dynamic route highlighting, and a user profile dropdown with theme toggling." />
                     <ComponentCard name="UserListModal" desc="A versatile modal for displaying lists of users (Followers/Following). Includes a real-time search bar to filter users and quick-action buttons for visiting profiles." />
                     <ComponentCard name="FriendsActivity" desc="A live polling component that fetches recent activity from friends. Displays their current status (Bunking/Chilling) with relative timestamps (e.g., '2 mins ago')." />
                     <ComponentCard name="AttendanceHeatmap" desc="A GitHub-style contribution graph for attendance. Renders a 52-week SVG grid with color-coded cells (green=attended, red=bunked, amber=mixed). Features auto-scroll to recent data, streaks, and hover tooltips." />
                     <ComponentCard name="NotificationManager" desc="A background service component that handles global push notifications and toast alerts. Manages the lifecycle of alerts to prevent spamming the user." />
                </div>
                
                <div style={{ marginTop: '60px' }}>
                     <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '32px' }}>Detailed Props & Usage</h3>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <ComponentDetail 
                            name="Navbar" 
                            props={[['currentPage', 'string', 'Active page identifier'], ['user', 'UserObject', 'Auth session data']]} 
                            usage="<Navbar currentPage='home' user={session.user} />"
                        />
                        <ComponentDetail 
                            name="AttendanceCard" 
                            props={[['subject', 'string', 'Course Name'], ['attended', 'number', 'Classes attended'], ['total', 'number', 'Total classes']]} 
                            usage="<AttendanceCard subject='DSA' attended={12} total={15} />"
                        />
                        <ComponentDetail 
                            name="AttendanceHeatmap" 
                            props={[['attendanceLog', 'object', 'Date-keyed map: { "YYYY-MM-DD": { attended, bunked } }']]} 
                            usage="<AttendanceHeatmap attendanceLog={attendanceLog} />"
                        />
                     </div>
                </div>
            </section>

            {/* API Reference */}
            <section id="api" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                <SectionTitle title="API Reference" subtitle="Key endpoints powering the ChillPeriod client." />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <ApiEndpoint method="GET" path="/api/user" desc="Fetches the currently authenticated user's profile, including attendance stats and social graph." />
                    <ApiEndpoint method="POST" path="/api/attendance/update" desc="Upserts attendance records for a specific subject. Recalculates aggregate percentage automatically." />
                    <ApiEndpoint method="GET" path="/api/spots/nearby" desc="Returns a list of spots sorted by geospatial distance from the provided lat/long coordinates." />
                    <ApiEndpoint method="POST" path="/api/friends/nudge" desc="Sends a push notification to a friend. Rate-limited to 1 nudge per hour per friend." />
                    <ApiEndpoint method="POST" path="/api/notifications/mass-bunk" desc="Creates a mass bunk alert with time slot metadata. Notifies all followers with 'Bunk Together' option." />
                    <ApiEndpoint method="POST" path="/api/notifications/respond" desc="Handles 'Bunk Together' response. Maps friend's bunked time slots to your timetable, marks overlapping classes, cascades to your followers." />
                    <ApiEndpoint method="GET" path="/api/users/:id" desc="Fetches a user's public profile including attendanceLog, followers, following, courses, and stats." />
                    <ApiEndpoint method="GET" path="/api/tasks" desc="Fetches all tasks for the authenticated user. Supports subtasks, pinned tasks (sorted first), color-coded tags, collaborators, and due date reminders. Synced between web and Discord bot." />
                </div>

                <div style={{ marginTop: '48px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px' }}>Request Lifecycle</h3>
                    <div style={{ 
                        background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                        borderRadius: '24px', padding: '40px', overflow: 'hidden'
                    }}>
                         <MermaidDiagram chart={`sequenceDiagram
participant C as Client
participant M as Middleware
participant R as Route Handler
participant D as DB
C->>M: HTTP Request
M->>M: Verify Session JWT
M->>R: Forward Request
R->>R: Validate Body Zod
R->>D: Execute Query
D-->>R: Data
R-->>C: JSON Response`} />
                    </div>
                </div>
            </section>

            {/* Recent Features */}
            <section id="new-features" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                <SectionTitle title="Recent Features" subtitle="Latest additions to the platform (v2.0.0)." />
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <InfoCard
                        icon="📊" title="GitHub-Style Heatmap"
                        desc="A full-year contribution graph on your attendance dashboard and friend profiles. Green for attended, red for bunked, amber for mixed. Shows streaks, active days, and auto-scrolls to recent data."
                    />
                    <InfoCard
                        icon="🤝" title="Bunk Together"
                        desc="Timeframe-aware bunking — when a friend mass bunks, it maps their time slots to YOUR timetable and marks only your overlapping classes. Cascades to your followers with your own subjects."
                    />
                    <InfoCard
                        icon="📅" title="Custom Timetable"
                        desc="Override the auto-generated timetable with your own schedule. Supports lab groups (G1/G2) and custom time slots."
                    />
                    <InfoCard
                        icon="📋" title="Tasks & Productivity"
                        desc="Enhanced task management with subtasks/checklists, pin important tasks, search & sort, color-coded tags, calendar view with dot indicators, daily goal tracker with ring chart, shared tasks with collaborator avatars, due date reminders via push notifications, and a built-in Pomodoro timer. Synced with Discord bot."
                    />
                </div>
            </section>

            {/* Roadmap */}
            <section id="roadmap" style={{ marginBottom: '120px', scrollMarginTop: '120px' }}>
                 <SectionTitle title="Future Roadmap" subtitle="What's next for the platform." />
                 
                 <div style={{ 
                     display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' 
                 }}>
                     <RoadmapCard phase="Q3 2026" title="Native Mobile App" desc="Full React Native port for iOS and Android with background location services." />
                     <RoadmapCard phase="Q4 2026" title="AI Predictor" desc="Machine learning model to predict 'Safe Bunk' days based on historical teacher trends." />
                     <RoadmapCard phase="Q1 2027" title="Campus Marketplace" desc="Peer-to-peer exchange for notes, books, and drafters." />
                 </div>
            </section>

             {/* Footer */}
            <footer style={{ 
                borderTop: '1px solid var(--border-color)', paddingTop: '64px', paddingBottom: '32px',
                marginTop: '120px' 
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '48px' }}>
                     <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>
                            ChillPeriod
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                            The ultimate student utility platform for tracking attendance, finding spots, and coordinating with friends.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '16px' }}>Product</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="/attendance" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} className="hover:text-violet-500">Attendance</Link></li>
                             <li><Link href="/spots" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} className="hover:text-cyan-500">Spots</Link></li>
                        </ul>
                    </div>
                     <div>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '16px' }}>Legal</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="/terms" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} className="hover:text-violet-500">Terms of Service</Link></li>
                             <li><Link href="/privacy" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} className="hover:text-cyan-500">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                 <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                    © {new Date().getFullYear()} ChillPeriod Engineering. All rights reserved.
                </div>
            </footer>

        </main>
      </div>

     {/* Responsive Styles Injection */}
      <style jsx>{`
        @media (max-width: 1024px) {
            aside { display: none !important; }
            #intro h1 { font-size: 42px !important; }
            main { padding-top: 20px; }
        }
      `}</style>
    </div>
  );
}

// --- Bespoke Components (Inline Styles for exact match) ---

function NavLink({ id, label, active }) {
    const isActive = active === id;
    return (
        <a 
            href={`#${id}`}
            style={{ 
                display: 'block', padding: '10px 16px', borderRadius: '12px', fontSize: '14px',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? '#8b5cf6' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
                textDecoration: 'none'
            }}
        >
            {label}
        </a>
    );
}

function SectionTitle({ title, subtitle }) {
    return (
        <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px' }}>{title}</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>{subtitle}</p>
        </div>
    );
}

function InfoCard({ icon, title, desc }) {
    return (
        <div 
            style={{ 
                background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                borderRadius: '20px', padding: '32px', transition: 'all 0.3s', cursor: 'default'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{icon}</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
        </div>
    );
}

function TechRow({ name, desc }) {
    return (
        <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{name}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
        </div>
    );
}

function ComponentCard({ name, desc }) {
     return (
        <div 
            style={{ 
                background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                borderRadius: '16px', padding: '24px', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', gap: '12px'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{name}</h3>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: '4px', color: 'var(--text-muted)' }}>.js</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{desc}</p>
        </div>
    );
}

function ApiEndpoint({ method, path, desc }) {
    const methodColor = method === 'GET' ? '#06b6d4' : method === 'POST' ? '#8b5cf6' : '#ec4899';
    return (
        <div style={{ 
            padding: '20px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px',
            display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'monospace' }}>
                <span style={{ color: methodColor, fontWeight: 'bold' }}>{method}</span>
                <span style={{ color: 'var(--text-primary)' }}>{path}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{desc}</p>
        </div>
    );
}

function RoadmapCard({ phase, title, desc }) {
    return (
        <div style={{ 
            padding: '32px', background: 'var(--bg-secondary)', borderLeft: '4px solid #8b5cf6', borderRadius: '4px',
            display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#8b5cf6', textTransform: 'uppercase' }}>{phase}</span>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>{desc}</p>
        </div>
    );
}

function ComponentDetail({ name, props, usage }) {
    return (
        <div style={{ 
            background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px'
        }}>
            <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '16px' }}>{name}</h4>
            
            <div style={{ marginBottom: '24px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>Props</h5>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '8px', color: 'var(--text-primary)' }}>Name</th>
                                <th style={{ padding: '8px', color: '#ec4899' }}>Type</th>
                                <th style={{ padding: '8px', color: 'var(--text-secondary)' }}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.map((prop, i) => (
                                <tr key={i} style={{ borderBottom: i === props.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '8px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{prop[0]}</td>
                                    <td style={{ padding: '8px', fontFamily: 'monospace', color: '#ec4899' }}>{prop[1]}</td>
                                    <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{prop[2]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                 <h5 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>Usage</h5>
                 <div style={{ 
                     background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', 
                     fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-primary)', overflowX: 'auto'
                 }}>
                     {usage}
                 </div>
            </div>
        </div>
    );
}
