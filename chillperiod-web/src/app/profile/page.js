'use client';

import MobileNav from '@/components/MobileNav';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { getSemesters, getSectionsForSemester } from '@/lib/data/timetable';
import UserListModal from '@/components/UserListModal';
import { deleteUser } from '@/app/admin/actions';

import { useRouter } from 'next/navigation';
import { COLLEGES, findCollege } from '@/lib/data/colleges';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error'
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editSemester, setEditSemester] = useState(4);
  const [editSection, setEditSection] = useState('CSE-A');
  const [editGroup, setEditGroup] = useState('G1');
  const [editInstagram, setEditInstagram] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editLeetcode, setEditLeetcode] = useState('');
  const [editCodeforces, setEditCodeforces] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Safety timeout for loading state
    const timer = setTimeout(() => {
      if (loading || status === 'loading') {
        setLoading(false);
        setError('Request timed out. Please check your internet or database connection.');
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timer);
  }, [loading, status]);

  useEffect(() => {
    console.log('ProfilePage: Session status:', status, 'User ID:', session?.user?.id);
    if (status === 'authenticated') {
      if (session?.user?.id) {
        fetchUserData();
      } else {
        // console.error('ProfilePage: Authenticated but no User ID found in session');
        // setError('User session invalid. Please try logging out and back in.');
        setLoading(false);
      }
    } else if (status === 'unauthenticated') {
      router.push('/login'); // Strict redirect to login
    }
  }, [status, session, router]);

  const fetchUserData = async () => {
    try {
      console.log('ProfilePage: Fetching user data for ID:', session.user.id);
      const res = await fetch(`/api/users/${session.user.id}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        // Initialize edit states
        setEditName(data.name || '');
        setEditUsername(data.username || '');
        
        // Normalize college to key if it's a full name
        const collegeObj = findCollege(data.college);
        setEditCollege(collegeObj ? collegeObj.key : '');
        
        setEditSemester(data.semester || 4);
        setEditSection(data.section || 'CSE-A');
        setEditGroup(data.group || 'G1');
        setEditInstagram(data.socialLinks?.instagram || '');
        setEditLinkedin(data.socialLinks?.linkedin || '');
        setEditLeetcode(data.socialLinks?.leetcode || '');
        setEditCodeforces(data.socialLinks?.codeforces || '');
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('ProfilePage: API error:', res.status, errorData);
        if (res.status === 404) setError('User profile not found.');
        else setError(`Failed to load profile (${res.status})`);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Network error. Failed to fetch profile.');
    }
    setLoading(false);
  };

  const fetchFollowDetails = async (type) => {
    setModalTitle(type === 'followers' ? 'Followers' : 'Following');
    setModalOpen(true);
    setModalLoading(true);
    setModalUsers([]);

    try {
      const res = await fetch(`/api/users/${session.user.id}/follow-details?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setModalUsers(data);
      } else {
        console.error('Failed to fetch follow details');
      }
    } catch (error) {
      console.error('Error fetching follow details:', error);
    }
    setModalLoading(false);
  };

  const validateUsername = (username) => {
    const regex = /^[a-z0-9_]{3,20}$/;
    if (!username) return '';
    if (!regex.test(username)) return 'Only lowercase letters, numbers, underscores. 3-20 chars.';
    return '';
  };

  const handleSaveProfile = async () => {
    const error = validateUsername(editUsername);
    if (error && editUsername) {
      setUsernameError(error);
      return;
    }

    if (!session?.user?.id) {
      setUsernameError("Session expired. Please login again.");
      return;
    }
    
    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          username: editUsername,
          college: editCollege,
          semester: editSemester,
          section: editSection,
          group: editGroup,
          socialLinks: {
            instagram: editInstagram,
            linkedin: editLinkedin,
            leetcode: editLeetcode,
            codeforces: editCodeforces
          }
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUserData(updatedUser);
        setIsEditing(false);
        setUsernameError('');
      } else {
        const data = await res.json();
        setUsernameError(data.error || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      setUsernameError(err.message || 'Something went wrong');
    }
  };

  const handleToggleNotifications = async () => {
    if (!userData) return;
    
    // Optimistic update
    const previousState = userData.notificationsEnabled;
    const newState = !previousState;

    if (newState) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('You need to allow notifications in your browser to get class alerts!');
        return;
      }
    }
    
    setUserData(prev => ({ ...prev, notificationsEnabled: newState }));
    
    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationsEnabled: newState })
      });
      
      if (!res.ok) {
        throw new Error('Failed to update');
      }
    } catch (err) {
      console.error(err);
      // Revert on error
      setUserData(prev => ({ ...prev, notificationsEnabled: previousState }));
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUser(session.user.id);
      if (result.success) {
        await signOut({ callbackUrl: '/login' });
      } else {
        alert(result.error || "Failed to delete account");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting your account.");
      setIsDeleting(false);
    }
  };


  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ color: '#ef4444' }}>⚠️ {error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading || status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading profile...</div>
        <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace', maxWidth: '300px', wordBreak: 'break-all', textAlign: 'center' }}>
          Status: {status}<br/>
          Has Session: {session ? 'Yes' : 'No'}<br/>
          User ID: {session?.user?.id || 'Missing'}<br/>
          DB Error: {session?.error || 'None'}<br/>
          Waited: {loading ? 'Fetching Data...' : 'Initializing...'}
        </div>
      </div>
    );
  }

  // Also show error if session exists but ID is missing (the "User session invalid" state)
  if (status === 'authenticated' && !session?.user?.id) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ color: '#ef4444' }}>⚠️ User session invalid (Database Sync Failed)</div>
        <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace', maxWidth: '400px', wordBreak: 'break-all', textAlign: 'center', background: '#1f2937', padding: '12px', borderRadius: '8px' }}>
          Error: {session?.error || 'Unknown error'}<br/>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          Logout & Retry
        </button>
      </div>
    );
  }

  const user = userData || {
    name: session?.user?.name || 'User',
    username: session?.user?.username || '',
    college: 'Your College',
    totalBunks: 0,
    attendedClasses: 0,
    totalClasses: 0,
    attendancePercentage: 100,
    currentStreak: 0,
    longestStreak: 0,
    notificationsEnabled: userData?.notificationsEnabled ?? true,
    followerCount: 0,
    followingCount: 0,
    semester: session?.user?.semester || 4,
    section: session?.user?.section || 'CSE-A',
    xp: 0,
    level: 1
  };
  
  // Calculate Progress to next level
  const xp = user.xp || 0;
  const level = user.level || 1;
  const currentLevelXp = Math.pow(level - 1, 2) * 10;
  const nextLevelXp = Math.pow(level, 2) * 10;
  const xpIntoLevel = xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  // Prevent NaN if xpNeededForLevel is 0
  const progressPercentage = xpNeededForLevel > 0 
    ? Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForLevel) * 100))
    : 0;

  const achievements = [
    { id: 1, emoji: '🔥', title: 'On Fire!', desc: '5-day streak', unlocked: (user.currentStreak || 0) >= 5 },
    { id: 2, emoji: '🎯', title: 'Sharp Shooter', desc: '90%+ attendance', unlocked: (user.attendancePercentage || 0) >= 90 },
    { id: 3, emoji: '😎', title: 'Chill Master', desc: 'Bunked 10+ safely', unlocked: (user.totalBunks || 0) >= 10 },
    { id: 4, emoji: '📚', title: 'Dedicated', desc: 'Attended 50+ classes', unlocked: (user.attendedClasses || 0) >= 50 },
    { id: 5, emoji: '⚡', title: 'Streak Legend', desc: '14-day streak', unlocked: (user.longestStreak || 0) >= 14 },
    { id: 6, emoji: '🏆', title: 'Perfect Week', desc: 'Full week attendance', unlocked: false }, // Logic needs complex backend support
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <MobileNav currentPage="profile" />

      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }} onClick={() => setIsEditing(false)}>
          <div style={{ 
            background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', 
            padding: '32px', maxWidth: '400px', width: '100%', maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px', textAlign: 'center' }}>
              ✏️ Edit Profile
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Display Name</label>
              <input 
                type="text" 
                value={editName} 
                onChange={e => setEditName(e.target.value)}
                placeholder="Your name"
                style={{ 
                  width: '100%', padding: '12px 16px', background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color)', borderRadius: '10px', 
                  color: 'var(--text-primary)', fontSize: '14px' 
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>
                Username <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>(unique)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>@</span>
                <input 
                  type="text" 
                  value={editUsername} 
                  onChange={e => { setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); setUsernameError(''); }}
                  placeholder="your_username"
                  style={{ 
                    width: '100%', padding: '12px 16px 12px 32px', background: 'var(--bg-tertiary)', 
                    border: usernameError ? '1px solid #ef4444' : '1px solid var(--border-color)', borderRadius: '10px', 
                    color: 'var(--text-primary)', fontSize: '14px' 
                  }}
                />
              </div>
              {usernameError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{usernameError}</p>}
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>Others can find you by @username</p>
            </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>College</label>
                <select 
                  value={editCollege} 
                  onChange={e => setEditCollege(e.target.value)}
                  style={{ 
                    width: '100%', padding: '12px', background: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-color)', borderRadius: '10px', 
                    color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                  }}
                >
                  <option value="">Select College</option>
                  {COLLEGES.map(college => (
                    <option key={college.key} value={college.key}>{college.name}</option>
                  ))}
                </select>
              </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Semester</label>
                  <select 
                    value={editSemester} 
                    onChange={e => {
                      const sem = parseInt(e.target.value);
                      setEditSemester(sem);
                      const sections = getSectionsForSemester(sem);
                      if (sections.length > 0) setEditSection(sections[0]);
                    }}
                    style={{ 
                      width: '100%', padding: '12px', background: 'var(--bg-tertiary)', 
                      border: '1px solid var(--border-color)', borderRadius: '10px', 
                      color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                    }}
                  >
                    {getSemesters().map(sem => (
                      <option key={sem} value={sem}>{sem}th Sem</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Section</label>
                  <select 
                    value={editSection} 
                    onChange={e => setEditSection(e.target.value)}
                    style={{ 
                      width: '100%', padding: '12px', background: 'var(--bg-tertiary)', 
                      border: '1px solid var(--border-color)', borderRadius: '10px', 
                      color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                    }}
                  >
                    {getSectionsForSemester(editSemester).map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
                 <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Group</label>
                  <select 
                    value={editGroup} 
                    onChange={e => setEditGroup(e.target.value)}
                    style={{ 
                      width: '100%', padding: '12px', background: 'var(--bg-tertiary)', 
                      border: '1px solid var(--border-color)', borderRadius: '10px', 
                      color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                    }}
                  >
                    <option value="G1">G1</option>
                    <option value="G2">G2</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Social Links</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" value={editInstagram} onChange={e => setEditInstagram(e.target.value)} placeholder="Instagram URL" style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }} />
                  <input type="text" value={editLinkedin} onChange={e => setEditLinkedin(e.target.value)} placeholder="LinkedIn URL" style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }} />
                  <input type="text" value={editLeetcode} onChange={e => setEditLeetcode(e.target.value)} placeholder="LeetCode URL" style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }} />
                  <input type="text" value={editCodeforces} onChange={e => setEditCodeforces(e.target.value)} placeholder="Codeforces URL" style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }} />
                </div>
              </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setIsEditing(false)} 
                style={{ 
                  flex: 1, padding: '12px', background: 'var(--bg-tertiary)', 
                  color: 'var(--text-secondary)', border: 'none', borderRadius: '10px', 
                  cursor: 'pointer', fontWeight: 500 
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile} 
                style={{ 
                  flex: 1, padding: '12px', background: '#8b5cf6', color: 'white', 
                  border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ paddingTop: '80px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>

          {/* Profile Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            {/* Avatar */}
            <div style={{ 
              width: '120px', height: '120px', margin: '0 auto 20px auto',
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              padding: '4px'
            }}>
              <div style={{ 
                width: '100%', height: '100%', borderRadius: '50%', 
                background: 'var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '48px', overflow: 'hidden'
              }}>
                {user.image ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image 
                      src={user.image} 
                      alt={user.name} 
                      fill
                      sizes="120px"
                      priority
                      style={{ objectFit: 'cover' }} 
                    />
                  </div>
                ) : '👤'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {user.name}
              </h1>
            </div>
            {user.username && (
              <p style={{ color: '#a78bfa', fontSize: '15px', marginBottom: '8px' }}>
                @{user.username}
              </p>
            )}
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
              📍 {user.college || 'No college set'} • {user.semester ? `${user.semester}th Sem` : ''} {user.section ? `(${user.section})` : ''} {user.group ? `• ${user.group}` : ''}
            </p>

            {user.socialLinks && (user.socialLinks.instagram || user.socialLinks.linkedin || user.socialLinks.leetcode || user.socialLinks.codeforces) && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
                {user.socialLinks.instagram && <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#e1306c', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', width: '40px', height: '40px', borderRadius: '50%', transition: 'opacity 0.2s', opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.9}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>}
                {user.socialLinks.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', width: '40px', height: '40px', borderRadius: '50%', transition: 'opacity 0.2s', opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.9}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>}
                {user.socialLinks.leetcode && <a href={user.socialLinks.leetcode} target="_blank" rel="noopener noreferrer" style={{ color: '#FFA116', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', width: '40px', height: '40px', borderRadius: '50%', transition: 'opacity 0.2s', opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.9}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.939 5.939 0 0 0 1.271 1.543l3.995 3.926a5.23 5.23 0 0 0 3.79 1.657 5.231 5.231 0 0 0 3.787-1.658l2.112-2.075a1.37 1.37 0 0 0 0-1.925 1.365 1.365 0 0 0-1.922 0l-2.112 2.075c-.468.459-1.133.736-1.802.736s-1.333-.277-1.802-.736l-3.995-3.926a3.179 3.179 0 0 1-.605-.733 3.328 3.328 0 0 1-.413-1.079 3.15 3.15 0 0 1-.12-1.059 3.24 3.24 0 0 1 .595-1.54l3.818-4.08 5.35-5.733a1.365 1.365 0 0 0 0-1.922 1.363 1.363 0 0 0-.96-.441zM7.336 17.863a1.368 1.368 0 0 0-.96 2.328l2.094 2.057c.84.825 2.049 1.319 3.342 1.319s2.502-.494 3.342-1.319l2.094-2.057a1.364 1.364 0 0 0 0-1.925 1.356 1.356 0 0 0-1.916 0l-2.094 2.057c-.468.459-1.133.736-1.802.736s-1.333-.277-1.802-.736l-2.094-2.057a1.363 1.363 0 0 0-.964-.403zM22.062 10.648a1.366 1.366 0 0 0-.96.441l-2.128 2.092a1.365 1.365 0 0 0 0 1.925 1.363 1.363 0 0 0 1.925 0l2.128-2.092a1.365 1.365 0 0 0 0-1.925 1.361 1.361 0 0 0-.965-.441zm-10.02 1.636a1.368 1.368 0 0 0-.96 2.327l5.244 5.152a1.365 1.365 0 0 0 1.92 0 1.363 1.363 0 0 0 0-1.922l-5.244-5.152a1.363 1.363 0 0 0-.96-.405z"/>
                  </svg>
                </a>}
                {user.socialLinks.codeforces && <a href={user.socialLinks.codeforces} target="_blank" rel="noopener noreferrer" style={{ color: '#1F8ACB', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', width: '40px', height: '40px', borderRadius: '50%', transition: 'opacity 0.2s', opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.9}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-15c0-.828.672-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z"/>
                  </svg>
                </a>}
              </div>
            )}

            {/* XP Progress Bar */}
            <div style={{ maxWidth: '300px', margin: '0 auto 24px auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', 
                    padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                  }}>
                    Lv {user.level || 1}
                  </div>
                  <span>XP: {user.xp || 0} / {nextLevelXp}</span>
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

            {/* Follower/Following Counts - Real Data */}
            <div style={{ 
              display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '20px'
            }}>
              <div 
                style={{ textAlign: 'center', cursor: 'pointer', transition: 'opacity 0.2s' }}
                onClick={() => fetchFollowDetails('followers')}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {user.followerCount || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Followers</div>
              </div>
              <div 
                style={{ textAlign: 'center', cursor: 'pointer', transition: 'opacity 0.2s' }}
                onClick={() => fetchFollowDetails('following')}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {user.followingCount || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Following</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {user.totalBunks || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bunks</div>
              </div>
            </div>

            <button 
              onClick={() => { 
                setEditName(user.name); 
                setEditUsername(user.username || ''); 
                setEditCollege(user.college || ''); 
                setEditSemester(user.semester || 4);
                setEditSection(user.section || 'CSE-A');
                setEditGroup(user.group || 'G1');
                setEditInstagram(user.socialLinks?.instagram || '');
                setEditLinkedin(user.socialLinks?.linkedin || '');
                setEditLeetcode(user.socialLinks?.leetcode || '');
                setEditCodeforces(user.socialLinks?.codeforces || '');
                setIsEditing(true); 
              }}
              style={{ 
                padding: '10px 24px', background: 'rgba(139,92,246,0.1)', 
                color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', 
                borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '14px'
              }}
            >
              ✏️ Edit Profile
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px'
          }} id="profile-stats-grid">
            <div style={{ 
              background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
              borderRadius: '16px', padding: '20px', textAlign: 'center' 
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6' }}>{user.attendancePercentage || 0}%</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Attendance</div>
            </div>
            <div style={{ 
              background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
              borderRadius: '16px', padding: '20px', textAlign: 'center' 
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{user.totalBunks || 0}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Bunks Saved</div>
            </div>
            <div style={{ 
              background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
              borderRadius: '16px', padding: '20px', textAlign: 'center' 
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{user.currentStreak || 0}🔥</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Day Streak</div>
            </div>
          </div>

          {/* Achievements Section */}
          <div style={{ 
            background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
            borderRadius: '20px', padding: '24px', marginBottom: '24px' 
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>
              🏅 Achievements
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} id="achievements-grid">
              {achievements.map(a => (
                <div 
                  key={a.id}
                  style={{ 
                    background: a.unlocked ? 'rgba(139,92,246,0.1)' : 'var(--bg-tertiary)', 
                    border: a.unlocked ? '1px solid rgba(139,92,246,0.3)' : '1px solid var(--border-color)',
                    borderRadius: '12px', padding: '16px', textAlign: 'center',
                    opacity: a.unlocked ? 1 : 0.5,
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{a.emoji}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings Section */}
          <div style={{ 
            background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
            borderRadius: '20px', padding: '24px', marginBottom: '24px' 
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>
              ⚙️ Settings
            </h2>

            {/* Theme Toggle */}
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
              padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', marginBottom: '12px'
            }}>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>Theme</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Switch between light and dark mode</div>
              </div>
              <ThemeToggle />
            </div>

            {/* Academic Details (Semester / Section) */}
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
              padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', marginBottom: '12px'
            }}>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Class
                  {saveStatus === 'saving' && <span style={{ fontSize: '10px', color: '#fbbf24' }}>Saving...</span>}
                  {saveStatus === 'saved' && <span style={{ fontSize: '10px', color: '#10b981' }}>Saved!</span>}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Your timetable source</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={user.semester || 4} 
                  onChange={async (e) => {
                    const newSem = parseInt(e.target.value);
                    const sections = getSectionsForSemester(newSem);
                    const newSec = sections.length > 0 ? sections[0] : 'CSE-A'; // Default to first
                    
                    // Optimistic update
                    setUserData(prev => ({ ...prev, semester: newSem, section: newSec }));
                    setSaveStatus('saving');
                    
                    try {
                      const res = await fetch(`/api/users/${session.user.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ semester: newSem, section: newSec })
                      });
                      
                      if (!res.ok) {
                          const errData = await res.json();
                          throw new Error(errData.error || 'Update failed');
                      }
                      setSaveStatus('saved');
                      setTimeout(() => setSaveStatus(''), 2000);
                    } catch (err) {
                      console.error('Failed to update semester', err);
                      // Revert
                      setUserData(prev => ({ ...prev, semester: user.semester, section: user.section }));
                      alert(`Failed to save class: ${err.message}`);
                      setSaveStatus('error');
                    }
                  }}
                  style={{ 
                    padding: '6px 10px', background: 'var(--card-bg)', 
                    border: '1px solid var(--border-color)', borderRadius: '8px', 
                    color: 'var(--text-primary)', fontSize: '12px', outline: 'none', cursor: 'pointer'
                  }}
                >
                  {getSemesters().map(sem => (
                    <option key={sem} value={sem}>{sem}th Sem</option>
                  ))}
                </select>

                <select 
                  value={user.section || 'CSE-A'} 
                  onChange={async (e) => {
                    const newSec = e.target.value;
                    // Optimistic update
                    setUserData(prev => ({ ...prev, section: newSec }));
                    setSaveStatus('saving');
                    
                    try {
                      const res = await fetch(`/api/users/${session.user.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ section: newSec })
                      });
                      
                      if (!res.ok) {
                          const errData = await res.json();
                          throw new Error(errData.error || 'Update failed');
                      }
                      setSaveStatus('saved');
                      setTimeout(() => setSaveStatus(''), 2000);
                    } catch (err) {
                      console.error('Failed to update section', err);
                      setUserData(prev => ({ ...prev, section: user.section })); // Revert
                      alert(`Failed to save section: ${err.message}`);
                      setSaveStatus('error');
                    }
                  }}
                  style={{ 
                    padding: '6px 10px', background: 'var(--card-bg)', 
                    border: '1px solid var(--border-color)', borderRadius: '8px', 
                    color: 'var(--text-primary)', fontSize: '12px', outline: 'none', cursor: 'pointer'
                  }}
                >
                  {getSectionsForSemester(user.semester || 4).map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notifications */}
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
              padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', marginBottom: '12px'
            }}>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>Class Alerts</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Get notified 5 min before each class</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  onClick={handleToggleNotifications}
                  style={{ 
                    width: '44px', height: '24px', 
                    background: user.notificationsEnabled ? '#8b5cf6' : 'var(--text-muted)', 
                    borderRadius: '12px', 
                    position: 'relative', cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                  <div style={{ 
                    width: '18px', height: '18px', background: 'white', borderRadius: '50%', 
                    position: 'absolute', top: '3px', 
                    left: user.notificationsEnabled ? '23px' : '3px',
                    transition: 'left 0.3s'
                  }} />
                </div>
              </div>
            </div>


            {/* Target Percentage (placeholder) */}
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
              padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', marginBottom: '12px'
            }}>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>Target Attendance</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Minimum percentage to maintain</div>
              </div>
              <div style={{ 
                padding: '8px 16px', background: 'rgba(139,92,246,0.2)', 
                borderRadius: '8px', color: '#a78bfa', fontWeight: 600, fontSize: '14px'
              }}>
                {user.targetPercentage || 75}%
              </div>
            </div>

            {/* Connected Accounts */}
            <div className="connected-accounts-card" style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
              padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', marginBottom: '12px'
            }}>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>Connected Accounts</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Login methods linked</div>
              </div>
              <div className="connected-accounts-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {/* Google Badge */}
                {session?.user?.isGoogleLinked ? (
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#10B981" />
                        <path d="M12.24 24.0008C15.4765 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#10B981" />
                        <path d="M5.50253 14.3003C5.00309 12.8099 5.00309 11.1961 5.50253 9.70575V6.61481H1.5166C-0.18551 10.0056 -0.18551 14.0004 1.5166 17.3912L5.50253 14.3003Z" fill="#10B981" />
                        <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50253 9.70575C6.45064 6.86173 9.10947 4.74966 12.24 4.74966Z" fill="#10B981" />
                     </svg>
                     <span style={{ fontSize: '14px', fontWeight: 500 }} className="connected-btn-text">Google</span>
                     <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => signIn('google')}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 12px', borderRadius: '12px', cursor: 'pointer',
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.7669 12.2764C23.7669 11.4607 23.7008 10.6406 23.5597 9.83807H12.2408V14.4591H18.7225C18.4537 15.9494 17.5894 17.2678 16.3239 18.1056V21.1039H20.1908C22.4617 19.0139 23.7669 15.9274 23.7669 12.2764Z" fill="currentColor" />
                        <path d="M12.2409 24.0008C15.4774 24.0008 18.2068 22.9382 20.1954 21.1039L16.3284 18.1055C15.2526 18.8375 13.8636 19.252 12.2454 19.252C9.11479 19.252 6.46037 17.1399 5.50796 14.3003H1.51751V17.3912C3.55462 21.4434 7.70381 24.0008 12.2409 24.0008Z" fill="currentColor" />
                        <path d="M5.5034 14.3003C5.00396 12.8099 5.00396 11.1961 5.5034 9.70575V6.61481H1.51751C-0.184643 10.0056 -0.184643 14.0004 1.51751 17.3912L5.5034 14.3003Z" fill="currentColor" />
                        <path d="M12.2409 4.74966C13.9517 4.7232 15.6053 5.36697 16.8443 6.54867L20.2704 3.12262C18.101 1.0855 15.2217 -0.0344664 12.2409 0.000808666C7.70381 0.000808666 3.55462 2.55822 1.51751 6.61481L5.5034 9.70575C6.45151 6.86173 9.11033 4.74966 12.2409 4.74966Z" fill="currentColor" />
                     </svg>
                     <span style={{ fontSize: '14px', fontWeight: 500 }}>Link Google</span>
                  </button>
                )}

                {/* Discord Badge */}
                {session?.user?.isDiscordLinked ? (
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderRadius: '12px',
                    background: 'rgba(88, 101, 242, 0.1)',
                    border: '1px solid rgba(88, 101, 242, 0.2)'
                  }}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.2 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08.01-.1c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09 0 .1c-.52.29-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.48-1.33 5.2-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" fill="#5865F2"/>
                     </svg>
                     <span style={{ fontSize: '14px', fontWeight: 500 }} className="connected-btn-text">Discord</span>
                     <span style={{ color: '#5865F2', fontSize: '16px' }}>✓</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => signIn('discord')}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 12px', borderRadius: '12px', cursor: 'pointer',
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#5865F2'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.2 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08.01-.1c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09 0 .1c-.52.29-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.48-1.33 5.2-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" fill="currentColor"/>
                     </svg>
                     <span style={{ fontSize: '14px', fontWeight: 500 }}>Link Discord</span>
                  </button>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{ 
                width: '100%', padding: '16px', marginTop: '12px',
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px', color: '#ef4444', fontWeight: 600, fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              🚪 Logout
            </button>
          </div>

          {/* Danger Zone */}
          <div style={{ 
            background: 'var(--card-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '20px', padding: '24px', marginBottom: '24px' 
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444', marginBottom: '16px' }}>
              🚨 Danger Zone
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                 <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>Delete Account</div>
                 <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                   Permanently remove your account and all data.
                 </div>
              </div>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                style={{ 
                  padding: '10px 20px', background: 'rgba(239, 68, 68, 0.1)', 
                  color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', 
                  cursor: 'pointer', fontWeight: 600, fontSize: '14px'
                }}
              >
                Delete Account
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '12px' }} id="profile-actions">
            <Link href="/attendance" style={{ 
              flex: 1, padding: '14px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', 
              color: 'white', borderRadius: '12px', fontWeight: 600, fontSize: '14px',
              textDecoration: 'none', textAlign: 'center'
            }}>
              📊 View Dashboard
            </Link>
            <Link href="/spots" style={{ 
              flex: 1, padding: '14px', background: 'var(--card-bg)', 
              color: 'var(--text-primary)', border: '1px solid var(--border-color)',
              borderRadius: '12px', fontWeight: 600, fontSize: '14px',
              textDecoration: 'none', textAlign: 'center'
            }}>
              📍 Find Spots
            </Link>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        .connected-btn-text {
          color: #000000; /* Black for Light Mode */
        }
        
        @media (prefers-color-scheme: dark) {
          .connected-btn-text {
            color: #ffffff;
          }
        }
        
        /* Force dark text overrides if user is in light mode manually toggled */
        :global(html[data-theme='light']) .connected-btn-text {
          color: #000000 !important; 
        }

        :global(html[data-theme='dark']) .connected-btn-text {
           color: #ffffff !important;
        }

        @media (max-width: 768px) {
          #profile-stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          #achievements-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          #profile-actions {
            flex-direction: column !important;
          }
          
          .connected-accounts-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          
          .connected-accounts-buttons {
            width: 100% !important;
            flex-direction: column !important;
          }
          
          .connected-accounts-buttons > div, .connected-accounts-buttons > button {
             width: 100% !important;
             justify-content: center !important;
          }
        }
      `}</style>
      <UserListModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle} 
        users={modalUsers} 
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ 
            background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', 
            padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Are you sure?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                style={{ 
                  flex: 1, padding: '12px', background: 'var(--bg-tertiary)', 
                  color: 'var(--text-primary)', border: '1px solid var(--border-color)', 
                  borderRadius: '10px', cursor: 'pointer', fontWeight: 500 
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                style={{ 
                  flex: 1, padding: '12px', background: '#ef4444', color: 'white', 
                  border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500,
                  opacity: isDeleting ? 0.7 : 1
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
