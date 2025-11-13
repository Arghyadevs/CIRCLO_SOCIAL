import { Instagram, Linkedin, X } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 text-white py-16 font-[Outfit]">
      {/* Soft background glow */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.3),_transparent_70%)]"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Circlo Info */}
          <div>
            <h3 className="text-2xl font-extrabold tracking-wide mb-4 text-white dark:text-white">CIRCLO</h3>
            <p className="text-white/90 dark:text-white/80 text-sm leading-relaxed mb-6">
              The social space where every connection comes full circle. Share your vibe, build your tribe. ✨
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="text-white/70 dark:text-white/60 hover:text-white dark:hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 dark:text-white/60 hover:text-white dark:hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 dark:text-white/60 hover:text-white dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white dark:text-white">Features</h4>
            <ul className="space-y-2 text-white/80 dark:text-white/70">
              <li><a href="#" className="hover:text-white dark:hover:text-white transition-colors">Core features</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-white transition-colors">Pro experience</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-white transition-colors">Integrations</a></li>
            </ul>
          </div>

          {/* Learn More */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white dark:text-white">Learn more</h4>
            <ul className="space-y-2 text-white/80 dark:text-white/70">
              <li><a href="#" className="hover:text-white dark:hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-white transition-colors">Case studies</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-white transition-colors">Tips & resources</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white dark:text-white">Support</h4>
            <ul className="space-y-2 text-white/80 dark:text-white/70">
              <li><a href="#" className="hover:text-white dark:hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white dark:hover:text-white transition-colors">Privacy & Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Divider & Bottom Text */}
        <div className="mt-12 border-t border-white/20 dark:border-white/10 pt-8 text-center text-sm text-white/70 dark:text-white/60">
          © {new Date().getFullYear()} <span className="font-semibold text-white dark:text-white">Circlo</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
