import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface ReactionCountProps {
  postId: string;
}

const EMOJIS = ['❤️','😂','😊','😡'] as const;

type Counts = Record<string, number>;

export default function ReactionCount({ postId }: ReactionCountProps) {
  const [counts, setCounts] = useState<Counts>({});
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFirebaseReady(!!u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!firebaseReady) return;
    const col = collection(db, 'posts', postId, 'reactions');
    const unsub = onSnapshot(col, snap => {
      const c: Counts = { '❤️':0, '😂':0, '😊':0, '😡':0 };
      snap.forEach(doc => {
        const d = doc.data() as any;
        if (EMOJIS.includes(d.emoji)) c[d.emoji]++;
      });
      setCounts(c);
    }, (err) => {
      console.warn('ReactionCount listener error', err);
    });
    return unsub;
  }, [postId, firebaseReady]);

  const total = EMOJIS.reduce((s,e)=>s+(counts[e]||0),0);
  if (!total) return null;

  return (
    <div className="flex items-center gap-3 text-sm text-gray-700">
      {EMOJIS.map(e => (
        <span key={e}>{e} {counts[e]||0}</span>
      ))}
    </div>
  );
}
