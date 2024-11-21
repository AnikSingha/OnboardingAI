import React, { useState } from 'react';
import Header from './Header';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ number, question, answer, isOpen, toggleOpen }) => {
  return (
    <div 
      className={`mb-4 rounded-lg overflow-hidden transition-all duration-300 ${
        isOpen ? 'bg-purple-100' : 'bg-purple-50 hover:bg-purple-100'
      }`}
    >
      <button
        className="flex justify-between items-center w-full py-5 px-6 text-left"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <span className="text-3xl font-light text-purple-400 mr-4">{number.padStart(2, '0')}</span>
          <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        </div>
        {isOpen ? <Minus className="flex-shrink-0 ml-2 text-purple-500" /> : <Plus className="flex-shrink-0 ml-2 text-purple-500" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-5">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does OnboardAI improve the onboarding process for new employees or clients?",
      answer: "OnboardAI streamlines onboarding by automating workflows, providing tailored resources, and offering personalized guidance, which reduces manual tasks and accelerates the adaptation process for new users."
    },
    {
      question: "What kind of data security measures does OnboardAI implement?",
      answer: "OnboardAI prioritizes data security by implementing industry-standard encryption, secure user authentication, and regular compliance checks to protect sensitive information throughout the onboarding process."
    },
    {
      question: "Is OnboardAI customizable for different types of businesses or industries?",
      answer: "Yes, OnboardAI is highly customizable. It allows businesses to tailor onboarding flows, content, and resources to align with their unique brand, industry standards, and compliance requirements."
    },
    {
      question: "How easy is it to integrate OnboardAI with existing systems and software?",
      answer: "OnboardAI offers seamless integrations with various platforms through APIs and pre-built connectors, making it easy to connect with your current CRM, HR, and project management tools without extensive development work."
    }
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#E6E6FA]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              number={`${index + 1}`}
              question={faq.question}
              answer={faq.answer}
              isOpen={index === openIndex}
              toggleOpen={() => toggleQuestion(index)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default FAQPage;