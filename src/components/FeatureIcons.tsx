import { Sparkles, Users, PenTool, MessageCircle, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function FeatureIcons() {
  const features = [
    {
      label: "Vibe",
      icon: Sparkles,
      color: "from-pink-500 to-purple-500",
      animation: { rotate: [0, 10, -10, 0] },
    },
    {
      label: "Connect",
      icon: Users,
      color: "from-indigo-500 to-blue-500",
      animation: { y: [0, -8, 0] },
    },
    {
      label: "Create",
      icon: PenTool,
      color: "from-emerald-500 to-teal-400",
      animation: { scale: [1, 1.15, 1] },
    },
    {
      label: "Chat",
      icon: MessageCircle,
      color: "from-orange-500 to-red-500",
      animation: { rotate: [0, -5, 5, 0] },
    },
    {
      label: "Grow",
      icon: Rocket,
      color: "from-yellow-400 to-orange-400",
      animation: { y: [0, -6, 0] },
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-100 via-blue-100 to-purple-100 py-20 font-poppins">
      {/* 🌈 Background with Infinite Moving Logos */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute top-0 left-0 w-[200%] h-40 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 opacity-20 animate-slide" />

        {/* ✨ Continuous Moving Logo Row */}
        <div className="absolute top-1/3 w-[200%] flex flex-nowrap gap-0 animate-marquee">
          {[...Array(12)].map((_, i) => (
            <img
              key={i}
              src="/Circlo Logo.png"
              alt="Circlo Logo"
              className="w-40 md:w-56 h-auto object-contain brightness-110 drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]"
            />
          ))}
          {[...Array(12)].map((_, i) => (
            <img
              key={`dup-${i}`}
              src="/Circlo Logo.png"
              alt="Circlo Logo"
              className="w-40 md:w-56 h-auto object-contain brightness-110 drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]"
            />
          ))}
        </div>
      </div>

      {/* ✳️ Content Section */}
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <motion.h2
          className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-snug tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Build your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            Circle
          </span>
          , share your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">
            vibe
          </span>
          ,<br />
          and grow your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            tribe.
          </span>
        </motion.h2>

        <motion.p
          className="text-gray-600 text-lg mb-14 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Circlo keeps it real — connect, create, and glow up with the people
          who match your energy. 💫
        </motion.p>

        {/* 💫 Floating Feature Icons */}
        <motion.div
          className="flex justify-center items-center gap-10 md:gap-16 flex-wrap"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.15, duration: 0.6 },
            },
          }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-3 cursor-pointer"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-br ${f.color} rounded-full flex items-center justify-center shadow-xl`}
                  animate={f.animation}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Icon className="w-10 h-10 text-white" />
                </motion.div>
                <span className="text-gray-800 font-bold text-lg tracking-wide">
                  {f.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 🧩 Animations */}
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-slide {
          animation: slide 12s linear infinite;
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </section>
  );
}
