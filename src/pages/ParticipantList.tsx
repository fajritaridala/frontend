import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Button,
  Input,
  Pagination,
} from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { TOEFLRegistration } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { CardWithHeader } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';

const ParticipantList: React.FC = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<TOEFLRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchParticipants();
  }, [currentPage, searchTerm]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get(`/toefls?${params}`);
      setParticipants(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selesai':
        return 'success';
      case 'belum selesai':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'selesai':
        return 'Completed';
      case 'belum selesai':
        return 'Pending';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Participants"
        subtitle="Manage TOEFL test participants"
        breadcrumbs={[
          { label: 'Home' },
          { label: 'Participants' }
        ]}
      />

      <CardWithHeader
        title="All Participants"
        subtitle={`${total} total participants`}
        headerAction={
          <div className="w-80">
            <Input
              placeholder="Search by name, NIM, or major..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              isClearable
              onClear={() => handleSearch('')}
              startContent={<span className="text-gray-400">🔍</span>}
            />
          </div>
        }
      >
        {loading ? (
          <LoadingSpinner text="Loading participants..." />
        ) : participants.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No participants found"
            description={searchTerm ? "No participants match your search criteria." : "No participants have registered yet."}
            action={searchTerm ? {
              label: "Clear Search",
              onClick: () => handleSearch('')
            } : undefined}
          />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table 
                aria-label="Participants table"
                classNames={{
                  wrapper: "shadow-none",
                  th: "bg-gray-50 text-gray-700 font-semibold",
                  td: "py-4"
                }}
              >
                <TableHeader>
                  <TableColumn>PARTICIPANT</TableColumn>
                  <TableColumn>NIM</TableColumn>
                  <TableColumn>MAJOR</TableColumn>
                  <TableColumn>SESSION</TableColumn>
                  <TableColumn>TEST DATE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.address} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {participant.fullName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{participant.fullName}</p>
                            <p className="text-sm text-gray-600">{participant.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {participant.nim}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{participant.major}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{participant.sessionTest}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(participant.testDate.toString())}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={participant.status === 'selesai' ? 'completed' : 'pending'}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => {
                              console.log('View participant:', participant.address);
                            }}
                          >
                            👁️
                          </Button>
                          {participant.status === 'belum selesai' && (
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onPress={() => navigate(`/input-scores/${participant.address}`)}
                            >
                              ✏️ Input Scores
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center pt-4">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  color="primary"
                  showControls
                  classNames={{
                    wrapper: "gap-0 overflow-visible h-8",
                    item: "w-8 h-8 text-small rounded-none bg-transparent",
                    cursor: "bg-gradient-to-b shadow-lg from-blue-500 to-blue-600 text-white font-bold"
                  }}
                />
              </div>
            )}
          </div>
        )}
      </CardWithHeader>
    </div>
  );
};

export default ParticipantList;