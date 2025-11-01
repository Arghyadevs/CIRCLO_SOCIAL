import Header from './components/Header';
import Hero from './components/Hero';
import FeatureIcons from './components/FeatureIcons';
import FeatureSection from './components/FeatureSection';
import ScrollSection from './components/ScrollSection';
import TextColumns from './components/TextColumns';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <FeatureIcons />
      <FeatureSection />
      <ScrollSection />
      <TextColumns />
      <Footer />
    </div>
  );
}

export default App;
