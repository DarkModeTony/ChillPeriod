'use client';

import { useState, useEffect, useCallback } from 'react';
import MobileNav from '@/components/MobileNav';
import { semesters, branches, getPdfLink, fetchSubjects, fetchSubjectDetails } from '@/lib/data/btech-syllabus';
import { getVideoLectures, getDotnotesVideoLink, extractYouTubeId } from '@/lib/data/video-lectures';

function slugToTitle(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function SubjectSkeleton() {
  return (
    <div className="skeleton-card" style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
      <div style={{ width: '70%', height: '18px', background: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '10px' }} />
      <div style={{ width: '40%', height: '14px', background: 'var(--bg-secondary)', borderRadius: '6px' }} />
    </div>
  );
}

function SubjectCard({ slug, semesterValue, branch, semesterShort }) {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('theory');
  const [checkedTopics, setCheckedTopics] = useState({});

  // Load checked topics from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`syllabus_${semesterValue}_${branch}_${slug}`);
      if (stored) setCheckedTopics(JSON.parse(stored));
    } catch {}
  }, [semesterValue, branch, slug]);

  const toggleTopic = (unitIdx, topicIdx) => {
    const key = `${unitIdx}-${topicIdx}`;
    setCheckedTopics(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(`syllabus_${semesterValue}_${branch}_${slug}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const subjectName = slugToTitle(slug);

  const loadDetails = useCallback(async () => {
    if (details) return;
    setLoading(true);
    const data = await fetchSubjectDetails(semesterValue, branch, slug);
    setDetails(data);
    setLoading(false);
  }, [details, semesterValue, branch, slug]);

  const handleClick = () => {
    if (!expanded) loadDetails();
    setExpanded(!expanded);
  };


  const videoLectures = getVideoLectures(semesterValue, slug);
  const dotnotesLink = getDotnotesVideoLink(slug);
  const hasTheory = details?.theory?.length > 0;
  const hasLab = details?.lab?.length > 0;
  const hasVideos = videoLectures.length > 0;

  return (
    <div className="subject-card" style={{
      background: 'var(--card-bg)',
      borderRadius: '14px',
      border: `1px solid ${expanded ? '#8b5cf6' : 'var(--border-color)'}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
    }}>
      {/* Header — always visible */}
      <div
        onClick={handleClick}
        style={{
          padding: '18px 20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {details?.subject || subjectName}
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {details?.theorypapercode && (
              <span className="badge badge-purple">{details.theorypapercode}</span>
            )}
            {details?.labpapercode && (
              <span className="badge badge-blue">{details.labpapercode}</span>
            )}
            {details?.theorycredits != null && (
              <span className="badge badge-ghost">{details.theorycredits} Credits</span>
            )}
            {details?.labcredits != null && details.labcredits > 0 && (
              <span className="badge badge-ghost">Lab: {details.labcredits} Cr</span>
            )}
          </div>
        </div>
        <span style={{
          fontSize: '18px',
          transition: 'transform 0.3s ease',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          color: '#8b5cf6',
          flexShrink: 0,
        }}>
          ▾
        </span>
      </div>

      {/* Expanded details panel */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border-color)',
          animation: 'slideDown 0.3s ease',
        }}>
          {loading && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div className="spinner" />
              <p style={{ marginTop: '8px', fontSize: '14px' }}>Loading syllabus...</p>
            </div>
          )}

          {details && !loading && (
            <>
              {/* Content Sections */}

              {/* Theory content */}
              {hasTheory && (

                <div style={{ padding: '0 20px' }}>
                  {hasTheory && hasLab && <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Theory</h3>}
                  <div className="animate-fade-in">
                  {details.theory.map((unit) => {
                    const checkedCount = unit.topics.filter((_, i) => checkedTopics[`${unit.unit}-${i}`]).length;
                    const progress = Math.round((checkedCount / unit.topics.length) * 100);
                    
                    return (
                      <div key={unit.unit} style={{ marginBottom: '24px' }}>
                        <div style={{
                          margin: '16px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 4px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              width: '28px', height: '28px',
                              borderRadius: '8px',
                              background: 'rgba(139, 92, 246, 0.15)',
                              color: '#8b5cf6',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 700,
                            }}>
                              {unit.unit}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Unit {unit.unit}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="h-1.5 w-32 sm:w-60 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                                <div style={{ 
                                    width: `${progress}%`, 
                                    height: '100%', 
                                    background: '#8b5cf6', 
                                    borderRadius: '3px',
                                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' 
                                }} />
                            </div>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, minWidth: '60px', textAlign: 'right' }}>
                              {checkedCount}/{unit.topics.length} done
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {unit.topics.map((topic, i) => {
                            const isChecked = !!checkedTopics[`${unit.unit}-${i}`];
                            return (
                              <div
                                key={i}
                                onClick={() => toggleTopic(unit.unit, i)}
                                className="relative flex w-full items-center gap-4 rounded-md p-2 text-sm transition-colors lg:text-base hover:bg-[var(--bg-secondary)]"
                                style={{
                                  cursor: 'pointer'
                                }}
                              >
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={isChecked}
                                  data-state={isChecked ? "checked" : "unchecked"}
                                  value="on"
                                  className="peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  style={{
                                    borderColor: isChecked ? '#8b5cf6' : 'var(--text-muted)',
                                    backgroundColor: isChecked ? '#8b5cf6' : 'transparent',
                                    color: 'white'
                                  }}
                                >
                                  <span
                                    data-state={isChecked ? "checked" : "unchecked"}
                                    className="flex items-center justify-center text-current"
                                    style={{ 
                                      pointerEvents: 'none',
                                      opacity: isChecked ? 1 : 0,
                                      color: isChecked ? 'white' : 'currentColor'
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3 w-3" aria-hidden="true">
                                      <path d="M20 6 9 17l-5-5"></path>
                                    </svg>
                                  </span>
                                </button>
                                <p 
                                  className={`flex-1 ${isChecked ? 'line-through' : ''}`}
                                  style={{
                                    margin: 0,
                                    color: isChecked ? 'var(--text-secondary)' : 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5'
                                  }}
                                >
                                  {topic}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}

              {/* Lab content */}
              {hasLab && (
                <div style={{ padding: '20px' }}>
                   {hasTheory && hasLab && <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>Lab Experiments</h3>}
                   <div className="animate-fade-in">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {details.lab.map((exp, i) => {
                          const content = typeof exp === 'string' ? exp : (exp.aim?.objective || exp.aim || exp.experiment || 'Experiment');
                          return (
                          <div key={i} style={{
                            padding: '16px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            lineHeight: '1.5'
                          }}>
                            <span style={{ 
                              color: '#8b5cf6', 
                              fontWeight: 700, 
                              minWidth: '24px',
                              display: 'inline-block' 
                            }}>
                              {i + 1}.
                            </span>
                            {content}
                          </div>
                          );
                        })}
                      </div>
                   </div>
                </div>
              )}

              {/* Video Lectures */}
              {hasVideos && (
                <div style={{ padding: '20px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '16px',
                    color: 'var(--text-primary)',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    🎬 Video Lectures
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    paddingBottom: '8px',
                    WebkitOverflowScrolling: 'touch',
                  }}>
                    {videoLectures.map((video, i) => {
                      const videoId = extractYouTubeId(video.url);
                      const thumbnail = videoId
                        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                        : null;
                      return (
                        <a
                          key={i}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: '0 0 200px',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'var(--bg-secondary)',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                        >
                          <div style={{
                            width: '100%',
                            aspectRatio: '16 / 9',
                            background: '#111',
                            overflow: 'hidden',
                          }}>
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={video.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                color: '#ef4444',
                              }}>
                                ▶
                              </div>
                            )}
                          </div>
                          <div style={{ padding: '8px 10px 10px' }}>
                            <p style={{
                              margin: '0 0 3px 0',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              lineHeight: '1.35',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>{video.title}</p>
                            <p style={{
                              margin: 0,
                              fontSize: '10px',
                              color: 'var(--text-secondary)',
                              fontWeight: 500,
                            }}>{video.author}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

            </>
          )}

          {!details && !loading && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Could not load details. Try again later.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SyllabusPage() {
  const [selectedSem, setSelectedSem] = useState(semesters[0].value);
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentSemester = semesters.find(s => s.value === selectedSem);
  const pdfLink = getPdfLink(selectedBranch);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSubjects([]);

    fetchSubjects(selectedSem, selectedBranch).then((data) => {
      if (!cancelled) {
        setSubjects(data || []);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [selectedSem, selectedBranch]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)', paddingTop: '80px' }}>
      <MobileNav currentPage="syllabus" />
      {/* Header */}
      <div style={{
        padding: '28px 24px 20px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.06))',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center',
      }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📚 B.Tech Syllabus
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
          IPU Syllabus & Study Materials
        </p>
      </div>

      {/* Filters */}
      <div style={{ padding: '20px 24px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <select
          value={selectedSem}
          onChange={(e) => setSelectedSem(e.target.value)}
          className="filter-select"
        >
          {semesters.map(sem => (
            <option key={sem.value} value={sem.value}>{sem.label}</option>
          ))}
        </select>

        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="filter-select"
        >
          {branches.map(branch => (
            <option key={branch.value} value={branch.value}>{branch.label}</option>
          ))}
        </select>
      </div>

      {/* PDF Link */}
      {pdfLink && (
        <div style={{ padding: '0 24px 16px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <a
            href={pdfLink}
            target="_blank"
            rel="noopener noreferrer"
            className="pdf-link"
          >
            📄 Download Official {selectedBranch} Syllabus PDF
          </a>
        </div>
      )}

      {/* Subject count */}
      {!loading && subjects.length > 0 && (
        <div style={{ padding: '0 24px 8px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''} found — click to expand syllabus
          </p>
        </div>
      )}

      {/* Subject List */}
      <div style={{ flex: 1, padding: '0 24px 100px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {loading ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {[1, 2, 3, 4, 5].map(i => <SubjectSkeleton key={i} />)}
          </div>
        ) : subjects.length > 0 ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {subjects.map((slug) => (
              <SubjectCard
                key={slug}
                slug={slug}
                semesterValue={selectedSem}
                branch={selectedBranch}
                semesterShort={currentSemester?.short}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>No subjects found</p>
            <p style={{ fontSize: '13px' }}>Try selecting a different semester or branch.</p>
          </div>
        )}
      </div>

      <MobileNav currentPage="syllabus" />

      <style jsx>{`
        .filter-select {
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--card-bg);
          color: var(--text-primary);
          font-size: 15px;
          min-width: 200px;
          cursor: pointer;
          transition: border-color 0.2s ease;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }
        .filter-select option {
          background: var(--bg-primary);
          color: var(--text-primary);
          padding: 10px 14px;
          font-size: 14px;
        }
        .filter-select option:checked,
        .filter-select option:hover {
          background: #8b5cf6;
          color: white;
        }
        .filter-select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
        }
        .pdf-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 12px;
          color: #8b5cf6;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .pdf-link:hover {
          background: rgba(139, 92, 246, 0.15);
          transform: translateY(-1px);
        }
        .subject-card:hover {
          border-color: rgba(139, 92, 246, 0.4) !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .badge-purple {
          background: rgba(139, 92, 246, 0.12);
          color: #8b5cf6;
        }
        .badge-blue {
          background: rgba(59, 130, 246, 0.12);
          color: #3b82f6;
        }
        .badge-ghost {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }
        .tab-btn {
          padding: 12px 0;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          white-space: nowrap;
          text-decoration: none;
        }
        .tab-btn:hover {
          color: var(--text-primary);
        }
        .tab-active {
          color: var(--text-primary) !important;
          border-bottom-color: #8b5cf6 !important;
          font-weight: 600;
        }



        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid var(--border-color);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 2000px; }
        }
        .skeleton-card {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
