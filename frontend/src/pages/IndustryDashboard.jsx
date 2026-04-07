import { useState, useEffect } from 'react';
import api from '../api';
import Chat from '../components/Chat';

export default function IndustryDashboard({ user }) {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newProject, setNewProject] = useState({ title: '', description: '', duration: '', skills_required: '' });
  const [chatUser, setChatUser] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [progressLogs, setProgressLogs] = useState({}); // { appId: [logs] }
  const [unreadCounts, setUnreadCounts] = useState({}); // { senderId: count }

  useEffect(() => {
    fetchIndustryProjects();
    fetchIndustryApplications();
    fetchUnreadCounts();
    const interval = setInterval(() => {
      fetchUnreadCounts();
      fetchIndustryApplications();
      fetchIndustryProjects();
    }, 5000); // Poll every 5s
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

  const fetchIndustryProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchIndustryApplications = async () => {
    try {
      const res = await api.get('/applications');
      const apps = res.data;
      console.log('Industry fetched apps:', apps);
      setApplications(apps);
      
      // Fetch progress for selected apps
      apps.filter(a => a.status === 'selected').forEach(a => {
        fetchProgress(a.id);
      });
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const fetchProgress = async (appId) => {
    try {
      const res = await api.get(`/applications/${appId}/progress`);
      setProgressLogs(prev => ({ ...prev, [appId]: res.data }));
    } catch (err) {
      console.error('Failed to fetch progress');
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      alert('Project Proposal Submitted!');
      setNewProject({ title: '', description: '', duration: '', skills_required: '' });
      fetchIndustryProjects();
    } catch (err) {
      alert('Failed to post project');
    }
  };

  const selectStudent = async (appId) => {
    try {
      await api.put(`/applications/${appId}/select`);
      alert('Student Selected!');
      fetchIndustryApplications();
      fetchIndustryProjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to select student');
    }
  };

  const evaluateStudent = async (appId, marks, feedback) => {
     try {
       await api.post(`/applications/${appId}/evaluate`, { marks, feedback });
       alert('Evaluation submitted!');
       fetchIndustryApplications();
     } catch (err) {
       alert('Failed to evaluate student');
     }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This will remove it for students and faculty as well.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      alert('Project deleted successfully');
      fetchIndustryProjects();
      fetchIndustryApplications();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  return (
    <div className="industry-dashboard">
      <h1 className="mb-4">Industry Portal</h1>
      <div className="flex gap-4">
        <div style={{ flex: 1 }}>
          <div className="glass-panel">
            <h3>Post Project Opportunity</h3>
            <form onSubmit={handleProjectSubmit} className="mt-2 text-muted">
              <label>Title</label>
              <input type="text" value={newProject.title} required onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="AI Based Solution" />
              <label>Description</label>
              <textarea value={newProject.description} required onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Project requirements and scope..." />
              <label>Duration</label>
              <input type="text" value={newProject.duration} required onChange={e => setNewProject({...newProject, duration: e.target.value})} placeholder="3 Months" />
              <label>Required Skills</label>
              <input type="text" value={newProject.skills_required} required onChange={e => setNewProject({...newProject, skills_required: e.target.value})} placeholder="React, Node.js" />
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Proposal</button>
            </form>
          </div>
        </div>

        <div style={{ flex: 1.5 }}>
          <div className="glass-panel">
            <h3>Management & Progress Tracking</h3>
            <div className="mt-2">
              {projects.length === 0 && <p className="text-muted">No projects posted yet.</p>}
              {projects.map(p => (
                <div key={p.id} className="project-card glass-panel mb-4" style={{ padding: '1rem' }}>
                   <div className="flex justify-between items-center">
                     <h4>{p.title} <span className={`badge ${p.status}`}>{p.status}</span></h4>
                     <button className="btn btn-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={() => deleteProject(p.id)}>Delete</button>
                   </div>
                   <p className="text-muted">{p.duration} | {p.skills_required}</p>
                   
                   <div className="mt-4 pt-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
                     <h5>Students & Workflow</h5>
                     {applications.filter(a => (a.project_id?._id || a.project_id) === p.id).length === 0 && <p className="text-muted" style={{ fontSize: '0.8rem' }}>No applicants yet.</p>}
                     {applications.filter(a => (a.project_id?._id || a.project_id) === p.id).map(a => (
                       <div key={a.id} className="bg-dark p-3 mt-4 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <p><strong>{a.student_name}</strong> ({a.student_email})</p>
                              <span className={`badge ${a.status.replace('_', '-')}`}>{a.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex gap-2">
                              <div style={{ position: 'relative' }}>
                                 <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => {
                                   const sid = a.student_id?._id || a.student_id;
                                   setChatUser({ id: sid, name: a.student_name });
                                   setSelectedProjectId(p.id);
                                   setUnreadCounts(prev => { 
                                     const next = { ...prev }; 
                                     delete next[`${sid}_${p.id}`]; 
                                     return next; 
                                   });
                                 }}>Chat</button>
                                 {unreadCounts[`${a.student_id?._id || a.student_id}_${p.id}`] > 0 && 
                                   <span className="notification-badge">{unreadCounts[`${a.student_id?._id || a.student_id}_${p.id}`]}</span>}
                              </div>
                              
                              {a.status === 'faculty_approved' && (
                                <button className="btn btn-primary" onClick={() => selectStudent(a.id)} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Assign Project</button>
                              )}
                              
                              {a.status === 'selected' && (
                                <button className="btn btn-primary" onClick={() => {
                                  const marks = prompt('Enter marks (1-100):');
                                  const feedback = prompt('Enter feedback:');
                                  if (marks && feedback) evaluateStudent(a.id, marks, feedback);
                                }} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Final Evaluation</button>
                              )}
                            </div>
                          </div>

                          {a.status === 'selected' && (
                            <div className="mt-3 bg-dark p-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                               <div className="flex justify-between items-center mb-1">
                                 <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project Progress:</p>
                                 <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>{a.progress_percent || 0}%</span>
                               </div>
                               <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                 <div style={{ width: `${a.progress_percent || 0}%`, height: '100%', background: 'linear-gradient(to right, #818cf8, #c084fc)', transition: 'width 0.3s ease' }}></div>
                               </div>

                               {a.project_url && (
                                 <p className="mt-3" style={{ fontSize: '0.85rem' }}>
                                   <strong>Project URL:</strong> <a href={a.project_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{a.project_url}</a>
                                 </p>
                               )}

                               <div className="mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>History Updates:</p>
                                 <div style={{ maxHeight: '60px', overflowY: 'auto' }}>
                                   {(progressLogs[a.id] || []).map(log => (
                                     <p key={log.id} style={{ fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '3px 0' }}>
                                       {log.update_text}
                                     </p>
                                   ))}
                                 </div>
                               </div>
                            </div>
                          )}
                       </div>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {chatUser && (
        <Chat 
          currentUser={user} 
          otherUser={chatUser} 
          projectId={selectedProjectId} 
          onClose={() => setChatUser(null)} 
        />
      )}
    </div>
  );
}
