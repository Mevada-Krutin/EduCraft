import React from 'react';

const VideoPlayer = ({ videoUrl, title, onMarkComplete, isCompleted }) => {
    // Simple check to determine if it's a YouTube URL to embed
    const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';
        if (url.includes('youtube.com/embed/')) return url;

        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].substring(0, 11);
        } else if (url.includes('v=')) {
            videoId = url.split('v=')[1].substring(0, 11);
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="mb-0 m-0" style={{ margin: 0 }}>{title || 'Course Video'}</h3>
                {onMarkComplete && (
                    <button
                        className={`btn ${isCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : 'btn-primary'}`}
                        onClick={onMarkComplete}
                        disabled={isCompleted}
                        style={{
                            opacity: isCompleted ? 0.8 : 1,
                            cursor: isCompleted ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '0.25rem',
                            color: 'white',
                            fontWeight: 600
                        }}
                    >
                        {isCompleted ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Completed
                            </>
                        ) : 'Mark as Complete'}
                    </button>
                )}
            </div>
            <div className="video-container">
                {isYouTube ? (
                    <iframe
                        src={getYouTubeEmbedUrl(videoUrl)}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <video controls>
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;
