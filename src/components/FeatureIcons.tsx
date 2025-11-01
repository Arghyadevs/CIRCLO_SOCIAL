import { Circle } from 'lucide-react';

export default function FeatureIcons() {
  const features = [
    'Share',
    'Connect',
    'Chat',
    'Grow',
    'Engage'
  ];

  return (
    <section className="bg-gradient-to-b from-blue-200 to-blue-300 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-3xl md:text-4xl font-black text-pink-600 mb-12 uppercase leading-tight">
          Build your circle, grow your influence, and stay real.<br />
          Circlo makes it easy to share, chat, and connect with<br />
          people who matter
        </h2>
        <div className="flex justify-center gap-12 md:gap-24 flex-wrap">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Circle className="w-8 h-8 text-white" />
              </div>
              <span className="text-blue-900 font-bold text-lg">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
