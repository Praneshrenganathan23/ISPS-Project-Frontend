import { useState, useEffect } from 'react';
import api from '../api';
import Chat from '../components/Chat';

export default function FacultyDashboard({ user }) {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [progressLogs, setProgressLogs] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({}); // { senderId: count }

  useEffect(() => {
    fetchProjects();
    fetchApplications();
    fetchUnreadCounts();
    const interval = setInterval(() => {
      fetchUnreadCounts();
      fetchApplications();
      fetchProjects();
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

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      const apps = res.data;
      console.log('Faculty fetched apps:', apps);
      setApplications(apps);
      
      apps.filter(a => a.status === 'selected').forEach(a => {
        fetchProgress(a.id);
      });
    } catch (err) {
      console.error('Error fetching applications');
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

  const approveApplication = async (appId) => {
    try {
      await api.put(`/applications/${appId}/faculty-approve`);
      alert('Application Approved for Industry selection!');
      fetchApplications();
    } catch (err) {
      alert('Failed to approve application');
    }
  };

  return (
    <div className="faculty-dashboard">
      <h1 className="mb-4">Faculty Portal</h1>
      <div className="flex gap-4">
        <div style={{ flex: 1 }}>
          <div className="glass-panel">
            <h3>Student Application Oversight</h3>
            <div className="mt-4">
              {applications.filter(a => a.status === 'applied').length === 0 && <p className="text-muted">No pending applications.</p>}
              {applications.filter(a => a.status === 'applied').map(a => (
                <div key={a.id} className="project-card glass-panel mb-4" style={{ padding: '1rem' }}>
                   <h4>{a.student_name}</h4>
                   <p className="text-muted">Applied for: {a.project_title}</p>
                   <div className="flex gap-2 mt-4">
                      <button className="btn btn-primary" onClick={() => approveApplication(a.id)}>Approve</button>
                        <div style={{ position: 'relative' }}>
                          <button className="btn btn-secondary" onClick={() => {
                            const sid = a.student_id?._id || a.student_id;
                            const pid = a.project_id?._id || a.project_id;
                            setChatUser({ id: sid, name: a.student_name });
                            setSelectedProjectId(pid);
                            setUnreadCounts(prev => { const next = { ...prev }; delete next[`${sid}_${pid}`]; return next; });
                          }}>Message Student</button>
                          {unreadCounts[`${a.student_id?._id || a.student_id}_${a.project_id?._id || a.project_id}`] > 0 && 
                            <span className="notification-badge">{unreadCounts[`${a.student_id?._id || a.student_id}_${a.project_id?._id || a.project_id}`]}</span>}
                        </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 2 }}>
          <div className="glass-panel">
            <h3>Monitoring Assigned & Approved Projects</h3>
            <div className="mt-4">
               {applications.filter(a => a.status === 'selected' || a.status === 'faculty_approved').length === 0 && <p className="text-muted">No active or approved projects currently.</p>}
               {applications.filter(a => a.status === 'selected' || a.status === 'faculty_approved').map(a => (
                 <div key={a.id} className="project-card glass-panel mb-4" style={{ padding: '1rem' }}>
                    <div className="flex justify-between items-center">
                       <h4>{a.project_title}</h4>
                       <span className={`badge ${a.status === 'selected' ? 'in-progress' : 'approved'}`}>
                         {a.status === 'selected' ? 'In Progress' : 'Awaiting Industry Selection'}
                       </span>
                    </div>
                    <p className="text-muted">Student: {a.student_name}</p>
                    
                    {a.status === 'selected' && (
                      <div className="mt-3 p-2 bg-dark rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
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
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                       <div style={{ position: 'relative' }}>
                        <button className="btn btn-secondary" onClick={() => {
                          const sid = a.student_id?._id || a.student_id;
                          const pid = a.project_id?._id || a.project_id;
                          setChatUser({ id: sid, name: a.student_name });
                          setSelectedProjectId(pid);
                          setUnreadCounts(prev => { const next = { ...prev }; delete next[`${sid}_${pid}`]; return next; });
                        }}>{a.status === 'selected' ? 'Guide Student' : 'Message Student'}</button>
                        {unreadCounts[`${a.student_id?._id || a.student_id}_${a.project_id?._id || a.project_id}`] > 0 && 
                          <span className="notification-badge">{unreadCounts[`${a.student_id?._id || a.student_id}_${a.project_id?._id || a.project_id}`]}</span>}
                      </div>
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
