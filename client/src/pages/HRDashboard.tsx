import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SimpleConnectionIndicator, SimpleConnectionGuard } from '../components/SimpleConnectionStatus';
// @ts-ignore JS helper
import { getInterviews, getApplicantsByInterview } from '../api/helper.js';

interface DashboardStats {
  totalInterviews: number;
  publishedInterviews: number;
  draftInterviews: number;
  totalApplicants: number;
  completedInterviews: number;
  pendingInterviews: number;
}

interface InterviewWithStats {
  id: number;
  title: string;
  jobRole: string;
  status: string;
  createdAt: string;
  applicantCount: number;
  completedCount: number;
}

export default function HRDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalInterviews: 0,
    publishedInterviews: 0,
    draftInterviews: 0,
    totalApplicants: 0,
    completedInterviews: 0,
    pendingInterviews: 0
  });
  const [recentInterviews, setRecentInterviews] = useState<InterviewWithStats[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);
    
    try {
      const interviews = await getInterviews();
      
      // Calculate stats
      const totalInterviews = interviews.length;
      const publishedInterviews = interviews.filter((iv: any) => iv.status === 'PUBLISHED').length;
      const draftInterviews = interviews.filter((iv: any) => iv.status === 'DRAFT').length;
      
      // Get applicant counts for each interview
      const interviewsWithStats: InterviewWithStats[] = [];
      let totalApplicants = 0;
      let completedInterviews = 0;
      
      for (const interview of interviews) {
        try {
          const applicants = await getApplicantsByInterview(interview.id);
          const applicantCount = applicants.length;
          const completedCount = applicants.filter((app: any) => 
            app.interviewStatus === 'COMPLETED' || app.status === 'COMPLETED'
          ).length;
          
          totalApplicants += applicantCount;
          if (completedCount > 0) completedInterviews++;
          
          interviewsWithStats.push({
            id: interview.id,
            title: interview.title,
            jobRole: interview.jobRole || interview.job_role || 'N/A',
            status: interview.status,
            createdAt: interview.createdAt || interview.created_at,
            applicantCount,
            completedCount
          });
        } catch (err) {
          console.warn(`Failed to load applicants for interview ${interview.id}:`, err);
          interviewsWithStats.push({
            id: interview.id,
            title: interview.title,
            jobRole: interview.jobRole || interview.job_role || 'N/A',
            status: interview.status,
            createdAt: interview.createdAt || interview.created_at,
            applicantCount: 0,
            completedCount: 0
          });
        }
      }
      
      setStats({
        totalInterviews,
        publishedInterviews,
        draftInterviews,
        totalApplicants,
        completedInterviews,
        pendingInterviews: totalInterviews - completedInterviews
      });
      
      // Sort by creation date (newest first) and take first 5
      setRecentInterviews(
        interviewsWithStats
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      );
      
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: number;
    icon: string;
    color: string;
  }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
            {title}
          </p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: color }}>
            {value}
          </p>
        </div>
        <div style={{ fontSize: '32px' }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const InterviewCard = ({ interview }: { interview: InterviewWithStats }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid #e5e7eb',
      transition: 'box-shadow 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
          {interview.title}
        </h3>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: interview.status === 'PUBLISHED' ? '#dcfce7' : '#fef3c7',
          color: interview.status === 'PUBLISHED' ? '#166534' : '#92400e'
        }}>
          {interview.status}
        </span>
      </div>
      
      <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>
        {interview.jobRole}
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
        <span>👥 {interview.applicantCount} applicants</span>
        <span>✅ {interview.completedCount} completed</span>
      </div>
      
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
        Created: {new Date(interview.createdAt).toLocaleDateString()}
      </div>
    </div>
  );

  return (
    <SimpleConnectionGuard>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              HR Dashboard
            </h1>
            <SimpleConnectionIndicator />
          </div>
          <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>
            Welcome back, {user?.firstName || user?.username}! Here's your hiring overview.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            Error: {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <StatCard
                title="Total Interviews"
                value={stats.totalInterviews}
                icon="🎯"
                color="#3b82f6"
              />
              <StatCard
                title="Published Interviews"
                value={stats.publishedInterviews}
                icon="📢"
                color="#10b981"
              />
              <StatCard
                title="Total Applicants"
                value={stats.totalApplicants}
                icon="👥"
                color="#f59e0b"
              />
              <StatCard
                title="Completed Interviews"
                value={stats.completedInterviews}
                icon="✅"
                color="#8b5cf6"
              />
            </div>

            {/* Recent Interviews */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                  Recent Interviews
                </h2>
                <button
                  onClick={() => window.location.href = '/interviews'}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  View All
                </button>
              </div>
              
              {recentInterviews.length === 0 ? (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '40px',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1f2937' }}>
                    No interviews yet
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                    Create your first interview to get started
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px'
                }}>
                  {recentInterviews.map((interview) => (
                    <InterviewCard key={interview.id} interview={interview} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SimpleConnectionGuard>
  );
}
