import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Badge } from '@heroui/react';
import { useAuth } from '../contexts/AuthContext';
import { useMetaMask } from '../contexts/MetaMaskContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { account, disconnect } = useMetaMask();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    disconnect();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar 
        isBordered 
        className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50"
        classNames={{
          wrapper: "px-4 sm:px-6 lg:px-8",
        }}
      >
        <NavbarBrand>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">TOEFL Verification</span>
              <div className="text-xs text-gray-500">Blockchain Certificate System</div>
            </div>
          </div>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={isActive('/')}>
            <Button
              variant={isActive('/') ? 'solid' : 'ghost'}
              color="primary"
              className={isActive('/') ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg' : 'hover:bg-blue-50'}
              onPress={() => navigate('/')}
            >
              <span className="text-lg mr-1">🏠</span>
              Dashboard
            </Button>
          </NavbarItem>
          <NavbarItem isActive={isActive('/participants')}>
            <Button
              variant={isActive('/participants') ? 'solid' : 'ghost'}
              color="primary"
              className={isActive('/participants') ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg' : 'hover:bg-blue-50'}
              onPress={() => navigate('/participants')}
            >
              <span className="text-lg mr-1">👥</span>
              Participants
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end">
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <Badge 
              content="" 
              color="success" 
              shape="circle" 
              placement="bottom-right"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">🔗</span>
              </div>
            </Badge>
            
            <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform hover:scale-110"
                color="primary"
                name={user?.fullName}
                size="sm"
                classNames={{
                  base: "bg-gradient-to-br from-blue-500 to-purple-600"
                }}
              />
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Profile Actions" 
              variant="flat"
              classNames={{
                base: "bg-white/90 backdrop-blur-md shadow-xl border border-gray-200/50"
              }}
            >
              <DropdownItem key="profile" className="h-16 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.fullName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.fullName}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </DropdownItem>
              <DropdownItem key="account" className="gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🔗</span>
                    <p className="font-medium text-gray-900">Wallet</p>
                  </div>
                  <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    {account?.slice(0, 8)}...{account?.slice(-6)}
                  </p>
                </div>
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger" 
                onPress={handleLogout}
                className="gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚪</span>
                  <span className="font-medium">Log Out</span>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          </div>
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;