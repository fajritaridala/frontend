import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
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
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        isBordered 
        className="bg-white shadow-sm"
        classNames={{
          wrapper: "px-4 sm:px-6 lg:px-8",
        }}
      >
        <NavbarBrand>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TOEFL Verification</span>
          </div>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={isActive('/')}>
            <Button
              variant={isActive('/') ? 'solid' : 'light'}
              color="primary"
              onPress={() => navigate('/')}
            >
              🏠 Dashboard
            </Button>
          </NavbarItem>
          <NavbarItem isActive={isActive('/participants')}>
            <Button
              variant={isActive('/participants') ? 'solid' : 'light'}
              color="primary"
              onPress={() => navigate('/participants')}
            >
              👥 Participants
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={user?.fullName}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user?.email}</p>
              </DropdownItem>
              <DropdownItem key="account">
                <div>
                  <p className="font-medium">👤 Account</p>
                  <p className="text-xs text-gray-500">{account?.slice(0, 8)}...{account?.slice(-6)}</p>
                </div>
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger" 
                onPress={handleLogout}
              >
                🚪 Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;