import React, { useEffect, useRef, useState } from "react";
import { storiesApi } from "../../utils/api";

type Story = {
  id: string;
  authorId: string;
  url: string;
  type: "image" | "video";
  text?: string;
  createdAt: number;
};

export default function StoriesSection() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Story | null>(null);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<Story | null>(null);
  const [editText, setEditText] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const editFileRef = useRef<HTMLInputElement | null>(null);

  const H24 = 24 * 60 * 60 * 1000;
  const isRecent = (s: Story) => Date.now() - s.createdAt < H24;

  // Helper to make URL absolute if server returned relative paths
  const makeAbsolute = (url: string) => {
    if (!url) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // derive base from VITE_API_URL or fallback to localhost:3000
    const apiRoot = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000/api";
    const origin = apiRoot.replace(/\/api\/?$/, "");
    if (url.startsWith("/")) return `${origin}${url}`;
    return `${origin}/${url}`;
  };

  // Load stories from server (server-source of truth)
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await storiesApi.getStories();
        const serverStories: any[] = Array.isArray(res) ? res : [];
        // normalize story URLs and convert createdAt to numeric timestamp
        const normalized = serverStories.map((s: any) => ({
          ...s,
          id: s.id || s._id || String(s._id || s.id),
          url: makeAbsolute(s.url),
          createdAt: s.createdAt ? new Date(s.createdAt).getTime() : Date.now(),
        }));
        const recent = normalized.filter(isRecent);
        if (mounted) setStories(recent);
      } catch (err) {
        console.warn("Could not load stories from server:", err);
        if (mounted) setError("Could not load stories from server.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Periodic cleanup of expired stories
  useEffect(() => {
    const id = setInterval(() => setStories((prev) => prev.filter(isRecent)), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const openFile = () => fileRef.current?.click();

  const handleVideoError = (id: string) => {
    setBroken((b) => ({ ...b, [id]: true }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    // Optimistic preview using object URL
    const tmp: Story = {
      id: `tmp_${Date.now()}`,
      authorId: "you",
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
      createdAt: Date.now(),
    };

    setStories((s) => [tmp, ...s]);

    try {
      const created = await storiesApi.createStory(file);
      const serverStory: any = created;
      if (serverStory && (serverStory.id || serverStory._id)) {
        // ensure absolute url
        serverStory.url = makeAbsolute(serverStory.url);
        setStories((prev) => [serverStory, ...prev.filter((p) => p.id !== tmp.id)]);
      } else {
        // If server didn't return a story object, re-fetch list
        const res = await storiesApi.getStories();
        const serverStories: any[] = Array.isArray(res) ? res : [];
        // normalize story URLs, set id from _id, and convert createdAt to numeric timestamp
        const normalized = serverStories.map((s: any) => ({
          ...s,
          id: s.id || s._id || String(s._id || s.id),
          url: makeAbsolute(s.url),
          createdAt: s.createdAt ? new Date(s.createdAt).getTime() : Date.now(),
        }));
        setStories(normalized.filter(isRecent));
      }
    } catch (err) {
      console.error("Story upload failed:", err);
      setError("Failed to upload story — please try again.");
      // remove optimistic preview
      setStories((prev) => prev.filter((p) => p.id !== tmp.id));
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const startEdit = (s: Story) => {
    setEditing(s);
    setEditText(s.text || '');
    setEditFile(null);
  };

  const submitEdit = async () => {
    if (!editing) return;
    try {
      const file = editFile;
      // Note: updateStory doesn't exist in API, using deleteStory + createStory as workaround
      await storiesApi.deleteStory(editing.id);
      if (file) {
        const res = await storiesApi.createStory(file, editText);
        const serverStory: any = res;
        if (serverStory) {
          const storyUrl = makeAbsolute(serverStory.mediaUrl || serverStory.url);
          const normalized = {
            id: serverStory._id || serverStory.id,
            authorId: serverStory.authorId || 'you',
            url: storyUrl,
            type: serverStory.mediaType || serverStory.type || 'image',
            text: serverStory.text,
            createdAt: serverStory.createdAt ? new Date(serverStory.createdAt).getTime() : Date.now(),
          };
          setStories((prev) => [normalized, ...prev.filter((p) => p.id !== editing.id)]);
        }
      } else {
        setStories((prev) => prev.filter((p) => p.id !== editing.id));
      }
      setEditing(null);
    } catch (err) {
      console.error('Edit failed', err);
      setError('Edit failed');
    }
  };

  const confirmDelete = async (s: Story) => {
    if (!confirm('Delete this story?')) return;
    try {
      await storiesApi.deleteStory(s.id);
      setStories((prev) => prev.filter((p) => p.id !== s.id));
      if (active && active.id === s.id) setActive(null);
    } catch (err) {
      console.error('Delete failed', err);
      setError('Delete failed');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex gap-4 overflow-x-auto py-2 pb-4">
        {/* Add bubble (icon only) */}
        <div
          className="flex-shrink-0 w-24 h-36 rounded-2xl bg-white/80 border border-gray-200 flex items-center justify-center p-2 cursor-pointer shadow-sm"
          onClick={openFile}
          aria-label="Add Story"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">+</div>
        </div>

        {/* Error banner (shows when story load/upload fails) */}
        {error && (
          <div className="flex items-center text-red-600 text-sm ml-2">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : (
          stories.map((st) => (
            <div
              key={st.id}
              className="flex-shrink-0 w-24 h-36 rounded-2xl overflow-hidden bg-black cursor-pointer shadow-md"
              onClick={() => setActive(st)}
            >
              {broken[st.id] ? (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-sm">Media unavailable</div>
              ) : st.type === "image" ? (
                <img src={st.url} alt="story" className="w-full h-full object-cover" />
              ) : (
                <video
                  key={st.url}
                  src={st.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                  onError={() => handleVideoError(st.id)}
                />
              )}
              {/* Edit/Delete buttons for own stories (authorId === 'you' in optimistic case) */}
              {st.authorId === 'you' && (
                <div className="absolute top-1 right-1 flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); startEdit(st); }} className="bg-white/20 px-1 py-0.5 rounded text-xs">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); confirmDelete(st); }} className="bg-red-600/20 px-1 py-0.5 rounded text-xs">Delete</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />

      {/* Modal view for active story */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="max-w-4xl w-full rounded-md overflow-hidden bg-black">
            <div className="relative">
              {active.type === "image" ? (
                <img src={active.url} alt="story" className="w-full h-auto max-h-[90vh] object-contain bg-black" />
              ) : broken[active.id] ? (
                <div className="w-full h-[60vh] bg-gray-900 flex items-center justify-center text-white">Media unavailable</div>
              ) : (
                <video
                  key={active.id}
                  src={active.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-auto max-h-[90vh] object-contain bg-black"
                  onError={() => handleVideoError(active.id)}
                />
              )}
              <button
                className="absolute top-3 right-3 bg-white/10 px-3 py-1 rounded text-white"
                onClick={() => setActive(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Story Modal */}
      {editing && (
        <Modal onClose={() => setEditing(null)} title="Edit Story">
          <div className="space-y-4">
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full p-2 rounded bg-white/10" />
            <div className="flex gap-2 items-center">
              <button onClick={() => editFileRef.current?.click()} className="bg-white/10 px-3 py-2 rounded">Replace Media</button>
              <input ref={editFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setEditFile(e.target.files?.[0] || null)} />
              {editFile && <div className="text-sm text-gray-300">{editFile.name}</div>}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="bg-white/5 px-4 py-2 rounded">Cancel</button>
              <button onClick={submitEdit} className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Simple Modal used by this component
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title?: string }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-lg text-white relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">✕</button>
        {title && <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
}
