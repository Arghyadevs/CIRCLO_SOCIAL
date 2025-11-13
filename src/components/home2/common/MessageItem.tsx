// src/components/home2/common/MessageItem.tsx

interface MessageItemProps {
  message: string;
  isOwn?: boolean;
  timestamp?: string;
}

export default function MessageItem({ message, isOwn, timestamp }: MessageItemProps) {
  return (
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-2 mb-2 text-sm ${
        isOwn
          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white self-end ml-auto"
          : "bg-gray-100 text-gray-800 self-start"
      }`}
    >
      <p>{message}</p>
      {timestamp && (
        <span
          className={`block mt-1 text-[10px] ${
            isOwn ? "text-white/70" : "text-gray-400"
          }`}
        >
          {timestamp}
        </span>
      )}
    </div>
  );
}
