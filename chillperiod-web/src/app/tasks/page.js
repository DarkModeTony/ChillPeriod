'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import MobileNav from '@/components/MobileNav';
import Notepad from '@/components/Notepad';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

export default function TasksPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  // Form State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formDueDate, setFormDueDate] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formSubtasks, setFormSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Search & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default','dueDate','priority','created'

  // View mode
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', or 'notepad'
  const [calViewMonth, setCalViewMonth] = useState(new Date().getMonth());
  const [calViewYear, setCalViewYear] = useState(new Date().getFullYear());
  const [selectedCalDate, setSelectedCalDate] = useState(null);

  // Daily Goal
  const [dailyGoal, setDailyGoal] = useState(3);
  const [editingGoal, setEditingGoal] = useState(false);

  // Collaborator search
  const [showCollabSearch, setShowCollabSearch] = useState(false);
  const [collabQuery, setCollabQuery] = useState('');
  const [collabResults, setCollabResults] = useState([]);
  const [selectedCollabs, setSelectedCollabs] = useState([]);

  // Custom Date Picker State
  const todayDate = new Date();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(todayDate.getMonth());
  const [calendarYear, setCalendarYear] = useState(todayDate.getFullYear());
  const [stepPicker, setStepPicker] = useState('date');

  // Pomodoro timer state
  const [timerMode, setTimerMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  let timerInterval;
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      if (timerMode === 'work') {
         // Automatically switch to break
         setTimerMode('break');
         setTimeLeft(5 * 60);
         // You could trigger a notification here
         if (Notification.permission === 'granted') {
             new Notification('Focus session complete! Time for a 5-minute ChillPeriod.');
         }
      } else {
         setTimerMode('work');
         setTimeLeft(25 * 60);
         if (Notification.permission === 'granted') {
             new Notification('Break over! Ready to focus?');
         }
      }
    }
    return () => clearInterval(timerInterval);
  }, [timerActive, timeLeft, timerMode]);

  // Request notification permissions for pomodoro
  useEffect(() => {
     if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
     }
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(timerMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const setWorkMode = () => {
     setTimerMode('work');
     setTimerActive(false);
     setTimeLeft(25 * 60);
  };

  const setBreakMode = () => {
     setTimerMode('break');
     setTimerActive(false);
     setTimeLeft(5 * 60);
  };


  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    
    setIsSubmitting(true);
    try {
      // split tags comma separated
      const tagsArray = formTags.split(',').map(t => t.trim()).filter(t => t);
      
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          priority: formPriority,
          dueDate: formDueDate || null,
          tags: tagsArray,
          subtasks: formSubtasks,
          collaborators: selectedCollabs.map(c => c._id)
        })
      });

      if (!res.ok) throw new Error('Failed to create task');
      
      const newTask = await res.json();
      setTasks(prev => [newTask, ...prev]);
      
      // Reset form
      setShowTaskForm(false);
      setFormTitle('');
      setFormDescription('');
      setFormPriority('Medium');
      setFormDueDate('');
      setFormTags('');
      setFormSubtasks([]);
      setNewSubtaskTitle('');
      setSelectedCollabs([]);
    } catch (err) {
      console.error(err);
      alert('Error creating task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      // Optimistic UI update
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, completed: !currentStatus } : t));
      
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });
      if (!res.ok) {
        throw new Error('Failed to update task');
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, completed: currentStatus } : t));
    }
  };

  const deleteTask = (taskId) => {
    setTaskToDelete(taskId);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      const res = await fetch(`/api/tasks/${taskToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(prev => prev.filter(t => t._id !== taskToDelete));
    } catch (err) {
      console.error(err);
      alert('Error deleting task');
    } finally {
      setTaskToDelete(null);
    }
  };

  // Pin/Unpin task
  const togglePin = async (taskId, currentPinned) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, pinned: !currentPinned } : t));
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !currentPinned })
      });
    } catch { setTasks(prev => prev.map(t => t._id === taskId ? { ...t, pinned: currentPinned } : t)); }
  };

  // Toggle subtask completion
  const toggleSubtask = async (taskId, subtaskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    const updatedSubs = task.subtasks.map(s => s._id === subtaskId ? { ...s, completed: !s.completed } : s);
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, subtasks: updatedSubs } : t));
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubs })
      });
    } catch {}
  };

  // Search collaborators
  const searchCollabs = async (q) => {
    setCollabQuery(q);
    if (q.length < 2) { setCollabResults([]); return; }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (res.ok) { const data = await res.json(); setCollabResults(data.filter(u => u._id !== session?.user?.id)); }
    } catch {}
  };

  // Due date reminders on load
  useEffect(() => {
    if (!tasks.length) return;
    const now = new Date();
    tasks.forEach(t => {
      if (t.dueDate && !t.completed && !t.reminderSent) {
        const due = new Date(t.dueDate);
        const hoursLeft = (due - now) / (1000 * 60 * 60);
        if (hoursLeft > 0 && hoursLeft <= 1 && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`⏰ Task due soon: ${t.title}`, { body: `Due in ${Math.round(hoursLeft * 60)} minutes` });
          fetch(`/api/tasks/${t._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reminderSent: true }) }).catch(() => {});
        }
      }
    });
  }, [tasks]);

  // Load daily goal from localStorage
  useEffect(() => {
    try { const g = localStorage.getItem('cp_daily_goal'); if (g) setDailyGoal(parseInt(g)); } catch {}
  }, []);

  // Color-coded tags helper
  const TAG_COLORS = ['#8b5cf6','#06b6d4','#ec4899','#f59e0b','#10b981','#ef4444','#6366f1','#14b8a6'];
  const getTagColor = (tag) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <MobileNav currentPage="tasks" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '80px', paddingBottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px', textAlign: 'center' }}>You need to sign in to access Tasks</h1>
        <a href="/login" style={{ padding: '12px 24px', background: '#8b5cf6', color: 'white', borderRadius: '12px', fontWeight: 500, textDecoration: 'none' }}>Log In</a>
        <MobileNav currentPage="tasks" />
      </div>
    );
  }

  // Filter, search, and sort
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  let filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  }).filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.tags?.some(tag => tag.toLowerCase().includes(q));
  });

  if (sortBy === 'dueDate') filteredTasks.sort((a, b) => (a.dueDate || '9') > (b.dueDate || '9') ? 1 : -1);
  else if (sortBy === 'priority') filteredTasks.sort((a, b) => (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1));
  else if (sortBy === 'created') filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Daily goal calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCompletedCount = tasks.filter(t => t.completed && t.updatedAt && t.updatedAt.startsWith(todayStr)).length;
  const dailyGoalPercent = Math.min(100, Math.round((todayCompletedCount / dailyGoal) * 100));

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <MobileNav currentPage="tasks" />

      {/* Main Content */}
      <div style={{ paddingTop: '80px', paddingBottom: '48px', maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 48px' }}>
        
        {/* Header & Stats Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    ✅ <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Tasks</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your assignments, study goals, and projects.</p>
            </div>
            
            {/* Analytics Widget */}
            <div style={{ 
                background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', 
                padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', 
                maxWidth: '400px', margin: '0 auto', width: '100%'
            }}>
                <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                        <path style={{ color: 'var(--border-color)' }} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path style={{ color: '#8b5cf6', transition: 'all 1s ease-out' }} strokeDasharray={`${progressPercent}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span style={{ position: 'absolute', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{progressPercent}%</span>
                </div>
                <div>
                   <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', marginBottom: '4px', marginTop: 0 }}>Productivity</h3>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>{completedCount} of {totalCount} completed</p>
                </div>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Left Column: Task List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
                <style jsx>{`
                  @media (min-width: 1024px) {
                    .layout-grid {
                      display: grid;
                      grid-template-columns: 2fr 1fr;
                      gap: 24px;
                    }
                  }
                  @media (max-width: 1023px) {
                    .layout-grid {
                      display: flex;
                      flex-direction: column;
                      gap: 24px;
                    }
                  }
                `}</style>
                <div className="layout-grid">
                  <div>
                    {/* Actions & Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'inline-flex' }}>
                            {['all', 'active', 'completed'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                                        background: filter === f ? 'var(--bg-primary)' : 'transparent',
                                        color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        boxShadow: filter === f ? 'var(--shadow-sm)' : 'none'
                                    }}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* View Toggle */}
                             <div style={{ background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'inline-flex' }}>
                                 <button onClick={() => setViewMode('list')} style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', background: viewMode === 'list' ? 'var(--bg-primary)' : 'transparent', color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)' }} title="List view">☰</button>
                                 <button onClick={() => setViewMode('calendar')} style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', background: viewMode === 'calendar' ? 'var(--bg-primary)' : 'transparent', color: viewMode === 'calendar' ? 'var(--text-primary)' : 'var(--text-secondary)' }} title="Calendar view">📅</button>
                                 <button onClick={() => setViewMode('notepad')} style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', background: viewMode === 'notepad' ? 'var(--bg-primary)' : 'transparent', color: viewMode === 'notepad' ? 'var(--text-primary)' : 'var(--text-secondary)' }} title="Notepad">📝</button>
                             </div>
                            <button 
                                onClick={() => setShowTaskForm(true)}
                                style={{ background: '#8b5cf6', color: 'white', padding: '10px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span>➕</span> Add Task
                            </button>
                        </div>
                    </div>

                    {/* Search & Sort Bar */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="🔍 Search tasks or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1, minWidth: '180px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none' }}
                        />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="default">Sort: Default</option>
                            <option value="dueDate">Sort: Due Date</option>
                            <option value="priority">Sort: Priority</option>
                            <option value="created">Sort: Newest</option>
                        </select>
                    </div>

                    {/* Form Modal/Dropdown Equivalent */}
                    {showTaskForm && (
                         <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-md)' }}>
                             <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px', marginTop: 0 }}>Create New Task</h3>
                             <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                 <div>
                                     <input 
                                         type="text" 
                                         placeholder="What needs to be done?" 
                                         required
                                         value={formTitle}
                                         onChange={(e)=>setFormTitle(e.target.value)}
                                         style={{ width: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none' }}
                                     />
                                 </div>
                                 
                                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                                     <div style={{ position: 'relative' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', paddingLeft: '4px' }}>Due Date</label>
                                        <div 
                                            onClick={() => { setStepPicker('date'); setShowDatePicker(true); }}
                                            style={{ width: '100%', background: 'var(--bg-primary)', color: formDueDate ? 'var(--text-primary)' : 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 16px', fontSize: '14px', outline: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            <span>
                                                {formDueDate ? new Date(formDueDate).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Select Date & Time'}
                                            </span>
                                            <span style={{ fontSize: '16px' }}>📅</span>
                                        </div>
                                     </div>
                                     <div>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', paddingLeft: '4px' }}>Priority</label>
                                        <select 
                                            value={formPriority}
                                            onChange={(e)=>setFormPriority(e.target.value)}
                                            style={{ width: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 16px', fontSize: '14px', outline: 'none' }}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High Priority</option>
                                        </select>
                                     </div>
                                 </div>

                                 <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', paddingLeft: '4px' }}>Tags (comma separated)</label>
                                    <input 
                                         type="text" 
                                         placeholder="e.g. Assignment, dbms, urgent" 
                                         value={formTags}
                                         onChange={(e)=>setFormTags(e.target.value)}
                                         style={{ width: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 16px', fontSize: '14px', outline: 'none' }}
                                     />
                                 </div>

                                 {/* Subtasks Builder */}
                                 <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', paddingLeft: '4px' }}>Subtasks / Checklist</label>
                                    {formSubtasks.map((st, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>•</span>
                                            <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)' }}>{st.title}</span>
                                            <button type="button" onClick={() => setFormSubtasks(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', padding: '2px 6px' }}>✕</button>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input type="text" placeholder="Add a subtask..." value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && newSubtaskTitle.trim()) { e.preventDefault(); setFormSubtasks(prev => [...prev, { title: newSubtaskTitle.trim() }]); setNewSubtaskTitle(''); } }}
                                            style={{ flex: 1, background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none' }} />
                                        <button type="button" onClick={() => { if (newSubtaskTitle.trim()) { setFormSubtasks(prev => [...prev, { title: newSubtaskTitle.trim() }]); setNewSubtaskTitle(''); } }}
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', cursor: 'pointer' }}>+ Add</button>
                                    </div>
                                 </div>

                                 {/* Collaborator Search */}
                                 <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', paddingLeft: '4px' }}>Share with (collaborators)</label>
                                    {selectedCollabs.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                            {selectedCollabs.map(c => (
                                                <span key={c._id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', color: '#a78bfa' }}>
                                                    {c.image && <img src={c.image} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />}
                                                    {c.username || c.name}
                                                    <button type="button" onClick={() => setSelectedCollabs(prev => prev.filter(x => x._id !== c._id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', padding: 0 }}>✕</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <input type="text" placeholder="Search username..." value={collabQuery} onChange={(e) => searchCollabs(e.target.value)}
                                        style={{ width: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none' }} />
                                    {collabResults.length > 0 && (
                                        <div style={{ marginTop: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', maxHeight: '120px', overflowY: 'auto' }}>
                                            {collabResults.map(u => (
                                                <div key={u._id} onClick={() => { if (!selectedCollabs.find(c => c._id === u._id)) { setSelectedCollabs(prev => [...prev, u]); } setCollabQuery(''); setCollabResults([]); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                                                    {u.image && <img src={u.image} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />}
                                                    <span>{u.username || u.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                 </div>

                                 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                                     <button 
                                         type="button" 
                                         onClick={()=>setShowTaskForm(false)}
                                         style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                                     >
                                         Cancel
                                     </button>
                                     <button 
                                         type="submit" 
                                         disabled={isSubmitting}
                                         style={{ padding: '8px 24px', background: '#8b5cf6', color: 'white', fontSize: '14px', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.5 : 1 }}
                                     >
                                         {isSubmitting ? 'Saving...' : 'Save Task'}
                                     </button>
                                 </div>
                             </form>
                         </div>
                    )}

                    {/* Task Content — List, Calendar, or Notepad */}
                    {viewMode === 'notepad' ? (
                      <div style={{ marginTop: '8px' }}>
                        <Notepad />
                      </div>
                    ) : viewMode === 'calendar' ? (
                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <button onClick={() => { if (calViewMonth === 0) { setCalViewMonth(11); setCalViewYear(y => y - 1); } else setCalViewMonth(m => m - 1); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px' }}>←</button>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{monthNames[calViewMonth]} {calViewYear}</span>
                          <button onClick={() => { if (calViewMonth === 11) { setCalViewMonth(0); setCalViewYear(y => y + 1); } else setCalViewMonth(m => m + 1); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px' }}>→</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', padding: '4px', fontWeight: 600 }}>{d}</div>)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                          {getCalendarDays(calViewYear, calViewMonth).map((day, i) => {
                            if (day === null) return <div key={i} />;
                            const dateStr = `${calViewYear}-${String(calViewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr));
                            const isSelected = selectedCalDate === dateStr;
                            const isToday = dateStr === todayStr;
                            return (
                              <div key={i} onClick={() => setSelectedCalDate(isSelected ? null : dateStr)}
                                style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s',
                                  background: isSelected ? 'rgba(139,92,246,0.2)' : 'transparent', border: isToday ? '2px solid #8b5cf6' : '1px solid transparent',
                                  color: isSelected ? '#a78bfa' : isToday ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isToday || isSelected ? 600 : 400 }}>
                                <span>{day}</span>
                                {dayTasks.length > 0 && <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                                  {dayTasks.slice(0, 3).map((_, j) => <span key={j} style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8b5cf6' }} />)}
                                </div>}
                              </div>
                            );
                          })}
                        </div>
                        {selectedCalDate && (
                          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                            <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, marginBottom: '8px', marginTop: 0 }}>Tasks for {new Date(selectedCalDate + 'T00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</h4>
                            {tasks.filter(t => t.dueDate && t.dueDate.startsWith(selectedCalDate)).length === 0 ? (
                              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>No tasks due this day.</p>
                            ) : tasks.filter(t => t.dueDate && t.dueDate.startsWith(selectedCalDate)).map(t => (
                              <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', background: 'var(--bg-primary)', marginBottom: '6px', fontSize: '13px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.completed ? '#10b981' : t.priority === 'High' ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
                                <span style={{ color: t.completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: t.completed ? 'line-through' : 'none', flex: 1 }}>{t.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredTasks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--card-bg)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                                <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>✅</span>
                                <h3 style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '4px', marginTop: 0 }}>All caught up!</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>You have no {filter !== 'all' ? filter : ''} tasks.</p>
                            </div>
                        ) : (
                            filteredTasks.map(task => (
                                <div 
                                    key={task._id} 
                                    style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '16px',
                                        border: task.pinned ? '1px solid rgba(139,92,246,0.4)' : '1px solid var(--border-color)',
                                        background: task.completed ? 'var(--bg-tertiary)' : task.pinned ? 'rgba(139,92,246,0.03)' : 'var(--card-bg)',
                                        opacity: task.completed ? 0.7 : 1, transition: 'all 0.2s', position: 'relative'
                                    }}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleTaskCompletion(task._id, task.completed)}
                                        style={{
                                            marginTop: '2px', width: '20px', height: '20px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            border: task.completed ? '1px solid #10b981' : '1px solid var(--text-secondary)',
                                            background: task.completed ? '#10b981' : 'transparent', color: task.completed ? 'white' : 'transparent', cursor: 'pointer'
                                        }}
                                    >
                                        <svg viewBox="0 0 14 14" fill="none" style={{ width: '14px', height: '14px', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                                            <polyline points="2.5 7 6 10.5 11.5 3"></polyline>
                                        </svg>
                                    </button>
                                    
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                            <h4 style={{
                                                fontWeight: 600, fontSize: '15px', color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                                                textDecoration: task.completed ? 'line-through' : 'none', wordBreak: 'break-word', margin: 0
                                            }}>
                                                {task.pinned && <span title="Pinned" style={{ marginRight: '6px' }}>📌</span>}
                                                {task.title}
                                            </h4>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                                {!task.completed && task.priority === 'High' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} title="High Priority" />}
                                                {!task.completed && task.priority === 'Medium' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} title="Medium Priority" />}
                                                <button onClick={() => togglePin(task._id, task.pinned)} style={{ background: 'none', border: 'none', color: task.pinned ? '#8b5cf6' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', padding: '4px' }} title={task.pinned ? 'Unpin' : 'Pin'}>📌</button>
                                                <button onClick={() => deleteTask(task._id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', padding: '4px' }} title="Delete task">🗑️</button>
                                            </div>
                                        </div>
                                        
                                        {/* Sub-info: Due Date, Tags (color-coded), Collaborators */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                            {task.dueDate && (
                                                <span style={{
                                                    fontSize: '11px', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    background: new Date(task.dueDate) < new Date() && !task.completed ? 'rgba(239,68,68,0.1)' : 'var(--bg-primary)',
                                                    color: new Date(task.dueDate) < new Date() && !task.completed ? '#ef4444' : 'var(--text-secondary)',
                                                    border: `1px solid ${new Date(task.dueDate) < new Date() && !task.completed ? 'rgba(239,68,68,0.2)' : 'var(--border-color)'}`
                                                }}>
                                                    ⏱️ {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                            {task.tags?.map((tag, idx) => {
                                                const tagColor = getTagColor(tag);
                                                return (
                                                    <span key={idx} style={{
                                                        fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase',
                                                        background: `${tagColor}15`, color: tagColor, border: `1px solid ${tagColor}30`
                                                    }}>{tag}</span>
                                                );
                                            })}
                                            {task.collaborators?.length > 0 && (
                                                <div style={{ display: 'flex', marginLeft: '4px' }}>
                                                    {task.collaborators.map((c, i) => (
                                                        <img key={c._id || i} src={c.image || `https://ui-avatars.com/api/?name=${c.name}&size=20&background=8b5cf6&color=fff`} alt={c.name} title={c.username || c.name}
                                                            style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--card-bg)', marginLeft: i > 0 ? '-6px' : 0 }} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Subtasks */}
                                        {task.subtasks?.length > 0 && (
                                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                                                    </span>
                                                    <div style={{ flex: 1, height: '3px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`, height: '100%', background: '#8b5cf6', borderRadius: '2px', transition: 'width 0.3s' }} />
                                                    </div>
                                                </div>
                                                {task.subtasks.map(sub => (
                                                    <div key={sub._id} onClick={() => toggleSubtask(task._id, sub._id)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer' }}>
                                                        <span style={{ width: '14px', height: '14px', borderRadius: '4px', border: sub.completed ? '1px solid #10b981' : '1px solid var(--text-muted)', background: sub.completed ? '#10b981' : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', flexShrink: 0 }}>
                                                            {sub.completed && '✓'}
                                                        </span>
                                                        <span style={{ fontSize: '12px', color: sub.completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: sub.completed ? 'line-through' : 'none' }}>{sub.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    )}
                  </div>

                  {/* Right Column: Pomodoro Tracker */}
                  <div>
                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', position: 'sticky', top: '96px', boxShadow: 'var(--shadow-sm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                              <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                  <span>🍅</span> Focus Timer
                              </h3>
                              {/* Mode toggles */}
                              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px' }}>
                                  <button 
                                      onClick={setWorkMode}
                                      style={{
                                          fontSize: '12px', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                          background: timerMode === 'work' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                          color: timerMode === 'work' ? '#ef4444' : 'var(--text-secondary)'
                                      }}
                                  >
                                      Work
                                  </button>
                                  <button 
                                      onClick={setBreakMode}
                                      style={{
                                          fontSize: '12px', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                          background: timerMode === 'break' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                          color: timerMode === 'break' ? '#10b981' : 'var(--text-secondary)'
                                      }}
                                  >
                                      Chill
                                  </button>
                              </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ fontSize: '64px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-2px', color: 'var(--text-primary)', marginBottom: '24px' }}>
                                  {formatTime(timeLeft)}
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                                  <button 
                                      onClick={toggleTimer}
                                      style={{
                                          flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', color: 'white',
                                          background: timerActive ? 'var(--text-muted)' : (timerMode === 'work' ? '#ef4444' : '#10b981')
                                      }}
                                  >
                                      {timerActive ? 'Pause' : 'Start Focus'}
                                  </button>
                                  <button 
                                      onClick={resetTimer}
                                      style={{ padding: '14px 20px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '12px', fontWeight: 600, border: '1px solid var(--border-color)', cursor: 'pointer' }}
                                  >
                                      ↻
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Daily Goal Widget */}
                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', marginTop: '16px', boxShadow: 'var(--shadow-sm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '15px' }}>
                                  <span>🎯</span> Daily Goal
                              </h3>
                              <button onClick={() => setEditingGoal(!editingGoal)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>⚙️</button>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                                      <path style={{ color: 'var(--border-color)' }} strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                      <path style={{ color: dailyGoalPercent >= 100 ? '#10b981' : '#f59e0b', transition: 'all 1s ease-out' }} strokeDasharray={`${dailyGoalPercent}, 100`} strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                  </svg>
                                  <span style={{ position: 'absolute', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{todayCompletedCount}/{dailyGoal}</span>
                              </div>
                              <div>
                                  <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', margin: '0 0 2px 0' }}>
                                      {dailyGoalPercent >= 100 ? '🎉 Goal reached!' : `${dailyGoal - todayCompletedCount} more to go`}
                                  </p>
                                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>Tasks completed today</p>
                              </div>
                          </div>

                          {editingGoal && (
                              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Target:</span>
                                  <input type="number" min="1" max="20" value={dailyGoal}
                                      onChange={(e) => { const v = parseInt(e.target.value) || 1; setDailyGoal(v); try { localStorage.setItem('cp_daily_goal', v); } catch {} }}
                                      style={{ width: '50px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', outline: 'none', textAlign: 'center' }} />
                                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>tasks/day</span>
                              </div>
                          )}
                      </div>
                  </div>
                </div>
            </div>
        </div>

      </div>

      {/* Custom Date Picker Modal */}
      {showDatePicker && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }} onClick={() => setShowDatePicker(false)}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', 
            padding: '24px', maxWidth: '350px', width: '100%',
            transform: 'scale(1)', animation: 'popIn 0.2s ease-out'
          }} onClick={e => e.stopPropagation()}>
            
            {stepPicker === 'date' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <button type="button" onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else { setCalendarMonth(m => m - 1); } }} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px' }}>←</button>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{monthNames[calendarMonth]} {calendarYear}</span>
                  <button type="button" onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else { setCalendarMonth(m => m + 1); } }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px' }}>→</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', padding: '4px' }}>{d}</div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {getCalendarDays(calendarYear, calendarMonth).map((day, i) => {
                    if (day === null) return <div key={i} />;
                    const isToday = day === todayDate.getDate() && calendarMonth === todayDate.getMonth() && calendarYear === todayDate.getFullYear();
                    
                    return (
                      <div 
                        key={i} 
                        onClick={() => { 
                          const pickedDate = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          if(formDueDate) {
                            const timePart = formDueDate.split('T')[1] || '23:59';
                            setFormDueDate(`${pickedDate}T${timePart}`);
                          } else {
                            setFormDueDate(`${pickedDate}T23:59`);
                          }
                          setStepPicker('time');
                        }}
                        style={{ 
                          aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '8px', fontSize: '13px', color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
                          background: 'transparent', border: isToday ? '2px solid #8b5cf6' : '1px solid transparent', fontWeight: isToday ? 600 : 400,
                          cursor: 'pointer', transition: 'all 0.1s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'; e.currentTarget.style.color = '#a78bfa'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isToday ? 'var(--text-primary)' : 'var(--text-secondary)'; }}
                      >{day}</div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px', marginTop: 0 }}>Select Time</h3>
                
                <style jsx>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
                {(() => {
                   const currentTime = formDueDate ? (formDueDate.split('T')[1] || '23:59').substring(0,5) : '23:59';
                   const [hourStr, minStr] = currentTime.split(':');
                   const datePart = formDueDate ? formDueDate.split('T')[0] : '';
                   
                   return (
                     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                       <div className="hide-scroll" style={{ height: '180px', width: '80px', overflowY: 'auto', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px', scrollbarWidth: 'none' }}>
                         {Array.from({length: 24}).map((_, i) => {
                            const h = String(i).padStart(2, '0');
                            const isSelected = h === hourStr;
                            return (
                              <div 
                                key={h} 
                                onClick={() => setFormDueDate(`${datePart}T${h}:${minStr}`)}
                                style={{ padding: '12px 0', cursor: 'pointer', background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent', color: isSelected ? '#a78bfa' : 'var(--text-secondary)', fontWeight: isSelected ? 'bold' : 500, fontSize: '20px', transition: 'all 0.1s' }}
                              >
                                {h}
                              </div>
                            )
                         })}
                       </div>
                       <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>:</div>
                       <div className="hide-scroll" style={{ height: '180px', width: '80px', overflowY: 'auto', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px', scrollbarWidth: 'none' }}>
                         {Array.from({length: 60}).map((_, i) => {
                            const m = String(i).padStart(2, '0');
                            const isSelected = m === minStr;
                            return (
                              <div 
                                key={m} 
                                onClick={() => setFormDueDate(`${datePart}T${hourStr}:${m}`)}
                                style={{ padding: '12px 0', cursor: 'pointer', background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent', color: isSelected ? '#a78bfa' : 'var(--text-secondary)', fontWeight: isSelected ? 'bold' : 500, fontSize: '20px', transition: 'all 0.1s' }}
                              >
                                {m}
                              </div>
                            )
                         })}
                       </div>
                     </div>
                   );
                })()}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setStepPicker('date')} style={{ flex: 1, padding: '10px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 }}>Back</button>
                  <button type="button" onClick={() => setShowDatePicker(false)} style={{ flex: 1, padding: '10px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 }}>Confirm</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setTaskToDelete(null)}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: 'var(--shadow-md)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px', marginTop: 0 }}>Delete Task</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Are you sure you want to delete this task? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setTaskToDelete(null)}
                style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteTask}
                style={{ padding: '8px 24px', background: '#ef4444', color: 'white', fontSize: '14px', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bottom (for mobile) */}
      <MobileNav currentPage="tasks" />
    </div>
  );
}
