export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/162031/dubai-tower-arab-khalifa-162031.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-200/40 to-orange-200/40"></div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center z-10 px-4">
          <h1 className="text-8xl md:text-9xl font-black text-white mb-2 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]"
              style={{
                WebkitTextStroke: '3px rgba(30, 58, 138, 0.8)',
                paintOrder: 'stroke fill',
              }}>
            CIRCLO
          </h1>
          <p className="text-3xl md:text-4xl text-white font-bold mb-8 drop-shadow-lg">
            কলকাতা
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-12 drop-shadow-lg leading-tight">
            Where circles connect,<br />stories grow
          </h2>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all transform hover:scale-105">
              Get Started
            </button>
            <button className="px-8 py-3 bg-white/90 text-black rounded-full hover:bg-white transition-all transform hover:scale-105">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
