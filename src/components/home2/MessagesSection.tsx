import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SendHorizonal } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { messagesApi, profilesApi } from "../../utils/api";

export default function MessagesSection() {
  const { user: clerkUser } = useUser();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selected) {
      fetchMessages(selected);
    }
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await messagesApi.getConversations();
      
      // Fetch user data for each conversation partner
      const userIds = data.map((conv: any) => conv._id);
      const userPromises = userIds.map(async (id: string) => {
        try {
          const userData = await profilesApi.getProfile(id);
          return { id, data: userData };
        } catch (err) {
          console.error(`Failed to fetch user ${id}:`, err);
          return { id, data: null };
        }
      });

      const users = await Promise.all(userPromises);
      const newUserCache: Record<string, any> = {};
      users.forEach(({ id, data }) => {
        if (data) newUserCache[id] = data;
      });
      setUserCache(newUserCache);

      setConversations(data);
      if (data.length > 0 && !selected) {
        setSelected(data[0].userId);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const data = await messagesApi.getMessages(userId);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selected) return;

    const optimisticMessage = {
      _id: Date.now().toString(),
      fromId: clerkUser?.id,
      toId: selected,
      text: input,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");

    try {
      const sentMessage = await messagesApi.sendMessage({ toId: selected, text: input });
      // Replace the optimistic message with the real one from the server
      setMessages((prev) =>
        prev.map((m) => (m._id === optimisticMessage._id ? sentMessage : m))
      );
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 font-[Outfit] text-gray-800">
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500 animate-pulse">Loading messages...</div>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto p-4 font-[Outfit] text-gray-800"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-purple-700 tracking-tight">
          Messages 💬
        </h2>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-10 text-center">
          <p className="text-gray-600 text-lg">No conversations yet</p>
          <p className="text-gray-500 text-sm mt-2">Start a conversation by sending a message to someone</p>
        </div>
      </motion.div>
    );
  }

  const selectedUser = selected ? userCache[selected] : null;
  const selectedUsername = selectedUser?.username || selectedUser?.name || 'User';
  const selectedAvatar = selectedUser?.avatarUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${selected}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto p-4 font-[Outfit] text-gray-800"
    >
      <h2 className="text-3xl font-extrabold mb-6 text-purple-700 tracking-tight">
        Messages 💬
      </h2>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row h-[550px]">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 p-4 overflow-y-auto bg-gradient-to-br from-purple-50 to-white">
          {conversations.map((conv) => {
            const user = userCache[conv._id];
            const username = user?.username || user?.name || 'User';
            const avatar = user?.avatarUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${conv._id}`;
            const lastMessage = conv.lastMessage?.text || 'Tap to chat';

            return (
              <div
                key={conv._id}
                onClick={() => setSelected(conv._id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selected === conv._id
                    ? "bg-purple-100 shadow-sm"
                    : "hover:bg-purple-50"
                }`}
              >
                <img
                  src={avatar}
                  alt={username}
                  className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{username}</p>
                  <p className="text-xs text-gray-500 truncate">{lastMessage}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Area */}
        {selected && (
          <div className="flex-1 flex flex-col bg-gray-50">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
              <img
                src={selectedAvatar}
                alt={selectedUsername}
                className="w-10 h-10 rounded-full object-cover"
              />
              <h3 className="text-lg font-semibold text-gray-800">{selectedUsername}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex flex-col space-y-3">
                <AnimatePresence>
                  {messages.map((msg, i) => {
                    const isMe = msg.fromId === clerkUser?.id;
                    return (
                      <motion.div
                        key={msg._id || i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`max-w-[75%] p-3 rounded-2xl ${
                          isMe
                            ? "bg-purple-600 text-white self-end rounded-br-none"
                            : "bg-gray-200 text-gray-800 self-start rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-200 bg-white flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={handleSend}
                className="px-5 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition flex items-center gap-2"
              >
                <SendHorizonal className="w-5 h-5" /> Send
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}