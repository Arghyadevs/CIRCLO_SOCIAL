import { useState, useRef, useEffect } from "react";
import {
  Heart,
  Laugh,
  Angry,
  Smile,
} from "lucide-react";
import { reactionsApi } from "../../../utils/api";

const emojis = [
  { name: '😂', icon: <Laugh size={18} /> },
  { name: '😡', icon: <Angry size={18} /> },
  { name: '❤️', icon: <Heart size={18} /> },
  { name: '😊', icon: <Smile size={18} /> },
];

// Map server reaction types <-> emoji
const typeToEmoji: Record<string, string> = { laugh: '😂', angry: '😡', love: '❤️', smile: '😊' };

interface ReactionBarProps {
  postId: string;
  initialCount?: number;
  initialReaction?: string | null;
}

export default function ReactionBar({
  postId,
  initialCount = 0,
  initialReaction = null,
}: ReactionBarProps) {
  const [selected, setSelected] = useState<string | null>(initialReaction);
  const [showPicker, setShowPicker] = useState(false);
  const [count, setCount] = useState(initialCount);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize from server if no initialReaction provided
  useEffect(() => {
    let active = true;
    if (initialReaction == null) {
      reactionsApi
        .checkLike(postId)
        .then((res) => {
          if (!active) return;
          if (res?.isLiked && res?.type && typeToEmoji[res.type]) {
            setSelected(typeToEmoji[res.type]);
          } else {
            setSelected(null);
          }
        })
        .catch(() => {/* ignore */});
    }
    return () => { active = false; };
  }, [postId, initialReaction]);

  const handleReaction = async (emoji: string) => {
    const wasSelected = selected === emoji;
    const newSelected = wasSelected ? null : emoji;
    const newCount = wasSelected ? count - 1 : (selected ? count : count + 1);
    setSelected(newSelected);
    setCount(newCount);
    setShowPicker(false);
    try {
      const res = await reactionsApi.toggleReaction(postId, emoji as any);
      // Update count from server response to ensure consistency
      if (typeof res.likeCount === 'number') setCount(res.likeCount);
    } catch (err) {
      console.error('Error toggling reaction:', err);
      setSelected(selected);
      setCount(count);
    }
  };

  const handleMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setShowPicker(true);
  };

  const handleMouseLeave = () => {
    hideTimeout.current = setTimeout(() => setShowPicker(false), 150);
  };

  return (
    <div className="relative inline-flex items-center gap-2 text-gray-600">
      {/* Main Like Button */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        <button
          className={`flex items-center gap-1 hover:text-pink-500 transition ${
            selected ? "text-pink-600" : ""
          }`}
        >
          <Heart
            size={18}
            className={`transition-transform ${
              selected ? 'fill-pink-500' : ''
            }`}
          />
          {count}
        </button>

        {/* Emoji Picker */}
        {showPicker && (
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute bottom-8 left-0 bg-white shadow-lg rounded-full flex gap-3 px-3 py-2 border border-gray-200 animate-fadeIn z-50"
          >
            {emojis.map((e) => (
              <button
                key={e.name}
                onClick={() => handleReaction(e.name)}
                className="hover:scale-125 transition"
                title={e.name}
              >
                {e.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
