import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Input, 
  Divider,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner
} from '@heroui/react';
import api from '../utils/api';
import { TOEFLRegistration, ScoreInput } from '../types';
import { generateCertificatePDF } from '../utils/pdfGenerator';
import { generateQRCode } from '../utils/qrGenerator';
import { blockchainService } from '../utils/blockchain';

const InputScores: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  const [participant, setParticipant] = useState<TOEFLRegistration | null>(null);
  const [scores, setScores] = useState<ScoreInput>({
    listening: 0,
    swe: 0,
    reading: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [hash, setHash] = useState<string>('');
  const [certificateUrl, setCertificateUrl] = useState<string>('');

  const processSteps = [
    'Input scores validation',
    'Generate hash and save to database', 
    'Send hash to blockchain',
    'Generate QR code',
    'Create PDF certificate',
    'Upload to IPFS',
    'Complete!'
  ];

  useEffect(() => {
    if (address) {
      fetchParticipant();
    }
  }, [address]);

  const fetchParticipant = async () => {
    try {
      // Since we don't have a single participant endpoint, we'll get from list
      const response = await api.get('/toefls?limit=100&page=1');
      const found = response.data.data.find((p: TOEFLRegistration) => p.address === address);
      
      if (found) {
        setParticipant(found);
      } else {
        alert('Participant not found');
        navigate('/participants');
      }
    } catch (error) {
      console.error('Error fetching participant:', error);
      alert('Error fetching participant data');
      navigate('/participants');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (field: keyof ScoreInput, value: string) => {
    const numValue = parseInt(value) || 0;
    setScores(prev => ({
      ...prev,
      [field]: Math.max(0, Math.min(677, numValue)) // TOEFL score range
    }));
  };

  const getTotalScore = () => {
    return scores.listening + scores.swe + scores.reading;
  };

  const handleSubmit = async () => {
    if (!participant || !address) return;
    
    setSubmitting(true);
    setProcessStep(0);
    onOpen();

    try {
      // Step 1: Input scores validation
      setProcessStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Send scores to backend and get hash
      setProcessStep(2);
      const response = await api.patch(`/toefls/${address}/input`, scores);
      const { hash: generatedHash, peserta } = response.data.data;
      setHash(generatedHash);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Send hash to blockchain
      setProcessStep(3);
      await blockchainService.sendHashToContract(generatedHash, peserta);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Generate QR code
      setProcessStep(4);
      const qrCodeDataUrl = await generateQRCode(generatedHash);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 5: Create PDF certificate
      setProcessStep(5);
      const pdfBlob = await generateCertificatePDF({
        ...peserta,
        qrCode: qrCodeDataUrl,
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 6: Upload to IPFS
      setProcessStep(6);
      const formData = new FormData();
      formData.append('file', pdfBlob, `certificate-${participant.nim}.pdf`);
      
      const uploadResponse = await api.patch(`/toefls/${address}/upload-certificate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setCertificateUrl(uploadResponse.data.data.url);
      
      // Step 7: Complete
      setProcessStep(7);
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error('Error in input process:', error);
      alert('Error processing scores. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (processStep === 7) {
      navigate('/participants');
    }
    onOpenChange();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Participant Not Found</h1>
        <Button color="primary" onPress={() => navigate('/participants')}>
          Back to Participants
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="light"
          onPress={() => navigate('/participants')}
        >
          ← Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Input Scores</h1>
          <p className="text-gray-600">Input TOEFL scores for {participant.fullName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participant Info */}
        <div className="lg:col-span-1">
          <Card className="card-shadow">
            <CardHeader>
              <h2 className="text-xl font-semibold">Participant Information</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Full Name</p>
                <p className="font-semibold">{participant.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm">{participant.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">NIM</p>
                <p className="font-mono text-sm">{participant.nim}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Major</p>
                <p className="text-sm">{participant.major}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Session</p>
                <p className="text-sm">{participant.sessionTest}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Wallet Address</p>
                <p className="text-xs font-mono break-all">{participant.address}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Score Input */}
        <div className="lg:col-span-2">
          <Card className="card-shadow">
            <CardHeader>
              <h2 className="text-xl font-semibold">TOEFL Scores</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="Listening"
                  placeholder="0"
                  min="0"
                  max="677"
                  value={scores.listening.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange('listening', e.target.value)}
                  description="Score range: 0-677"
                />
                <Input
                  type="number"
                  label="Structure & Written Expression"
                  placeholder="0"
                  min="0"
                  max="677"
                  value={scores.swe.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange('swe', e.target.value)}
                  description="Score range: 0-677"
                />
                <Input
                  type="number"
                  label="Reading"
                  placeholder="0"
                  min="0"
                  max="677"
                  value={scores.reading.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange('reading', e.target.value)}
                  description="Score range: 0-677"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-900">Total Score:</span>
                  <span className="text-2xl font-bold text-blue-900">{getTotalScore()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => navigate('/participants')}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isDisabled={getTotalScore() === 0}
                  isLoading={submitting}
                >
                  💾 Submit Scores
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Process Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        isDismissable={false}
        hideCloseButton={processStep < 7}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Processing Scores
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Progress 
                    value={(processStep / (processSteps.length - 1)) * 100} 
                    color="primary"
                    size="md"
                  />
                  
                  <div className="space-y-2">
                    {processSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          index < processStep ? 'bg-green-500 text-white' :
                          index === processStep ? 'bg-blue-500 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {index < processStep ? '✓' : index + 1}
                        </div>
                        <span className={`text-sm ${
                          index <= processStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>

                  {processStep === 7 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium mb-2">Success!</p>
                      <p className="text-sm text-green-700 mb-3">
                        Scores have been successfully processed and certificate has been generated.
                      </p>
                      {certificateUrl && (
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          onPress={() => window.open(certificateUrl, '_blank')}
                        >
                          📥 Download Certificate
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </ModalBody>
              {processStep === 7 && (
                <ModalFooter>
                  <Button color="primary" onPress={handleClose}>
                    Close
                  </Button>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default InputScores;