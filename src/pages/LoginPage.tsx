import React, { useState } from 'react';
import { Button, Card, CardBody, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { useAuth } from '../contexts/AuthContext';
import { useMetaMask } from '../contexts/MetaMaskContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const { connect, account, isConnected } = useMetaMask();
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    roleToken: '',
  });

  const handleConnect = async () => {
    try {
      setLoading(true);
      await connect();
    } catch (error: any) {
      console.error('Connection failed:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      await login(account);
      navigate('/');
    } catch (error: any) {
      if (error.message === 'NEEDS_REGISTRATION') {
        onOpen();
      } else {
        console.error('Login failed:', error);
        alert('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      await register({
        address: account,
        ...registerData,
      });
      navigate('/');
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md card-shadow">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">TOEFL Verification</h1>
            <p className="text-gray-600">Connect your wallet to continue</p>
          </div>

          <div className="space-y-4">
            {!isConnected ? (
              <Button
                color="primary"
                size="lg"
                className="w-full"
                onPress={handleConnect}
                isLoading={loading}
              >
                🦊 Connect MetaMask
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">Wallet Connected</p>
                  <p className="text-xs text-green-600 mt-1">{account}</p>
                </div>
                
                <Button
                  color="primary"
                  size="lg"
                  className="w-full"
                  onPress={handleLogin}
                  isLoading={loading}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Register Account
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-gray-600 mb-4">
                  This wallet address is not registered. Please complete your registration.
                </p>
                
                <Input
                  autoFocus
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={registerData.fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                />
                
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  value={registerData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                />
                
                <Input
                  label="Admin Token (Optional)"
                  placeholder="Enter admin token if you're an admin"
                  type="password"
                  value={registerData.roleToken}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData(prev => ({ ...prev, roleToken: e.target.value }))}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleRegister}
                  isLoading={loading}
                  isDisabled={!registerData.fullName || !registerData.email}
                >
                  Register
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default LoginPage;