import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { TOEFLRegistration } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { CardWithHeader } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalParticipants: 0,
    completedTests: 0,
    pendingTests: 0,
    certificatesIssued: 0,
  });
  const [recentParticipants, setRecentParticipants] = useState<TOEFLRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/toefls?limit=5&page=1');
      const participants = response.data.data;
      
      setRecentParticipants(participants);
      
      // Calculate stats
      const total = response.data.pagination.total;
      const completed = participants.filter((p: TOEFLRegistration) => p.status === 'selesai').length;
      const pending = participants.filter((p: TOEFLRegistration) => p.status === 'belum selesai').length;
      
      setStats({
        totalParticipants: total,
        completedTests: completed,
        pendingTests: pending,
        certificatesIssued: completed, // Assuming completed tests have certificates
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Participants',
      value: stats.totalParticipants,
      icon: '👥',
      color: 'blue' as const,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Completed Tests',
      value: stats.completedTests,
      icon: '✅',
      color: 'green' as const,
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Pending Tests',
      value: stats.pendingTests,
      icon: '⏰',
      color: 'yellow' as const,
      trend: { value: 3, isPositive: false }
    },
    {
      title: 'Certificates Issued',
      value: stats.certificatesIssued,
      icon: '📄',
      color: 'purple' as const,
      trend: { value: 15, isPositive: true }
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage TOEFL participants and certificates"
        breadcrumbs={[
          { label: 'Home' },
          { label: 'Dashboard' }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Recent Participants */}
      <CardWithHeader
        title="Recent Participants"
        subtitle="Latest TOEFL test registrations"
        headerAction={
          <Button
            color="primary"
            variant="flat"
            size="sm"
            onPress={() => navigate('/participants')}
          >
            View All →
          </Button>
        }
      >
        {loading ? (
          <LoadingSpinner text="Loading participants..." />
        ) : recentParticipants.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No participants yet"
            description="When participants register for TOEFL tests, they will appear here."
            action={{
              label: "View All Participants",
              onClick: () => navigate('/participants')
            }}
          />
        ) : (
          <div className="space-y-4">
            {recentParticipants.map((participant, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {participant.fullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{participant.fullName}</h3>
                        <p className="text-sm text-gray-600">{participant.email}</p>
                      </div>
                      <StatusBadge 
                        status={participant.status === 'selesai' ? 'completed' : 'pending'}
                        size="sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">🎓 NIM:</span>
                        <span className="font-mono">{participant.nim}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📚 Major:</span>
                        <span>{participant.major}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📅 Session:</span>
                        <span>{participant.sessionTest}</span>
                      </div>
                    </div>
                  </div>
                  {participant.status === 'belum selesai' && (
                    <Button
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={() => navigate(`/input-scores/${participant.address}`)}
                    >
                      ✏️ Input Scores
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardWithHeader>
    </div>
  );
};

export default AdminDashboard;