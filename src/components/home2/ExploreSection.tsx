// src/components/home2/ExploreSection.tsx

export default function ExploreSection() {
  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6">Explore Trends 🌍</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer"
          >
            <img
              src={`https://source.unsplash.com/random/400x400?sig=${i}&social`}
              alt="Explore"
              className="object-cover w-full h-64 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-semibold text-lg">
              #Trending {i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
