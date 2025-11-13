import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Play } from "lucide-react";
import { postsApi, profilesApi } from "../../utils/api";
import type { Post, User } from "@/types";
import { PostSkeleton } from "@/components/shared/LoadingSkeleton";

interface ReelPost extends Post {
  isPlaying?: boolean;
}

export default function ReelsSection() {
  const [reels, setReels] = useState<ReelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const [isMuted, setIsMuted] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initialize Intersection Observer for autoplay
  const initializeObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          const postId = entry.target.getAttribute("data-post-id");

          if (!postId) return;

          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // Video is in view (more than 50% visible)
            videoElement.muted = isMuted;
            videoElement.play().catch((err) => {
              console.log("Autoplay prevented:", err);
            });
          } else {
            // Video is out of view
            videoElement.pause();
          }
        });
      },
      {
        threshold: [0.5],
        rootMargin: "0px",
      }
    );

    // Observe all videos
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        observerRef.current?.observe(video);
      }
    });
  }, [isMuted, reels]);

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    initializeObserver();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [initializeObserver]);

  // Handle mute toggle
  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });
  }, [isMuted]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      // Fetch posts with video content only
      const data = await postsApi.getFeed(1, 20);
      const videoReels = data.items.filter(
        (post: Post) =>
          post.media && post.media.some((m) => m.type === "video")
      );

      setReels(videoReels);

      // Fetch user profiles for reel authors
      const authorIds = [...new Set(videoReels.map((p: ReelPost) => p.authorId))];
      const userPromises = authorIds.map(async (id) => {
        try {
          return await profilesApi.getProfile(id);
        } catch {
          return null;
        }
      });

      const users = await Promise.all(userPromises);
      const newUserCache: Record<string, User> = {};
      users.forEach((user) => {
        if (user) newUserCache[user.clerkId] = user;
      });

      setUserCache(newUserCache);
    } catch (err) {
      console.error("Error fetching reels:", err);
      setError(err instanceof Error ? err.message : "Failed to load reels");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoRef = (postId: string, videoElement: HTMLVideoElement | null) => {
    videoRefs.current[postId] = videoElement;
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <PostSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white/70 text-lg">Error: {error}</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Play size={48} className="text-white/50" />
        <p className="text-white/70 text-lg">No reels available yet</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-screen overflow-y-scroll snap-y snap-mandatory bg-black"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Mute Toggle Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-8 right-8 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full text-white transition-all duration-200 shadow-lg"
        aria-label="Toggle mute"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX size={24} />
        ) : (
          <Volume2 size={24} />
        )}
      </button>

      {/* Reels Container */}
      {reels.map((reel, index) => {
        const author = userCache[reel.authorId];
        const videoMedia = reel.media?.find((m) => m.type === "video");

        return (
          <div
            key={reel._id}
            className="relative h-screen w-full snap-center flex items-center justify-center bg-black overflow-hidden group"
          >
            {/* Video Player */}
            {videoMedia ? (
              <>
                <video
                  ref={(el) => handleVideoRef(reel._id, el)}
                  data-post-id={reel._id}
                  src={videoMedia.url}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  webkit-playsinline="true"
                />

                {/* Play Button Fallback */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const video = videoRefs.current[reel._id];
                    if (video) {
                      video.muted = isMuted;
                      video.play();
                    }
                  }}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30"
                  aria-label="Play video"
                >
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full hover:bg-white/40 transition">
                    <Play size={32} className="text-white fill-white" />
                  </div>
                </button>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                <p className="text-white/50">No video available</p>
              </div>
            )}

            {/* Post Info Overlay (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/50 to-transparent">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden border-2 border-white cursor-pointer"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("circlo:openProfile", {
                        detail: { userId: reel.authorId },
                      })
                    )
                  }
                >
                  {author?.avatarUrl && (
                    <img
                      src={author.avatarUrl}
                      alt={author.username}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {author?.username || "User"}
                  </p>
                  {reel.location && (
                    <p className="text-white/70 text-xs truncate">{reel.location}</p>
                  )}
                </div>
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("circlo:openChat", {
                        detail: { userId: reel.authorId },
                      })
                    )
                  }
                  className="px-4 py-1 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition flex-shrink-0"
                >
                  Follow
                </button>
              </div>

              {/* Caption */}
              {reel.text && (
                <p className="text-white text-sm line-clamp-2 mb-3">{reel.text}</p>
              )}

              {/* Action Bar */}
              <div className="flex items-center gap-4 justify-between">
                <div className="flex gap-4">
                  <button className="text-white hover:text-pink-500 transition">
                    <svg
                      className="w-6 h-6 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  <button className="text-white hover:text-blue-500 transition">
                    <svg
                      className="w-6 h-6 fill-none stroke-current"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                  <button className="text-white hover:text-green-500 transition">
                    <svg
                      className="w-6 h-6 fill-none stroke-current"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>
                </div>

                {/* View Count */}
                <span className="text-white/70 text-xs">{reel.likeCount || 0} views</span>
              </div>
            </div>

            {/* Right Side Action Bar */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-20">
              {/* Like Count */}
              <div className="flex flex-col items-center gap-1">
                <button className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 text-white transition">
                  <svg
                    className="w-6 h-6 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <span className="text-white text-xs font-semibold">
                  {reel.likeCount || 0}
                </span>
              </div>

              {/* Comment Count */}
              <div className="flex flex-col items-center gap-1">
                <button className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 text-white transition">
                  <svg
                    className="w-6 h-6 fill-none stroke-current"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
                <span className="text-white text-xs font-semibold">
                  {reel.commentCount || 0}
                </span>
              </div>

              {/* Share Count */}
              <div className="flex flex-col items-center gap-1">
                <button className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 text-white transition">
                  <svg
                    className="w-6 h-6 fill-none stroke-current"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
                <span className="text-white text-xs font-semibold">
                  {reel.shareCount || 0}
                </span>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="absolute top-2 left-4 right-4 flex gap-1">
              {reels.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-0.5 flex-1 rounded-full transition-all ${
                    idx === index
                      ? "bg-white"
                      : idx < index
                      ? "bg-white/50"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
