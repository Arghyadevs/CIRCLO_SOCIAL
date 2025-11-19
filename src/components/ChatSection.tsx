import React, { useEffect, useState, useCallback } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { profilesApi, searchApi } from "../utils/api";

interface ConversationDoc {
  id: string;
  participants: string[]; // [uid1, uid2]
  participantsKey: string; // stable key for the pair
  lastMessageText?: string;
  lastMessageSenderId?: string;
  updatedAt?: { seconds?: number };
}

// New: message type for DM
interface DMMessageDoc {
  id: string;
  text: string;
  fromId: string;
  toId: string;
  participantsKey: string;
  createdAt?: { seconds?: number };
}

// Utility: stable key for a pair of user IDs
const getParticipantsKey = (a: string, b: string) => {
  return [a, b].sort().join("__");
};

interface ResolvedUser { id: string; user?: unknown }

// Resolve a username (with optional leading @) to a user ID via search API (no hooks at module scope)
async function resolveUserIdByUsername(raw: string): Promise<ResolvedUser | null> {
  const handle = raw.trim().replace(/^@/, "");
  if (!handle) return null;
  try {
    const results: unknown = await searchApi.searchUsers(handle);
    const list: unknown[] = Array.isArray(results) ? results : ((results as { users?: unknown[] })?.users || []);
    const normalized = list
      .map((u) => ({
        original: u,
        id: (u as { clerkId?: string; id?: string; _id?: string }).clerkId || (u as { clerkId?: string; id?: string; _id?: string }).id || (u as { clerkId?: string; id?: string; _id?: string })._id,
        username: ((u as { username?: string }).username || "").toLowerCase(),
      }))
      .filter((r) => r.id && typeof r.id === 'string');
    const exact = normalized.find((u) => u.username === handle.toLowerCase());
    const chosen = exact || normalized[0];
    if (chosen?.id && typeof chosen.id === 'string' && chosen.id.startsWith('user_')) {
      return { id: chosen.id, user: chosen.original };
    }
  } catch (e) {
    console.warn("Username lookup failed", e);
  }
  return null;
}

type Props = { initialPartnerId?: string };

