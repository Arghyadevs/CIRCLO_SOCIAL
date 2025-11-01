export default function ScrollSection() {
  return (
    <section className="bg-gradient-to-b from-blue-200 to-blue-300 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 opacity-80"></div>
            <div className="absolute inset-0 backdrop-blur-3xl"></div>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Another scroll-stopper
            </h2>
            <p className="text-gray-700 text-lg mb-8">
              When there's one great thing, there's usually another. What's your second thing to showcase?
            </p>
            <button className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all transform hover:scale-105">
              Another button
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
