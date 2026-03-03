'use client';

import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      
      <Navbar />
      <MobileNav currentPage="profile" />

      <div style={{ 
          maxWidth: '900px', margin: '0 auto', width: '100%', 
          padding: '120px 24px 60px', 
          flex: 1 
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ 
              fontSize: '42px', fontWeight: 'bold', marginBottom: '16px',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', 
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Glass Card Content */}
        <div style={{ 
            background: 'var(--card-bg)', 
            border: '1px solid var(--border-color)',
            borderRadius: '24px', 
            padding: '40px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)'
        }}>

            {/* Intro */}
            <div style={{ marginBottom: '40px', padding: '20px', background: 'rgba(139,92,246,0.08)', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.15)' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '16px', margin: 0 }}>
                Your privacy matters to us. This Privacy Policy explains how <strong style={{ color: 'var(--text-primary)' }}>ChillPeriod</strong> ("we", "our", "us") 
                collects, uses, stores, and protects your personal information when you use our attendance tracking, syllabus, 
                and social coordination platform ("the Service").
              </p>
            </div>

            <Section title="1. Information We Collect">
              <SubHeading>a) Information You Provide</SubHeading>
              <BulletList items={[
                <><strong>Account Information:</strong> When you sign in via Google or Discord OAuth, we receive your name, email address, and profile picture from the provider.</>,
                <><strong>Profile Data:</strong> College name, semester, section, and lab group that you set in your profile.</>,
                <><strong>Attendance Data:</strong> Course names, codes, attendance records (attended/bunked), and daily logs that you manually enter.</>,
                <><strong>Social Data:</strong> Your followers/following lists, mass bunk alerts, and notification preferences.</>,
                <><strong>Chill Spots:</strong> Location names, coordinates, categories, and descriptions of spots you submit.</>,
              ]} />

              <SubHeading>b) Information Collected Automatically</SubHeading>
              <BulletList items={[
                <><strong>Usage Data:</strong> Pages visited, features used, timestamps, and general interaction patterns.</>,
                <><strong>Device Information:</strong> Browser type, operating system, screen resolution, and device type.</>,
                <><strong>Cookies:</strong> Session cookies required for authentication. We do not use tracking or advertising cookies.</>,
              ]} />
            </Section>

            <Section title="2. How We Use Your Information">
              <BulletList items={[
                'Provide and maintain the attendance tracking service.',
                'Calculate attendance percentages, safe-to-bunk counts, and safety indicators.',
                'Display syllabus content and video lecture links relevant to your semester.',
                'Enable social features — following, mass bunk alerts, and the leaderboard.',
                'Send notifications about mass bunk alerts from users you follow.',
                'Populate chill spots on the map and sort by community upvotes.',
                'Sync your timetable and courses based on your semester and section.',
                'Improve the Service through aggregate usage analytics (no individual tracking).',
              ]} />
            </Section>

            <Section title="3. Data Storage & Security">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '16px', marginBottom: '16px' }}>
                Your data is stored securely in a <strong style={{ color: 'var(--text-primary)' }}>MongoDB Atlas</strong> cloud database 
                with encryption at rest and in transit. We implement the following security measures:
              </p>
              <BulletList items={[
                <><strong>Authentication:</strong> Handled via NextAuth.js with OAuth providers — we never store your password.</>,
                <><strong>API Protection:</strong> All API routes are protected with session-based authentication, rate limiting, and input validation.</>,
                <><strong>Content Security Policy:</strong> Strict CSP headers prevent XSS attacks and unauthorized script execution.</>,
                <><strong>HTTPS Only:</strong> All communication between your browser and our servers is encrypted via TLS.</>,
                <><strong>No Plaintext Secrets:</strong> All sensitive configuration (database URIs, API keys) is stored in environment variables, never in source code.</>,
              ]} />
            </Section>

            <Section title="4. Data Sharing & Third Parties">
              <div style={{ padding: '16px', background: 'rgba(16,185,129,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '16px' }}>
                <p style={{ color: '#10b981', fontWeight: 600, margin: 0, fontSize: '15px' }}>
                  🔒 We do NOT sell, rent, or trade your personal data to any third party.
                </p>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '16px', marginBottom: '16px' }}>
                We share data only with the following services essential to operating the platform:
              </p>
              <BulletList items={[
                <><strong>Google & Discord (OAuth):</strong> Provide authentication only. We receive your basic profile; they do not receive your app data.</>,
                <><strong>MongoDB Atlas:</strong> Cloud database provider that stores your data with enterprise-grade encryption.</>,
                <><strong>Vercel:</strong> Hosting platform — handles request routing but does not access or store your personal data.</>,
                <><strong>Syllabus Integration:</strong> Local static data for syllabus content. No personal data is sent.</>,
                <><strong>YouTube (Thumbnails):</strong> Video thumbnails load from YouTube CDN. No personal data is transmitted.</>,
              ]} />
            </Section>

            <Section title="5. Your Rights & Controls">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '16px', marginBottom: '16px' }}>
                You have full control over your data:
              </p>
              <BulletList items={[
                <><strong>View & Edit:</strong> You can view and update all your profile information, courses, and attendance data at any time via the Profile and Attendance pages.</>,
                <><strong>Delete Account:</strong> You can permanently delete your account and all associated data from the Profile page. This action is irreversible.</>,
                <><strong>Export Data:</strong> Your attendance log and course data are visible in-app. Contact us if you need a data export.</>,
                <><strong>Notification Control:</strong> You can enable/disable notifications from your profile settings.</>,
                <><strong>Profile Visibility:</strong> You can set your profile to private, hiding your attendance data from other users.</>,
                <><strong>Unfollow/Block:</strong> You can unfollow any user to stop receiving their mass bunk alerts.</>,
              ]} />
            </Section>

            <Section title="6. Data Retention">
              <BulletList items={[
                'Your data is retained as long as your account is active.',
                'When you delete your account, all personal data (profile, courses, attendance logs, social connections, notifications) is permanently removed within 24 hours.',
                'Aggregate, anonymized analytics may be retained for service improvement purposes.',
                'Chill spot submissions may remain after account deletion as community-contributed content (your name will be disassociated).',
              ]} />
            </Section>

            <Section title="7. Children's Privacy">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '16px' }}>
                ChillPeriod is designed for college students and is not intended for children under 13 years of age. 
                We do not knowingly collect personal information from children under 13. If we learn that we have collected 
                data from a child under 13, we will delete that information promptly.
              </p>
            </Section>

            <Section title="8. Changes to This Policy">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '16px' }}>
                We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an 
                updated "Last updated" date. Continued use of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </Section>

            <Section title="9. Contact Us" last>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '16px', marginBottom: '16px' }}>
                If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, 
                please reach out to us:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ContactRow emoji="📸" label="Instagram" href="https://www.instagram.com/twokney/" text="@twokney" />
                <ContactRow emoji="📧" label="Email" href="mailto:privacy@chillperiod.in" text="privacy@chillperiod.in" />
              </div>
            </Section>

        </div>

        {/* Related Links */}
        <div style={{ 
          display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '32px', flexWrap: 'wrap'
        }}>
          <Link href="/terms" style={{ 
            color: '#8b5cf6', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
            padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)',
            background: 'rgba(139,92,246,0.05)', transition: 'all 0.2s'
          }}>
            📜 Terms & Conditions
          </Link>
          <Link href="/docs" style={{ 
            color: '#06b6d4', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
            padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(6,182,212,0.2)',
            background: 'rgba(6,182,212,0.05)', transition: 'all 0.2s'
          }}>
            📖 Documentation
          </Link>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '48px', color: 'var(--text-muted)', fontSize: '14px' }}>
            © {new Date().getFullYear()} ChillPeriod Engineering. All rights reserved.
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, last }) {
    return (
        <div style={{ marginBottom: last ? 0 : '40px' }}>
            <h2 style={{ 
                fontSize: '20px', fontWeight: 'bold', marginBottom: '16px',
                color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></span>
                {title}
            </h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '16px' }}>
                {children}
            </div>
        </div>
    );
}

function SubHeading({ children }) {
    return (
        <h3 style={{ 
            fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', 
            marginBottom: '10px', marginTop: '16px' 
        }}>
            {children}
        </h3>
    );
}

function BulletList({ items }) {
    return (
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {items.map((item, i) => (
                <li key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '15px' }}>{item}</li>
            ))}
        </ul>
    );
}

function ContactRow({ emoji, label, href, text }) {
    return (
        <div style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
            background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)'
        }}>
            <span style={{ fontSize: '20px' }}>{emoji}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px', minWidth: '80px' }}>{label}</span>
            <a href={href} target="_blank" rel="noopener noreferrer" 
               style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                {text}
            </a>
        </div>
    );
}
