import React, { useState, useEffect } from 'react';
import { Teacher, TeacherAttendanceRecord, BoardStudentResult } from '../types';
import { 
  ShieldAlert, 
  UserPlus, 
  Users, 
  CheckCircle2, 
  KeyRound, 
  Phone, 
  BookOpen, 
  Sparkles, 
  Lock, 
  LogOut, 
  MapPin, 
  Clock, 
  Loader2,
  Trophy,
  Download,
  Trash2,
  PlusCircle,
  HelpCircle,
  Database,
  ArrowRight
} from 'lucide-react';

interface AdminPortalProps {
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout }) => {
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Active admin tab: 'teachers' | 'attendance' | 'boardResults' | 'dataGuide'
  const [activeTab, setActiveTab] = useState<'teachers' | 'attendance' | 'boardResults' | 'dataGuide'>('teachers');

  // Admin data
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Board results in admin
  const [boardResultsList, setBoardResultsList] = useState<BoardStudentResult[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);

  // New board result form state
  const [brYear, setBrYear] = useState<number>(2024);
  const [brClass, setBrClass] = useState<'10th' | '12th'>('10th');
  const [brStream, setBrStream] = useState<'Science' | 'Arts'>('Science');
  const [brRollNo, setBrRollNo] = useState('');
  const [brName, setBrName] = useState('');
  const [brFatherName, setBrFatherName] = useState('');
  const [brPercentage, setBrPercentage] = useState('');
  const [brAddress, setBrAddress] = useState('ग्राम मनोता खुर्द, झुंझुनूं (राजस्थान)');
  const [brRank, setBrRank] = useState('विद्यालय मेरिट');
  const [brPhoto, setBrPhoto] = useState('/src/assets/images/student_rahul_sharma_1791828048407.jpg');
  const [brSuccessMsg, setBrSuccessMsg] = useState<string | null>(null);

  // New teacher form
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'male' | 'female'>('male');
  const [newSubject, setNewSubject] = useState('');
  const [newDesignation, setNewDesignation] = useState('वरिष्ठ अध्यापक');
  const [newPhone, setNewPhone] = useState('');
  const [newAssignedClass, setNewAssignedClass] = useState('Class 9th-A');
  const [customPassword, setCustomPassword] = useState('Jawahar@123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState<string | null>(null);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (data.success) {
        setOverview(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBoardResults = async () => {
    setBoardLoading(true);
    try {
      const res = await fetch('/api/board-results');
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setBoardResultsList(data.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBoardLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthed) {
      fetchOverview();
      fetchBoardResults();
    }
  }, [isAdminAuthed]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'admin' || adminPin === '1234' || adminPin === 'Jawahar@Admin2026') {
      setIsAdminAuthed(true);
      setPinError(null);
    } else {
      setPinError('गलत एडमिन पिन! (डेमो पिन: 1234 या admin दर्ज करें)');
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSubject.trim() || !newPhone.trim()) {
      alert('कृपया नाम, विषय और फोन नंबर दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    setCreationSuccess(null);

    try {
      const res = await fetch('/api/teachers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          gender: newGender,
          subject: newSubject.trim(),
          designation: newDesignation.trim(),
          phone: newPhone.trim(),
          assignedClass: newAssignedClass.trim(),
          password: customPassword.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setCreationSuccess(
          `शिक्षक खाता बना दिया गया! यूजरनेम: ${data.credentials.username} | पासवर्ड: ${data.credentials.password}`
        );
        setNewName('');
        setNewSubject('');
        setNewPhone('');
        fetchOverview();
      } else {
        alert(data.message || 'त्रुटि हुई।');
      }
    } catch (err) {
      console.error(err);
      alert('सर्वर से संपर्क विफल।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBoardResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brName.trim() || !brFatherName.trim() || !brPercentage.trim()) {
      alert('कृपया छात्र का नाम, पिता का नाम और प्रतिशत दर्ज करें।');
      return;
    }

    try {
      const res = await fetch('/api/board-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: brYear,
          classType: brClass,
          stream: brClass === '12th' ? brStream : undefined,
          rollNo: brRollNo.trim() || `${brYear}${brClass === '10th' ? '10' : '12'}${Math.floor(100 + Math.random() * 900)}`,
          studentName: brName.trim(),
          fatherName: brFatherName.trim(),
          percentage: parseFloat(brPercentage),
          division: parseFloat(brPercentage) >= 75 ? '1st Division with Distinction' : '1st Division',
          rank: brRank.trim(),
          address: brAddress.trim(),
          studentPhoto: brPhoto
        })
      });

      const data = await res.json();
      if (data.success) {
        setBrSuccessMsg(`छात्र ${brName} का ${brYear} ${brClass} बोर्ड रिजल्ट सफलतापूर्वक जोड़ दिया गया!`);
        setBrName('');
        setBrFatherName('');
        setBrPercentage('');
        setBrRollNo('');
        fetchBoardResults();
      } else {
        alert(data.message || 'त्रुटि हुई।');
      }
    } catch (err) {
      console.error(err);
      alert('सर्वर से संपर्क विफल।');
    }
  };

  const handleDeleteBoardResult = async (id: string, name: string) => {
    if (!window.confirm(`क्या आप ${name} का बोर्ड परिणाम रिकॉर्ड हटाना चाहते हैं?`)) return;

    try {
      const res = await fetch(`/api/board-results/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchBoardResults();
      } else {
        alert(data.message || 'हटाने में विफल।');
      }
    } catch (err) {
      console.error(err);
      alert('त्रुटि हुई।');
    }
  };

  // 1. PIN LOGIN SCREEN
  if (!isAdminAuthed) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0b2850] text-[#f4b942] flex items-center justify-center text-3xl mx-auto shadow-md">
            <Lock className="w-8 h-8 text-[#f4b942]" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-neutral-900">
              विद्यालय प्रशासन कंसोल
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Jawahar Memorial Sikshansthan · Admin Security Access
            </p>
          </div>

          {pinError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              {pinError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="block text-xs font-bold text-neutral-700">
                एडमिन सुरक्षा पिन दर्ज करें (Admin PIN)
              </label>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="पिन दर्ज करें (उदा. 1234)"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-center font-mono font-bold tracking-widest text-lg focus:outline-hidden focus:ring-2 focus:ring-[#0b2850]"
              />
              <p className="text-[11px] text-neutral-400">
                डिफ़ॉल्ट प्रबंधन पिन: <code className="font-bold text-neutral-700">1234</code> या <code className="font-bold text-neutral-700">admin</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white font-bold text-sm transition-colors cursor-pointer shadow-md"
            >
              प्रशासन कंसोल में प्रवेश करें (Enter Console)
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MAIN ADMIN DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="bg-[#0b2850] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-[#f4b942]">
        <div>
          <div className="text-xs text-[#f4b942] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>School Administration & Data Control Center</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-0.5">
            विद्यालय प्रबंधन एवं डेटा कंट्रोल सेंटर
          </h2>
          <div className="text-xs text-blue-200">
            Jawahar Memorial Sikshansthan · मनोता खुर्द (झुंझुनूं), राजस्थान
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>लॉगआउट</span>
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
          <div className="text-xs text-neutral-500 font-bold">कुल पंजीकृत शिक्षक</div>
          <div className="text-2xl font-black text-[#0b2850] font-mono tabular-nums mt-1">
            {overview?.stats?.totalTeachers || 23}
          </div>
          <div className="text-xs text-neutral-500 mt-1">13 पुरुष · 10 महिला शिक्षक</div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
          <div className="text-xs text-neutral-500 font-bold">आज उपस्थित शिक्षक (GPS)</div>
          <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-1">
            {overview?.stats?.teachersPresentToday || 3}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">कैंपस में सत्यापित</div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
          <div className="text-xs text-neutral-500 font-bold">बोर्ड रिजल्ट रिकॉर्ड्स</div>
          <div className="text-2xl font-black text-[#0b2850] font-mono tabular-nums mt-1">
            {boardResultsList.length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">2022, 2023, 2024 मेधावी छात्र</div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
          <div className="text-xs text-neutral-500 font-bold">सक्रिय छात्र प्रोफाइल्स</div>
          <div className="text-2xl font-black text-purple-600 font-mono tabular-nums mt-1">
            {overview?.stats?.totalStudents || 4}
          </div>
          <div className="text-xs text-neutral-500 mt-1">1st/2nd Midterm & Halfyearly</div>
        </div>
      </div>

      {/* ADMIN TABS SWITCHER */}
      <div className="bg-white p-2 rounded-2xl border border-neutral-200 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'teachers'
              ? 'bg-[#0b2850] text-[#f4b942] shadow-sm'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>1. शिक्षक प्रबंधन व पासवर्ड जारी करना</span>
        </button>

        <button
          onClick={() => setActiveTab('boardResults')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'boardResults'
              ? 'bg-[#0b2850] text-[#f4b942] shadow-sm'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <Trophy className="w-4 h-4 text-[#f4b942]" />
          <span>2. 🏆 10वीं व 12वीं बोर्ड परिणाम प्रबंधन</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-[#0b2850] text-[#f4b942] shadow-sm'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>3. आज की GPS उपस्थिति (Live Log)</span>
        </button>

        <button
          onClick={() => setActiveTab('dataGuide')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dataGuide'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>4. 💡 बैकग्राउंड में डेटा कैसे हैंडल करें (Guide & Backup)</span>
        </button>
      </div>

      {/* TAB 1: TEACHERS & CREDENTIALS */}
      {activeTab === 'teachers' && (
        <div className="space-y-8">
          {/* ADD NEW TEACHER & ASSIGN PASSWORD FORM */}
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0b2850]" />
                <span>नया शिक्षक जोड़ें एवं यूजरनेम/पासवर्ड जारी करें (Assign Login & Password)</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                प्रबंधन द्वारा नए शिक्षक का नाम दर्ज करते ही उनका आधिकारिक यूजरनेम व पासवर्ड स्वतः बन जाएगा।
              </p>
            </div>

            {creationSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{creationSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateTeacher} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">शिक्षक का पूरा नाम *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="उदा. श्री राहुल कुमार"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#0b2850]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">लिंग</label>
                <select
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium"
                >
                  <option value="male">पुरुष शिक्षक (Male)</option>
                  <option value="female">महिला शिक्षिका (Female)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">अध्यापन विषय *</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="उदा. गणित / भौतिक विज्ञान"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">पद / Designation</label>
                <input
                  type="text"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  placeholder="उदा. वरिष्ठ अध्यापक"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">मोबाइल नंबर *</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="उदा. 9829012345"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">प्रभारी कक्षा (Class Assigned)</label>
                <select
                  value={newAssignedClass}
                  onChange={(e) => setNewAssignedClass(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium"
                >
                  <option value="Class 10th-A">Class 10th-A</option>
                  <option value="Class 12th-Science">Class 12th-Science</option>
                  <option value="Class 12th-Arts">Class 12th-Arts</option>
                  <option value="Class 8th-B">Class 8th-B</option>
                  <option value="Class 6th-A">Class 6th-A</option>
                  <option value="All Classes">All Classes</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-bold text-neutral-700">विद्यालय द्वारा दिया गया पासवर्ड *</label>
                <input
                  type="text"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="उदा. Jawahar@123"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold text-[#0b2850]"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#0b2850] hover:bg-[#082040] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 text-[#f4b942]" />}
                  <span>शिक्षक क्रेडेंशियल बनाएं एवं यूजरनेम/पासवर्ड जारी करें</span>
                </button>
              </div>
            </form>
          </div>

          {/* ALL REGISTERED TEACHERS TABLE */}
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-4">
            <div>
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0b2850]" />
                <span>पंजीकृत शिक्षक सूची एवं लॉगिन विवरण (Teacher Credentials List)</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                प्रबंधन द्वारा जारी किए गए आधिकारिक यूजरनेम एवं पासवर्ड।
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#0b2850] text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">शिक्षक आईडी</th>
                    <th className="py-3 px-4">नाम</th>
                    <th className="py-3 px-4">विषय / पद</th>
                    <th className="py-3 px-4 font-mono">यूजरनेम (Login ID)</th>
                    <th className="py-3 px-4 font-mono">पासवर्ड</th>
                    <th className="py-3 px-4">प्रभारी कक्षा</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {(overview?.teachers || []).map((t: Teacher) => (
                    <tr key={t.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-700">{t.id}</td>
                      <td className="py-3 px-4 font-extrabold text-neutral-900">{t.name}</td>
                      <td className="py-3 px-4 text-xs text-neutral-600">{t.subject}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0b2850]">{t.username}</td>
                      <td className="py-3 px-4 font-mono text-neutral-700 bg-neutral-50 px-2 py-0.5 rounded font-bold">
                        {t.passwordHash}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-neutral-700">{t.assignedClass}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOARD RESULTS MANAGER (10TH & 12TH - 2022, 2023, 2024, 2025) */}
      {activeTab === 'boardResults' && (
        <div className="space-y-8">
          {/* ADD NEW BOARD RESULT FORM */}
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <div className="text-xs font-bold text-[#f4b942] bg-[#0b2850] px-3 py-1 rounded-full w-fit">
                Board Results Entry | बोर्ड परीक्षा परिणाम प्रविष्टि
              </div>
              <h3 className="text-xl font-black text-neutral-900 mt-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#f4b942]" />
                <span>नया बोर्ड परीक्षा परिणाम जोड़ें (10वीं / 12वीं - वर्ष 2022, 2023, 2024 या 2025)</span>
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                विद्यार्थी का नाम, पिता का नाम, प्राप्तांक प्रतिशत, पता एवं फोटो दर्ज करें। यह डेटा तुरंत वेबसाइट पर दिखने लगेगा।
              </p>
            </div>

            {brSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{brSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddBoardResult} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">परीक्षा वर्ष *</label>
                <select
                  value={brYear}
                  onChange={(e) => setBrYear(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold font-mono text-[#0b2850]"
                >
                  <option value={2025}>वर्ष 2025 (नवीनतम)</option>
                  <option value={2024}>वर्ष 2024</option>
                  <option value={2023}>वर्ष 2023</option>
                  <option value={2022}>वर्ष 2022</option>
                  <option value={2021}>वर्ष 2021</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">कक्षा *</label>
                <select
                  value={brClass}
                  onChange={(e) => setBrClass(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold"
                >
                  <option value="10th">कक्षा 10वीं बोर्ड</option>
                  <option value="12th">कक्षा 12वीं बोर्ड</option>
                </select>
              </div>

              {brClass === '12th' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">12वीं संकाय (Stream)</label>
                  <select
                    value={brStream}
                    onChange={(e) => setBrStream(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold"
                  >
                    <option value="Science">विज्ञान वर्ग (Science)</option>
                    <option value="Arts">कला संकाय (Arts)</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">रोल नंबर</label>
                <input
                  type="text"
                  value={brRollNo}
                  onChange={(e) => setBrRollNo(e.target.value)}
                  placeholder="उदा. 2410889"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">छात्र का पूरा नाम *</label>
                <input
                  type="text"
                  value={brName}
                  onChange={(e) => setBrName(e.target.value)}
                  placeholder="उदा. अंकित शर्मा (Ankit Sharma)"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">पिता का नाम *</label>
                <input
                  type="text"
                  value={brFatherName}
                  onChange={(e) => setBrFatherName(e.target.value)}
                  placeholder="उदा. श्री धर्मपाल शर्मा"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">प्राप्तांक प्रतिशत (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="33"
                  max="100"
                  value={brPercentage}
                  onChange={(e) => setBrPercentage(e.target.value)}
                  placeholder="उदा. 96.40"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-black text-[#0b2850]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">रैंक / मेरिट उपाधि</label>
                <input
                  type="text"
                  value={brRank}
                  onChange={(e) => setBrRank(e.target.value)}
                  placeholder="उदा. 1st Rank / 10वीं टॉपर"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700">विद्यार्थी का स्थाई पता (Address) *</label>
                <input
                  type="text"
                  value={brAddress}
                  onChange={(e) => setBrAddress(e.target.value)}
                  placeholder="उदा. ग्राम मनोता खुर्द, झुंझुनूं (राजस्थान)"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700">छात्र फोटो (Photo URL या नमूना)</label>
                <select
                  value={brPhoto}
                  onChange={(e) => setBrPhoto(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                >
                  <option value="/src/assets/images/student_rahul_sharma_1791828048407.jpg">छात्र फोटो 1 (राहुल शर्मा)</option>
                  <option value="/src/assets/images/student_priya_saini_1791828076818.jpg">छात्रा फोटो 2 (प्रिया सैनी)</option>
                  <option value="/src/assets/images/student_vikram_kumar_1791828104570.jpg">छात्र फोटो 3 (विक्रम कुमार)</option>
                  <option value="/src/assets/images/student_neha_kumari_1791828173838.jpg">छात्रा फोटो 4 (नेहा कुमारी)</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-[#f4b942]" />
                  <span>बोर्ड परिणाम रिकॉर्ड सेव करें (Save Board Result)</span>
                </button>
              </div>
            </form>
          </div>

          {/* EXISTING BOARD RESULTS LIST TABLE */}
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#f4b942]" />
                  <span>वर्तमान पंजीकृत बोर्ड परीक्षा परिणाम सूची (Total: {boardResultsList.length})</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  यह डेटा सीधे पब्लिक पोर्टल के "बोर्ड परिणाम (2022-2024)" में दिखाई देता है।
                </p>
              </div>
              <button
                type="button"
                onClick={fetchBoardResults}
                className="text-xs font-bold text-[#0b2850] bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg cursor-pointer w-fit"
              >
                रीफ्रेश करें
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#0b2850] text-white font-bold">
                  <tr>
                    <th className="py-3 px-3">फोटो</th>
                    <th className="py-3 px-3">वर्ष</th>
                    <th className="py-3 px-3">कक्षा</th>
                    <th className="py-3 px-3">छात्र का नाम</th>
                    <th className="py-3 px-3">पिता का नाम</th>
                    <th className="py-3 px-3">प्रतिशत</th>
                    <th className="py-3 px-3">पता</th>
                    <th className="py-3 px-3 text-center">एक्शन</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {boardResultsList.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3">
                        <img
                          src={r.studentPhoto}
                          alt={r.studentName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-neutral-200 bg-neutral-100"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0b2850]">{r.year}</td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className="bg-blue-50 text-[#0b2850] px-2 py-0.5 rounded text-xs">
                          {r.classType} {r.stream ? `(${r.stream})` : ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-black text-neutral-900">{r.studentName}</td>
                      <td className="py-2.5 px-3 text-neutral-700">{r.fatherName}</td>
                      <td className="py-2.5 px-3 font-mono font-black text-emerald-700">
                        {r.percentage}%
                      </td>
                      <td className="py-2.5 px-3 text-xs text-neutral-600 max-w-xs truncate">{r.address}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteBoardResult(r.id, r.studentName)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="डिलीट करें"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TODAY'S GPS ATTENDANCE LOG */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>आज की शिक्षक GPS उपस्थिति (School Campus 200m Verification Log)</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                फर्जी उपस्थिति रोकने के लिए स्कूल गेट (मनोता खुर्द) के 200 मीटर के भीतर प्रमाणित हाजिरी।
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0b2850] text-white font-bold">
                <tr>
                  <th className="py-3 px-4">शिक्षक का नाम</th>
                  <th className="py-3 px-4">समय (Time)</th>
                  <th className="py-3 px-4">कैंपस से दूरी</th>
                  <th className="py-3 px-4">सत्यापन स्थिति</th>
                  <th className="py-3 px-4">टिप्पणी</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {(overview?.todayAttendance || []).map((att: TeacherAttendanceRecord) => (
                  <tr key={att.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4 font-bold text-neutral-900">{att.teacherName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0b2850]">{att.time}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {att.distanceFromCampusMeters} मीटर (वैध)
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>GPS जियोफेंस सत्यापित</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-600">{att.notes || 'ऑन-कैंपस'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HOW BACKGROUND DATA WORKS & BACKUP DOWNLOAD */}
      {activeTab === 'dataGuide' && (
        <div className="space-y-8">
          {/* Database Backup Download Card */}
          <div className="bg-gradient-to-br from-[#0b2850] to-[#143d75] text-white rounded-3xl p-6 sm:p-8 shadow-md border-b-4 border-[#f4b942] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[#f4b942] uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  <span>School Database Backup & Persistence</span>
                </div>
                <h3 className="text-2xl font-black text-white mt-1">
                  डेटाबेस बैकअप एवं बैकग्राउंड स्टोरेज
                </h3>
                <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
                  विद्यालय का सम्पूर्ण डेटा (शिक्षक, छात्र उपस्थिति, तीनों टर्म के परीक्षा अंक, और 2022-2024 के बोर्ड परीक्षा परिणाम) सर्वर के <code className="bg-black/30 px-2 py-0.5 rounded font-mono text-[#f4b942]">data/school_store.json</code> में स्वचालित रूप से सुरक्षित रहता है।
                </p>
              </div>

              <a
                href="/api/admin/export-db"
                download
                className="px-6 py-3.5 rounded-xl bg-[#f4b942] hover:bg-[#ffcc00] text-[#0b2850] font-black text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shrink-0"
              >
                <Download className="w-4 h-4 text-[#0b2850]" />
                <span>सम्पूर्ण डेटाबेस JSON बैकअप डाउनलोड करें</span>
              </a>
            </div>
          </div>

          {/* DETAILED EXPLANATION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guide 1: Teachers & Attendance */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0b2850] flex items-center justify-center font-black">
                1
              </div>
              <h4 className="font-extrabold text-base text-neutral-900">
                शिक्षक लॉगिन एवं फर्जी उपस्थिति रोकथाम कैसे काम करता है?
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                • <strong>यूजरनेम/पासवर्ड:</strong> आप (प्रबंधन) इस एडमिन कंसोल से शिक्षक का नाम व विषय डालकर उनका यूजरनेम व पासवर्ड बनाते हैं और उन्हें देते हैं।<br />
                • <strong>एंटी-फेक GPS जियोफेंस:</strong> जब शिक्षक स्कूल आते हैं, पोर्टल उनकी लाइव GPS लोकेशन जांचता है। यदि वे स्कूल गेट (मनोता खुर्द) के <strong>200 मीटर</strong> के दायरे में हैं तभी हाजिरी लगती है। घर बैठे या दूर से लगाने पर <em>"उपस्थिति अस्वीकृत"</em> का लाल अलर्ट आ जाता है।
              </p>
            </div>

            {/* Guide 2: Class Teacher Daily Attendance & Marks */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
                2
              </div>
              <h4 className="font-extrabold text-base text-neutral-900">
                छात्रों की दैनिक हाजिरी और परीक्षा अंक कौन और कैसे भरता है?
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                • <strong>क्लास टीचर भरते हैं:</strong> प्रत्येक कक्षा के नियुक्त क्लास टीचर (जैसे 10th-A के राजेश कुमार जी) अपने शिक्षक पोर्टल में लॉगिन करते हैं।<br />
                • <strong>दैनिक हाजिरी:</strong> वे अपनी कक्षा की हाजिरी शीट खोलकर एक क्लिक में छात्रों को उपस्थित/अनुपस्थित दर्ज करते हैं।<br />
                • <strong>परीक्षा अंक:</strong> 1st मिड-टर्म, 2nd मिड-टर्म और अर्धवार्षिक परीक्षा के विषयवार अंक क्लास टीचर अपने पोर्टल से सीधे भरते हैं, जो तुरंत सेव हो जाते हैं।
              </p>
            </div>

            {/* Guide 3: Parents Portal */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-black">
                3
              </div>
              <h4 className="font-extrabold text-base text-neutral-900">
                अभिभावक अपने बच्चों का रिजल्ट व हाजिरी कैसे देखते हैं?
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                • अभिभावक को कोई कठिन पासवर्ड याद रखने की जरूरत नहीं है; वे केवल अपना <strong>10 अंकों का मोबाइल नंबर</strong> दर्ज करते हैं।<br />
                • लॉगिन होते ही उनके <strong>सभी नामांकित बच्चों के नाम व कार्ड</strong> स्क्रीन पर दिखते हैं (चाहे 1 बच्चा हो या 2 या 3)।<br />
                • जिस बच्चे के नाम पर वे क्लिक करते हैं, उस बच्चे का 1st परख, 2nd परख, अर्धवार्षिक रिजल्ट, कुल प्रतिशत, रैंक और आज की हाजिरी खुल जाती है, और वे आधिकारिक अंकतालिका भी प्रिंट कर सकते हैं।
              </p>
            </div>

            {/* Guide 4: Board Examination Results (2022-2024) */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-black">
                4
              </div>
              <h4 className="font-extrabold text-base text-neutral-900">
                वार्षिक बोर्ड परीक्षा परिणाम (2022, 2023, 2024) को आप कैसे प्रबंधित करेंगे?
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                • इसी एडमिन कंसोल के <strong>"2. 🏆 10वीं व 12वीं बोर्ड परिणाम प्रबंधन"</strong> टैब में जाकर आप किसी भी वर्ष (2024, 2023, 2022 या भविष्य में 2025) का परिणाम, छात्र का नाम, पिता का नाम, प्राप्तांक प्रतिशत, रोल नंबर, गृह पता और फोटो आसानी से जोड़ व हटा सकते हैं।<br />
                • वेबसाइट पर कोई भी यूजर <strong>वर्ष</strong> चुनकर <strong>10वीं या 12वीं</strong> पर क्लिक करके सम्पूर्ण विवरण देख सकता है।
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
