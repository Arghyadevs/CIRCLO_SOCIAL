// src/components/home2/SearchSection.tsx

export default function SearchSection() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200 animate-fadeIn">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Search Circlo 🔍</h2>
      <input
        type="text"
        placeholder="Search for users, posts, or topics..."
        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-purple-500 transition"
      />
      <p className="text-sm text-gray-500 mt-4">
        Try searching for #hashtags, usernames, or interests.
      </p>
    </div>
  );
}
