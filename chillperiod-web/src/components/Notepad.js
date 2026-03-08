'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const NOTE_COLORS = {
  default: { bg: 'var(--card-bg)', accent: '#8b5cf6', border: 'var(--border-color)' },
  purple:  { bg: 'rgba(139,92,246,0.07)', accent: '#8b5cf6', border: 'rgba(139,92,246,0.3)' },
  cyan:    { bg: 'rgba(6,182,212,0.07)',  accent: '#06b6d4', border: 'rgba(6,182,212,0.3)' },
  pink:    { bg: 'rgba(236,72,153,0.07)', accent: '#ec4899', border: 'rgba(236,72,153,0.3)' },
  green:   { bg: 'rgba(16,185,129,0.07)', accent: '#10b981', border: 'rgba(16,185,129,0.3)' },
  yellow:  { bg: 'rgba(245,158,11,0.07)', accent: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
};

function formatRelativeTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Notepad() {
  const [notes, setNotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeId, setActiveId]       = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy]           = useState('updated'); // 'updated' | 'created' | 'alpha'
  const [saveStatus, setSaveStatus]   = useState('saved');   // 'saved' | 'saving' | 'unsaved'
  const [isCreating, setIsCreating]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const saveTimerRef = useRef(null);
  const textareaRef  = useRef(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchNotes();
  }, []);

  // ── Active note (derived early so useEffects can reference it) ────────────
  const activeNote = notes.find(n => n._id === activeId);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [activeNote?.content]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotes(data);
      if (data.length > 0 && !activeId) setActiveId(data[0]._id);
    } catch {}
    finally { setLoading(false); }
  };

  // ── Debounced save ────────────────────────────────────────────────────────
  const scheduleSave = useCallback((id, patch) => {
    setSaveStatus('unsaved');
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch)
        });
        if (res.ok) {
          const updated = await res.json();
          setNotes(prev => prev.map(n => n._id === id ? { ...n, ...updated } : n));
          setSaveStatus('saved');
        }
      } catch { setSaveStatus('unsaved'); }
    }, 1200);
  }, []);

  // ── Field update helpers ──────────────────────────────────────────────────
  const updateField = (field, value) => {
    setNotes(prev => prev.map(n => n._id === activeId ? { ...n, [field]: value } : n));
    scheduleSave(activeId, { [field]: value });
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const createNote = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note', content: '' })
      });
      if (!res.ok) throw new Error();
      const note = await res.json();
      setNotes(prev => [note, ...prev]);
      setActiveId(note._id);
      setSaveStatus('saved');
    } catch {} finally { setIsCreating(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteNote = async (id) => {
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      const remaining = notes.filter(n => n._id !== id);
      setNotes(remaining);
      if (activeId === id) setActiveId(remaining[0]?._id || null);
    } catch {}
    finally { setDeleteConfirmId(null); }
  };

  // ── Pin ───────────────────────────────────────────────────────────────────
  const togglePin = async (id, current) => {
    setNotes(prev => prev.map(n => n._id === id ? { ...n, isPinned: !current } : n));
    await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !current })
    });
  };

  // ── Sorted + filtered notes ───────────────────────────────────────────────
  const filteredNotes = notes
    .filter(n => {
      const q = searchQuery.toLowerCase();
      return !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      if (sortBy === 'alpha')   return a.title.localeCompare(b.title);
      if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  // ── Markdown-ish quick actions (insert at cursor) ────────────────────────
  const insertText = (prefix, suffix = '') => {
    const ta = textareaRef.current;
    if (!ta || !activeNote) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const selected = ta.value.slice(start, end);
    const inserted = prefix + selected + suffix;
    const newVal = ta.value.slice(0, start) + inserted + ta.value.slice(end);
    updateField('content', newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const wordCount    = activeNote ? activeNote.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount    = activeNote ? activeNote.content.length : 0;
  const lineCount    = activeNote ? activeNote.content.split('\n').length : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 180px)', minHeight: '500px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <div style={{
        width: sidebarOpen ? '280px' : '0',
        minWidth: sidebarOpen ? '280px' : '0',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        borderRight: sidebarOpen ? '1px solid var(--border-color)' : 'none',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-secondary)'
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>📝 Notes</span>
            <button
              onClick={createNote}
              disabled={isCreating}
              style={{ background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: isCreating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {isCreating ? '...' : '+ New'}
            </button>
          </div>
          <input
            type="text"
            placeholder="🔍 Search notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ marginTop: '8px', width: '100%', background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="updated">Sort: Last Modified</option>
            <option value="created">Sort: Date Created</option>
            <option value="alpha">Sort: A → Z</option>
          </select>
        </div>

        {/* Note List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filteredNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              {searchQuery ? 'No matching notes.' : 'No notes yet. Create one!'}
            </div>
          ) : filteredNotes.map(note => {
            const colors = NOTE_COLORS[note.color] || NOTE_COLORS.default;
            const isActive = note._id === activeId;
            return (
              <div
                key={note._id}
                onClick={() => setActiveId(note._id)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  border: isActive ? `1.5px solid ${colors.accent}` : '1.5px solid transparent',
                  background: isActive ? colors.bg : 'transparent',
                  transition: 'all 0.15s',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {note.isPinned && <span style={{ fontSize: '10px' }}>📌</span>}
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {note.title || 'Untitled Note'}
                      </p>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {note.content || 'No content yet…'}
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: '10px', color: 'var(--text-muted)' }}>
                      {formatRelativeTime(note.updatedAt)}
                    </p>
                  </div>
                  <div
                    style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.accent, flexShrink: 0, marginTop: '3px' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Editor Area ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Editor Toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap', background: 'var(--bg-primary)' }}>
          {/* Toggle sidebar */}
          <button
            onClick={() => setSidebarOpen(p => !p)}
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '14px' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          {activeNote && <>
            {/* Formatting quick-inserts */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
              {[
                { label: 'B',   tip: 'Bold',          style: { fontWeight: 'bold' },        action: () => insertText('**', '**')   },
                { label: 'I',   tip: 'Italic',        style: { fontStyle: 'italic' },       action: () => insertText('_', '_')     },
                { label: 'S',   tip: 'Strikethrough', style: { textDecoration: 'line-through' }, action: () => insertText('~~', '~~') },
                { label: '`',   tip: 'Inline code',   style: { fontFamily: 'monospace' },   action: () => insertText('`', '`')     },
                { label: '—',   tip: 'Divider',       style: {},                             action: () => insertText('\n---\n')    },
                { label: '☑',   tip: 'Checkbox',      style: {},                             action: () => insertText('- [ ] ')    },
                { label: '•',   tip: 'Bullet',        style: {},                             action: () => insertText('- ')         },
                { label: '#',   tip: 'Heading',       style: {},                             action: () => insertText('## ')        },
              ].map(btn => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  title={btn.tip}
                  style={{ ...btn.style, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', fontSize: '13px' }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Color picker */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {Object.entries(NOTE_COLORS).map(([key, c]) => (
                <button
                  key={key}
                  onClick={() => updateField('color', key)}
                  title={`Color: ${key}`}
                  style={{
                    width: '16px', height: '16px', borderRadius: '50%', background: c.accent, border: activeNote?.color === key ? `2px solid var(--text-primary)` : '2px solid transparent', cursor: 'pointer', padding: 0, outline: 'none', transition: 'border 0.15s'
                  }}
                />
              ))}
            </div>

            {/* Pin */}
            <button
              onClick={() => togglePin(activeNote._id, activeNote.isPinned)}
              title={activeNote.isPinned ? 'Unpin' : 'Pin note'}
              style={{ background: activeNote.isPinned ? 'rgba(139,92,246,0.12)' : 'var(--bg-secondary)', border: `1px solid ${activeNote.isPinned ? 'rgba(139,92,246,0.3)' : 'var(--border-color)'}`, color: activeNote.isPinned ? '#a78bfa' : 'var(--text-secondary)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '13px' }}
            >
              📌
            </button>

            {/* Delete */}
            <button
              onClick={() => setDeleteConfirmId(activeNote._id)}
              title="Delete note"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: '#ef4444', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '13px', marginLeft: 'auto' }}
            >
              🗑️
            </button>

            {/* Save status */}
            <div style={{ fontSize: '11px', color: saveStatus === 'unsaved' ? '#f59e0b' : saveStatus === 'saving' ? '#06b6d4' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              {saveStatus === 'saving' && <span style={{ display: 'inline-block', width: '8px', height: '8px', border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
              {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving…' : '● Unsaved'}
            </div>
          </>}
        </div>

        {/* Actual Editor */}
        {activeNote ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: NOTE_COLORS[activeNote.color]?.bg || 'var(--card-bg)' }}>
            {/* Title */}
            <div style={{ padding: '20px 28px 0' }}>
              <input
                type="text"
                value={activeNote.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="Note Title"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '24px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  padding: 0,
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', paddingBottom: '12px', borderBottom: `1px solid ${NOTE_COLORS[activeNote.color]?.border || 'var(--border-color)'}` }}>
                Created {new Date(activeNote.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · Last edited {formatRelativeTime(activeNote.updatedAt)}
              </div>
            </div>

            {/* Content textarea */}
            <textarea
              ref={textareaRef}
              value={activeNote.content}
              onChange={e => updateField('content', e.target.value)}
              placeholder="Start typing your note here…&#10;&#10;Tips: use ## for headings, **text** for bold, - for bullets, - [ ] for checklists"
              style={{
                flex: 1,
                width: '100%',
                padding: '16px 28px 24px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '14px',
                lineHeight: '1.8',
                color: 'var(--text-primary)',
                fontFamily: `'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace`,
                boxSizing: 'border-box',
                overflowY: 'auto'
              }}
            />

            {/* Status bar */}
            <div style={{ padding: '8px 28px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, background: 'var(--bg-primary)' }}>
              <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
              <span>{charCount} {charCount === 1 ? 'character' : 'characters'}</span>
              <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '48px' }}>📝</span>
            <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>No note selected</p>
            <p style={{ margin: 0, fontSize: '13px' }}>Create a new note or select one from the sidebar.</p>
            <button
              onClick={createNote}
              disabled={isCreating}
              style={{ background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              {isCreating ? 'Creating…' : '+ New Note'}
            </button>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ────────────────────────────────── */}
      {deleteConfirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px', maxWidth: '360px', width: '90%', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700 }}>Delete Note?</h3>
            <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>This action cannot be undone. The note will be permanently deleted.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirmId(null)} style={{ padding: '8px 20px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={() => deleteNote(deleteConfirmId)} style={{ padding: '8px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        textarea::placeholder { color: var(--text-muted); font-style: italic; }
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
      `}</style>
    </div>
  );
}
