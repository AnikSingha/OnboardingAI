import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

export default function LandingPage() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        setLocalLoading(false);
      }
    }
  }, [isAuthenticated, loading, navigate]);

  if (localLoading || loading) {
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
