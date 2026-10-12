import React, { useState, useEffect } from 'react';
import { BoardStudentResult } from '../types';
import { INITIAL_BOARD_RESULTS, YEAR_METRICS, YEARS_LIST } from '../data/boardResultsData';
import emblemImg from '../assets/images/jawahar_school_emblem_1791825002243.jpg';
import {
  Award,
  GraduationCap,
  Calendar,
  Search,
  MapPin,
  User,
  ChevronRight,
  Printer,
  Sparkles,
  Trophy,
  BookOpen,
  Filter,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';

interface BoardResultsViewProps {
  initialYear?: number;
  initialClass?: '10th' | '12th';
  onBackToHome?: () => void;
}

export const BoardResultsView: React.FC<BoardResultsViewProps> = ({
  initialYear = 2024,
  initialClass = '10th',
  onBackToHome
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedClass, setSelectedClass] = useState<'10th' | '12th'>(initialClass);
  const [streamFilter, setStreamFilter] = useState<'all' | 'Science' | 'Arts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allResults, setAllResults] = useState<BoardStudentResult[]>(INITIAL_BOARD_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [detailModalStudent, setDetailModalStudent] = useState<BoardStudentResult | null>(null);

  // Fetch results from server if available, fallback to INITIAL_BOARD_RESULTS
  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/board-results');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
          setAllResults(data.results);
        }
      }
    } catch {
      // Offline or dev server fallback
      setAllResults(INITIAL_BOARD_RESULTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Filter students based on year, class, stream, and search query
  const filteredStudents = allResults.filter((student) => {
    const matchYear = student.year === selectedYear;
    const matchClass = student.classType === selectedClass;
    const matchStream =
      selectedClass === '10th' || streamFilter === 'all' || student.stream === streamFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchSearch =
      !query ||
      student.studentName.toLowerCase().includes(query) ||
      student.fatherName.toLowerCase().includes(query) ||
      student.address.toLowerCase().includes(query) ||
      student.rollNo.toLowerCase().includes(query);

    return matchYear && matchClass && matchStream && matchSearch;
  });

  // Current year metrics
  const currentMetrics = YEAR_METRICS[selectedYear] || {
    academicSession: `सत्र ${selectedYear - 1}-${selectedYear}`,
    totalPassingRate: '100%',
    firstDivisionRate: '90%',
    class10Topper: { name: 'विद्यालय टॉपर', percentage: 96.0, photo: '' },
    class12Topper: { name: 'विद्यालय टॉपर', percentage: 95.0, photo: '', stream: 'विज्ञान' }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* 1. INSTITUTIONAL HERO HEADER */}
      <div className="bg-[#0b2850] text-white rounded-3xl p-6 sm:p-10 shadow-lg border-b-4 border-[#f4b942] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Trophy className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 bg-[#f4b942]/20 border border-[#f4b942] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#f4b942]">
              <Trophy className="w-3.5 h-3.5" />
              <span>राजस्थान माध्यमिक शिक्षा बोर्ड (RBSE) परीक्षा परिणाम</span>
            </div>

            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="text-xs font-bold text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                ← मुख्य पृष्ठ पर लौटें (Back to Home)
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                वर्षवार 10वीं एवं 12वीं बोर्ड परीक्षा परिणाम
              </h2>
              <p className="text-xs sm:text-sm text-blue-200 max-w-2xl leading-relaxed">
                जवाहर मेमोरियल शिक्षण संस्थान, मनोता खुर्द (झुंझुनूं) के मेधावी छात्र-छात्राओं का वार्षिक बोर्ड परीक्षा प्रदर्शन। वर्ष 2022, 2023 और 2024 के 10वीं व 12वीं के संपूर्ण परिणाम छात्र फोटो, पिता का नाम, प्राप्तांक प्रतिशत एवं पते सहित देखें।
              </p>
            </div>

            {/* Quick Session Stats Badge */}
            <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[160px]">
              <div className="text-xs text-blue-200 font-bold">विद्यालय परीक्षा परिणाम</div>
              <div className="text-3xl font-black text-[#f4b942] font-mono mt-0.5">
                {currentMetrics.totalPassingRate}
              </div>
              <div className="text-[11px] text-white/80 mt-0.5">
                प्रथम श्रेणी: <span className="font-bold text-emerald-300">{currentMetrics.firstDivisionRate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STEP 1: YEAR SELECTION (वर्ष चुनें: 2024, 2023, 2022) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-neutral-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#0b2850] text-[#f4b942] flex items-center justify-center font-black text-xs">
              1
            </span>
            <h3 className="font-black text-lg text-neutral-900">
              बोर्ड परीक्षा वर्ष चुनें (Select Examination Year)
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            जिस वर्ष का परिणाम देखना है उस वर्ष पर क्लिक करें:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {YEARS_LIST.map((year) => {
            const isSelected = selectedYear === year;
            const metrics = YEAR_METRICS[year];

            return (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setSelectedYear(year);
                }}
                className={`p-5 rounded-2xl text-left transition-all border-2 cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#0b2850] text-white border-[#f4b942] shadow-lg scale-102 ring-4 ring-[#f4b942]/20'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 bg-[#f4b942] text-[#0b2850] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    चयनित (Selected)
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${isSelected ? 'text-[#f4b942]' : 'text-neutral-500'}`} />
                  <span className="text-xs font-bold opacity-80">{metrics.academicSession}</span>
                </div>

                <div className="text-3xl font-black font-mono mt-2 tracking-tight">
                  वर्ष {year}
                </div>

                <div className="mt-3 pt-3 border-t border-current/10 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="opacity-80">उत्तीर्ण प्रतिशत:</span>
                    <span className={`font-mono font-bold ${isSelected ? 'text-[#f4b942]' : 'text-emerald-700'}`}>
                      {metrics.totalPassingRate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-80">10वीं सर्वोच्च:</span>
                    <span className="font-bold font-mono">{metrics.class10Topper.percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-80">12वीं सर्वोच्च:</span>
                    <span className="font-bold font-mono">{metrics.class12Topper.percentage}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. STEP 2: CLASS SELECTION (10वीं या 12वीं का विकल्प) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-neutral-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#0b2850] text-[#f4b942] flex items-center justify-center font-black text-xs">
              2
            </span>
            <h3 className="font-black text-lg text-neutral-900">
              कक्षा चुनें: 10वीं बोर्ड अथवा 12वीं बोर्ड (Select Class Option)
            </h3>
          </div>
          <span className="text-xs font-bold text-[#0b2850] bg-blue-50 px-3 py-1 rounded-full">
            सत्र {selectedYear - 1}-{selectedYear} के लिए कक्षा चुनें
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Option A: 10th Board Result Button */}
          <button
            type="button"
            onClick={() => setSelectedClass('10th')}
            className={`p-6 rounded-2xl text-left transition-all border-2 cursor-pointer flex flex-col justify-between group ${
              selectedClass === '10th'
                ? 'bg-gradient-to-br from-[#0b2850] to-[#143d75] text-white border-[#f4b942] shadow-md ring-4 ring-[#f4b942]/20'
                : 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedClass === '10th' ? 'bg-[#f4b942] text-[#0b2850]' : 'bg-blue-100 text-[#0b2850]'
                }`}>
                  माध्यमिक बोर्ड (Secondary Board)
                </span>
                <span className="text-xs font-mono opacity-80">वर्ष {selectedYear}</span>
              </div>

              <h4 className="text-2xl font-black tracking-tight">
                कक्षा 10वीं बोर्ड परीक्षा परिणाम
              </h4>
              <p className={`text-xs mt-2 leading-relaxed ${selectedClass === '10th' ? 'text-blue-100' : 'text-neutral-600'}`}>
                माध्यमिक परीक्षा के सभी विषय (गणित, विज्ञान, अंग्रेजी, हिंदी, सामाजिक विज्ञान, संस्कृत) के छात्र परिणाम, पिता का नाम, फोटो एवं पते सहित।
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-current/10 flex items-center justify-between text-xs font-bold">
              <span>
                {selectedClass === '10th' ? '✓ परिणाम नीचे प्रदर्शित हैं' : 'क्लिक करके 10वीं परिणाम देखें'}
              </span>
              <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${selectedClass === '10th' ? 'text-[#f4b942]' : ''}`} />
            </div>
          </button>

          {/* Option B: 12th Board Result Button */}
          <button
            type="button"
            onClick={() => setSelectedClass('12th')}
            className={`p-6 rounded-2xl text-left transition-all border-2 cursor-pointer flex flex-col justify-between group ${
              selectedClass === '12th'
                ? 'bg-gradient-to-br from-[#0b2850] to-[#143d75] text-white border-[#f4b942] shadow-md ring-4 ring-[#f4b942]/20'
                : 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedClass === '12th' ? 'bg-[#f4b942] text-[#0b2850]' : 'bg-purple-100 text-purple-900'
                }`}>
                  उच्च माध्यमिक बोर्ड (Senior Secondary)
                </span>
                <span className="text-xs font-mono opacity-80">वर्ष {selectedYear}</span>
              </div>

              <h4 className="text-2xl font-black tracking-tight">
                कक्षा 12वीं बोर्ड परीक्षा परिणाम
              </h4>
              <p className={`text-xs mt-2 leading-relaxed ${selectedClass === '12th' ? 'text-blue-100' : 'text-neutral-600'}`}>
                विज्ञान वर्ग (भौतिक, रसायन, गणित, जीव विज्ञान) एवं कला संकाय (इतिहास, भूगोल, राजनीति) के विद्यार्थियों का उत्कृष्ट परिणाम।
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-current/10 flex items-center justify-between text-xs font-bold">
              <span>
                {selectedClass === '12th' ? '✓ परिणाम नीचे प्रदर्शित हैं' : 'क्लिक करके 12वीं परिणाम देखें'}
              </span>
              <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${selectedClass === '12th' ? 'text-[#f4b942]' : ''}`} />
            </div>
          </button>
        </div>

        {/* 12th Stream Filters if 12th is selected */}
        {selectedClass === '12th' && (
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#0b2850]" />
              <span>संकाय फिल्टर (Stream):</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStreamFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  streamFilter === 'all'
                    ? 'bg-[#0b2850] text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                सभी संकाय (All)
              </button>
              <button
                type="button"
                onClick={() => setStreamFilter('Science')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  streamFilter === 'Science'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                विज्ञान वर्ग (Science)
              </button>
              <button
                type="button"
                onClick={() => setStreamFilter('Arts')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  streamFilter === 'Arts'
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                कला संकाय (Arts)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. STEP 3: STUDENT RESULTS SHOWCASE (WITH PHOTO, NAME, FATHER NAME, PERCENTAGE, ADDRESS) */}
      <div id="printable-board-results" className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-neutral-200 space-y-6">
        
        {/* Header bar with Search and Count */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#f4b942] text-[#0b2850] flex items-center justify-center font-black text-xs">
                3
              </span>
              <h3 className="font-black text-xl text-neutral-900">
                {selectedYear} - कक्षा {selectedClass}वीं बोर्ड परीक्षा परिणाम सूची
              </h3>
            </div>
            <p className="text-xs text-neutral-500">
              कुल {filteredStudents.length} मेधावी विद्यार्थियों का रिकॉर्ड उपलब्ध (प्रतिशत क्रम में व्यवस्थित)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="छात्र / पिता का नाम या रोल नं..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0b2850] focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="मेरिट सूची प्रिंट करें"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">प्रिंट मेरिट सूची</span>
            </button>
          </div>
        </div>

        {/* RESULTS GRID / CARDS */}
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 space-y-3">
            <Award className="w-12 h-12 text-neutral-400 mx-auto" />
            <h4 className="text-base font-bold text-neutral-700">कोई छात्र रिकॉर्ड नहीं मिला</h4>
            <p className="text-xs text-neutral-500">
              कृपया दूसरा खोज शब्द दर्ज करें अथवा वर्ष / कक्षा बदलें।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStreamFilter('all');
              }}
              className="text-xs font-bold text-[#0b2850] underline cursor-pointer"
            >
              फिल्टर हटाएं
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, index) => {
              const isTopper = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={student.id}
                  className={`bg-white rounded-2xl border transition-all hover:shadow-lg overflow-hidden flex flex-col justify-between ${
                    isTopper
                      ? 'border-[#f4b942] ring-2 ring-[#f4b942]/30 shadow-md'
                      : 'border-neutral-200 shadow-xs'
                  }`}
                >
                  {/* Card Header Badge */}
                  <div className={`px-4 py-2.5 flex items-center justify-between text-xs font-bold ${
                    isTopper
                      ? 'bg-[#0b2850] text-[#f4b942]'
                      : isSecond
                      ? 'bg-neutral-800 text-neutral-200'
                      : isThird
                      ? 'bg-amber-800 text-amber-100'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {isTopper && <Trophy className="w-3.5 h-3.5 text-[#f4b942]" />}
                      <span>{student.rank || `रैंक #${index + 1}`}</span>
                    </div>
                    <span className="font-mono text-[11px] opacity-90">
                      रोल नं: {student.rollNo}
                    </span>
                  </div>

                  {/* STUDENT DETAILS: PHOTO, NAME, FATHER NAME, PERCENTAGE, ADDRESS */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      {/* 1. STUDENT PHOTO */}
                      <div className="relative shrink-0">
                        <img
                          src={student.studentPhoto}
                          alt={student.studentName}
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover object-top border-2 border-neutral-200 shadow-xs bg-neutral-100"
                        />
                        {isTopper && (
                          <div className="absolute -bottom-2 -right-1 bg-[#f4b942] text-[#0b2850] text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                            ★ 1st
                          </div>
                        )}
                      </div>

                      {/* 2. NAME & PERCENTAGE */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-neutral-900 text-base leading-snug">
                          {student.studentName}
                        </h4>

                        {/* PERCENTAGE BADGE */}
                        <div className="mt-1.5 inline-flex items-baseline gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl">
                          <span className="text-xl sm:text-2xl font-black font-mono leading-none">
                            {student.percentage}%
                          </span>
                          <span className="text-[10px] font-bold uppercase">प्राप्तांक</span>
                        </div>

                        <div className="text-[11px] text-neutral-500 font-medium mt-1">
                          {student.division}
                        </div>
                      </div>
                    </div>

                    {/* 3. FATHER NAME & ADDRESS INFO BOX */}
                    <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
                      {/* Father Name */}
                      <div className="flex items-start gap-2 text-neutral-700">
                        <User className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-neutral-500 font-medium">पिता का नाम: </span>
                          <span className="font-bold text-neutral-900">{student.fatherName}</span>
                        </div>
                      </div>

                      {/* Stream if 12th */}
                      {student.stream && (
                        <div className="flex items-center gap-2 text-neutral-700">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <div>
                            <span className="text-neutral-500 font-medium">संकाय (Stream): </span>
                            <span className="font-bold text-[#0b2850]">
                              {student.stream === 'Science' ? 'विज्ञान वर्ग (Science)' : 'कला संकाय (Arts)'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Address */}
                      <div className="flex items-start gap-2 text-neutral-700">
                        <MapPin className="w-3.5 h-3.5 text-[#0b2850] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-neutral-500 font-medium">पता (Address): </span>
                          <span className="font-bold text-neutral-800">{student.address}</span>
                        </div>
                      </div>

                      {/* Highlight remark */}
                      {student.highlight && (
                        <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-[#0b2850] font-medium flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#f4b942] shrink-0" />
                          <span className="truncate">{student.highlight}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Detail Marks button */}
                  <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-500">
                      RBSE · {student.year}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDetailModalStudent(student)}
                      className="text-xs font-bold text-[#0b2850] hover:text-[#082040] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>विषयवार अंक देखें</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 5. STUDENT DETAILED MARKS / CERTIFICATE MODAL */}
      {detailModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-neutral-300 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 my-8">
            {/* Header */}
            <div className="bg-[#0b2850] text-white p-4 flex items-center justify-between">
              <div className="text-xs font-bold text-[#f4b942] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>बोर्ड परीक्षा छात्र विवरण एवं अंकतालिका (Marksheet)</span>
              </div>
              <button
                onClick={() => setDetailModalStudent(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Institutional Header */}
              <div className="flex items-center gap-3 border-b pb-4">
                <img
                  src={emblemImg}
                  alt="School Emblem"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full border border-neutral-200"
                />
                <div>
                  <h3 className="font-black text-lg text-[#0b2850]">
                    Jawahar Memorial Sikshansthan
                  </h3>
                  <div className="text-xs text-neutral-600">
                    मनोता खुर्द, झुंझुनूं (राजस्थान) · RBSE बोर्ड परीक्षा {detailModalStudent.year}
                  </div>
                </div>
              </div>

              {/* Student Identity Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                <img
                  src={detailModalStudent.studentPhoto}
                  alt={detailModalStudent.studentName}
                  referrerPolicy="no-referrer"
                  className="w-18 h-18 rounded-2xl object-cover border-2 border-white shadow-xs"
                />
                <div className="space-y-1">
                  <div className="text-lg font-black text-neutral-900">
                    {detailModalStudent.studentName}
                  </div>
                  <div className="text-xs text-neutral-600">
                    पिता का नाम: <span className="font-bold text-neutral-900">{detailModalStudent.fatherName}</span>
                  </div>
                  <div className="text-xs text-neutral-600">
                    कक्षा: <span className="font-bold text-[#0b2850]">{detailModalStudent.classType}वीं बोर्ड</span> · रोल नं: <span className="font-mono font-bold">{detailModalStudent.rollNo}</span>
                  </div>
                  <div className="text-xs text-neutral-600">
                    पता: <span className="font-medium text-neutral-800">{detailModalStudent.address}</span>
                  </div>
                </div>
              </div>

              {/* Subject Marks Table */}
              {detailModalStudent.subjects && detailModalStudent.subjects.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    विषयवार प्राप्तांक विवरण (Subject-wise Marks):
                  </div>
                  <div className="overflow-hidden rounded-xl border border-neutral-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#0b2850] text-white">
                        <tr>
                          <th className="p-2.5">विषय (Subject)</th>
                          <th className="p-2.5 text-center">पूर्णांक (Max)</th>
                          <th className="p-2.5 text-center">प्राप्तांक (Marks)</th>
                          <th className="p-2.5 text-center">प्रतिशत</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {detailModalStudent.subjects.map((sub, sIdx) => (
                          <tr key={sIdx} className="hover:bg-neutral-50 font-medium">
                            <td className="p-2.5 text-neutral-900 font-bold">{sub.name}</td>
                            <td className="p-2.5 text-center font-mono text-neutral-600">{sub.max}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-[#0b2850]">{sub.marks}</td>
                            <td className="p-2.5 text-center font-mono text-emerald-700">
                              {((sub.marks / sub.max) * 100).toFixed(0)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Total & Percentage summary */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-800 font-bold">बोर्ड परीक्षा कुल परिणाम</div>
                  <div className="text-xs text-neutral-600">{detailModalStudent.division}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-emerald-900">
                    {detailModalStudent.percentage}%
                  </div>
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">
                    {detailModalStudent.rank || 'उत्तीर्ण'}
                  </div>
                </div>
              </div>

              {/* Close & Print Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDetailModalStudent(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer"
                >
                  बंद करें (Close)
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>अंकतालिका प्रिंट करें</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
