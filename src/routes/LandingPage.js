import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection.js';
import CTASection from '../components/CTASection.js';
import Footer from '../components/Footer.js';
import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'


export default function LandingPage() {

  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    console.log(isAuthenticated)
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate]);

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