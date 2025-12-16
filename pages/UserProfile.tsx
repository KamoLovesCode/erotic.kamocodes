import React, { useState, useEffect, useRef } from 'react';
import { User, MediaItem, UserRole } from '../types';
import { Settings, ShieldCheck, Grid, Edit3, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import MediaGrid from '../components/MediaGrid';
import { store } from '../services/store';

interface UserProfileProps {
  user: User;
  onMediaClick: (id: string) => void;
  onUserUpdate: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onMediaClick, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'about' | 'settings'>('videos');
  const [userVideos, setUserVideos] = useState<MediaItem[]>([]);
  
  // Form State for Credentials
  const [username, setUsername] = useState(user.name);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credentialError, setCredentialError] = useState('');
  const [credentialSuccess, setCredentialSuccess] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverImage, setCoverImage] = useState("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2940&auto=format&fit=crop");

  useEffect(() => {
    const allMedia = store.getMedia();
    const myMedia = allMedia.filter(m => m.userId === user.id);
    setUserVideos(myMedia);
  }, [user.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'avatar' | 'cover') => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const newUrl = URL.createObjectURL(file);
          if (imageType === 'avatar') {
              const updatedUser = store.updateUser(user.id, { avatarUrl: newUrl });
              if(updatedUser) {
                  store.saveSession(updatedUser);
                  onUserUpdate(updatedUser);
              }
          } else {
              setCoverImage(newUrl); // Cover is cosmetic for this demo
          }
      }
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialError('');
    setCredentialSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
        setCredentialError('Passwords do not match.');
        return;
    }

    const updates: Partial<User> = { name: username };
    if (newPassword) {
        updates.password = newPassword;
    }

    const updatedUser = store.updateUser(user.id, updates);
    if (updatedUser) {
        store.saveSession(updatedUser);
        onUserUpdate(updatedUser);
        setCredentialSuccess('Credentials updated successfully!');
        setTimeout(() => setCredentialSuccess(''), 3000);
        setNewPassword('');
        setConfirmPassword('');
    } else {
        setCredentialError('Failed to update credentials.');
    }
  };


  const handleDeleteAccount = () => {
      if (confirm("Are you sure? This is just a demo, so nothing will actually happen.")) {
          alert("Demo Mode: Account deletion simulated.");
      }
  };

  const isContentCreator = user.role === UserRole.CREATOR || user.role === UserRole.ADMIN;

  return (
    <div className="-mt-6">
      <input type="file" ref={avatarInputRef} onChange={(e) => handleImageChange(e, 'avatar')} className="hidden" accept="image/*" />
      <input type="file" ref={coverInputRef} onChange={(e) => handleImageChange(e, 'cover')} className="hidden" accept="image/*" />
      
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative bg-zinc-800 overflow-hidden">
        <img src={coverImage} alt="Cover" className="w-full h-full object-cover opacity-60"/>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
        <button type="button" onClick={() => coverInputRef.current?.click()} aria-label="Change cover image" className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/70 transition-all border border-white/10">
          <Camera className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-20 mb-8 pb-8 border-b border-zinc-800">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-zinc-950 bg-zinc-900 overflow-hidden relative">
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <button type="button" aria-label="Edit profile picture" onClick={() => avatarInputRef.current?.click()} className="absolute bottom-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-6 flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  {user.name}
                  {user.verified && <ShieldCheck className="w-6 h-6 ml-2 text-green-500" />}
                </h1>
                <p className="text-zinc-400 mt-1">@{user.name.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '')} • {user.role === 'CREATOR' ? 'Verified Creator' : (user.role === 'ADMIN' ? 'Administrator' : 'Member')}</p>
              </div>
            </div>

            {isContentCreator && (
              <div className="flex items-center space-x-8 mt-6">
                <div>
                  <span className="block text-xl font-bold text-white">12.5K</span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Subscribers</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-white">450K</span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Views</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-white">{userVideos.length}</span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Videos</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-zinc-900/50 p-1 rounded-xl w-fit border border-zinc-800">
          <button type="button" onClick={() => setActiveTab('videos')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${ activeTab === 'videos' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white' }`}>My Content</button>
          <button type="button" onClick={() => setActiveTab('about')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${ activeTab === 'about' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white' }`}>About</button>
          <button type="button" onClick={() => setActiveTab('settings')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${ activeTab === 'settings' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white' }`}>Settings</button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'videos' && (
             isContentCreator ? (
                userVideos.length > 0 ? <MediaGrid items={userVideos} onItemClick={onMediaClick} />
                : (<div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800"><Camera className="w-12 h-12 text-zinc-600 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">No content yet</h3><p className="text-zinc-400 mt-2">Use the Admin Upload tool to add content.</p></div>)
             ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/30"><div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-6"><Grid className="w-8 h-8 text-zinc-500" /></div><h3 className="text-xl font-bold text-white mb-2">No Content to Display</h3><p className="text-zinc-400 max-w-md text-center">This user is a member and has not uploaded any content.</p></div>
             )
          )}
          
          {activeTab === 'about' && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-2xl"><h3 className="text-xl font-bold text-white mb-4">About {user.name}</h3><p className="text-zinc-400 leading-relaxed mb-6">{isContentCreator? "Passionate visual artist creating high-fidelity content for exclusive audiences. Joined Mzansis Best Ass to share my creative journey and connect with fans.": "Avid consumer of high-quality digital media. Love exploring new perspectives and supporting independent creators."}</p><div className="grid grid-cols-2 gap-4"><div className="bg-black p-4 rounded-xl border border-zinc-800"><p className="text-zinc-500 text-sm">Joined</p><p className="text-white font-medium">October 2025</p></div><div className="bg-black p-4 rounded-xl border border-zinc-800"><p className="text-zinc-500 text-sm">Location</p><p className="text-white font-medium">New York, USA</p></div></div></div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-2xl space-y-10">
               <div>
                  <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
                  <div className="space-y-6"><div className="flex items-center justify-between pb-6 border-b border-zinc-800"><div><p className="text-white font-medium">Email Notifications</p><p className="text-sm text-zinc-500">Receive updates about your content</p></div><div className="w-11 h-6 bg-red-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div></div><div className="flex items-center justify-between pb-6 border-b border-zinc-800"><div><p className="text-white font-medium">Profile Visibility</p><p className="text-sm text-zinc-500">Who can see your profile details</p></div><select className="bg-black border border-zinc-800 rounded-lg text-sm text-white px-3 py-1.5 focus:outline-none"><option>Public</option><option>Subscribers Only</option><option>Private</option></select></div></div>
               </div>
               
               <div>
                 <h3 className="text-xl font-bold text-white mb-6">Credentials</h3>
                 <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                    <div><label className="text-sm text-zinc-400">Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 mt-2 text-white focus:ring-1 focus:ring-red-600 focus:border-red-600 focus:outline-none transition-all"/></div>
                    <div><label className="text-sm text-zinc-400">New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 mt-2 text-white focus:ring-1 focus:ring-red-600 focus:border-red-600 focus:outline-none transition-all" placeholder="Leave blank to keep current password"/></div>
                    <div><label className="text-sm text-zinc-400">Confirm New Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 mt-2 text-white focus:ring-1 focus:ring-red-600 focus:border-red-600 focus:outline-none transition-all"/></div>
                    {credentialError && <p className="text-sm text-red-500 flex items-center"><AlertCircle className="w-4 h-4 mr-2"/>{credentialError}</p>}
                    {credentialSuccess && <p className="text-sm text-green-500 flex items-center"><CheckCircle className="w-4 h-4 mr-2"/>{credentialSuccess}</p>}
                    <div className="flex justify-end pt-2"><button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold">Save Changes</button></div>
                 </form>
               </div>
               
               <div className="pt-6 border-t border-zinc-800"><button type="button" onClick={handleDeleteAccount} className="text-red-500 text-sm font-medium hover:text-red-400">Delete Account</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;