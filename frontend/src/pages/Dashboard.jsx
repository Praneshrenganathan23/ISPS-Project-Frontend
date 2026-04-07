import { useEffect, useState } from 'react';
import StudentDashboard from './StudentDashboard';
import IndustryDashboard from './IndustryDashboard';
import FacultyDashboard from './FacultyDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard({ user }) {
  const renderDashboard = () => {
    switch (user.role) {
      case 'student': return <StudentDashboard user={user} />;
      case 'industry': return <IndustryDashboard user={user} />;
      case 'faculty': return <FacultyDashboard user={user} />;
      case 'admin': return <AdminDashboard user={user} />;
      default: return <div>Unauthorized Role</div>;
    }
  };

  return (
    <div className="dashboard-wrapper animate-fade-in" style={{ padding: '2rem' }}>
      {renderDashboard()}
    </div>
  );
}
