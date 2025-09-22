import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Button,
  Input,
  Pagination,
  Spinner
} from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { TOEFLRegistration } from '../types';

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Participants</h1>
        <p className="text-gray-600">Manage TOEFL test participants</p>
      </div>

      <Card className="card-shadow">
        <CardHeader className="px-6 py-4">
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Participants</h2>
              <p className="text-sm text-gray-600">{total} total participants</p>
            </div>
            <div className="w-80">
              <Input
                placeholder="Search by name, NIM, or major..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                isClearable
                onClear={() => handleSearch('')}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" color="primary" />
            </div>
          ) : (
            <>
              <Table aria-label="Participants table">
                <TableHeader>
                  <TableColumn>PARTICIPANT</TableColumn>
                  <TableColumn>NIM</TableColumn>
                  <TableColumn>MAJOR</TableColumn>
                  <TableColumn>SESSION</TableColumn>
                  <TableColumn>TEST DATE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No participants found">
                  {participants.map((participant) => (
                    <TableRow key={participant.address}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{participant.fullName}</p>
                          <p className="text-sm text-gray-600">{participant.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{participant.nim}</span>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          participant.status === 'selesai' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getStatusText(participant.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => {
                              // Navigate to participant details
                              console.log('View participant:', participant.address);
                            }}
                          >
                            👁️ View
                          </Button>
                          {participant.status === 'belum selesai' && (
                            <Button
                              size="sm"
                              color="primary"
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
              
              {totalPages > 1 && (
                <div className="flex justify-center py-4">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={setCurrentPage}
                    color="primary"
                    showControls
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ParticipantList;