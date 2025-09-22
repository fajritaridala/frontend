import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Input, 
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react';
import api from '../utils/api';
import { TOEFLRegistration, ScoreInput } from '../types';
import { generateCertificatePDF } from '../utils/pdfGenerator';
import { generateQRCode } from '../utils/qrGenerator';
import { blockchainService } from '../utils/blockchain';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardWithHeader } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBadge } from '../components/ui/StatusBadge';

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
      <LoadingSpinner text="Loading participant data..." fullScreen />
    );
  }

  if (!participant) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Participant Not Found"
          subtitle="The requested participant could not be found"
        />
        <Card className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Participant Not Found</h2>
          <p className="text-gray-600 mb-6">The participant you're looking for doesn't exist or has been removed.</p>
          <Button color="primary" onPress={() => navigate('/participants')}>
            ← Back to Participants
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Input Scores"
        subtitle={`Input TOEFL scores for ${participant.fullName}`}
        breadcrumbs={[
          { label: 'Home' },
          { label: 'Participants' },
          { label: 'Input Scores' }
        ]}
        action={
          <Button
            variant="light"
            onPress={() => navigate('/participants')}
          >
            ← Back to Participants
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participant Info */}
        <div className="lg:col-span-1">
          <CardWithHeader title="Participant Information">
            <div className="space-y-6">
              {/* Avatar and basic info */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">
                    {participant.fullName.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{participant.fullName}</h3>
                <p className="text-sm text-gray-600">{participant.email}</p>
                <div className="mt-2">
                  <StatusBadge 
                    status={participant.status === 'selesai' ? 'completed' : 'pending'}
                  />
                </div>
              </div>
              
              {/* Details */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎓</span>
                    <span className="text-sm font-medium text-gray-600">Student ID</span>
                  </div>
                  <p className="font-mono text-sm bg-white px-2 py-1 rounded border">
                    {participant.nim}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📚</span>
                    <span className="text-sm font-medium text-gray-600">Major</span>
                  </div>
                  <p className="text-sm">{participant.major}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📅</span>
                    <span className="text-sm font-medium text-gray-600">Test Session</span>
                  </div>
                  <p className="text-sm">{participant.sessionTest}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🔗</span>
                    <span className="text-sm font-medium text-gray-600">Wallet Address</span>
                  </div>
                  <p className="text-xs font-mono break-all bg-white px-2 py-1 rounded border">
                    {participant.address}
                  </p>
                </div>
              </div>
            </div>
          </CardWithHeader>
        </div>

        {/* Score Input */}
        <div className="lg:col-span-2">
          <CardWithHeader title="TOEFL Scores" subtitle="Enter the test scores for each section">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="🎧 Listening"
                  placeholder="0"
                  min="0"
                  max="677"
                  value={scores.listening.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange('listening', e.target.value)}
                  description="Score range: 0-677"
                  classNames={{
                    input: "text-center font-semibold",
                    inputWrapper: "border-2 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
                <Input
                  type="number"
                  label="✍️ Structure & Written Expression"
                  placeholder="0"
                  min="0"
                  max="677"
                  value={scores.swe.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange('swe', e.target.value)}
                  description="Score range: 0-677"
                  classNames={{
                    input: "text-center font-semibold",
                    inputWrapper: "border-2 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
                <Input
                  type="number"
                  label="📖 Reading"
                  placeholder="0"
                  min="0"
                  max="677"
                  value={scores.reading.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange('reading', e.target.value)}
                  description="Score range: 0-677"
                  classNames={{
                    input: "text-center font-semibold",
                    inputWrapper: "border-2 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
              </div>

              {/* Total Score Display */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Total TOEFL Score</p>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                    {getTotalScore()}
                  </div>
                  <div className="flex justify-center gap-4 text-sm text-gray-600">
                    <span>Listening: {scores.listening}</span>
                    <span>•</span>
                    <span>SWE: {scores.swe}</span>
                    <span>•</span>
                    <span>Reading: {scores.reading}</span>
                  </div>
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
                  size="lg"
                  onPress={handleSubmit}
                  isDisabled={getTotalScore() === 0}
                  isLoading={submitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
                >
                  💾 Submit Scores
                </Button>
              </div>
            </div>
          </CardWithHeader>
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
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Processing Scores
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Progress 
                    value={(processStep / (processSteps.length - 1)) * 100} 
                    color="primary"
                    size="md"
                    classNames={{
                      track: "drop-shadow-md border border-default",
                      indicator: "bg-gradient-to-r from-blue-500 to-purple-600",
                    }}
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
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">🎉</div>
                        <p className="text-green-800 font-bold text-lg">Success!</p>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Scores have been successfully processed and certificate has been generated.
                      </p>
                      {certificateUrl && (
                        <div className="text-center">
                          <Button
                            color="success"
                            variant="flat"
                            onPress={() => window.open(certificateUrl, '_blank')}
                            className="font-semibold"
                          >
                            📥 Download Certificate
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ModalBody>
              {processStep === 7 && (
                <ModalFooter>
                  <Button color="primary" onPress={handleClose}>
                    ✅ Complete
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