import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Notification } from '../types';
import { Search, Bell, Menu, ShieldCheck, LogIn, Database, LogOut } from 'lucide-react';
import { store } from '../services/store';

interface NavbarProps {
  user: User;
  onVerifyClick: () => void;
  onLoginClick: () => void;
  onAdminClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, onVerifyClick, onLoginClick, onAdminClick, onProfileClick, onLogout, onMenuClick
}) => {
  const isGuest = user.id === 'guest';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = () => setNotifications(store.getNotifications(user.id));
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user.id]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const handleMarkAllRead = () => { store.markAllNotificationsRead(user.id); setNotifications(store.getNotifications(user.id)); };
  const handleNotificationClick = (id: string) => { store.markNotificationRead(id); setNotifications(store.getNotifications(user.id)); };

  return (
    <header className="h-16 bg-zinc-950/50 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-4 sticky top-0 z-20 flex-shrink-0">
      <div className="flex items-center flex-1">
        <button type="button" aria-label="Open menu" className="sm:hidden p-2 text-zinc-400 hover:text-white" onClick={onMenuClick}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative max-w-md w-full ml-4 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input type="text" placeholder="Search creators, professionals, or content..." className="w-full bg-black border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-red-600" />
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {user.role === UserRole.ADMIN && (
          <button type="button" onClick={onAdminClick} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full" title="Admin Dashboard">
            <Database className="w-5 h-5" />
          </button>
        )}
        {!isGuest && !user.verified && (
          <button type="button" onClick={onVerifyClick} className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-red-600/10 text-red-500 rounded-full text-xs font-medium hover:bg-red-600/20 border border-red-600/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Get Verified</span>
          </button>
        )}
        
        <div className="relative" ref={notificationsRef}>
            <button type="button" aria-label="Toggle notifications" onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-zinc-400 hover:text-red-500">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-zinc-950"></span>}
            </button>
            {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/50"><h3 className="font-bold text-white text-sm">Notifications</h3>{unreadCount > 0 && <button type="button" onClick={handleMarkAllRead} className="text-xs text-red-500 hover:text-red-400 font-medium">Mark all read</button>}</div>
                    <div className="max-h-80 overflow-y-auto">{notifications.length === 0 ? <div className="p-8 text-center text-zinc-500 text-sm">No notifications yet.</div> : notifications.map(notif => (<div key={notif.id} onClick={() => handleNotificationClick(notif.id)} className={`p-4 border-b border-zinc-800/50 hover:bg-zinc-800 cursor-pointer ${!notif.read ? 'bg-red-600/5' : ''}`}><div className="flex items-start"><div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${!notif.read ? 'bg-red-600' : 'bg-transparent'}`}></div><div><p className={`text-sm ${!notif.read ? 'text-white font-medium' : 'text-zinc-400'}`}>{notif.message}</p><p className="text-xs text-zinc-600 mt-1">{notif.createdAt}</p></div></div></div>))}</div>
                </div>
            )}
        </div>

        <div className="flex items-center space-x-3 border-l border-zinc-800 pl-4">
          {isGuest ? (
             <button type="button" onClick={onLoginClick} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-red-600/20"><LogIn className="w-4 h-4" /><span>Sign In</span></button>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button type="button" onClick={() => setShowUserMenu(!showUserMenu)} className="relative group flex items-center space-x-2">
                <img src={user.avatarUrl} alt="User" className="w-9 h-9 rounded-full border-2 border-zinc-800 group-hover:border-red-600 object-cover"/>
                <div className="text-right hidden sm:block"><p className="text-sm font-medium text-white">{user.name}</p><p className="text-xs text-zinc-500">{user.role}</p></div>
              </button>
              {showUserMenu && (
                 <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <button type="button" onClick={() => { onProfileClick(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white">My Profile</button>
                    <button type="button" onClick={() => { onLogout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-800 hover:text-red-400 flex items-center"><LogOut className="w-4 h-4 mr-2"/>Sign Out</button>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;