import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Divider, Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { TOEFLRegistration } from '../types';

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
      color: 'primary',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Completed Tests',
      value: stats.completedTests,
      icon: '✅',
      color: 'success',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Pending Tests',
      value: stats.pendingTests,
      icon: '⏰',
      color: 'warning',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Certificates Issued',
      value: stats.certificatesIssued,
      icon: '📄',
      color: 'secondary',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage TOEFL participants and certificates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="card-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Recent Participants */}
      <Card className="card-shadow">
        <CardHeader className="flex justify-between items-center px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Participants</h2>
            <p className="text-sm text-gray-600">Latest TOEFL test registrations</p>
          </div>
          <Button
            color="primary"
            variant="flat"
            onPress={() => navigate('/participants')}
          >
            View All →
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : recentParticipants.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No participants found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentParticipants.map((participant, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{participant.fullName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          participant.status === 'selesai' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {participant.status === 'selesai' ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <p><span className="font-medium">NIM:</span> {participant.nim}</p>
                        <p><span className="font-medium">Major:</span> {participant.major}</p>
                        <p><span className="font-medium">Session:</span> {participant.sessionTest}</p>
                      </div>
                    </div>
                    {participant.status === 'belum selesai' && (
                      <Button
                        color="primary"
                        size="sm"
                        onPress={() => navigate(`/input-scores/${participant.address}`)}
                      >
                        Input Scores
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDashboard;