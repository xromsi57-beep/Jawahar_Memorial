import React from 'react';
import emblemImg from '../assets/images/jawahar_school_emblem_1791825002243.jpg';
import { MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onViewChange: (view: 'home' | 'teacher' | 'parent' | 'admin' | 'boardResults') => void;
  onOpenAdmission: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onViewChange, onOpenAdmission }) => {
  return (
    <footer className="bg-[#0b2850] text-blue-100 border-t-4 border-[#f4b942]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Col 1: School Identity */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={emblemImg}
                alt="Jawahar Memorial Emblem"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full border-2 border-[#f4b942] bg-white object-cover"
              />
              <div>
                <h3 className="text-lg font-black text-white">
                  Jawahar Memorial Sikshansthan
                </h3>
                <div className="text-xs text-[#f4b942] font-semibold">
                  मनोता खुर्द, झुंझुनूं (राजस्थान)
                </div>
              </div>
            </div>

            <p className="text-xs text-blue-200 leading-relaxed max-w-sm">
              ग्रामीण एवं क्षेत्रीय विद्यार्थियों को समर्पित एक अग्रणी शैक्षणिक संस्थान। शिक्षा, संस्कार और अनुशासन के साथ विद्यार्थियों का सर्वांगीण विकास हमारी सर्वोच्च प्राथमिकता है।
            </p>

            <div className="text-xs text-[#ffcc00] flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>मान्यता प्राप्त माध्यमिक शिक्षा बोर्ड राजस्थान</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              त्वरित पोर्टल लिंक्स
            </div>
            <ul className="space-y-2 text-xs text-blue-200">
              <li>
                <button
                  onClick={() => onViewChange('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  मुख्य पृष्ठ (Home)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange('boardResults')}
                  className="hover:text-[#f4b942] transition-colors cursor-pointer font-bold text-[#f4b942]"
                >
                  🏆 बोर्ड परीक्षा परिणाम (2022-2024)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange('teacher')}
                  className="hover:text-[#f4b942] transition-colors cursor-pointer font-semibold"
                >
                  शिक्षक पोर्टल (GPS Attendance)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange('parent')}
                  className="hover:text-[#ffcc00] transition-colors cursor-pointer font-semibold"
                >
                  अभिभावक व छात्र पोर्टल (Results)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange('admin')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  विद्यालय प्रशासन (Admin Console)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmission}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  ऑनलाइन प्रवेश फॉर्म (Admissions)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Address & Contact */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              कार्यालय संपर्क
            </div>
            <div className="space-y-2 text-xs text-blue-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#f4b942] shrink-0 mt-0.5" />
                <span>स्थान: ग्राम - मनोता खुर्द, वाया - खेतड़ी, जिला - झुंझुनूं, राजस्थान - 333001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>फोन: +91 94140 12345, +91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-300 shrink-0" />
                <span>ईमेल: info@jawaharmemorial.edu.in</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300 gap-4">
          <div>
            © 2026 Jawahar Memorial Sikshansthan. समस्त अधिकार सुरक्षित।
          </div>
          <div className="flex items-center gap-2">
            <span>Designed for Jawahar Memorial School Community</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
