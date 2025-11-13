export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          // Corrected line:
          // 1. Use backgroundImage (camelCase)
          // 2. Use the 'url()' CSS function as a string
          backgroundImage: "url('/Public/Circlo Hero.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-200/30 to-orange-200/30"></div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center z-10 px-4">
          <h1
            className="text-8xl md:text-9xl font-black text-white mb-2 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]"
            style={{
              WebkitTextStroke: "3px rgba(30, 58, 138, 0.8)",
              paintOrder: "stroke fill",
            }}
          >
          </h1>
          <p className="text-3xl md:text-4xl text-white font-bold mb-8 drop-shadow-lg">
          </p>
          <div className="flex gap-4 justify-center mt-44">
          </div>
        </div>
      </div>
    </section>
  );
}