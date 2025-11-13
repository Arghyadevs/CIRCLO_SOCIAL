import { useState } from "react";
import { Share2, Link, Copy, Send, X } from "lucide-react";

export default function ShareMenu({ postUrl }: { postUrl: string }) {
  const [open, setOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(postUrl);
    alert("Post link copied!");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition"
      >
        <Share2 size={18} /> Share
      </button>

      {open && (
        <div className="absolute top-8 right-0 bg-white shadow-lg rounded-xl border border-gray-200 w-44 p-2 animate-fadeIn z-40">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
            onClick={() => setOpen(false)}
          >
            <X size={14} />
          </button>

          <div className="flex flex-col gap-2 mt-4">
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
              <Send size={16} /> Share to Circlo
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <Copy size={16} /> Copy Link
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
              <Link size={16} /> Open in Browser
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
