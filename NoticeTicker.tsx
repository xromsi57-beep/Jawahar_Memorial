import React from 'react';
import { Bell, Sparkles } from 'lucide-react';

export const NoticeTicker: React.FC = () => {
  const notices = [
    'सत्र 2026-27 नवीन प्रवेश प्रारंभ (नर्सरी से 12वीं कला एवं विज्ञान वर्ग)',
    'द्वितीय परख (2nd Mid-term) परीक्षा परिणाम ऑनलाइन पोर्टल पर जारी',
    'शिक्षक दैनिक उपस्थिति GPS जियोफेंस द्वारा प्रातः 08:30 बजे तक अनिवार्य',
    'अभिभावक अपने मोबाइल नंबर से लॉगिन कर बच्चों की रिपोर्ट कार्ड देख सकते हैं',
    'कक्षा 10वीं एवं 12वीं बोर्ड परीक्षार्थियों हेतु विशेष प्रातःकालीन मार्गदर्शन कक्षाएं'
  ];

  return (
    <div className="bg-[#ffcc00] text-[#0b2850] border-b border-[#e6b800] py-2 px-3 sm:px-6 shadow-xs text-xs sm:text-sm font-semibold overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Ticker Title Badge */}
        <div className="bg-[#0b2850] text-[#ffcc00] px-3 py-1 rounded-md text-xs font-bold tracking-wider shrink-0 flex items-center gap-1.5 shadow-xs">
          <Bell className="w-3.5 h-3.5" />
          <span>सूचना / NOTICES</span>
        </div>

        {/* Marquee Ticker */}
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-block animate-marquee hover:pause cursor-pointer text-[#0b2850]">
            {notices.map((notice, idx) => (
              <span key={idx} className="mx-4 inline-flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[#0b2850]" />
                <span>{notice}</span>
                <span className="text-[#0b2850]/40">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
