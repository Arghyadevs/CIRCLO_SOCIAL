import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function TextColumns() {
  const columns = [
    {
      title: "Create",
      content:
        "Turn your ideas into something real. Share your vibe, post your thoughts, and make your presence felt — one story at a time.",
      color: "from-pink-500 to-purple-500",
    },
    {
      title: "Connect",
      content:
        "Find your people. Build meaningful connections through creativity, conversations, and shared interests.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      title: "Grow",
      content:
        "Every post, chat, and reaction brings new energy. Keep expanding your circle and evolving with the community.",
      color: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-blue-100 to-purple-100 py-24 font-poppins">
      {/* Decorative blurred circles */}
      <div className="absolute -top-20 left-0 w-64 h-64 bg-pink-300 opacity-25 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400 opacity-20 blur-3xl rounded-full"></div>

      {/* Decorative Circlo SVG (subtle background design) */}
      <img
        src="/Public/Circlo Logo.svg"
        alt="Circlo design"
        className="absolute top-8 left-1/2 -translate-x-1/2 w-36 opacity-10 pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center mb-16">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600">
            Create. Connect. Grow.
          </span>
        </motion.h2>
        <motion.p
          className="text-gray-600 text-lg mt-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          The Circlo way — a space built for creators, dreamers, and doers to
          thrive together. ✨
        </motion.p>
      </div>

      {/* Columns Grid */}
      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        {columns.map((column, index) => (
          <motion.div
            key={index}
            className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-[1.03] border border-white/20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
          >
            {/* Accent gradient bar */}
            <div
              className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${column.color} rounded-t-3xl`}
            ></div>

            <div className="flex items-center justify-center mb-5">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${column.color} rounded-full flex items-center justify-center shadow-md`}
              >
                <Sparkles className="text-white w-6 h-6" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {column.title}
            </h3>
            <p className="text-gray-700 leading-relaxed text-base">
              {column.content}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
