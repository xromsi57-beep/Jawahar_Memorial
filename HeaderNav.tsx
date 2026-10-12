import React from 'react';
import emblemImg from '../assets/images/jawahar_school_emblem_1791825002243.jpg';
import { 
  GraduationCap, 
  UserCheck, 
  Users, 
  ShieldAlert, 
  PhoneCall, 
  FileText,
  MapPin,
  Menu,
  X,
  Trophy
} from 'lucide-react';

interface HeaderNavProps {
  currentView: 'home' | 'teacher' | 'parent' | 'admin' | 'boardResults';
  onViewChange: (view: 'home' | 'teacher' | 'parent' | 'admin' | 'boardResults') => void;
  onOpenAdmission: () => void;
  teacherSession: any;
  parentSession: any;
  onLogout: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  onViewChange,
  onOpenAdmission,
  teacherSession,
  parentSession,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="bg-[#0b2850] text-white sticky top-0 z-40 shadow-md border-b-2 border-[#f4b942]">
      {/* Top institution bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & School Name */}
          <div 
            onClick={() => onViewChange('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <img
              src={emblemImg}
              alt="Jawahar Memorial Emblem"
              referrerPolicy="no-referrer"
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-[#f4b942] bg-white object-cover shadow-xs group-hover:scale-105 transition-transform"
            />
            <div>
              <h1 className="text-base sm:text-xl font-black tracking-tight leading-tight text-white group-hover:text-[#f4b942] transition-colors">
                Jawahar Memorial Sikshansthan
              </h1>
              <div className="text-[11px] sm:text-xs text-blue-200 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-[#f4b942]" />
                <span>मनोता खुर्द (Manota Khurd), झुंझुनूं (Jhunjhunu), राजस्थान</span>
              </div>
            </div>
          </div>

          {/* Direct Portal Switcher Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => onViewChange('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'bg-[#f4b942] text-[#0b2850] shadow-xs'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              मुख्य पृष्ठ (Home)
            </button>

            {/* NEW: Dedicated Board Results (2022-2024) Button */}
            <button
              onClick={() => onViewChange('boardResults')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'boardResults'
                  ? 'bg-[#f4b942] text-[#0b2850] shadow-sm font-extrabold ring-2 ring-white/20'
                  : 'bg-white/10 hover:bg-white/20 text-[#f4b942] border border-[#f4b942]/40'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[#f4b942]" />
              <span>बोर्ड परिणाम (2022-2024)</span>
            </button>

            <button
              onClick={() => onViewChange('teacher')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'teacher'
                  ? 'bg-[#f4b942] text-[#0b2850] shadow-sm font-extrabold ring-2 ring-white/20'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#f4b942]" />
              <span>शिक्षक पोर्टल</span>
              {teacherSession && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
            </button>

            <button
              onClick={() => onViewChange('parent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'parent'
                  ? 'bg-[#f4b942] text-[#0b2850] shadow-sm font-extrabold ring-2 ring-white/20'
                  : 'bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-[#0b2850]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#0b2850]" />
              <span>अभिभावक / छात्र रिजल्ट</span>
              {parentSession && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
            </button>

            <button
              onClick={() => onViewChange('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-[#f4b942] text-[#0b2850]'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>प्रशासन</span>
            </button>

            <button
              onClick={onOpenAdmission}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>प्रवेश आवेदन</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#082040] border-t border-white/10 px-4 py-4 space-y-2">
          <button
            onClick={() => {
              onViewChange('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-white hover:bg-white/10"
          >
            मुख्य पृष्ठ (Home)
          </button>
          <button
            onClick={() => {
              onViewChange('boardResults');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-[#f4b942] hover:bg-white/10 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-[#f4b942]" />
            <span>वार्षिक बोर्ड परिणाम (2022-2024)</span>
          </button>
          <button
            onClick={() => {
              onViewChange('teacher');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-[#f4b942] hover:bg-white/10 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>शिक्षक पोर्टल (GPS Attendance)</span>
            </span>
            {teacherSession && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">लॉगिन</span>}
          </button>
          <button
            onClick={() => {
              onViewChange('parent');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-yellow-300 hover:bg-white/10 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>अभिभावक व छात्र पोर्टल (Results)</span>
            </span>
            {parentSession && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">सक्रिय</span>}
          </button>
          <button
            onClick={() => {
              onViewChange('admin');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-blue-200 hover:bg-white/10 flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>विद्यालय प्रशासन (Admin)</span>
          </button>
          <button
            onClick={() => {
              onOpenAdmission();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white flex items-center gap-2 mt-2"
          >
            <GraduationCap className="w-4 h-4" />
            <span>नवीन प्रवेश पूछताछ Form</span>
          </button>
        </div>
      )}
    </header>
  );
};
