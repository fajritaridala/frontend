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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/90 relative z-10">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-3xl">T</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">TOEFL Verification</h1>
            <p className="text-gray-600 text-lg">Connect your wallet to continue</p>
          </div>

          <div className="space-y-4">
            {!isConnected ? (
              <div className="space-y-4">
                <Button
                  color="primary"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onPress={handleConnect}
                  isLoading={loading}
                >
                  <span className="text-xl mr-2">🦊</span>
                  Connect MetaMask
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Don't have MetaMask?</p>
                  <Button
                    variant="light"
                    size="sm"
                    onPress={() => window.open('https://metamask.io/download/', '_blank')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Download MetaMask →
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 text-lg">✅</span>
                    <p className="text-sm text-green-700 font-semibold">Wallet Connected</p>
                  </div>
                  <p className="text-xs text-green-600 font-mono bg-white px-2 py-1 rounded border">
                    {account?.slice(0, 8)}...{account?.slice(-6)}
                  </p>
                </div>
                
                <Button
                  color="primary"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onPress={handleLogin}
                  isLoading={loading}
                >
                  <span className="text-xl mr-2">🚀</span>
                  Sign In
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Secure blockchain-based certificate verification
            </p>
          </div>
        </CardBody>
      </Card>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        placement="top-center"
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900/50 to-zinc-900/10 backdrop-opacity-20"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Register Account
                </div>
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-gray-600 mb-4">
                  This wallet address is not registered. Please complete your registration.
                </p>
                
                <Input
                  autoFocus
                  label="👤 Full Name"
                  placeholder="Enter your full name"
                  value={registerData.fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                  classNames={{
                    inputWrapper: "border-2 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
                
                <Input
                  label="📧 Email"
                  placeholder="Enter your email"
                  type="email"
                  value={registerData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                  classNames={{
                    inputWrapper: "border-2 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
                
                <Input
                  label="🔑 Admin Token (Optional)"
                  placeholder="Enter admin token if you're an admin"
                  type="password"
                  value={registerData.roleToken}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData(prev => ({ ...prev, roleToken: e.target.value }))}
                  classNames={{
                    inputWrapper: "border-2 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
                  onPress={handleRegister}
                  isLoading={loading}
                  isDisabled={!registerData.fullName || !registerData.email}
                >
                  ✅ Register
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