import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface ReactionButtonProps {
  postId: string;
  userId: string; // Clerk user id
}

const EMOJIS = ['❤️','😂','😊','😡'] as const;
export type ReactionEmoji = typeof EMOJIS[number];

interface Burst { id: string; emoji: ReactionEmoji; }

export default function ReactionButton({ postId, userId }: ReactionButtonProps) {
  const [reaction, setReaction] = useState<ReactionEmoji | null>(null);
  const [open, setOpen] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFirebaseReady(!!u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!firebaseReady) return;
    const ref = doc(db, 'posts', postId, 'reactions', userId);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const data = snap.data() as any;
        setReaction(data.emoji as ReactionEmoji);
      } else {
        setReaction(null);
      }
    }, (err) => {
      console.warn('Reaction doc listener error', err);
    });
    return unsub;
  }, [postId, userId, firebaseReady]);

  const setEmoji = async (emoji: ReactionEmoji) => {
    if (!auth.currentUser) {
      console.warn('Skipping reaction, Firebase auth not ready');
      return;
    }
    if (auth.currentUser.uid !== userId) {
      console.warn('Skipping reaction, uid mismatch');
      return;
    }

    if (reaction === emoji) {
      await deleteDoc(doc(db, 'posts', postId, 'reactions', userId));
      setReaction(null);
    } else {
      await setDoc(doc(db, 'posts', postId, 'reactions', userId), { emoji, ts: Date.now() });
      setReaction(emoji);
      // spawn animated burst
      const id = Math.random().toString(36).slice(2);
      setBursts(b => [...b, { id, emoji }]);
      setTimeout(() => setBursts(b => b.filter(x => x.id !== id)), 1200);
    }
    setOpen(false);
  };

  return (
    <div className="relative inline-block" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm relative overflow-visible"
      >
        <span className="text-base">{reaction || 'React'}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 left-0 flex gap-2 bg-white border border-gray-200 rounded-full px-3 py-2 shadow">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`text-lg hover:scale-125 transition ${reaction===e?'':'opacity-80'}`}
              aria-label={`React ${e}`}
            >{e}</button>
          ))}
        </div>
      )}
      {/* Burst graphics */}
      <div className="pointer-events-none absolute inset-0 overflow-visible">
        {bursts.map((b,i) => (
          <span
            key={b.id}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-emoji-burst"
            style={{ animationDelay: `${i*0.05}s` }}
          >{b.emoji}</span>
        ))}
      </div>
      <style>{`
        @keyframes emoji-burst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          10% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          40% { transform: translate(-50%, -80%) scale(1); opacity: 1; }
          70% { transform: translate(-50%, -110%) scale(0.9); opacity: .9; }
          100% { transform: translate(-50%, -140%) scale(0.3); opacity: 0; }
        }
        .animate-emoji-burst { animation: emoji-burst 1.2s ease-out forwards; font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
      `}</style>
    </div>
  );
}
