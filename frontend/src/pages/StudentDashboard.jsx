import { useState, useEffect } from 'react';
import api from '../api';
import Chat from '../components/Chat';

export default function StudentDashboard({ user }) {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({}); // { senderId: count }
  const [viewProject, setViewProject] = useState(null);
  const [localProgress, setLocalProgress] = useState({}); // { appId: percent }
  const [localUrls, setLocalUrls] = useState({}); // { appId: url }

  useEffect(() => {
    fetchProjects();
    fetchApplications();
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCounts = async () => {
    try {
      const res = await api.get('/messages/unread/counts');
      const counts = {};
      res.data.forEach(item => { 
        counts[`${item.sender_id}_${item.project_id}`] = item.count; 
      });
      setUnreadCounts(counts);
    } catch (err) {
      console.error('Failed to fetch unread counts');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      const apps = Array.isArray(res.data) ? res.data : [];
      setApplications(apps);
      
      // Sync local progress with server data
      const newLocal = { ...localProgress };
      const newUrls = { ...localUrls };
      apps.forEach(a => {
        if (newLocal[a.id] === undefined) {
          newLocal[a.id] = a.progress_percent || 0;
        }
        if (newUrls[a.id] === undefined) {
          newUrls[a.id] = a.project_url || '';
        }
      });
      setLocalProgress(newLocal);
      setLocalUrls(newUrls);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleStatusUpdate = async (appId, url) => {
    try {
      await api.put(`/applications/${appId}/status-update`, { 
        progress_percent: localProgress[appId], 
        project_url: url 
      });
      fetchApplications(); 
      alert('Project status and link updated successfully!');
    } catch (err) {
      alert('Failed to update project data.');
    }
  };

  const applyForProject = async (projectId) => {
    try {
      await api.post('/applications/apply', { project_id: projectId });
      alert('Application successful! Waiting for approval.');
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit application');
    }
  };

  return (
    <div className="student-dashboard animate-fade-in">
      <header className="mb-4">
        <h1>Student Portal <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>/ Dashboard</span></h1>
      </header>

      <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>
        {/* Available Projects Section */}
        <div style={{ flex: 1.2 }}>
          <div className="glass-panel">
            <h3 className="mb-4">Available Project Opportunities</h3>
            <div className="grid gap-4">
              {projects.length === 0 && <p className="text-muted">No pending projects currently available for matching.</p>}
              {projects.map((p) => (
                <div key={p.id} className="project-card" style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px', 
                  padding: '1.2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{p.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {p.industry_name} • {p.duration}
                    </p>
                    <div className="mt-2" style={{ display: 'flex', gap: '8px' }}>
                      {(p.skills_required || '').split(',').map(s => (
                        <span key={s} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary"
                    disabled={applications.some(a => (a.project_id?._id || a.project_id) === p.id)}
                    onClick={() => applyForProject(p.id)}
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    {applications.some(a => (a.project_id?._id || a.project_id) === p.id) ? 'Application Sent' : 'Apply Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Work Section */}
        <div style={{ flex: 1 }}>
          <div className="glass-panel">
            <h3 className="mb-4">My Status & Ongoing Work</h3>
            <div className="grid gap-4">
              {applications.length === 0 && <p className="text-muted">Your active applications and assignments will appear here.</p>}
              {applications.map((a) => {
                const project = projects.find(p => p.id === (a.project_id?._id || a.project_id)) || {};
                return (
                  <div key={a.id} className="app-card" style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(129, 140, 248, 0.2)', 
                    borderRadius: '16px', 
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                  }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 style={{ color: 'var(--primary-color)' }}>{a.project_title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge ${a.status.replace('_', '-')}`}>{a.status.replace('_', ' ')}</span>
                          <button className="btn-link" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', border: 'none', background: 'none' }} onClick={() => setViewProject(project)}>View Details</button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div style={{ position: 'relative' }}>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => {
                            const mid = project.industry_mentor_id?._id || project.industry_mentor_id;
                            if (mid) {
                              setChatUser({ id: mid, name: 'Industry Mentor' });
                              setSelectedProjectId(a.project_id?._id || a.project_id);
                            }
                          }}>Chat Mentor</button>
                          {unreadCounts[`${project.industry_mentor_id?._id || project.industry_mentor_id}_${a.project_id?._id || a.project_id}`] > 0 && 
                            <span className="notification-badge">{unreadCounts[`${project.industry_mentor_id?._id || project.industry_mentor_id}_${a.project_id?._id || a.project_id}`]}</span>}
                        </div>
                        {project.faculty_id && (
                          <div style={{ position: 'relative' }}>
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => {
                              const fid = project.faculty_id?._id || project.faculty_id;
                              if (fid) {
                                setChatUser({ id: fid, name: 'Faculty' });
                                setSelectedProjectId(a.project_id?._id || a.project_id);
                              }
                            }}>Chat Faculty</button>
                            {unreadCounts[`${project.faculty_id?._id || project.faculty_id}_${a.project_id?._id || a.project_id}`] > 0 && 
                              <span className="notification-badge">{unreadCounts[`${project.faculty_id?._id || project.faculty_id}_${a.project_id?._id || a.project_id}`]}</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {a.status === 'selected' && (
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="flex justify-between items-center mb-3">
                          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Project Completion</p>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" min="0" max="100" 
                              value={localProgress[a.id] || 0}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                setLocalProgress(prev => ({ ...prev, [a.id]: val }));
                              }}
                              style={{ width: '55px', padding: '3px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '0.85rem' }}
                            />
                            <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>%</span>
                          </div>
                        </div>

                        <div className="p-3 rounded mb-4" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" min="0" max="100" 
                              value={localProgress[a.id] || 0} 
                              onChange={(e) => setLocalProgress(prev => ({ ...prev, [a.id]: parseInt(e.target.value) }))}
                              style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                            />
                            <button className="btn btn-primary" onClick={() => handleStatusUpdate(a.id, a.project_url)} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Update</button>
                          </div>
                        </div>

                        {localProgress[a.id] === 100 && (
                          <div className="mt-4 p-4 rounded animate-fade-in" style={{ border: '1px solid var(--primary-color)', background: 'rgba(99, 102, 241, 0.05)' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>🚀 Final Milestone: Submit Project URL</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Documentation or Demo URL (e.g. GitHub)" 
                                value={localUrls[a.id] || ''}
                                onChange={(e) => setLocalUrls({...localUrls, [a.id]: e.target.value})}
                                style={{ marginBottom: 0, padding: '10px', flex: 1 }}
                              />
                              <button 
                                className="btn btn-primary" 
                                style={{ whiteSpace: 'nowrap', padding: '10px 20px', fontSize: '0.85rem' }}
                                onClick={() => handleStatusUpdate(a.id, localUrls[a.id])}
                              >
                                Send URL
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 grid flex gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                           <div className="p-2 rounded bg-dark" style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>INTERNAL MARKS</p>
                              <p style={{ fontSize: '1rem', fontWeight: 700 }}>{a.marks || '-'}</p>
                           </div>
                           <div className="p-2 rounded bg-dark" style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FEEDBACK</p>
                              <p style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.feedback || 'None'}</p>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {chatUser && (
        <Chat currentUser={user} otherUser={chatUser} projectId={selectedProjectId} onClose={() => setChatUser(null)} />
      )}

      {viewProject && (
        <div className="chat-overlay" style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '550px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="flex justify-between mb-4">
              <h3>Opportunity Details</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewProject(null)}>Close</button>
            </div>
            <div style={{ lineHeight: 1.6 }}>
              <h4 style={{ color: 'var(--primary-color)' }}>{viewProject.title}</h4>
              <p className="mb-2"><strong>Mentored By:</strong> {viewProject.industry_name}</p>
              <p className="mb-2"><strong>Duration:</strong> {viewProject.duration}</p>
              <div className="mb-4">
                <strong>Project Description:</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{viewProject.description}</p>
              </div>
              <p><strong>Required Proficiencies:</strong> {viewProject.skills_required}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .badge.selected { background: #10b98120; color: #10b981; border: 1px solid #10b98150; }
        .badge.applied { background: #94a3b820; color: #94a3b8; border: 1px solid #94a3b850; }
        .badge.faculty-approved { background: #6366f120; color: #6366f1; border: 1px solid #6366f150; }
      `}</style>
    </div>
  );
}
