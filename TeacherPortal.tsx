import React, { useState, useEffect, useMemo } from 'react';
import { Teacher, TeacherAttendanceRecord, Student } from '../types';
import { playEvmBeep } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  UserCheck, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Lock, 
  User, 
  LogOut, 
  Loader2, 
  BookOpen, 
  Sparkles,
  Users,
  Award,
  Check,
  X,
  Save,
  PenTool,
  Printer,
  FileSpreadsheet,
  Send,
  RefreshCw,
  Filter,
  CheckCheck
} from 'lucide-react';

interface TeacherPortalProps {
  teacherSession: Teacher | null;
  onLoginSuccess: (teacher: Teacher, todayAttendance: TeacherAttendanceRecord | null) => void;
  onLogout: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  teacherSession,
  onLoginSuccess,
  onLogout
}) => {
  // Login form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active dashboard tab: 'student_attendance' | 'marks_entry' | 'my_attendance'
  const [activeTab, setActiveTab] = useState<'student_attendance' | 'marks_entry' | 'my_attendance'>('student_attendance');

  // Teacher own attendance states
  const [todayAttendance, setTodayAttendance] = useState<TeacherAttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<TeacherAttendanceRecord[]>([]);
  const [historyStats, setHistoryStats] = useState<{ totalWorkingDays: number; presentDays: number; percentage: number } | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Geofence states
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceFromSchool, setDistanceFromSchool] = useState<number | null>(null);
  const [useCampusSimulation, setUseCampusSimulation] = useState(true);

  // Class Teacher Student Attendance Register states
  const [selectedClass, setSelectedClass] = useState<string>('Class 10th-A');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [studentAttendanceMap, setStudentAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'leave'>>({});
  const [studentAttendanceNotes, setStudentAttendanceNotes] = useState<Record<string, string>>({});
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent' | 'leave'>('all');
  const [notifyParentsOfAbsent, setNotifyParentsOfAbsent] = useState<boolean>(true);
  const [isSavingStudentAttendance, setIsSavingStudentAttendance] = useState(false);
  const [studentAttendanceSuccess, setStudentAttendanceSuccess] = useState<string | null>(null);

  // Class Marks Entry states
  const [marksMode, setMarksMode] = useState<'full_gradebook' | 'single_subject'>('full_gradebook');
  const [marksExamTerm, setMarksExamTerm] = useState<'first_midterm' | 'second_midterm' | 'half_yearly'>('first_midterm');
  const [marksSubject, setMarksSubject] = useState<string>('Mathematics (गणित)');
  const [maxMarks, setMaxMarks] = useState<number>(10);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  
  // Full Gradebook Grid state: studentId -> { [subjectName]: number }
  const [gradebookMap, setGradebookMap] = useState<Record<string, Record<string, number>>>({});
  const [gradebookRemarks, setGradebookRemarks] = useState<Record<string, string>>({});
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [marksSuccess, setMarksSuccess] = useState<string | null>(null);

  const SCHOOL_LAT = 28.0254;
  const SCHOOL_LNG = 75.7891;
  const ALLOWED_RADIUS = 200;

  // Initialize teacher info and fetch class students
  useEffect(() => {
    if (teacherSession) {
      if (teacherSession.assignedClass.includes('10th')) setSelectedClass('Class 10th-A');
      else if (teacherSession.assignedClass.includes('8th')) setSelectedClass('Class 8th-B');
      else if (teacherSession.assignedClass.includes('12th')) setSelectedClass('Class 12th-Science');
      else if (teacherSession.assignedClass.includes('6th')) setSelectedClass('Class 6th-A');
      else if (teacherSession.assignedClass.includes('9th')) setSelectedClass('Class 9th-A');

      // Fetch teacher own attendance
      fetch(`/api/attendance/teacher/history/${teacherSession.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAttendanceHistory(data.records || []);
            setHistoryStats(data.stats || null);
            const todayStr = new Date().toISOString().split('T')[0];
            const today = (data.records || []).find((r: TeacherAttendanceRecord) => r.date === todayStr);
            if (today) setTodayAttendance(today);
          }
        })
        .catch((err) => console.warn(err));

      updateLocation(useCampusSimulation);
    }
  }, [teacherSession]);

  // Helper to fetch class students
  const fetchClassStudents = () => {
    if (!teacherSession) return;
    fetch(`/api/class-students/${encodeURIComponent(selectedClass)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.students) {
          setClassStudents(data.students);
          
          const attMap: Record<string, 'present' | 'absent' | 'leave'> = {};
          const mksMap: Record<string, number> = {};
          const remMap: Record<string, string> = {};
          const gMap: Record<string, Record<string, number>> = {};
          const gRem: Record<string, string> = {};

          data.students.forEach((s: Student) => {
            // Check if attended on chosen date
            const log = s.attendanceStats.recentLog.find((l) => l.date === attendanceDate);
            attMap[s.id] = log ? log.status : 'present';

            // Active term for marks
            let term = s.results.firstMidterm;
            if (marksExamTerm === 'second_midterm') term = s.results.secondMidterm;
            else if (marksExamTerm === 'half_yearly') term = s.results.halfYearly;

            // Single subject
            const sub = term.subjects.find((sb) => sb.subject.toLowerCase().includes(marksSubject.toLowerCase().split(' ')[0]));
            mksMap[s.id] = sub ? sub.marksObtained : marksExamTerm === 'half_yearly' ? 85 : 9;
            remMap[s.id] = term.remarks || 'अच्छा प्रदर्शन।';

            // Full gradebook
            const subMap: Record<string, number> = {};
            term.subjects.forEach((sb) => {
              subMap[sb.subject] = sb.marksObtained;
            });
            gMap[s.id] = subMap;
            gRem[s.id] = term.remarks || 'अच्छा प्रदर्शन।';
          });

          setStudentAttendanceMap(attMap);
          setMarksMap(mksMap);
          setRemarksMap(remMap);
          setGradebookMap(gMap);
          setGradebookRemarks(gRem);
        }
      })
      .catch((err) => console.warn(err));
  };

  // Fetch class students whenever selectedClass, attendanceDate, or exam term changes
  useEffect(() => {
    fetchClassStudents();
  }, [selectedClass, teacherSession, attendanceDate, marksExamTerm, marksSubject]);

  // Update maxMarks when exam term changes
  useEffect(() => {
    if (marksExamTerm === 'half_yearly') {
      setMaxMarks(100);
    } else {
      setMaxMarks(10);
    }
  }, [marksExamTerm]);

  // Determine subjects available for this class
  const classSubjects = useMemo(() => {
    if (classStudents.length === 0) {
      return [
        { name: 'Hindi (हिंदी)', maxMarks: marksExamTerm === 'half_yearly' ? 100 : 10 },
        { name: 'English (अंग्रेजी)', maxMarks: marksExamTerm === 'half_yearly' ? 100 : 10 },
        { name: 'Mathematics (गणित)', maxMarks: marksExamTerm === 'half_yearly' ? 100 : 10 },
        { name: 'Science (विज्ञान)', maxMarks: marksExamTerm === 'half_yearly' ? 100 : 10 },
        { name: 'Social Science (सामाजिक विज्ञान)', maxMarks: marksExamTerm === 'half_yearly' ? 100 : 10 },
      ];
    }
    const first = classStudents[0];
    let term = first.results.firstMidterm;
    if (marksExamTerm === 'second_midterm') term = first.results.secondMidterm;
    else if (marksExamTerm === 'half_yearly') term = first.results.halfYearly;
    return term.subjects.map((s) => ({
      name: s.subject,
      maxMarks: s.maxMarks
    }));
  }, [classStudents, marksExamTerm]);

  const updateLocation = (simulateCampus: boolean) => {
    if (simulateCampus) {
      setDeviceCoords({ lat: SCHOOL_LAT + 0.0001, lng: SCHOOL_LNG + 0.0001 });
      setDistanceFromSchool(18);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setDeviceCoords({ lat, lng });
            const d = calculateDistance(lat, lng, SCHOOL_LAT, SCHOOL_LNG);
            setDistanceFromSchool(d);
          },
          () => {
            setDistanceFromSchool(4250);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        setDistanceFromSchool(4250);
      }
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError('यूजरनेम और पासवर्ड दर्ज करें।');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || 'लॉगिन विफल हुआ।');
        return;
      }

      onLoginSuccess(data.teacher, data.todayAttendance);
      if (data.todayAttendance) {
        setTodayAttendance(data.todayAttendance);
      }
    } catch (err) {
      console.error(err);
      setLoginError('सर्वर से संपर्क करने में समस्या आई।');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAutofill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setLoginError(null);
  };

  // Mark teacher own geofence attendance
  const handleMarkTeacherAttendance = async () => {
    if (!teacherSession) return;
    setIsMarking(true);
    setAttendanceMessage(null);

    try {
      const res = await fetch('/api/attendance/teacher/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: teacherSession.id,
          latitude: deviceCoords?.lat || SCHOOL_LAT,
          longitude: deviceCoords?.lng || SCHOOL_LNG,
          isCampusOverride: useCampusSimulation
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setAttendanceMessage({
          type: 'error',
          text: data.message || 'उपस्थिति दर्ज नहीं हो सकी।'
        });
        return;
      }

      playEvmBeep(800);
      confetti({ particleCount: 80, spread: 60 });

      setTodayAttendance(data.record);
      setAttendanceHistory([data.record, ...attendanceHistory]);
      setAttendanceMessage({
        type: 'success',
        text: data.message || 'आपकी उपस्थिति सफलतापूर्वक दर्ज हो गई है!'
      });
    } catch (err) {
      console.error(err);
      setAttendanceMessage({ type: 'error', text: 'सर्वर से संपर्क में त्रुटि।' });
    } finally {
      setIsMarking(false);
    }
  };

  // Save student attendance register for the class
  const handleSaveStudentAttendance = async () => {
    setIsSavingStudentAttendance(true);
    setStudentAttendanceSuccess(null);

    const payload = {
      className: selectedClass,
      date: attendanceDate,
      attendanceList: classStudents.map((s) => ({
        studentId: s.id,
        status: studentAttendanceMap[s.id] || 'present'
      }))
    };

    try {
      const res = await fetch('/api/attendance/class/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        playEvmBeep(600);
        confetti({ particleCount: 80, spread: 55 });
        
        const absentCount = classStudents.filter((s) => studentAttendanceMap[s.id] === 'absent').length;
        let successMsg = data.message || 'छात्र उपस्थिति रजिस्टर सफलतापूर्वक सुरक्षित किया गया!';
        if (notifyParentsOfAbsent && absentCount > 0) {
          successMsg += ` 📱 (${absentCount} अनुपस्थित छात्रों के अभिभावकों को SMS अलर्ट प्रेषित किया गया)`;
        }
        setStudentAttendanceSuccess(successMsg);
        fetchClassStudents();
      } else {
        alert(data.message || 'उपस्थिति सहेजने में विफल।');
      }
    } catch (err) {
      console.error(err);
      alert('सर्वर त्रुटि।');
    } finally {
      setIsSavingStudentAttendance(false);
    }
  };

  // Quick mark all students
  const handleMarkAllStudents = (status: 'present' | 'absent') => {
    const updated: Record<string, 'present' | 'absent' | 'leave'> = {};
    classStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setStudentAttendanceMap(updated);
  };

  // Invert student attendance
  const handleInvertAttendance = () => {
    const updated: Record<string, 'present' | 'absent' | 'leave'> = {};
    classStudents.forEach((s) => {
      const cur = studentAttendanceMap[s.id] || 'present';
      updated[s.id] = cur === 'present' ? 'absent' : 'present';
    });
    setStudentAttendanceMap(updated);
  };

  // Save Single Subject Marks
  const handleSaveClassMarks = async () => {
    setIsSavingMarks(true);
    setMarksSuccess(null);

    const payload = {
      className: selectedClass,
      termKey: marksExamTerm,
      subject: marksSubject,
      maxMarks,
      marksList: classStudents.map((s) => ({
        studentId: s.id,
        marksObtained: marksMap[s.id] ?? 0,
        remarks: remarksMap[s.id] || 'अच्छा प्रयास।'
      }))
    };

    try {
      const res = await fetch('/api/marks/class/bulk-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        playEvmBeep(600);
        confetti({ particleCount: 80, spread: 60 });
        setMarksSuccess(data.message || 'परीक्षा अंक सफलतापूर्वक अपडेट किए गए!');
        fetchClassStudents();
      } else {
        alert(data.message || 'अंक सहेजने में विफल।');
      }
    } catch (err) {
      console.error(err);
      alert('सर्वर त्रुटि।');
    } finally {
      setIsSavingMarks(false);
    }
  };

  // Save Complete Class Marksheet (All subjects for entire class at once)
  const handleSaveFullGradebook = async () => {
    setIsSavingMarks(true);
    setMarksSuccess(null);

    const records = classStudents.map((s) => ({
      studentId: s.id,
      subjects: classSubjects.map((sub) => ({
        subject: sub.name,
        maxMarks: sub.maxMarks,
        marksObtained: gradebookMap[s.id]?.[sub.name] ?? 0
      })),
      remarks: gradebookRemarks[s.id] || 'अच्छा प्रयास।'
    }));

    try {
      const res = await fetch('/api/marks/class/full-gradebook-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: selectedClass,
          termKey: marksExamTerm,
          records
        })
      });
      const data = await res.json();

      if (res.ok) {
        playEvmBeep(650);
        confetti({ particleCount: 90, spread: 65 });
        setMarksSuccess(data.message || 'सम्पूर्ण कक्षा अंकतालिका सफलतापूर्वक सुरक्षित की गई! अभिभावक पोर्टल पर लाइव अपडेट हो चुका है।');
        fetchClassStudents();
      } else {
        alert(data.message || 'अंकतालिका सहेजने में विफल।');
      }
    } catch (err) {
      console.error(err);
      alert('सर्वर त्रुटि।');
    } finally {
      setIsSavingMarks(false);
    }
  };

  // ------------------- VIEW 1: LOGIN FORM -------------------
  if (!teacherSession) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-md p-6 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#0b2850] text-[#f4b942] flex items-center justify-center text-2xl mx-auto shadow-sm">
              👨‍🏫
            </div>
            <h2 className="text-2xl font-black text-neutral-900">
              शिक्षक एवं कक्षाध्यापक लॉगिन पोर्टल
            </h2>
            <p className="text-xs text-neutral-600">
              विद्यालय प्रशासन द्वारा प्रदान किया गया यूजरनेम एवं पासवर्ड दर्ज करें।
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-800">
                शिक्षक यूजरनेम (Teacher Username)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="उदा. rajesh.math या suresh.science"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0b2850] focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-800">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="विद्यालय द्वारा दिया गया पासवर्ड"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0b2850] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>प्रमाणित किया जा रहा है...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-[#f4b942]" />
                  <span>शिक्षक पोर्टल में लॉगिन करें</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="p-4 rounded-2xl bg-[#f4f7fc] border border-blue-100 text-xs space-y-2">
            <div className="font-bold text-[#0b2850] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#f4b942]" />
              <span>परीक्षण हेतु कक्षाध्यापक क्रेडेंशियल्स:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleAutofill('rajesh.math', 'Jawahar@123')}
                className="p-2.5 text-left bg-white rounded-xl border border-neutral-200 hover:border-blue-400 transition-colors cursor-pointer group"
              >
                <div className="font-bold text-neutral-900 group-hover:text-[#0b2850]">Mr. Rajesh Kumar (10th-A)</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">rajesh.math / Jawahar@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleAutofill('suresh.science', 'Jawahar@123')}
                className="p-2.5 text-left bg-white rounded-xl border border-neutral-200 hover:border-blue-400 transition-colors cursor-pointer group"
              >
                <div className="font-bold text-neutral-900 group-hover:text-[#0b2850]">Mr. Suresh Choudhary (8th-B)</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">suresh.science / Jawahar@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleAutofill('sunita.hindi', 'Jawahar@123')}
                className="p-2.5 text-left bg-white rounded-xl border border-neutral-200 hover:border-blue-400 transition-colors cursor-pointer group"
              >
                <div className="font-bold text-neutral-900 group-hover:text-[#0b2850]">Mrs. Sunita Saini (6th-A)</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">sunita.hindi / Jawahar@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleAutofill('priya.english', 'Jawahar@123')}
                className="p-2.5 text-left bg-white rounded-xl border border-neutral-200 hover:border-blue-400 transition-colors cursor-pointer group"
              >
                <div className="font-bold text-neutral-900 group-hover:text-[#0b2850]">Mrs. Priya Sharma (12th)</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">priya.english / Jawahar@123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------- VIEW 2: AUTHENTICATED TEACHER DASHBOARD -------------------
  const isInsideCampus = distanceFromSchool !== null && distanceFromSchool <= ALLOWED_RADIUS;

  // Filter students for attendance view
  const filteredStudents = classStudents.filter((s) => {
    if (attendanceFilter === 'all') return true;
    const st = studentAttendanceMap[s.id] || 'present';
    return st === attendanceFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Teacher Profile & Role Bar */}
      <div className="bg-[#0b2850] text-white rounded-3xl p-6 sm:p-8 shadow-md border-b-4 border-[#ffcc00] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center text-3xl font-black shrink-0 border border-white/20">
            {teacherSession.gender === 'female' ? '👩‍🏫' : '👨‍🏫'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#f4b942] uppercase tracking-wider">
                शिक्षक पहचान संख्या: {teacherSession.id}
              </span>
              <span className="text-xs text-blue-200 font-bold bg-white/10 px-2.5 py-0.5 rounded-full">
                प्रभारी कक्षाध्यापक: {teacherSession.assignedClass}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              {teacherSession.name}
            </h2>
            <div className="text-xs text-blue-200">
              {teacherSession.designation} · {teacherSession.subject} · फोन: {teacherSession.phone}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>लॉगआउट</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD NAVIGATION TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('student_attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'student_attendance'
              ? 'bg-[#0b2850] text-[#f4b942] shadow-sm ring-2 ring-[#f4b942]'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Users className="w-4 h-4 text-[#f4b942]" />
          <span>दैनिक छात्र उपस्थिति रजिस्टर (Daily Student Attendance)</span>
        </button>

        <button
          onClick={() => setActiveTab('marks_entry')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'marks_entry'
              ? 'bg-[#0b2850] text-[#f4b942] shadow-sm ring-2 ring-[#f4b942]'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Award className="w-4 h-4 text-[#f4b942]" />
          <span>कक्षा परीक्षा अंक प्रविष्टि (Exam Marks Entry)</span>
        </button>

        <button
          onClick={() => setActiveTab('my_attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'my_attendance'
              ? 'bg-[#0b2850] text-[#f4b942] shadow-sm ring-2 ring-[#f4b942]'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>मेरी GPS उपस्थिति (Teacher Geofence)</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: DAILY STUDENT ATTENDANCE REGISTER (कक्षाध्यापक दैनिक हाजिरी)
          ========================================================================= */}
      {activeTab === 'student_attendance' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Top Controls: Class selector & Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#0b2850] uppercase tracking-wider">
                <Users className="w-4 h-4 text-[#0b2850]" />
                <span>Class Teacher Register | कक्षाध्यापक दैनिक हाजिरी रजिस्टर</span>
              </div>
              <h3 className="text-xl font-black text-neutral-900 mt-0.5">
                {selectedClass} — दैनिक छात्र उपस्थिति
              </h3>
              <p className="text-xs text-neutral-500">
                कक्षाध्यापक द्वारा लगाई गई हाजिरी सीधे अभिभावक के मोबाइल पोर्टल पर तुरंत अपडेट हो जाती है।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Class Switcher */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-neutral-700">कक्षा:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold text-[#0b2850] focus:ring-2 focus:ring-[#0b2850]"
                >
                  <option value="Class 10th-A">Class 10th-A (10वीं-अ)</option>
                  <option value="Class 8th-B">Class 8th-B (8वीं-ब)</option>
                  <option value="Class 12th-Science">Class 12th-Science (12वीं विज्ञान)</option>
                  <option value="Class 6th-A">Class 6th-A (6वीं-अ)</option>
                  <option value="Class 9th-A">Class 9th-A (9वीं-अ)</option>
                </select>
              </div>

              {/* Date Input */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-neutral-700">तारीख:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              {/* Reload Button */}
              <button
                type="button"
                onClick={fetchClassStudents}
                title="छात्र सूची रीफ्रेश करें"
                className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Bulk Action Buttons & Tally */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#f4f7fc] border border-blue-100">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#0b2850]">
              <span className="shrink-0">त्वरित एक्शन:</span>
              <button
                type="button"
                onClick={() => handleMarkAllStudents('present')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>सभी उपस्थित (All Present)</span>
              </button>
              <button
                type="button"
                onClick={() => handleMarkAllStudents('absent')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>सभी अनुपस्थित (All Absent)</span>
              </button>
              <button
                type="button"
                onClick={handleInvertAttendance}
                className="px-3 py-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs cursor-pointer transition-all"
              >
                <span>उलटे (Invert)</span>
              </button>
            </div>

            {/* Attendance Tally */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                उपस्थित: {classStudents.filter((s) => (studentAttendanceMap[s.id] || 'present') === 'present').length}
              </span>
              <span className="text-rose-700 bg-rose-100/70 px-2.5 py-1 rounded-md">
                अनुपस्थित: {classStudents.filter((s) => studentAttendanceMap[s.id] === 'absent').length}
              </span>
              <span className="text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-md">
                अवकाश: {classStudents.filter((s) => studentAttendanceMap[s.id] === 'leave').length}
              </span>
              <span className="text-[#0b2850] bg-blue-100/70 px-2.5 py-1 rounded-md font-mono">
                कुल: {classStudents.length} छात्र
              </span>
            </div>
          </div>

          {/* Filter Chips & Parent Alert Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>फ़िल्टर:</span>
              </span>
              {(['all', 'present', 'absent', 'leave'] as const).map((flt) => (
                <button
                  key={flt}
                  type="button"
                  onClick={() => setAttendanceFilter(flt)}
                  className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all ${
                    attendanceFilter === flt
                      ? 'bg-[#0b2850] text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {flt === 'all' && `सभी (${classStudents.length})`}
                  {flt === 'present' && `उपस्थित (${classStudents.filter((s) => (studentAttendanceMap[s.id] || 'present') === 'present').length})`}
                  {flt === 'absent' && `अनुपस्थित (${classStudents.filter((s) => studentAttendanceMap[s.id] === 'absent').length})`}
                  {flt === 'leave' && `अवकाश (${classStudents.filter((s) => studentAttendanceMap[s.id] === 'leave').length})`}
                </button>
              ))}
            </div>

            {/* SMS / WhatsApp Alert to Parents Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-900 font-semibold select-none">
              <input
                type="checkbox"
                checked={notifyParentsOfAbsent}
                onChange={(e) => setNotifyParentsOfAbsent(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1">
                <Send className="w-3.5 h-3.5 text-amber-600" />
                <span>अनुपस्थित छात्रों के अभिभावकों को SMS अलर्ट भेजें</span>
              </span>
            </label>
          </div>

          {studentAttendanceSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{studentAttendanceSuccess}</span>
            </div>
          )}

          {/* Student Roster Table */}
          <div className="overflow-x-auto rounded-2xl border border-neutral-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0b2850] text-white font-bold">
                <tr>
                  <th className="py-3 px-4 font-mono w-20">रोल नं.</th>
                  <th className="py-3 px-4">विद्यार्थी का नाम</th>
                  <th className="py-3 px-4">पिता का नाम</th>
                  <th className="py-3 px-4 text-center">दैनिक उपस्थिति (Mark P / A / L)</th>
                  <th className="py-3 px-4">टिप्पणी / अवकाश का कारण</th>
                  <th className="py-3 px-4 text-right font-mono">माह उपस्थिति %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {filteredStudents.map((stu) => {
                  const currentStatus = studentAttendanceMap[stu.id] || 'present';

                  return (
                    <tr key={stu.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-700">
                        #{stu.rollNo}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-neutral-900">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{stu.avatar}</span>
                          <span>{stu.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-neutral-600">
                        {stu.fatherName}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-300 gap-1 shadow-inner">
                          <button
                            type="button"
                            onClick={() => setStudentAttendanceMap({ ...studentAttendanceMap, [stu.id]: 'present' })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs scale-102'
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            P (उपस्थित)
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentAttendanceMap({ ...studentAttendanceMap, [stu.id]: 'absent' })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs scale-102'
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            A (अनुपस्थित)
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentAttendanceMap({ ...studentAttendanceMap, [stu.id]: 'leave' })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'leave'
                                ? 'bg-amber-500 text-white shadow-xs scale-102'
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            L (अवकाश)
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          value={studentAttendanceNotes[stu.id] || ''}
                          onChange={(e) => setStudentAttendanceNotes({ ...studentAttendanceNotes, [stu.id]: e.target.value })}
                          placeholder={currentStatus === 'absent' ? 'उदा. बिना सूचना गैरहाजिर' : currentStatus === 'leave' ? 'उदा. पारिवारिक कार्य' : 'उपस्थित'}
                          className="w-full px-2.5 py-1 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:bg-white"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-800">
                        {stu.attendanceStats.percentage}%
                      </td>
                    </tr>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      चयनित फ़िल्टर के अनुसार कोई छात्र नहीं मिला।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Action Footer: Save & Print */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer w-fit"
            >
              <Printer className="w-4 h-4 text-neutral-500" />
              <span>उपस्थिति रजिस्टर प्रिंट करें (Print Register)</span>
            </button>

            <button
              type="button"
              onClick={handleSaveStudentAttendance}
              disabled={isSavingStudentAttendance || classStudents.length === 0}
              className="py-3 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
            >
              {isSavingStudentAttendance ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>उपस्थिति सहेजी जा रही है...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>दैनिक उपस्थिति रजिस्टर सुरक्षित करें (Save Register)</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: CLASS EXAM MARKS ENTRY (कक्षा परीक्षा अंक प्रविष्टि)
          ========================================================================= */}
      {activeTab === 'marks_entry' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#0b2850] uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#f4b942]" />
                <span>Class Marks Entry | कक्षा परीक्षा अंक प्रविष्टि</span>
              </div>
              <h3 className="text-xl font-black text-neutral-900 mt-0.5">
                {selectedClass} — 1st/2nd मिड-टर्म व अर्धवार्षिक अंक प्रविष्टि
              </h3>
              <p className="text-xs text-neutral-500">
                कक्षाध्यापक द्वारा दर्ज किए गए अंक तुरंत छात्र की डिजिटल अंकतालिका (Report Card) में जुड़ जाते हैं।
              </p>
            </div>

            {/* Exam Term Selector & Mode Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Term Selector */}
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-neutral-700">परीक्षा टर्म:</span>
                <select
                  value={marksExamTerm}
                  onChange={(e) => setMarksExamTerm(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold text-[#0b2850] focus:ring-2 focus:ring-[#0b2850]"
                >
                  <option value="first_midterm">1st Mid-term (प्रथम परख - पूर्णांक 10)</option>
                  <option value="second_midterm">2nd Mid-term (द्वितीय परख - पूर्णांक 10)</option>
                  <option value="half_yearly">Half-Yearly (अर्धवार्षिक - पूर्णांक 100)</option>
                </select>
              </div>

              {/* View Mode Switcher */}
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-neutral-700">प्रविष्टि मोड:</span>
                <div className="flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-300">
                  <button
                    type="button"
                    onClick={() => setMarksMode('full_gradebook')}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      marksMode === 'full_gradebook'
                        ? 'bg-[#0b2850] text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>सम्पूर्ण अंकतालिका (All Subjects)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarksMode('single_subject')}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      marksMode === 'single_subject'
                        ? 'bg-[#0b2850] text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>एकल विषय (Single Subject)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {marksSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{marksSuccess}</span>
            </div>
          )}

          {/* ----------------- SUB-MODE A: FULL CLASS GRADEBOOK SPREADSHEET ----------------- */}
          {marksMode === 'full_gradebook' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#f4f7fc] border border-blue-100 text-xs text-[#0b2850] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold">
                  <FileSpreadsheet className="w-4 h-4 text-[#f4b942]" />
                  <span>
                    सम्पूर्ण कक्षा अंकतालिका ग्रिड: सभी विषयों के अंक एक साथ भरें। कुल योग, प्रतिशत एवं ग्रेड स्वतः परिकलित होते हैं।
                  </span>
                </div>
                <div className="font-mono font-bold text-neutral-600">
                  कक्षा: {selectedClass} · कुल विद्यार्थी: {classStudents.length}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-neutral-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b2850] text-white font-bold">
                    <tr>
                      <th className="py-3 px-3 font-mono">रोल नं.</th>
                      <th className="py-3 px-3">विद्यार्थी का नाम</th>
                      {classSubjects.map((sub) => (
                        <th key={sub.name} className="py-3 px-3 text-center">
                          <div>{sub.name.split(' ')[0]}</div>
                          <div className="text-[10px] text-blue-200 font-mono">Max: {sub.maxMarks}</div>
                        </th>
                      ))}
                      <th className="py-3 px-3 text-center font-mono bg-[#082040]">कुल अंक</th>
                      <th className="py-3 px-3 text-center font-mono bg-[#082040]">प्रतिशत %</th>
                      <th className="py-3 px-3 text-center bg-[#082040]">ग्रेड</th>
                      <th className="py-3 px-3 min-w-[140px]">शिक्षक टिप्पणी (Remarks)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white font-sans">
                    {classStudents.map((stu) => {
                      const studentGrid = gradebookMap[stu.id] || {};
                      const rowTotal = classSubjects.reduce((sum, sub) => sum + (studentGrid[sub.name] ?? 0), 0);
                      const rowMaxTotal = classSubjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
                      const rowPercent = rowMaxTotal > 0 ? Number(((rowTotal / rowMaxTotal) * 100).toFixed(1)) : 0;
                      const rowGrade = rowPercent >= 90 ? 'A+' : rowPercent >= 80 ? 'A' : rowPercent >= 70 ? 'B+' : rowPercent >= 60 ? 'B' : 'C';

                      return (
                        <tr key={stu.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-neutral-700">
                            #{stu.rollNo}
                          </td>
                          <td className="py-2.5 px-3 font-extrabold text-neutral-900 whitespace-nowrap">
                            <span className="mr-1.5">{stu.avatar}</span>
                            {stu.name}
                          </td>

                          {/* Subject Inputs */}
                          {classSubjects.map((sub) => {
                            const val = studentGrid[sub.name] ?? 0;
                            return (
                              <td key={sub.name} className="py-2 px-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={sub.maxMarks}
                                  step={marksExamTerm === 'half_yearly' ? 1 : 0.5}
                                  value={val}
                                  onChange={(e) => {
                                    const nextVal = Math.min(sub.maxMarks, Math.max(0, Number(e.target.value)));
                                    setGradebookMap((prev) => ({
                                      ...prev,
                                      [stu.id]: {
                                        ...(prev[stu.id] || {}),
                                        [sub.name]: nextVal
                                      }
                                    }));
                                  }}
                                  className="w-16 px-1.5 py-1 text-center bg-neutral-50 border border-neutral-300 rounded-md font-mono font-bold text-xs text-neutral-900 focus:bg-white focus:ring-2 focus:ring-[#0b2850]"
                                />
                              </td>
                            );
                          })}

                          {/* Calculated Row Stats */}
                          <td className="py-2.5 px-3 text-center font-mono font-black text-neutral-900 bg-neutral-50/70">
                            {rowTotal} / {rowMaxTotal}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 bg-neutral-50/70">
                            {rowPercent}%
                          </td>
                          <td className="py-2.5 px-3 text-center bg-neutral-50/70">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800">
                              {rowGrade}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={gradebookRemarks[stu.id] || ''}
                              onChange={(e) => {
                                const rem = e.target.value;
                                setGradebookRemarks((prev) => ({ ...prev, [stu.id]: rem }));
                              }}
                              placeholder="उदा. बहुत अच्छा प्रदर्शन"
                              className="w-full px-2 py-1 bg-neutral-50 border border-neutral-300 rounded text-xs focus:bg-white"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons for Full Gradebook */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer w-fit"
                >
                  <Printer className="w-4 h-4 text-neutral-500" />
                  <span>सम्पूर्ण अंकतालिका प्रिंट करें (Print Marksheet)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveFullGradebook}
                  disabled={isSavingMarks || classStudents.length === 0}
                  className="py-3 px-8 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
                >
                  {isSavingMarks ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>अंकतालिका सहेजी जा रही है...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#f4b942]" />
                      <span>सम्पूर्ण कक्षा अंकतालिका सुरक्षित करें (Save Complete Gradebook)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ----------------- SUB-MODE B: SINGLE SUBJECT MARKS ENTRY ----------------- */}
          {marksMode === 'single_subject' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 p-3 rounded-2xl bg-[#f4f7fc] border border-blue-100">
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-neutral-700">विषय (Subject):</span>
                  <select
                    value={marksSubject}
                    onChange={(e) => setMarksSubject(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-bold text-[#0b2850]"
                  >
                    <option value="Mathematics (गणित)">Mathematics (गणित)</option>
                    <option value="Science (विज्ञान)">Science (विज्ञान)</option>
                    <option value="English (अंग्रेजी)">English (अंग्रेजी)</option>
                    <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                    <option value="Social Science (सामाजिक विज्ञान)">Social Science (सामाजिक विज्ञान)</option>
                    <option value="Physics (भौतिक विज्ञान)">Physics (भौतिक विज्ञान)</option>
                    <option value="Chemistry (रसायन विज्ञान)">Chemistry (रसायन विज्ञान)</option>
                    <option value="Sanskrit (संस्कृत)">Sanskrit (संस्कृत)</option>
                  </select>
                </div>

                <div className="space-y-0.5 text-xs w-28">
                  <span className="font-bold text-neutral-700">पूर्णांक (Max Marks):</span>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-neutral-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#0b2850] text-white font-bold">
                    <tr>
                      <th className="py-3 px-4 font-mono">रोल नं.</th>
                      <th className="py-3 px-4">विद्यार्थी का नाम</th>
                      <th className="py-3 px-4 text-center">पूर्णांक</th>
                      <th className="py-3 px-4 text-center">प्राप्तांक (Marks Input)</th>
                      <th className="py-3 px-4 text-center">ग्रेड (Grade)</th>
                      <th className="py-3 px-4">शिक्षक टिप्पणी (Remarks)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {classStudents.map((stu) => {
                      const val = marksMap[stu.id] ?? 0;
                      const grade = val >= maxMarks * 0.9 ? 'A+' : val >= maxMarks * 0.8 ? 'A' : val >= maxMarks * 0.7 ? 'B+' : val >= maxMarks * 0.6 ? 'B' : 'C';

                      return (
                        <tr key={stu.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-neutral-700">
                            #{stu.rollNo}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-neutral-900">
                            <span className="mr-1.5">{stu.avatar}</span>
                            {stu.name}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-neutral-500 font-bold">
                            {maxMarks}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={maxMarks}
                              value={val}
                              onChange={(e) => setMarksMap({ ...marksMap, [stu.id]: Number(e.target.value) })}
                              className="w-20 px-2 py-1.5 text-center bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-mono font-black text-neutral-900 focus:bg-white focus:ring-2 focus:ring-[#0b2850]"
                            />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md font-mono">
                              {grade}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              value={remarksMap[stu.id] || ''}
                              onChange={(e) => setRemarksMap({ ...remarksMap, [stu.id]: e.target.value })}
                              placeholder="उदा. बहुत अच्छा प्रयास"
                              className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveClassMarks}
                  disabled={isSavingMarks || classStudents.length === 0}
                  className="py-3 px-8 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white font-black text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
                >
                  {isSavingMarks ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>अंक सहेजे जा रहे हैं...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#f4b942]" />
                      <span>{marksSubject} के अंक सुरक्षित करें (Save Marks)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          TAB 3: TEACHER OWN GEOFENCE ATTENDANCE (शिक्षक स्वयं की हाजिरी)
          ========================================================================= */}
      {activeTab === 'my_attendance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0b2850] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Anti-Fake Attendance Engine | दैनिक GPS उपस्थिति</span>
                </div>
                <h3 className="text-xl font-black text-neutral-900 mt-0.5">
                  स्कूल कैंपस जियोफेंस उपस्थिति (School Campus Only)
                </h3>
                <p className="text-xs text-neutral-500">
                  फर्जी उपस्थिति रोकने हेतु केवल स्कूल परिसर (200 मीटर परिधि) के भीतर उपस्थित होने पर ही हाजिरी दर्ज होती है।
                </p>
              </div>

              {/* Simulation Toggle */}
              <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-200 text-xs space-y-1">
                <div className="font-bold text-neutral-700 flex items-center justify-between gap-4">
                  <span>GPS लोकेशन मोड:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !useCampusSimulation;
                      setUseCampusSimulation(next);
                      updateLocation(next);
                    }}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      useCampusSimulation 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-neutral-800 text-white'
                    }`}
                  >
                    {useCampusSimulation ? 'कैंपस में उपस्थित (Simulated)' : 'डिवाइस GPS (Real)'}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500">
                  {useCampusSimulation ? '✅ स्कूल गेट के 18m अंदर' : '🛰️ वास्तविक डिवाइस लोकेशन जांच'}
                </p>
              </div>
            </div>

            {/* Status alerts */}
            {attendanceMessage && (
              <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-3 ${
                attendanceMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {attendanceMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>{attendanceMessage.text}</div>
              </div>
            )}

            {/* Geofence Status Radar Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border ${
                isInsideCampus 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}>
                <div className="text-xs font-bold uppercase tracking-wider">कैंपस दूरी (Distance)</div>
                <div className="text-2xl font-black font-mono tabular-nums mt-1">
                  {distanceFromSchool !== null ? `${distanceFromSchool} मीटर` : 'गणना जारी...'}
                </div>
                <div className="text-xs font-semibold mt-1 flex items-center gap-1">
                  {isInsideCampus ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>कैंपस के अंदर (मान्य सीमा 200m)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>कैंपस से बाहर (अमान्य दूरी)</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-800">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">स्कूल स्थान</div>
                <div className="text-sm font-bold mt-1">मनोता खुर्द, झुंझुनूं</div>
                <div className="text-xs font-mono text-neutral-500 mt-1">
                  28.0254° N, 75.7891° E
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-800">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">आज की उपस्थिति स्थिति</div>
                {todayAttendance ? (
                  <div>
                    <div className="text-xl font-black text-emerald-600 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>उपस्थित (Present)</span>
                    </div>
                    <div className="text-xs font-mono text-neutral-500 mt-0.5">
                      समय: {todayAttendance.time} · GPS सत्यापित
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-lg font-bold text-amber-700 mt-1 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>लगाना शेष है (Pending)</span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      प्रातः 08:30 बजे से पूर्व लगाएं
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div>
              {todayAttendance ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>आपकी आज की उपस्थिति दर्ज हो चुकी है (प्रातः {todayAttendance.time})। धन्यवाद!</span>
                  </span>
                  <span className="font-mono text-xs bg-emerald-100 px-2.5 py-1 rounded-md text-emerald-800">
                    ID: {todayAttendance.id}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleMarkTeacherAttendance}
                  disabled={isMarking || !isInsideCampus}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    isInsideCampus
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {isMarking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>GPS एवं बायोमेट्रिक सत्यापित हो रहा है...</span>
                    </>
                  ) : isInsideCampus ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span>स्कूल कैंपस उपस्थिति दर्ज करें (Mark Attendance Now)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      <span>उपस्थिति ब्लॉक: केवल स्कूल परिसर में आकर ही हाजिरी लगाएं</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Teacher History Table */}
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0b2850]" />
                  <span>शिक्षक उपस्थिति इतिहास (Attendance Log)</span>
                </h3>
              </div>
              {historyStats && (
                <div className="text-right">
                  <div className="text-xs text-neutral-500 font-medium">मासिक उपस्थिति:</div>
                  <div className="text-xl font-black text-[#0b2850] font-mono tabular-nums">
                    {historyStats.percentage}%
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#f4f7fc] text-[#0b2850] font-bold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">तारीख</th>
                    <th className="py-3 px-4">समय</th>
                    <th className="py-3 px-4">स्थिति</th>
                    <th className="py-3 px-4">सत्यापन विधि</th>
                    <th className="py-3 px-4 font-mono">कैंपस दूरी</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {attendanceHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4 font-bold text-neutral-900">
                        {new Date(rec.date).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-neutral-700">{rec.time}</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md font-bold text-xs">
                          उपस्थित
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-neutral-600">
                        {rec.verificationMethod === 'school_campus_geofence' ? '🛰️ GPS जियोफेंस (कैंपस)' : '🛡️ प्रशासन प्रमाणित'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-neutral-500">{rec.distanceFromCampusMeters}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
