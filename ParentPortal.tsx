import React, { useState } from 'react';
import { Student, TermResult } from '../types';
import { 
  Users, 
  Phone, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  BookOpen, 
  FileText, 
  Printer, 
  Sparkles, 
  User, 
  LogOut, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  GraduationCap,
  RefreshCw
} from 'lucide-react';

interface ParentPortalProps {
  parentSession: { phone: string; children: Student[] } | null;
  onLoginSuccess: (phone: string, children: Student[]) => void;
  onLogout: () => void;
  onPrintReportCard: (student: Student, term: TermResult) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  parentSession,
  onLoginSuccess,
  onLogout,
  onPrintReportCard
}) => {
  const [phone, setPhone] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selected child index when multi-child parent logs in
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  // View mode: 'child_selection' (shows all children first) or 'child_detail' (detailed results of selected child)
  const [parentViewMode, setParentViewMode] = useState<'child_selection' | 'child_detail'>('child_selection');

  // Exam result tab: 'first_midterm' | 'second_midterm' | 'half_yearly'
  const [selectedExamTerm, setSelectedExamTerm] = useState<'first_midterm' | 'second_midterm' | 'half_yearly'>('first_midterm');

  const handleRefreshLive = async () => {
    if (!parentSession) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/parent/refresh/${parentSession.phone}`);
      const data = await res.json();
      if (data.success && data.children) {
        onLoginSuccess(parentSession.phone, data.children);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getClassTeacherInfo = (className: string) => {
    if (className.includes('10th')) return { name: 'Mr. Rajesh Kumar', designation: 'वरिष्ठ गणित अध्यापक', phone: '9829033445' };
    if (className.includes('8th')) return { name: 'Mr. Suresh Choudhary', designation: 'विज्ञान विशेषज्ञ', phone: '9672055667' };
    if (className.includes('12th')) return { name: 'Mrs. Priya Sharma', designation: 'व्याख्याता अंग्रेजी', phone: '9784044556' };
    if (className.includes('6th')) return { name: 'Mrs. Sunita Saini', designation: 'हिंदी/संस्कृत शिक्षिका', phone: '9587066778' };
    if (className.includes('9th')) return { name: 'Mr. Amit Verma', designation: 'सामाजिक विज्ञान शिक्षक', phone: '9460077889' };
    return { name: 'नियुक्त कक्षाध्यापक', designation: 'वरिष्ठ अध्यापक', phone: '9414011223' };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setLoginError('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/parent-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || 'लॉगिन विफल।');
        return;
      }

      onLoginSuccess(data.parentPhone, data.children);
      setSelectedChildIndex(0);
      setParentViewMode('child_selection');
    } catch (err) {
      console.error(err);
      setLoginError('सर्वर से संपर्क करने में असमर्थ।');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAutofill = (testPhone: string) => {
    setPhone(testPhone);
    setLoginError(null);
  };

  // ------------------- VIEW 1: PARENT LOGIN FORM -------------------
  if (!parentSession) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-md p-6 sm:p-10 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#ffcc00] text-[#0b2850] flex items-center justify-center text-2xl mx-auto shadow-sm">
              👨‍👩‍👧
            </div>
            <h2 className="text-2xl font-black text-neutral-900">
              अभिभावक एवं छात्र पोर्टल (Parent & Student Portal)
            </h2>
            <p className="text-xs text-neutral-600">
              विद्यालय में पंजीकृत अपना 10-अंकीय मोबाइल नंबर दर्ज कर अपने बच्चे का स्टेटस देखें।
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-800">
                पंजीकृत मोबाइल नंबर (Registered Mobile Number)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-neutral-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="उदा. 9876543210"
                  className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-base font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#0b2850] focus:bg-white tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading || phone.length < 10}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                phone.length < 10 || loginLoading
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-[#0b2850] hover:bg-[#082040] text-white active:scale-98'
              }`}
            >
              <Search className="w-4 h-4 text-[#f4b942]" />
              <span>छात्र प्रोफाइल व परिणाम देखें (Login)</span>
            </button>
          </form>

          {/* Multi-child Demo Accounts for Easy Testing */}
          <div className="p-4 rounded-2xl bg-[#f4f7fc] border border-blue-100 text-xs space-y-2">
            <div className="font-bold text-[#0b2850] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#f4b942]" />
              <span>परीक्षण हेतु बहु-संतान (Multi-Child) अभिभावक डेमो नंबर:</span>
            </div>
            
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleAutofill('9876543210')}
                className="w-full p-3 text-left bg-white rounded-xl border border-neutral-200 hover:border-blue-400 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-neutral-900 group-hover:text-[#0b2850]">
                    अभिभावक: श्री संजय जिंदर (2 बच्चे नामांकित)
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    9876543210
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-2">
                  <span>1. राहुल (10th-A)</span>
                  <span>·</span>
                  <span>2. अंजलि (8th-B)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAutofill('9414012345')}
                className="w-full p-3 text-left bg-white rounded-xl border border-neutral-200 hover:border-blue-400 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-neutral-900 group-hover:text-[#0b2850]">
                    अभिभावक: श्री रामनिवास सैनी (2 बच्चे नामांकित)
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    9414012345
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-2">
                  <span>1. अमित (12th-Science)</span>
                  <span>·</span>
                  <span>2. रोहित (6th-A)</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ------------------- VIEW 2: AUTHENTICATED PARENT & STUDENT DASHBOARD -------------------
  const children = parentSession.children;
  const currentStudent = children[selectedChildIndex] || children[0];
  const hasMultipleChildren = children.length > 1;

  // Active exam term
  let activeTermData: TermResult = currentStudent?.results?.firstMidterm || ({} as any);
  if (selectedExamTerm === 'second_midterm' && currentStudent?.results?.secondMidterm) {
    activeTermData = currentStudent.results.secondMidterm;
  } else if (selectedExamTerm === 'half_yearly' && currentStudent?.results?.halfYearly) {
    activeTermData = currentStudent.results.halfYearly;
  }

  // 2A: DEDICATED CHILD SELECTION SCREEN (जब अभिभावक नंबर से लॉगिन करे तो बच्चों के नाम व कार्ड दिखें)
  if (parentViewMode === 'child_selection') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
        {/* Parent Welcome Bar */}
        <div className="bg-[#0b2850] text-white rounded-3xl p-6 sm:p-8 shadow-md border-b-4 border-[#ffcc00] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#ffcc00] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>अभिभावक पोर्टल (Parent Mobile: +91 {parentSession.phone})</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                श्री {children[0]?.fatherName || 'अभिभावक'}
              </h2>
              <div className="text-xs text-blue-200 mt-1">
                माता: {children[0]?.motherName} · निवास: {children[0]?.address}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshLive}
                disabled={isRefreshing}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#ffcc00] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>ताज़ा करें (Refresh)</span>
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>लॉगआउट</span>
              </button>
            </div>
          </div>
        </div>

        {/* Children List Showcase */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-neutral-200 space-y-6">
          <div className="border-b border-neutral-100 pb-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#ffcc00] text-[#0b2850] flex items-center justify-center font-black text-xs shadow-xs">
                ★
              </span>
              <h3 className="font-black text-xl text-neutral-900">
                आपके नामांकित बच्चे ({children.length} Students Registered)
              </h3>
            </div>
            <p className="text-xs text-neutral-600">
              इस मोबाइल नंबर से पंजीकृत विद्यार्थी नीचे प्रदर्शित हैं। जिस बच्चे का स्टेटस, परीक्षा परिणाम व दैनिक उपस्थिति देखनी है, उसके नाम पर क्लिक करें:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children.map((child, idx) => {
              const todayStr = new Date().toISOString().split('T')[0];
              const todayLog = child.attendanceStats.recentLog.find((l) => l.date === todayStr) || child.attendanceStats.recentLog[0];
              const isPresentToday = todayLog?.status === 'present';

              return (
                <div
                  key={child.id}
                  onClick={() => {
                    setSelectedChildIndex(idx);
                    setParentViewMode('child_detail');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-6 rounded-2xl border-2 border-neutral-200 hover:border-[#0b2850] bg-neutral-50/60 hover:bg-white hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-5 relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#0b2850] text-[#f4b942] border-2 border-[#ffcc00] flex items-center justify-center text-3xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                      {child.avatar || '👨‍🎓'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#0b2850] bg-[#ffcc00]/30 px-2.5 py-0.5 rounded-full border border-[#ffcc00]">
                          {child.class}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500 font-bold">
                          रोल नं: {child.rollNo}
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-neutral-900 mt-1.5 group-hover:text-[#0b2850] transition-colors">
                        {child.name}
                      </h4>

                      <div className="text-xs text-neutral-500 mt-0.5">
                        प्रवेश क्रमांक: {child.admissionNo} · माता: {child.motherName}
                      </div>
                    </div>
                  </div>

                  {/* Summary metrics for this child */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-200 text-center">
                    <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                      <div className="text-[10px] text-neutral-500 font-bold">कुल उपस्थिति</div>
                      <div className="text-sm font-black text-emerald-700 font-mono">
                        {child.attendanceStats.percentage}%
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                      <div className="text-[10px] text-neutral-500 font-bold">1st Midterm</div>
                      <div className="text-sm font-black text-[#0b2850] font-mono">
                        {child.results.firstMidterm.percentage}%
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                      <div className="text-[10px] text-neutral-500 font-bold">2nd Midterm</div>
                      <div className="text-sm font-black text-[#0b2850] font-mono">
                        {child.results.secondMidterm.percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Click CTA button */}
                  <div>
                    <button
                      type="button"
                      className="w-full py-3 px-4 rounded-xl bg-[#0b2850] group-hover:bg-[#082040] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ffcc00]" />
                      <span>{child.name.split(' ')[0]} का परिणाम व उपस्थिति देखें (Click to View)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#ffcc00] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2B: CHILD DETAILED DASHBOARD VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: Parent Welcome, Back to Children Button & Multi-Child Switcher */}
      <div className="bg-[#0b2850] text-white rounded-3xl p-6 sm:p-8 shadow-md border-b-4 border-[#ffcc00] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={() => setParentViewMode('child_selection')}
                className="px-3.5 py-1.5 rounded-xl bg-[#ffcc00] hover:bg-[#e6b800] text-[#0b2850] font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-[#0b2850]" />
                <span>← वापस सभी बच्चे देखें ({children.length} बच्चे)</span>
              </button>
            </div>
            <div className="text-xs text-[#ffcc00] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>अभिभावक डैशबोर्ड (Parent Mobile: {parentSession.phone})</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {currentStudent.fatherName}
            </h2>
            <div className="text-xs text-blue-200">
              माता का नाम: {currentStudent.motherName} · पता: {currentStudent.address}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshLive}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#ffcc00] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>ताज़ा करें (Live Refresh)</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* MULTI-CHILD SELECTION TABS (एक से अधिक बच्चे होने पर सीधे टॉगल करें) */}
        {hasMultipleChildren ? (
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#ffcc00] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>आपके {children.length} बच्चे नामांकित हैं — जिस बच्चे का स्टेटस देखना है उस पर क्लिक करें:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {children.map((child, idx) => {
                const isSelected = idx === selectedChildIndex;
                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildIndex(idx)}
                    className={`p-4 rounded-2xl text-left transition-all border cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-[#ffcc00] text-[#0b2850] border-white shadow-md scale-102 font-bold ring-4 ring-white/20'
                        : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <span className="text-3xl shrink-0">{child.avatar}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-black truncate">{child.name}</div>
                      <div className={`text-xs ${isSelected ? 'text-[#0b2850]/80' : 'text-blue-200'}`}>
                        {child.class} · रोल नं: {child.rollNo}
                      </div>
                      <div className="text-[11px] font-mono mt-0.5">
                        उपस्थिति: {child.attendanceStats.percentage}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/15 w-fit">
            <span className="text-2xl">{currentStudent.avatar}</span>
            <div>
              <div className="text-sm font-bold text-white">{currentStudent.name}</div>
              <div className="text-xs text-blue-200">{currentStudent.class} · रोल नं: {currentStudent.rollNo}</div>
            </div>
          </div>
        )}
      </div>

      {/* CLASS TEACHER & TODAY'S ATTENDANCE STATUS BANNER */}
      {(() => {
        const teacher = getClassTeacherInfo(currentStudent.class);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLog = currentStudent.attendanceStats.recentLog.find((l) => l.date === todayStr) || currentStudent.attendanceStats.recentLog[0];
        const isPresentToday = todayLog?.status === 'present';
        const isAbsentToday = todayLog?.status === 'absent';
        const isLeaveToday = todayLog?.status === 'leave';

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Today's Attendance Status */}
            <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-xs transition-all ${
              isPresentToday
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : isAbsentToday
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : isLeaveToday
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 font-bold ${
                isPresentToday 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : isAbsentToday 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'bg-amber-500 text-white'
              }`}>
                {isPresentToday ? '✓' : isAbsentToday ? '✕' : '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-between">
                  <span>दैनिक उपस्थिति स्थिति ({todayLog?.date || todayStr})</span>
                  <span className="text-[10px] text-[#0b2850] font-bold font-mono">कक्षाध्यापक द्वारा दर्ज</span>
                </div>
                <div className="text-base font-black truncate mt-0.5">
                  {isPresentToday && 'आज उपस्थित (Present) — विद्यार्थी कक्षा में मौजूद'}
                  {isAbsentToday && 'आज अनुपस्थित (Absent) — विद्यालय में अनुपस्थिति दर्ज'}
                  {isLeaveToday && 'आज अवकाश (Leave) — स्वीकृत छुट्टी'}
                  {!todayLog && 'आज की हाजिरी प्रक्रियाधीन है'}
                </div>
                <div className="text-xs text-neutral-600 mt-0.5">
                  {isPresentToday 
                    ? 'कक्षाध्यापक द्वारा दैनिक हाजिरी रजिस्टर में उपस्थिति दर्ज की गई।' 
                    : isAbsentToday 
                    ? 'कृपया अनुपस्थिति का कारण कक्षाध्यापक को सूचित करें।' 
                    : 'विद्यालय कार्यालय में अवकाश आवेदन स्वीकृत है।'}
                </div>
              </div>
            </div>

            {/* Assigned Class Teacher Contact Card */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#0b2850] text-[#f4b942] flex items-center justify-center text-2xl shrink-0">
                👨‍🏫
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  प्रभारी कक्षाध्यापक (Class Teacher)
                </div>
                <div className="text-base font-black text-neutral-900 truncate mt-0.5">
                  {teacher.name} ({currentStudent.class})
                </div>
                <div className="text-xs text-neutral-600 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{teacher.designation}</span>
                  <span>·</span>
                  <span className="font-mono font-bold text-[#0b2850]">📞 {teacher.phone}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ACTIVE STUDENT STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Attendance KPI */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
            <span>दैनिक उपस्थिति</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 font-mono tabular-nums mt-1">
            {currentStudent.attendanceStats.percentage}%
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {currentStudent.attendanceStats.daysPresent} दिन उपस्थित / {currentStudent.attendanceStats.totalDays} कार्य दिवस
          </div>
        </div>

        {/* 1st Mid-term KPI */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
            <span>1st Mid-term परिणाम</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 font-mono tabular-nums mt-1">
            {currentStudent.results.firstMidterm.percentage}%
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            रैंक: #{currentStudent.results.firstMidterm.rank} ({currentStudent.results.firstMidterm.grade})
          </div>
        </div>

        {/* 2nd Mid-term KPI */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
            <span>2nd Mid-term परिणाम</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 font-mono tabular-nums mt-1">
            {currentStudent.results.secondMidterm.percentage}%
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            रैंक: #{currentStudent.results.secondMidterm.rank} ({currentStudent.results.secondMidterm.grade})
          </div>
        </div>

        {/* Fees KPI */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
            <span>फीस स्थिति</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 font-mono tabular-nums mt-1">
            {currentStudent.feesStatus.status === 'paid' ? 'पूर्ण जमा' : `बकाया: ₹${currentStudent.feesStatus.dueFee}`}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            रसीद: {currentStudent.feesStatus.lastReceiptNo}
          </div>
        </div>
      </div>

      {/* EXAM RESULTS SECTION (1st Midterm, 2nd Midterm, Half-Yearly) */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header & Term Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <div className="text-xs font-bold text-[#0b2850] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#f4b942]" />
              <span>परीक्षा परिणाम एवं अंकतालिका (Exam Results)</span>
            </div>
            <h3 className="text-xl font-black text-neutral-900 mt-0.5">
              {currentStudent.name} — विषयवार अंक विवरण
            </h3>
          </div>

          {/* Exam Term Selector */}
          <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs">
            <button
              onClick={() => setSelectedExamTerm('first_midterm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedExamTerm === 'first_midterm'
                  ? 'bg-[#0b2850] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              1st Mid-term (प्रथम परख)
            </button>
            <button
              onClick={() => setSelectedExamTerm('second_midterm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedExamTerm === 'second_midterm'
                  ? 'bg-[#0b2850] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              2nd Mid-term (द्वितीय परख)
            </button>
            <button
              onClick={() => setSelectedExamTerm('half_yearly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedExamTerm === 'half_yearly'
                  ? 'bg-[#0b2850] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Half-Yearly (अर्धवार्षिक)
            </button>
          </div>
        </div>

        {/* Term Summary Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#f4f7fc] border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#0b2850] uppercase">
              {activeTermData.termTitle}
            </div>
            <div className="text-lg font-black text-neutral-900 mt-0.5 flex items-center gap-3">
              <span>प्राप्तांक: {activeTermData.obtainedTotal} / {activeTermData.maxTotal}</span>
              <span className="text-base text-emerald-600 font-mono font-bold">({activeTermData.percentage}%)</span>
            </div>
            <p className="text-xs text-neutral-600 mt-1">
              शिक्षक टिप्पणी: <em>"{activeTermData.remarks}"</em>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xs text-neutral-500 font-semibold">कक्षा में रैंक</div>
              <div className="text-xl font-black text-[#0b2850] font-mono">
                #{activeTermData.rank}
              </div>
            </div>

            <button
              onClick={() => onPrintReportCard(currentStudent, activeTermData)}
              className="px-4 py-2.5 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#f4b942]" />
              <span>अंकतालिका प्रिंट करें</span>
            </button>
          </div>
        </div>

        {/* Subject Marks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#0b2850] text-white font-bold">
              <tr>
                <th className="py-3 px-4">क्र. सं.</th>
                <th className="py-3 px-4">विषय (Subject)</th>
                <th className="py-3 px-4 text-center font-mono">अधिकतम अंक</th>
                <th className="py-3 px-4 text-center font-mono">प्राप्तांक (Marks)</th>
                <th className="py-3 px-4 text-center">ग्रेड (Grade)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {activeTermData.subjects.map((sub, idx) => (
                <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-500">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-neutral-900">
                    {sub.subject}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-neutral-600">
                    {sub.maxMarks}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-black text-neutral-900 tabular-nums">
                    {sub.marksObtained}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                      {sub.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-100 font-extrabold border-t-2 border-neutral-300">
              <tr>
                <td colSpan={2} className="py-3 px-4 text-neutral-900">कुल योग (Total)</td>
                <td className="py-3 px-4 text-center font-mono">{activeTermData.maxTotal}</td>
                <td className="py-3 px-4 text-center font-mono text-[#0b2850] text-base">{activeTermData.obtainedTotal}</td>
                <td className="py-3 px-4 text-center font-mono text-emerald-700">{activeTermData.percentage}% ({activeTermData.grade})</td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>

      {/* DAILY ATTENDANCE LOG CALENDAR FOR STUDENT */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0b2850]" />
            <span>दैनिक छात्र उपस्थिति रिकॉर्ड (Daily Attendance Calendar)</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            सत्र 2026-27 के दौरान दर्ज की गई हालिया उपस्थिति स्थिति।
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-2">
          {currentStudent.attendanceStats.recentLog.map((log, idx) => {
            const isPresent = log.status === 'present';
            const isLeave = log.status === 'leave';

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isPresent
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : isLeave
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-neutral-500">
                  {new Date(log.date).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short' })}
                </div>
                <div className="text-xs font-black mt-1">
                  {isPresent ? 'उपस्थित' : isLeave ? 'अवकाश' : 'अनुपस्थित'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
