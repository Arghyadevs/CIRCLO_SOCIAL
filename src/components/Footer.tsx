import { Instagram, Linkedin, X } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Namedly</h3>
            <p className="text-gray-600 text-sm mb-6">
              Descriptive line about what your company does.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <X className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Features</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Core features</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Pro experience</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Learn more</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Case studies</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Customer stories</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Forum</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Best practices</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Support</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Legal</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
