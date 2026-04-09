import React from 'react';
import { 
  Play, 
  Maximize, 
  CheckCircle2, 
  Youtube, 
  MonitorPlay,
  CheckCircle
} from 'lucide-react';

const VideoPlayer = ({ videoUrl, title, onMarkComplete, isCompleted }) => {
    // Robust YouTube detection and embedding
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';
        
        // Return if it's already an embed URL
        if (url.includes('youtube.com/embed/')) return url;

        let videoId = '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);

        if (match && match[2].length === 11) {
            videoId = match[2];
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0`;
        }

        // Return original URL if it's not a standard YouTube link (e.g. local file)
        return url;
    };

    const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');
    const embedUrl = getYouTubeEmbedUrl(videoUrl);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        {isYouTube ? <Youtube size={24} /> : <MonitorPlay size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-1">{title || 'Lesson Video'}</h3>
                        <p className="text-xs font-medium text-slate-500">
                            {isYouTube ? 'YouTube Source' : 'Local Video'}
                        </p>
                    </div>
                </div>

                {onMarkComplete && (
                    <button
                        onClick={onMarkComplete}
                        disabled={isCompleted}
                        className={`group flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
                            isCompleted 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                            : 'bg-primary text-white hover:bg-primary-hover shadow-primary/20'
                        }`}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle size={18} />
                                Completed
                            </>
                        ) : (
                            <>
                                <Play size={18} fill="currentColor" />
                                Mark as Complete
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-slate-700/50 group">
                {isYouTube ? (
                    <iframe
                        src={embedUrl}
                        title={title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <video 
                      controls 
                      className="w-full h-full object-contain"
                      src={videoUrl.startsWith('http') ? videoUrl : `http://localhost:5000${videoUrl}`}
                    >
                        <source src={videoUrl} type="video/mp4" />
                        <p>Your browser doesn't support HTML5 video.</p>
                    </video>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;
