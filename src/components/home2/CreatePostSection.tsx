import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Image, Video, X } from "lucide-react";
import { postsApi, mediaApi } from "../../utils/api";

interface CreatePostSectionProps {
  onPostCreated?: () => void;
}

export default function CreatePostSection({ onPostCreated }: CreatePostSectionProps) {
  const { user: clerkUser } = useUser();
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Revoke object URL when component unmounts
      if (mediaPreview && mediaPreview.startsWith('blob:')) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setError('Please select an image or video file');
      return;
    }

    // Validate file size (10MB for images, 50MB for videos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Max ${isVideo ? '50MB' : '10MB'}`);
      return;
    }

    // Revoke previous preview if it was an object URL
    if (mediaPreview && mediaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreview);
    }

    setMediaFile(file);
    setError(null);

    // Use object URL for preview (better for videos and avoids large base64 strings)
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const handleRemoveMedia = () => {
    if (mediaPreview && mediaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() && !mediaFile) {
      setError('Please add some text or media');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let mediaData = undefined;

      if (mediaFile) {
        // Upload the file to the media endpoint (does not create a Story)
        const uploaded = await mediaApi.upload(mediaFile);
        const url = uploaded.url;
        if (!url) throw new Error('Upload failed');
        const type: 'image' | 'video' = uploaded.type;
        mediaData = [{ url, type }];
      }

      // Create the post with the media URL
      await postsApi.createPost({
        text: text.trim() || undefined,
        media: mediaData
      });

      // Clear form
      setText('');
      if (mediaPreview && mediaPreview.startsWith('blob:')) {
        URL.revokeObjectURL(mediaPreview);
      }
      setMediaFile(null);
      setMediaPreview(null);

      // Trigger refresh
      onPostCreated?.();
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const userAvatar = clerkUser?.imageUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${clerkUser?.id}`;

  return (
    <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <img
            src={userAvatar}
            alt="Your avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {clerkUser?.username || clerkUser?.firstName || 'User'}
            </p>
          </div>
        </div>

        {/* Text Input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-none"
          disabled={loading}
        />

        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative">
            {mediaFile?.type.startsWith('image/') ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-full max-h-96 object-contain rounded-lg border border-gray-300"
              />
            ) : (
              <video
                src={mediaPreview}
                controls
                className="w-full max-h-96 rounded-lg border border-gray-300"
              />
            )}
            <button
              type="button"
              onClick={handleRemoveMedia}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition">
              <Image size={18} className="text-green-600" />
              <span className="text-sm font-medium">Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={loading}
              />
            </label>
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition">
              <Video size={18} className="text-red-600" />
              <span className="text-sm font-medium">Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || (!text.trim() && !mediaFile)}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}