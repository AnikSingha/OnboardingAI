export const mockCalls = [
  { 
    id: 1, 
    contact: "John Doe", 
    date: "2024-03-15", 
    time: "14:30", 
    duration: "5:23", 
    outcome: "Appointment Scheduled",
    audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav", // Example public audio file
    transcript: [
      { time: "0:00", speaker: "AI", text: "Hello, this is Alex from OnboardAI. Am I speaking with John Doe?" },
      { time: "0:04", speaker: "Customer", text: "Yes, this is John." },
      { time: "0:06", speaker: "AI", text: "Great! I'm calling about your recent inquiry regarding our business automation services. Do you have a few minutes to discuss how we can help streamline your operations?" },
      { time: "0:15", speaker: "Customer", text: "Yes, I've been looking for solutions to automate our customer outreach." },
      { time: "0:22", speaker: "AI", text: "Perfect! Based on your business needs, I'd recommend our Professional plan which includes automated call scheduling and custom AI scripts. Would you like me to explain the key features?" }
    ],
    analytics: {
      sentiment: "Positive",
      keyTopics: ["Automation", "Customer Outreach", "Pricing"],
      customerEngagement: 85,
      callQuality: 92
    },
    notes: [
      { timestamp: "14:32", text: "Customer showed strong interest in automation features" },
      { timestamp: "14:35", text: "Discussed Professional plan pricing and benefits" },
      { timestamp: "14:38", text: "Follow-up scheduled for next week to demo the platform" }
    ]
  },
  // Add more mock calls as needed
];
