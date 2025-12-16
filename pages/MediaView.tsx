import React, { useState, useEffect } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, Share2, Flag, MessageSquare, Bell, CheckCircle2, Play, Lock, Send, Sparkles, Frown } from 'lucide-react';
import { MediaItem, User, Comment } from '../types';
import { store } from '../services/store';
import { mediaApi } from '../services/mediaApi';

interface MediaViewProps {
    mediaId: string;
    currentUser: User;
    onBack: () => void;
    onRelatedClick: (id: string) => void;
}

const MediaView: React.FC<MediaViewProps> = ({ mediaId, currentUser, onBack, onRelatedClick }) => {
    // undefined: loading, null: not found, MediaItem: found
    const [media, setMedia] = useState<MediaItem | undefined | null>(undefined);
    const [comments, setComments] = useState<Comment[]>([]);
    const [related, setRelated] = useState<MediaItem[]>([]);
    const [newComment, setNewComment] = useState('');

    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showFullDesc, setShowFullDesc] = useState(false);

    useEffect(() => {
        // Set to loading state on new ID
        setMedia(undefined);

        // Scroll to top
        const mainContainer = document.querySelector('main');
        if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: 'smooth' });

        // Fetch Data from API
        const fetchMedia = async () => {
            try {
                const item = await mediaApi.getById(mediaId);
                setMedia(item);
                setComments(store.getComments(mediaId));

                // Fetch related media
                const allMedia = await mediaApi.list();
                setRelated(allMedia.filter(m => m.id !== mediaId).slice(0, 6));
            } catch (error) {
                console.error('Error fetching media:', error);
                // Fallback to localStorage
                const item = store.getMediaById(mediaId);
                if (item) {
                    setMedia(item);
                    setComments(store.getComments(mediaId));
                    setRelated(store.getMedia().filter(m => m.id !== mediaId).slice(0, 6));
                } else {
                    setMedia(null); // Not found
                }
            }
        };

        fetchMedia();

        // Reset interaction states
        setIsPlaying(false);
        setIsLiked(false);
    }, [mediaId]);

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !media) return;

        const added = store.addComment({
            mediaId: media.id,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatarUrl,
            text: newComment
        });

        setComments([added, ...comments]);
        setNewComment('');
    };

    // Loading State
    if (media === undefined) {
        return <div className="text-center py-20 text-zinc-400">Loading content...</div>;
    }

    // Not Found State
    if (media === null) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-800">
                <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-6">
                    <Frown className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Content Not Found</h2>
                <p className="text-zinc-400 mb-8 max-w-sm">
                    This media may have been removed by an administrator or the link is incorrect.
                </p>
                <button
                    type="button"
                    onClick={onBack}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold flex items-center transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Media Hub
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
                {/* Player Container */}
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-900 group">
                    {/* Back Button Overlay */}
                    <button
                        type="button"
                        aria-label="Go back"
                        onClick={onBack}
                        className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 duration-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Video / Image Display */}
                    {media.mediaType === 'image' ? (
                        <img src={media.sourceUrl || media.thumbnailUrl} alt={media.title} className="w-full h-full object-contain" />
                    ) : (
                        <>
                            {!isPlaying ? (
                                <>
                                    <img
                                        src={media.thumbnailUrl}
                                        alt="Content"
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button
                                            type="button"
                                            aria-label="Play content"
                                            onClick={() => setIsPlaying(true)}
                                            className="w-20 h-20 bg-red-600/90 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                                        >
                                            <Play className="w-8 h-8 text-white ml-1 fill-current" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <video
                                    src={media.sourceUrl}
                                    controls
                                    autoPlay
                                    className="w-full h-full"
                                    poster={media.thumbnailUrl}
                                >
                                    Your browser does not support video playback.
                                </video>
                            )}
                        </>
                    )}
                </div>

                {/* Premium Banner (if applicable) */}
                {media.isPremium && (
                    <div className="bg-gradient-to-r from-red-900/30 to-black border border-red-600/30 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-4 shadow-lg shadow-red-600/30">
                                <Lock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Unlock Full Uncensored Video</h4>
                                <p className="text-xs text-red-300">Join now to access premium content from {media.creatorName}</p>
                            </div>
                        </div>
                        <button type="button" className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-red-600/20 whitespace-nowrap">
                            Join for R{media.price || 99}
                        </button>
                    </div>
                )}

                {/* Video Info */}
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2 leading-snug">
                        {media.title}
                    </h1>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-zinc-900">
                        <div className="flex items-center text-sm text-zinc-400 space-x-2">
                            <span>{media.views.toLocaleString()} views</span>
                            <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                            <span>{media.uploadedAt}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className="flex bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => { setIsLiked(!isLiked); if (isDisliked) setIsDisliked(false); }}
                                    className={`flex items-center space-x-2 px-4 py-2 hover:bg-zinc-800 transition-colors ${isLiked ? 'text-red-500' : 'text-zinc-300'}`}
                                >
                                    <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                    <span className="text-sm font-medium">{isLiked ? '45.1K' : '45K'}</span>
                                </button>
                                <div className="w-px bg-zinc-800"></div>
                                <button
                                    type="button"
                                    onClick={() => { setIsDisliked(!isDisliked); if (isLiked) setIsLiked(false); }}
                                    className={`px-4 py-2 hover:bg-zinc-800 transition-colors ${isDisliked ? 'text-white' : 'text-zinc-300'}`}
                                >
                                    <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                            <button type="button" className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 rounded-full text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border border-zinc-800">
                                <Share2 className="w-5 h-5" />
                                <span className="text-sm font-medium hidden sm:inline">Share</span>
                            </button>
                        </div>
                    </div>

                    {/* Creator Row */}
                    <div className="flex items-center justify-between py-6 border-b border-zinc-900">
                        <div className="flex items-center space-x-4">
                            <img src={media.creatorAvatar} alt="Creator" className="w-12 h-12 rounded-full border-2 border-zinc-800" />
                            <div>
                                <h3 className="text-white font-bold flex items-center">
                                    {media.creatorName}
                                    <CheckCircle2 className="w-4 h-4 text-zinc-400 ml-1.5" />
                                </h3>
                                <p className="text-xs text-zinc-400">850K subscribers</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsSubscribed(!isSubscribed)}
                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-full font-semibold transition-all ${isSubscribed
                                    ? 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800'
                                    : 'bg-white text-zinc-900 hover:bg-zinc-100 hover:text-red-600'
                                }`}
                        >
                            {isSubscribed ? (
                                <>
                                    <Bell className="w-4 h-4" />
                                    <span>Subscribed</span>
                                </>
                            ) : (
                                <span>Subscribe</span>
                            )}
                        </button>
                    </div>

                    {/* Description */}
                    <div className="py-4">
                        <div className={`bg-zinc-900/50 rounded-xl p-4 text-sm text-zinc-300 whitespace-pre-line border border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer`} onClick={() => setShowFullDesc(!showFullDesc)}>
                            <p className={showFullDesc ? '' : 'line-clamp-2'}>
                                <span className="font-bold text-white mb-2 block text-base">About this content</span>
                                {media.description}
                            </p>
                            <button type="button" className="text-zinc-500 font-semibold mt-2 hover:text-white transition-colors text-xs uppercase tracking-wide">
                                {showFullDesc ? 'Show Less' : 'Show More'}
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            {comments.length} Comments
                            <span className="text-sm font-normal text-zinc-500 ml-4 flex items-center cursor-pointer hover:text-white">
                                Sort by <ArrowLeft className="w-3 h-3 rotate-90 ml-1" />
                            </span>
                        </h3>

                        <form onSubmit={handlePostComment} className="flex space-x-4 mb-8">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-800">
                                <img src={currentUser.avatarUrl} alt="Me" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="w-full bg-transparent border-b border-zinc-800 py-2 text-zinc-200 focus:outline-none focus:border-red-600 transition-colors placeholder:text-zinc-600 pr-10"
                                />
                                {newComment && (
                                    <button type="submit" aria-label="Post comment" className="absolute right-0 top-2 text-red-500 hover:text-red-400">
                                        <Send className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="space-y-6">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-800">
                                        <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-semibold text-white text-sm">{comment.userName}</span>
                                            <span className="text-xs text-zinc-500">{comment.createdAt}</span>
                                        </div>
                                        <p className="text-sm text-zinc-300 mb-2">{comment.text}</p>
                                        <div className="flex items-center space-x-4">
                                            <button type="button" className="flex items-center space-x-1 text-xs text-zinc-500 hover:text-white transition-colors">
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                                <span>{comment.likes}</span>
                                            </button>
                                            <button type="button" className="flex items-center space-x-1 text-xs text-zinc-500 hover:text-white transition-colors">
                                                <ThumbsDown className="w-3.5 h-3.5" />
                                            </button>
                                            <button type="button" className="text-xs text-zinc-500 hover:text-white font-medium">Reply</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar: Related Videos */}
            <div className="lg:col-span-1">
                <h3 className="text-lg font-bold text-white mb-4">Up Next</h3>
                <div className="space-y-4">
                    {related.map(video => (
                        <div
                            key={video.id}
                            className="flex space-x-3 group cursor-pointer"
                            onClick={() => onRelatedClick(video.id)}
                        >
                            <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-zinc-800">
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-mono">
                                    {video.duration || 'IMG'}
                                </div>
                                {video.isPremium && (
                                    <div className="absolute top-1 left-1 bg-amber-500/90 text-zinc-900 p-0.5 rounded">
                                        <Lock className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-zinc-200 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
                                    {video.title}
                                </h4>
                                <p className="text-xs text-zinc-400 mt-1">{video.creatorName}</p>
                                <div className="text-[10px] text-zinc-500 mt-auto flex items-center">
                                    {video.views.toLocaleString()} views • {video.uploadedAt}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MediaView;