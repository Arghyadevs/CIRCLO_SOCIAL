import { motion } from "framer-motion";

export default function FeatureSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#7F00FF] via-[#E100FF] to-[#FF8C00] py-24 overflow-hidden font-[Outfit] text-white">
      {/* 🎨 Background Glow Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* 🌟 Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* 📝 Text Column */}
          <motion.div
            className="space-y-7"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
              Stay{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-400">
                Connected
              </span>
              <br />
              <span className="italic font-extrabold text-white/90">
                Effortlessly. Everywhere.
              </span>
            </h2>

            <p className="text-lg text-white/85 leading-relaxed max-w-lg">
              Circlo isn’t just another app — it’s your vibe hub 💫 where every
              scroll, chat, and post keeps you closer to your people.
            </p>

            <div className="flex flex-wrap gap-5 pt-3">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(255,255,255,0.4)",
                }}
                className="px-8 py-3 bg-white text-purple-700 font-semibold rounded-full shadow-md transition-all"
              >
                Join the Vibe 🚀
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,0.15)",
                }}
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full transition-all"
              >
                Learn More ✨
              </motion.button>
            </div>
          </motion.div>

          {/* 📱 Visual Column — Only Video */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/20 hover:scale-105 transition-transform duration-500">
              <video
                src="/Public/Circlo.mp4" // <-- replace with your actual video path
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-80 md:h-[420px] object-cover"
              />
            </div>

            {/* Floating emojis (optional for fun motion) */}
            <motion.div
              className="absolute -top-6 left-2 text-4xl pointer-events-none"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              💬
            </motion.div>
            <motion.div
              className="absolute -bottom-6 right-4 text-4xl pointer-events-none"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🔥
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
