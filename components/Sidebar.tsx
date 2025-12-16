import React from 'react';
import { PlayCircle, Users, Settings, Shield, Zap } from 'lucide-react';

interface SidebarProps {
  activePage: 'media' | 'directory' | 'profile';
  onNavigate: (page: 'media' | 'directory' | 'profile') => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, isOpen, onClose }) => {
  const navItems = [
    { id: 'media', label: 'Media Hub', icon: PlayCircle },
    { id: 'directory', label: 'Talent Directory', icon: Users },
    { id: 'profile', label: 'My Profile', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="w-64 bg-black border-r border-zinc-900 flex flex-col justify-between h-full">
      <div>
        <div className="h-16 flex items-center justify-start px-6 border-b border-zinc-900">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-700 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20">
            <Zap className="text-white w-5 h-5" fill="currentColor" />
          </div>
          <span className="ml-3 font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">

          </span>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`w-full flex items-center justify-start px-4 py-3 rounded-xl transition-all duration-200 group ${activePage === item.id ? 'bg-red-600/10 text-red-500' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
            >
              <item.icon className={`w-6 h-6 ${activePage === item.id ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className={`ml-3 font-medium ${activePage === item.id ? 'font-semibold' : ''}`}>{item.label}</span>
              {activePage === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]"></div>}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4">
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center space-x-2 text-red-500 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Safety First</span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            All creators and professionals are ID-verified using our bank-grade secure system.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden sm:block flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className={`sm:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>
      {isOpen && <div className="sm:hidden fixed inset-0 bg-black/60 z-30" onClick={onClose}></div>}
    </>
  );
};

export default Sidebar;