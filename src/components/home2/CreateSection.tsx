// src/components/home2/CreateSection.tsx

export default function CreateSection() {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl border border-gray-200 animate-fadeIn">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        Create a Post ✨
      </h2>
      <form className="space-y-4">
        <textarea
          placeholder="Share your thoughts..."
          className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
        />
        <input type="file" accept="image/*,video/*" className="text-sm block" />
        <button
          type="submit"
          className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
        >
          Post to Circlo
        </button>
      </form>
    </div>
  );
}
