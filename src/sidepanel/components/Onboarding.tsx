import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    title: "Welcome to Context Bridge",
    content: "Your external memory for the AI age. Let's show you around.",
  },
  {
    title: "1. Capture",
    content: "Select any text on a webpage. A capture bubble will appear. Click it to save to your Staging Area.",
  },
  {
    title: "2. Organize & Edit",
    content: "Drag clips to reorder. Double-click to edit content. Add tags using the + button.",
  },
  {
    title: "3. Synthesize",
    content: "Select multiple clips using the checkboxes. Then use AI templates to synthesize new content.",
  },
  {
    title: "4. Power Features",
    content: "Use Ctrl+I to open the sidebar. Search your archive. Export to Markdown.",
  }
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
      <AnimatePresence mode='wait'>
        <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center max-w-[280px]"
        >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-2xl">
                {step === 0 ? "👋" : step === 1 ? "✂️" : step === 2 ? "📝" : step === 3 ? "✨" : "🚀"}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{STEPS[step].title}</h2>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">{STEPS[step].content}</p>
        </motion.div>
      </AnimatePresence>
      
      <div className="flex flex-col items-center w-full absolute bottom-10">
        <div className="flex gap-1.5 mb-6">
            {STEPS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
        </div>
      
        <button 
            onClick={handleNext}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
        >
            {step === STEPS.length - 1 ? "Get Started" : "Next"} <ChevronRight size={16} />
        </button>
      </div>
      
      <button onClick={onComplete} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2">
        <X size={20} />
      </button>
    </div>
  );
}