export default function ChatSection({ initialPartnerId }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [conversations, setConversations] = useState<ConversationDoc[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DMMessageDoc[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newPartnerInput, setNewPartnerInput] = useState("");
  const [userCache, setUserCache] = useState<Record<string, any>>({});

  // New: username suggestions state
  const [suggestions, setSuggestions] = useState<Array<{ id: string; username: string; name?: string; avatarUrl?: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseReady(!!u);
      setCurrentUserId(u?.uid ?? null);
    });
    return () => unsub();
  }, []);

  // Listen to conversations involving current user
  useEffect(() => {
    if (!currentUserId || !firebaseReady) return;
    
    // Fetch current user profile on auth
    (async () => {
      try {
        const myProfile = await profilesApi.getProfile(currentUserId);
        setUserCache((prev) => ({ ...prev, [currentUserId]: myProfile }));
      } catch (e) {
        console.warn('Failed to fetch current user profile:', e);
      }
    })();
    
    const convRef = collection(db, "dmConversations");
    const qConv = query(convRef, where("participants", "array-contains", currentUserId));
    const unsub = onSnapshot(qConv, (snap) => {
      const data: ConversationDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      // Sort by updatedAt desc
      data.sort((a, b) => {
        const ta = a.updatedAt?.seconds || 0;
        const tb = b.updatedAt?.seconds || 0;
        return tb - ta;
      });
      setConversations(data);
      // Auto-select first if none selected
      if (!selectedPartnerId && data.length > 0) {
        const partner = data[0].participants.find((p) => p !== currentUserId) || null;
        setSelectedPartnerId(partner);
      }
      // Prefetch partner profiles by ID for display names
      const partnerIds = Array.from(
        new Set(
          data
            .map((c) => c.participants.find((p) => p !== currentUserId))
            .filter(Boolean) as string[]
        )
      ).filter((id) => !userCache[id]);
      if (partnerIds.length) {
        Promise.all(
          partnerIds.map(async (id) => {
            try {
              const u = await profilesApi.getProfile(id);
              return { id, u };
            } catch {
              return { id, u: null };
            }
          })
        ).then((arr) => {
          const next = { ...userCache };
          arr.forEach(({ id, u }) => {
            if (u) next[id] = u;
          });
          setUserCache(next);
        });
      }
    }, (err) => {
      console.error('❌ Conversations listener error:', err);
      console.error('This is likely a Firestore security rules issue. Check FIRESTORE_RULES_FIX.md for the solution.');
    });
    return () => unsub();
  }, [currentUserId, selectedPartnerId, userCache, firebaseReady]);

  // New: messages listener for selected conversation
  useEffect(() => {
    if (!currentUserId || !selectedPartnerId || !firebaseReady) return;
    const key = getParticipantsKey(currentUserId, selectedPartnerId);
    const msgsRef = collection(db, "dmMessages");
    const qMsgs = query(msgsRef, where("participantsKey", "==", key), orderBy("createdAt", 'asc'));
    const unsub = onSnapshot(qMsgs, (snap) => {
      const data: DMMessageDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setMessages(data);
    }, (err) => {
      console.error('❌ Messages listener error:', err);
      console.error('This is likely a Firestore security rules or index issue. Check FIRESTORE_RULES_FIX.md');
      // If Firestore asks for an index, check err.message for a link
      if (err.message?.includes('index')) {
        console.error('Index creation required. Check the error message for the index creation link.');
      }
    });
    return () => unsub();
  }, [currentUserId, selectedPartnerId, firebaseReady]);

  // Helper: normalize search results (prefer Clerk IDs)
  const normalizeUsers = (results: unknown): { id: string; username: string; name?: string; avatarUrl?: string }[] => {
    const list: unknown[] = Array.isArray(results) ? results : ((results as { users?: unknown[] })?.users || []);
    const mapped = list
      .map((u) => ({
        id: (u as { clerkId?: string; id?: string; _id?: string }).clerkId || (u as { clerkId?: string; id?: string; _id?: string }).id || (u as { clerkId?: string; id?: string; _id?: string })._id || "",
        username: (u as { username?: string; handle?: string }).username || (u as { username?: string; handle?: string }).handle || "",
        name: (u as { name?: string; fullName?: string }).name || (u as { name?: string; fullName?: string }).fullName || "",
        avatarUrl: (u as { avatarUrl?: string; imageUrl?: string; photoURL?: string }).avatarUrl || (u as { avatarUrl?: string; imageUrl?: string; photoURL?: string }).imageUrl || (u as { avatarUrl?: string; imageUrl?: string; photoURL?: string }).photoURL || "",
      }));
    return mapped.filter((u) => typeof u.id === 'string' && u.id.startsWith('user_') && (Boolean(u.username) || Boolean(u.name)));
  };

  // Debounced username search
  useEffect(() => {
    const raw = newPartnerInput.trim().replace(/^@/, "");
    if (!raw) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    let alive = true;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await searchApi.searchUsers(raw);
        if (!alive) return;
        const list = normalizeUsers(res);
        setSuggestions(list.slice(0, 8));
        setShowSuggestions(true);
      } catch (e) {
        if (!alive) return;
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        if (alive) setSearching(false);
      }
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [newPartnerInput]);

  // Start conversation directly by userId (used when clicking a suggestion)
  const startConversationWithId = useCallback(async (partnerId: string) => {
    if (!currentUserId || !partnerId) return;
    if (partnerId === currentUserId) {
      alert("You can't message yourself. Try adding a personal note in your profile instead!");
      return;
    }
    if (!partnerId.startsWith('user_')) {
      console.warn('Invalid partner id for chat (expecting Clerk/Firebase UID starting with user_):', partnerId);
      return;
    }
    const key = getParticipantsKey(currentUserId, partnerId);
    const convDocRef = doc(db, "dmConversations", key);
    const existing = await getDoc(convDocRef);
    if (!existing.exists()) {
      await setDoc(convDocRef, {
        participantsKey: key,
        participants: [currentUserId, partnerId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    setSelectedPartnerId(partnerId);
    setNewPartnerInput("");
    setShowSuggestions(false);
  }, [currentUserId]);

  // Auto-start/select when initialPartnerId is provided
  useEffect(() => {
    if (initialPartnerId && typeof initialPartnerId === 'string' && initialPartnerId.startsWith('user_')) {
      startConversationWithId(initialPartnerId);
    }
  }, [initialPartnerId, startConversationWithId]);

  const startConversation = useCallback(async () => {
    if (!currentUserId || !newPartnerInput.trim()) return;

    let partnerId = newPartnerInput.trim();
    if (!partnerId.startsWith("user_")) {
      const resolved = await resolveUserIdByUsername(partnerId);
      if (!resolved || !resolved.id?.startsWith('user_')) {
        alert("User not found or invalid ID");
        return;
      }
      partnerId = resolved.id;
      if (resolved.user) {
        setUserCache((prev) => ({ ...prev, [partnerId]: resolved.user }));
      }
    }

    if (partnerId === currentUserId) {
      alert("You can't message yourself. Try adding a personal note in your profile instead!");
      return;
    }
    
    const key = getParticipantsKey(currentUserId, partnerId);
    const convDocRef = doc(db, "dmConversations", key);
    const existing = await getDoc(convDocRef);
    if (!existing.exists()) {
      await setDoc(convDocRef, {
        participantsKey: key,
        participants: [currentUserId, partnerId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    setSelectedPartnerId(partnerId);
    setNewPartnerInput("");
  }, [currentUserId, newPartnerInput, resolveUserIdByUsername]);

  // Ensure conversation exists before sending a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !selectedPartnerId || !newMessage.trim() || !firebaseReady) return;
    const key = getParticipantsKey(currentUserId, selectedPartnerId);

    const convDocRef = doc(db, "dmConversations", key);
    await setDoc(
      convDocRef,
      {
        participantsKey: key,
        participants: [currentUserId, selectedPartnerId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(collection(db, "dmMessages"), {
      text: newMessage.trim(),
      fromId: currentUserId,
      toId: selectedPartnerId,
      participantsKey: key,
      createdAt: serverTimestamp(),
    });

    await setDoc(
      convDocRef,
      {
        lastMessageText: newMessage.trim(),
        lastMessageSenderId: currentUserId,
        updatedAt: serverTimestamp(),
        participants: [currentUserId, selectedPartnerId],
      },
      { merge: true }
    );

    setNewMessage("");
  };

  // Derive a display name for a partner
  const displayName = (partnerId?: string | null) => {
    if (!partnerId) return "Unknown";
    const u = userCache[partnerId];
    return u?.username || u?.name || partnerId;
  };

  if (!currentUserId) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-2">Direct Messages</h2>
        <p className="text-sm text-gray-500">Sign in to use messaging.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl flex flex-col md:flex-row gap-6 animate-fadeIn">
      {/* Conversations List */}
      <div className="md:w-1/3 bg-white/80 backdrop-blur rounded-2xl shadow border border-gray-200 p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-3">Conversations</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startConversation();
          }}
          className="mb-4"
        >
          <div className="relative flex gap-2">
            <input
              value={newPartnerInput}
              onChange={(e) => setNewPartnerInput(e.target.value)}
              onFocus={() => suggestions.length && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search @username or paste user ID"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
              disabled={!newPartnerInput.trim() || searching}
            >
              {searching ? "..." : "Start"}
            </button>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-20 top-10 z-30 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => startConversationWithId(s.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-purple-50 text-left"
                  >
                    <img
                      src={s.avatarUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${s.id}`}
                      alt={s.username || s.name || s.id}
                      className="w-6 h-6 rounded-full border border-gray-200 object-cover"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate">{s.username || s.name}</span>
                      {s.name && s.username && (
                        <span className="text-xs text-gray-500 truncate">{s.name}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {conversations.length === 0 && (
            <div className="text-xs text-gray-500">No conversations yet.</div>
          )}
          {conversations.map((c) => {
            const partner = c.participants.find((p) => p !== currentUserId) || currentUserId || "Unknown";
            const active = partner === selectedPartnerId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedPartnerId(partner)}
                className={`w-full text-left p-3 rounded-xl text-sm transition border flex flex-col gap-0.5 ${
                  active
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white hover:bg-purple-50 border-gray-200"
                }`}
              >
                <span className="font-semibold truncate">{displayName(partner)}</span>
                {c.lastMessageText && (
                  <span className={`truncate ${active ? "text-purple-100" : "text-gray-500"}`}>
                    {c.lastMessageSenderId === currentUserId ? "You: " : ""}
                    {c.lastMessageText}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Panel */}
      <div className="flex-1 bg-white/80 backdrop-blur rounded-2xl shadow border border-gray-200 flex flex-col p-4">
        {selectedPartnerId ? (
          <>
            <div className="pb-3 border-b border-gray-200 mb-4">
              <h2 className="font-bold text-lg">Chat with {displayName(selectedPartnerId)}</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((m) => {
                const mine = m.fromId === currentUserId;
                const senderName = displayName(m.fromId);
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[75%]`}>
                      <div className={`text-xs font-semibold mb-1 ${mine ? "text-right text-purple-600" : "text-left text-gray-600"}`}>
                        {senderName}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-2xl text-sm ${
                          mine
                            ? "bg-purple-600 text-white rounded-br-sm"
                            : "bg-gray-200 text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="text-xs text-gray-500">No messages yet. Say hi 👋</div>
              )}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 mt-auto">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-5 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-sm text-gray-500">
            Select or start a conversation.
          </div>
        )}
      </div>
    </div>
  );
}
