import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import IntroAnimation from './components/IntroAnimation';
import Chat from './components/Chat';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import VisualSection from './components/VisualSection';
import UseCases from './components/UseCases';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

function App() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // If we want to skip the animation during development
    // setShowAnimation(false);
    // setShowContent(true);

    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  return (
    <div className="bg-[#F6F5EE] min-h-screen">
      {showAnimation && (
        <IntroAnimation onComplete={handleAnimationComplete} />
      )}
      
      {isLoggedIn ? (
        <Chat />
      ) : (
        <div
        className={`transition-opacity duration-700 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        >
        <Header />
        <main>
          <Hero />
          <Features />
          <VisualSection />
          <UseCases />
          <CallToAction />
        </main>
        <Footer />
        </div>
      )}
    </div>
  );
}

export default App;