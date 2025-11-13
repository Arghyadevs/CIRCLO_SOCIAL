import { motion } from "framer-motion";

export default function ScrollSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-purple-100 via-indigo-100 to-blue-200 py-24 font-[Outfit]">
      {/* 🌈 Background Glow Blobs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-pink-400 opacity-30 blur-[100px] rounded-full"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-400 opacity-30 blur-[120px] rounded-full"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
        {/* 🎨 GIF Section (no frame behind) */}
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          {/* 🖼️ Your GIF File */}
          <motion.img
            src="/Public/Circlo scroll.gif"
            alt="Circlo Animated GIF"
            className="max-w-full h-auto rounded-2xl drop-shadow-[0_0_30px_rgba(236,72,153,0.4)]"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* 📝 Text Side */}
        <motion.div
          className="text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-snug mb-6">
            Make every scroll <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              worth the vibe.
            </span>
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-10 max-w-md">
            Your story deserves more than just a scroll — turn moments into
            memories, and connections into something real. ✨
          </p>

          <div className="flex flex-wrap gap-4 md:gap-6">
            <button className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform">
              Join the Circle
            </button>
            <button className="px-8 py-3 rounded-full border-2 border-gray-800 text-gray-800 font-semibold hover:bg-gray-800 hover:text-white transition-all">
              Explore More
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
