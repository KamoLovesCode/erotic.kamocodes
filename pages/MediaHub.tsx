import React, { useState, useEffect } from 'react';
import MediaGrid from '../components/MediaGrid';
import { MediaItem } from '../types';
import { Flame, Star, Clock, Filter, Play } from 'lucide-react';
import { store } from '../services/store';
import { mediaApi } from '../services/mediaApi';

const CATEGORIES = [
  { id: 'all', label: 'All Content' },
  { id: 'exclusive', label: 'Exclusive' },
  { id: 'bts', label: 'Behind The Scenes' },
  { id: '4k', label: '4K Ultra HD' },
  { id: 'vr', label: 'VR Experience' },
];

interface MediaHubProps {
  onMediaClick: (id: string) => void;
}

const MediaHub: React.FC<MediaHubProps> = ({ onMediaClick }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [featuredItem, setFeaturedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    // Load media from MongoDB API
    const loadMedia = async () => {
      try {
        const items = await mediaApi.list();
        setMediaItems(items);

        // Load featured item from settings
        const settings = store.getSiteSettings();
        const featured = items.find(item => item.id === settings.featuredMediaId);
        setFeaturedItem(featured || items[0] || null);
      } catch (error) {
        console.error('Error loading media from API:', error);
        // Fallback to localStorage
        const items = store.getMedia();
        setMediaItems(items);
        const settings = store.getSiteSettings();
        const featured = items.find(item => item.id === settings.featuredMediaId);
        setFeaturedItem(featured || items[0] || null);
      }
    };

    loadMedia();
  }, []);

  const heroItem = featuredItem || {
    id: 'placeholder',
    title: 'Midnight in Paris: The Collection',
    description: 'Experience the latest exclusive shoot featuring top international talent in 4K resolution.',
    thumbnailUrl: 'https://picsum.photos/seed/hero1/1600/600'
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden h-80 lg:h-96 border border-zinc-800 shadow-2xl group cursor-pointer" onClick={() => onMediaClick(heroItem.id)}>
        <img
          src={heroItem.thumbnailUrl}
          alt="Featured"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent flex flex-col justify-end p-8 lg:p-12">
          <span className="bg-red-600 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-4 shadow-lg shadow-red-600/30">
            Featured Premiere
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 max-w-2xl leading-tight">
            {heroItem.title}
          </h1>
          <p className="text-zinc-300 max-w-xl mb-6 text-lg line-clamp-2">
            {heroItem.description}
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => { e.stopPropagation(); onMediaClick(heroItem.id); }}
              className="bg-white text-zinc-900 px-8 py-3 rounded-full font-bold hover:bg-zinc-100 transition-colors flex items-center"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Watch Now
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="bg-black/80 backdrop-blur-md text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors border border-zinc-700"
            >
              Add to Playlist
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 text-sm text-zinc-400 bg-black p-1 rounded-full border border-zinc-800 w-fit">
          <button className="flex items-center px-4 py-1.5 rounded-full bg-zinc-800 text-zinc-200 shadow-sm">
            <Flame className="w-4 h-4 mr-2 text-red-500" />
            Trending
          </button>
          <button className="flex items-center px-4 py-1.5 rounded-full hover:text-zinc-200 transition-colors">
            <Clock className="w-4 h-4 mr-2" />
            Newest
          </button>
          <button className="flex items-center px-4 py-1.5 rounded-full hover:text-zinc-200 transition-colors">
            <Star className="w-4 h-4 mr-2" />
            Top Rated
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-1.5 h-8 bg-red-600 rounded-full mr-3"></span>
          Recommended For You
        </h2>
        <MediaGrid items={mediaItems} onItemClick={onMediaClick} />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-1.5 h-8 bg-rose-700 rounded-full mr-3"></span>
          New Arrivals
        </h2>
        <MediaGrid items={[...mediaItems].reverse()} onItemClick={onMediaClick} />
      </section>
    </div>
  );
};

export default MediaHub;
