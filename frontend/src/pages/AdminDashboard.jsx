import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({ users: [], projects: [], applications: [] });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const usersRes = await api.get('/auth/me'); // Just a placeholder for now, admin needs a real user management endpoint
      const projectsRes = await api.get('/projects');
      const appsRes = await api.get('/applications');
      setStats({ users: [], projects: projectsRes.data, applications: appsRes.data });
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="mb-4">Admin Control Center</h1>
      <div className="flex gap-4 mb-4">
        <div className="glass-panel" style={{ flex: 1, textAlign: 'center' }}>
          <h2>{stats.projects.length}</h2>
          <p className="text-muted">Total Projects</p>
        </div>
        <div className="glass-panel" style={{ flex: 1, textAlign: 'center' }}>
          <h2>{stats.applications.length}</h2>
          <p className="text-muted">Total Applications</p>
        </div>
        <div className="glass-panel" style={{ flex: 1, textAlign: 'center' }}>
          <h2>{stats.projects.filter(p => p.status === 'completed').length}</h2>
          <p className="text-muted">Completed Projects</p>
        </div>
      </div>

      <div className="glass-panel">
        <h3>System Overview</h3>
        <table className="mt-4" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Project Title</th>
              <th style={{ padding: '1rem' }}>Industry</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Applications</th>
            </tr>
          </thead>
          <tbody>
            {stats.projects.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>{p.title}</td>
                <td style={{ padding: '1rem' }}>{p.industry_name}</td>
                <td style={{ padding: '1rem' }}><span className={`badge ${p.status}`}>{p.status}</span></td>
                <td style={{ padding: '1rem' }}>{stats.applications.filter(a => a.project_id === p.id).length} applicants</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
