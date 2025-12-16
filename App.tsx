import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MediaHub from './pages/MediaHub';
import TalentDirectory from './pages/TalentDirectory';
import MediaView from './pages/MediaView';
import VerificationModal from './components/VerificationModal';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';
import AgeGate from './components/AgeGate';
import { store, generateAvatar } from './services/store';

const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest',
  role: UserRole.CONSUMER,
  verified: false,
  avatarUrl: generateAvatar('Guest')
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'auth' | 'media' | 'directory' | 'profile' | 'view' | 'admin-dashboard'>('media');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User>(GUEST_USER);

  useEffect(() => {
    const sessionUser = store.getSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }
  }, []);

  const handleLogin = (user: User) => {
    store.saveSession(user);
    setCurrentUser(user);
    setCurrentPage('media');
  };

  const handleLogout = () => {
    store.clearSession();
    setCurrentUser(GUEST_USER);
    setCurrentPage('media');
  };

  const handleUserUpdate = (user: User) => {
    setCurrentUser(user);
  };

  const handleMediaClick = (id: string) => {
    setSelectedMediaId(id);
    setCurrentPage('view');
    setIsSidebarOpen(false);
  };

  const handleNavigate = (page: 'media' | 'directory' | 'profile') => {
    if (page === 'profile' && currentUser.id === 'guest') {
      setCurrentPage('auth');
      setIsSidebarOpen(false);
      return;
    }
    setCurrentPage(page);
    setSelectedMediaId(null);
    setIsSidebarOpen(false);
  };

  const handleAdminNav = () => {
    setCurrentPage('admin-dashboard');
    setIsSidebarOpen(false);
  }

  if (currentPage === 'auth') {
    return (
      <div className="h-screen bg-zinc-950 text-zinc-50 font-poppins">
        <Auth onLogin={handleLogin} onNavigateBack={() => setCurrentPage('media')} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-poppins">
      <AgeGate />

      <Sidebar
        activePage={['view', 'admin-dashboard'].includes(currentPage) ? 'media' : currentPage as any}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar
          user={currentUser}
          onVerifyClick={() => setIsVerificationOpen(true)}
          onLoginClick={() => setCurrentPage('auth')}
          onAdminClick={handleAdminNav}
          onProfileClick={() => handleNavigate('profile')}
          onLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'media' && <MediaHub onMediaClick={handleMediaClick} />}
            {currentPage === 'view' && selectedMediaId && (
              <MediaView mediaId={selectedMediaId} currentUser={currentUser} onBack={() => setCurrentPage('media')} onRelatedClick={handleMediaClick} />
            )}
            {currentPage === 'directory' && <TalentDirectory />}
            {currentPage === 'profile' && <UserProfile user={currentUser} onMediaClick={handleMediaClick} onUserUpdate={handleUserUpdate} />}
            {currentPage === 'admin-dashboard' && <AdminDashboard user={currentUser} />}
          </div>
        </main>
      </div>

      {isVerificationOpen && <VerificationModal onClose={() => setIsVerificationOpen(false)} />}
    </div>
  );
};

export default App;