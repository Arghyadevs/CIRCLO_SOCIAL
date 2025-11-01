import { Circle } from 'lucide-react';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <Circle className="w-6 h-6 text-blue-600 fill-blue-600" />
        <span className="text-xl font-bold text-gray-800">CIRCLO</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
          Signup
        </button>
        <button className="px-6 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors">
          Login
        </button>
      </div>
    </header>
  );
}
