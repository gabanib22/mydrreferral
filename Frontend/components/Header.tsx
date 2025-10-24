'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Dialog from './Dialog';
import NewConnection from './new-connection-request';
import NewReferral from './new-referral-request';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../contexts/UserContext';
import { 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  Plus, 
  Users, 
  UserPlus, 
  Heart, 
  Menu, 
  X,
  ChevronDown,
  Stethoscope,
  UserCheck,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';

const Header = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { user, isLoading: userLoading, fetchUserData } = useUser();
  const router = useRouter();
  const [popupVisible, setPopupVisible] = useState(false);
  const [isNewConPop, setIsNewConPop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isConnectionsDropdownOpen, setIsConnectionsDropdownOpen] = useState(false);
  const [isReferralsDropdownOpen, setIsReferralsDropdownOpen] = useState(false);
  const [isPatientsDropdownOpen, setIsPatientsDropdownOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('U');

  // User data is managed by UserContext, no need to fetch here

  // Get user initials for avatar
  useEffect(() => {
    if (isAuthenticated && user) {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      setUserInitials(`${firstName[0]}${lastName[0]}`.toUpperCase());
    } else if (isAuthenticated && userLoading) {
      setUserInitials('...');
    } else {
      setUserInitials('U');
    }
  }, [isAuthenticated, user, userLoading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-profile-dropdown]')) {
        setIsProfileDropdownOpen(false);
        setIsConnectionsDropdownOpen(false);
        setIsReferralsDropdownOpen(false);
        setIsPatientsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  function onClose() {
    console.log("Modal has closed");
    setPopupVisible(false);
  }

  function onOk() {
    console.log("Ok was clicked");
    setPopupVisible(false);
  }

  function openPopup(openNecCon: boolean) {
    console.log("Opening popup:", openNecCon ? 'New Connection' : 'New Referral');
    setPopupVisible(true);
    setIsNewConPop(openNecCon);
  }

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  return (
    <>
      <Dialog title={isNewConPop ? 'New Connection Request' : 'New Referral Request'} onClose={onClose} onOk={onOk} popupVisible={popupVisible}>
        {isNewConPop ? <NewConnection close={onClose} /> : <NewReferral close={onClose} />}
      </Dialog>

      {/* Main Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/">
                <Logo size="md" showText={true} />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  {/* Connections Dropdown */}
                  <div className="relative" data-profile-dropdown>
                    <button
                      onClick={() => {
                        setIsConnectionsDropdownOpen(!isConnectionsDropdownOpen);
                        setIsReferralsDropdownOpen(false);
                        setIsPatientsDropdownOpen(false);
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                    >
                      <Users className="w-4 h-4" />
                      <span>Connections</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {isConnectionsDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        <button
                          onClick={() => { openPopup(true); setIsConnectionsDropdownOpen(false); }}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 w-full text-left"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>New Connection</span>
                        </button>
                        <Link
                          href="/my-connections"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setIsConnectionsDropdownOpen(false)}
                        >
                          <Users className="w-4 h-4" />
                          <span>My Connections</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Referrals Dropdown */}
                  <div className="relative" data-profile-dropdown>
                    <button
                      onClick={() => {
                        setIsReferralsDropdownOpen(!isReferralsDropdownOpen);
                        setIsConnectionsDropdownOpen(false);
                        setIsPatientsDropdownOpen(false);
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Referrals</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {isReferralsDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        <button
                          onClick={() => { openPopup(false); setIsReferralsDropdownOpen(false); }}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 w-full text-left"
                        >
                          <Plus className="w-4 h-4" />
                          <span>New Referral</span>
                        </button>
                        <Link
                          href="/referrals/sent"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setIsReferralsDropdownOpen(false)}
                        >
                          <FileText className="w-4 h-4" />
                          <span>Sent Referrals</span>
                        </Link>
                        <Link
                          href="/referrals/received"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setIsReferralsDropdownOpen(false)}
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Received Referrals</span>
                        </Link>
                        <Link
                          href="/referrals/pending"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setIsReferralsDropdownOpen(false)}
                        >
                          <Clock className="w-4 h-4" />
                          <span>Pending Actions</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Patients Dropdown */}
                  <div className="relative" data-profile-dropdown>
                    <button
                      onClick={() => {
                        setIsPatientsDropdownOpen(!isPatientsDropdownOpen);
                        setIsConnectionsDropdownOpen(false);
                        setIsReferralsDropdownOpen(false);
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                    >
                      <User className="w-4 h-4" />
                      <span>Patients</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {isPatientsDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        <Link
                          href="/patients"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setIsPatientsDropdownOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>My Patients</span>
                        </Link>
                        <Link
                          href="/patients/history"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setIsPatientsDropdownOpen(false)}
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Patient History</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  {/* Notifications */}
                  <NotificationBell />

                  {/* Profile Dropdown */}
                  <div className="relative" data-profile-dropdown>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {userInitials}
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        {/* User Info Section */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {userInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user ? `${user.first_name} ${user.last_name}` : (userLoading ? 'Loading...' : 'User')}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user?.email || (userLoading ? 'Loading...' : 'user@example.com')}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                        </div>
                        
                        <hr className="my-1" />
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-2">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        openPopup(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Referral</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        openPopup(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>New Connection</span>
                    </button>
                    
                    <Link
                      href="/my-connections"
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Users className="w-4 h-4" />
                      <span>My Connections</span>
                    </Link>
                    
                    <Link
                      href="/patients"
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>My Patients</span>
                    </Link>
                    
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    
                    {/* Mobile Notifications */}
                    <div className="px-3 py-2">
                      <NotificationBell />
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-red-600 hover:bg-red-50 transition-colors duration-200 px-3 py-2 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
        </header>
    </>
  )
}

export default Header