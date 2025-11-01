export default function FeatureSection() {
  return (
    <section className="bg-gradient-to-b from-blue-300 to-blue-200 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Stay in the Loop, Effortlessly
            </h2>
            <p className="text-gray-700 text-lg mb-8">
              Call out a feature, benefit, or value of your site, then link to a page where people can learn more about it.
            </p>
            <button className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all transform hover:scale-105">
              Call to action
            </button>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-12 shadow-2xl">
              <div className="bg-cyan-400 rounded-2xl p-8 mb-6">
                <div className="bg-white rounded-xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">C</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">CIRCLO</h3>
                  </div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white text-center mb-2">
                CIRCLO: CONNECT<br />EFFORTLESSLY ANYTIME
              </h3>
              <p className="text-white/90 text-center text-sm">
                Experience seamless interaction across devices
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
