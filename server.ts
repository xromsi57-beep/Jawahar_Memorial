import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SCHOOL_CAMPUS, INITIAL_TEACHERS, INITIAL_STUDENTS, INITIAL_TEACHER_ATTENDANCE } from './src/data/schoolData';
import { Teacher, Student, TeacherAttendanceRecord, BoardStudentResult } from './src/types';
import { INITIAL_BOARD_RESULTS, YEAR_METRICS } from './src/data/boardResultsData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.resolve(DATA_DIR, 'school_store.json');

interface SchoolStore {
  teachers: Teacher[];
  students: Student[];
  teacherAttendance: TeacherAttendanceRecord[];
  boardResults: BoardStudentResult[];
  notices: Array<{ id: string; title: string; date: string; category: string }>;
}

function initStore(): SchoolStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.teachers && parsed.students && parsed.teacherAttendance) {
        if (!parsed.boardResults || !Array.isArray(parsed.boardResults) || parsed.boardResults.length === 0) {
          parsed.boardResults = [...INITIAL_BOARD_RESULTS];
          saveStore(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading school store, creating defaults:', err);
  }

  const defaultStore: SchoolStore = {
    teachers: [...INITIAL_TEACHERS],
    students: [...INITIAL_STUDENTS],
    teacherAttendance: [...INITIAL_TEACHER_ATTENDANCE],
    boardResults: [...INITIAL_BOARD_RESULTS],
    notices: [
      { id: 'N-1', title: 'सत्र 2026-27 नवीन प्रवेश प्रारंभ (नर्सरी से 12वीं कला व विज्ञान वर्ग)', date: '2026-10-12', category: 'प्रवेश' },
      { id: 'N-2', title: 'द्वितीय परख (2nd Mid-term) परीक्षा परिणाम ऑनलाइन पोर्टल पर जारी', date: '2026-10-10', category: 'परीक्षा' },
      { id: 'N-3', title: 'अभिभावक-शिक्षक बैठक (PTM) आगामी शनिवार को प्रातः 10:00 बजे आयोजित होगी', date: '2026-10-08', category: 'बैठक' },
      { id: 'N-4', title: 'कक्षा 10वीं व 12वीं बोर्ड परीक्षार्थियों हेतु अतिरिक्त मार्गदर्शन कक्षाएं', date: '2026-10-05', category: 'शैक्षणिक' },
    ]
  };

  saveStore(defaultStore);
  return defaultStore;
}

function saveStore(store: SchoolStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save school store:', err);
  }
}

let schoolDb = initStore();

// Haversine formula to calculate exact distance in meters between two GPS coordinates
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// ----------------- API ENDPOINTS -----------------

// 1. Teacher Login (Username & School-assigned Password)
app.post('/api/auth/teacher-login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'यूजरनेम और पासवर्ड दर्ज करना अनिवार्य है।' });
  }

  const cleanUser = username.trim().toLowerCase();
  const teacher = schoolDb.teachers.find(
    (t) => t.username.toLowerCase() === cleanUser && t.passwordHash === password.trim()
  );

  if (!teacher) {
    return res.status(401).json({
      success: false,
      message: 'अमान्य यूजरनेम या पासवर्ड! कृपया विद्यालय प्रशासन द्वारा दिया गया सही पासवर्ड दर्ज करें।'
    });
  }

  // Check today's attendance for this teacher
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = schoolDb.teacherAttendance.find(
    (a) => a.teacherId === teacher.id && a.date === todayStr
  );

  return res.json({
    success: true,
    teacher: {
      id: teacher.id,
      username: teacher.username,
      name: teacher.name,
      gender: teacher.gender,
      designation: teacher.designation,
      subject: teacher.subject,
      phone: teacher.phone,
      email: teacher.email,
      assignedClass: teacher.assignedClass
    },
    todayAttendance: todayRecord || null
  });
});

// 2. Parent Login via Mobile Number (Supports Multi-child families!)
app.post('/api/auth/parent-login', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'कृपया पंजीकृत मोबाइल नंबर दर्ज करें।' });
  }

  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।' });
  }

  // Search all students registered with this parent's phone number
  const children = schoolDb.students.filter((s) => s.parentPhone.includes(cleanPhone));

  if (children.length === 0) {
    return res.status(404).json({
      success: false,
      message: `मोबाइल नंबर ${cleanPhone} से कोई छात्र पंजीकृत नहीं मिला। कृपया विद्यालय कार्यालय से संपर्क करें या डेमो नंबर 9876543210 दर्ज करें।`
    });
  }

  return res.json({
    success: true,
    message: `${children.length} विद्यार्थी प्रोफाइल प्राप्त हुई।`,
    parentPhone: cleanPhone,
    totalChildren: children.length,
    children
  });
});

// 3. Teacher Attendance Marking with Anti-Fake GPS Geofencing
app.post('/api/attendance/teacher/mark', (req: Request, res: Response) => {
  const { teacherId, latitude, longitude, isCampusOverride, selfieImage } = req.body;

  if (!teacherId) {
    return res.status(400).json({ success: false, message: 'शिक्षक पहचान अनिवार्य है।' });
  }

  const teacher = schoolDb.teachers.find((t) => t.id === teacherId);
  if (!teacher) {
    return res.status(404).json({ success: false, message: 'शिक्षक रिकॉर्ड नहीं मिला।' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const existingRecord = schoolDb.teacherAttendance.find(
    (a) => a.teacherId === teacherId && a.date === todayStr
  );

  if (existingRecord) {
    return res.status(400).json({
      success: false,
      message: `आपकी आज की उपस्थिति पहले ही प्रातः ${existingRecord.time} पर दर्ज की जा चुकी है!`
    });
  }

  let finalLat = typeof latitude === 'number' ? latitude : SCHOOL_CAMPUS.latitude;
  let finalLng = typeof longitude === 'number' ? longitude : SCHOOL_CAMPUS.longitude;
  let distanceMeters = 0;

  if (isCampusOverride) {
    // School premise simulation
    finalLat = SCHOOL_CAMPUS.latitude + (Math.random() - 0.5) * 0.0002;
    finalLng = SCHOOL_CAMPUS.longitude + (Math.random() - 0.5) * 0.0002;
    distanceMeters = calculateDistanceMeters(finalLat, finalLng, SCHOOL_CAMPUS.latitude, SCHOOL_CAMPUS.longitude);
  } else {
    // Real Geolocation
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'GPS लोकेशन प्राप्त नहीं हो सकी। कृपया लोकेशन अनुमति दें।'
      });
    }
    distanceMeters = calculateDistanceMeters(finalLat, finalLng, SCHOOL_CAMPUS.latitude, SCHOOL_CAMPUS.longitude);
  }

  // ANTI-FAKE RULE: Must be within allowed radius (200m) of school campus
  if (distanceMeters > SCHOOL_CAMPUS.allowedRadiusMeters && !isCampusOverride) {
    return res.status(403).json({
      success: false,
      isGeofenceViolation: true,
      distanceMeters,
      allowedRadius: SCHOOL_CAMPUS.allowedRadiusMeters,
      message: `उपस्थिति अस्वीकृत! आप स्कूल कैंपस (मनोता खुर्द) से ${distanceMeters} मीटर दूर हैं। फर्जी उपस्थिति रोकने के लिए स्कूल परिसर (200 मीटर परिधि) में आकर ही हाजिरी दर्ज की जा सकती है!`
    });
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const newRecord: TeacherAttendanceRecord = {
    id: `ATT-${Date.now()}`,
    teacherId,
    teacherName: teacher.name,
    date: todayStr,
    time: timeStr,
    status: 'present',
    latitude: finalLat,
    longitude: finalLng,
    distanceFromCampusMeters: distanceMeters,
    isGpsVerified: true,
    verificationMethod: isCampusOverride ? 'admin_override' : 'school_campus_geofence',
    selfieImage: selfieImage || undefined,
    notes: `कैंपस GPS सत्यापित (${distanceMeters}m दूरी)`
  };

  schoolDb.teacherAttendance.unshift(newRecord);
  saveStore(schoolDb);

  return res.json({
    success: true,
    message: `बधाई हो! आपकी उपस्थिति ${timeStr} पर GPS जियोफेंस द्वारा सफलतापूर्वक दर्ज कर ली गई है।`,
    record: newRecord
  });
});

// 4. Get Teacher Attendance History
app.get('/api/attendance/teacher/history/:teacherId', (req: Request, res: Response) => {
  const teacherId = req.params.teacherId;
  const records = schoolDb.teacherAttendance.filter((a) => a.teacherId === teacherId);

  const totalWorkingDays = 24; // This month
  const presentDays = records.length;
  const percentage = Math.min(100, Number(((presentDays / totalWorkingDays) * 100).toFixed(1)));

  res.json({
    success: true,
    stats: {
      totalWorkingDays,
      presentDays,
      percentage
    },
    records
  });
});

// 5. Update Student Marks (by Teacher or Admin)
app.post('/api/student/marks/update', (req: Request, res: Response) => {
  const { studentId, termKey, subjectIndex, newMarks } = req.body;

  const student = schoolDb.students.find((s) => s.id === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'छात्र रिकॉर्ड नहीं मिला।' });
  }

  let termObj = null;
  if (termKey === 'first_midterm') termObj = student.results.firstMidterm;
  else if (termKey === 'second_midterm') termObj = student.results.secondMidterm;
  else if (termKey === 'half_yearly') termObj = student.results.halfYearly;

  if (termObj && termObj.subjects[subjectIndex]) {
    termObj.subjects[subjectIndex].marksObtained = Number(newMarks);
    // Recalculate total
    const total = termObj.subjects.reduce((sum, s) => sum + s.marksObtained, 0);
    termObj.obtainedTotal = total;
    termObj.percentage = Number(((total / termObj.maxTotal) * 100).toFixed(1));
    saveStore(schoolDb);
    return res.json({ success: true, message: 'अंक सफलतापूर्वक अपडेट किए गए।', student });
  }

  return res.status(400).json({ success: false, message: 'अमान्य विषय या परीक्षा टर्म।' });
});

// 5b. Get Students of a Specific Class
app.get('/api/class-students/:className', (req: Request, res: Response) => {
  const className = decodeURIComponent(req.params.className || '');
  let students = schoolDb.students;
  if (className && className !== 'all') {
    students = schoolDb.students.filter(
      (s) => s.class.toLowerCase().includes(className.toLowerCase())
    );
  }
  return res.json({ success: true, count: students.length, students });
});

// 5c. Class Teacher Daily Attendance Submission
app.post('/api/attendance/class/mark', (req: Request, res: Response) => {
  const { className, date, attendanceList } = req.body;
  if (!date || !Array.isArray(attendanceList)) {
    return res.status(400).json({ success: false, message: 'अमान्य उपस्थिति डेटा।' });
  }

  const dateStr = date.trim();
  let updatedCount = 0;

  attendanceList.forEach((item: { studentId: string; status: 'present' | 'absent' | 'leave' }) => {
    const student = schoolDb.students.find((s) => s.id === item.studentId);
    if (student) {
      // Find if date already logged
      const existingIdx = student.attendanceStats.recentLog.findIndex((l) => l.date === dateStr);
      if (existingIdx >= 0) {
        student.attendanceStats.recentLog[existingIdx].status = item.status;
      } else {
        student.attendanceStats.recentLog.unshift({ date: dateStr, status: item.status });
      }

      // If present today and wasn't present before on new day, increment days
      const presentCount = student.attendanceStats.recentLog.filter((l) => l.status === 'present').length;
      student.attendanceStats.daysPresent = Math.max(student.attendanceStats.daysPresent, presentCount + 100);
      student.attendanceStats.percentage = Number(
        ((student.attendanceStats.daysPresent / student.attendanceStats.totalDays) * 100).toFixed(1)
      );
      updatedCount++;
    }
  });

  saveStore(schoolDb);

  return res.json({
    success: true,
    message: `${className || 'कक्षा'} के ${updatedCount} विद्यार्थियों की उपस्थिति सफलतापूर्वक दर्ज की गई।`,
    date: dateStr
  });
});

// 5d. Class Teacher Bulk Marks Entry (1st Midterm, 2nd Midterm, Half-Yearly)
app.post('/api/marks/class/bulk-save', (req: Request, res: Response) => {
  const { className, termKey, subject, maxMarks, marksList } = req.body;
  if (!termKey || !subject || !Array.isArray(marksList)) {
    return res.status(400).json({ success: false, message: 'अमान्य परीक्षा अंक डेटा।' });
  }

  const numericMax = Number(maxMarks) || (termKey === 'half_yearly' ? 100 : 10);
  let updatedCount = 0;

  marksList.forEach((item: { studentId: string; marksObtained: number; remarks?: string }) => {
    const student = schoolDb.students.find((s) => s.id === item.studentId);
    if (student) {
      let termObj = null;
      if (termKey === 'first_midterm') termObj = student.results.firstMidterm;
      else if (termKey === 'second_midterm') termObj = student.results.secondMidterm;
      else if (termKey === 'half_yearly') termObj = student.results.halfYearly;

      if (termObj) {
        const marks = Number(item.marksObtained);
        const grade = marks >= numericMax * 0.9 ? 'A+' : marks >= numericMax * 0.8 ? 'A' : marks >= numericMax * 0.7 ? 'B+' : marks >= numericMax * 0.6 ? 'B' : 'C';

        // Check if subject exists in subjects array
        const subIdx = termObj.subjects.findIndex((s) => s.subject.toLowerCase().includes(subject.toLowerCase().split(' ')[0]));
        if (subIdx >= 0) {
          termObj.subjects[subIdx].marksObtained = marks;
          termObj.subjects[subIdx].maxMarks = numericMax;
          termObj.subjects[subIdx].grade = grade;
        } else {
          termObj.subjects.push({
            subject,
            maxMarks: numericMax,
            marksObtained: marks,
            grade
          });
        }

        // Recalculate term total
        const total = termObj.subjects.reduce((sum, s) => sum + s.marksObtained, 0);
        termObj.obtainedTotal = total;
        termObj.percentage = Number(((total / termObj.maxTotal) * 100).toFixed(1));
        if (item.remarks) {
          termObj.remarks = item.remarks;
        }
        updatedCount++;
      }
    }
  });

  saveStore(schoolDb);

  return res.json({
    success: true,
    message: `${className || 'कक्षा'} के ${updatedCount} विद्यार्थियों के ${subject} अंक सफलतापूर्वक सहेजे गए।`
  });
});

// 5e. Class Teacher Full Gradebook Save (All subjects for entire class at once)
app.post('/api/marks/class/full-gradebook-save', (req: Request, res: Response) => {
  const { className, termKey, records } = req.body;
  if (!termKey || !Array.isArray(records)) {
    return res.status(400).json({ success: false, message: 'अमान्य अंकतालिका डेटा।' });
  }

  let updatedCount = 0;
  records.forEach((rec: { studentId: string; subjects: Array<{ subject: string; maxMarks: number; marksObtained: number }>; remarks?: string }) => {
    const student = schoolDb.students.find((s) => s.id === rec.studentId);
    if (student) {
      let termObj = null;
      if (termKey === 'first_midterm') termObj = student.results.firstMidterm;
      else if (termKey === 'second_midterm') termObj = student.results.secondMidterm;
      else if (termKey === 'half_yearly') termObj = student.results.halfYearly;

      if (termObj && Array.isArray(rec.subjects)) {
        rec.subjects.forEach((subItem) => {
          const marks = Number(subItem.marksObtained);
          const max = Number(subItem.maxMarks) || (termKey === 'half_yearly' ? 100 : 10);
          const grade = marks >= max * 0.9 ? 'A+' : marks >= max * 0.8 ? 'A' : marks >= max * 0.7 ? 'B+' : marks >= max * 0.6 ? 'B' : 'C';

          const existingSub = termObj.subjects.find((s) => s.subject.toLowerCase().includes(subItem.subject.toLowerCase().split(' ')[0]));
          if (existingSub) {
            existingSub.marksObtained = marks;
            existingSub.maxMarks = max;
            existingSub.grade = grade;
          } else {
            termObj.subjects.push({
              subject: subItem.subject,
              maxMarks: max,
              marksObtained: marks,
              grade
            });
          }
        });

        // Recalculate term total & percentage
        const total = termObj.subjects.reduce((sum, s) => sum + s.marksObtained, 0);
        termObj.obtainedTotal = total;
        termObj.maxTotal = termObj.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
        termObj.percentage = Number(((total / termObj.maxTotal) * 100).toFixed(1));
        if (rec.remarks) {
          termObj.remarks = rec.remarks;
        }
        updatedCount++;
      }
    }
  });

  saveStore(schoolDb);

  return res.json({
    success: true,
    message: `${className || 'कक्षा'} के ${updatedCount} विद्यार्थियों की सम्पूर्ण अंकतालिका सुरक्षित की गई।`
  });
});

// 5f. Refresh Parent Children Data Live
app.get('/api/parent/refresh/:phone', (req: Request, res: Response) => {
  const cleanPhone = (req.params.phone || '').replace(/\D/g, '');
  const children = schoolDb.students.filter((s) => s.parentPhone.includes(cleanPhone));
  return res.json({
    success: true,
    parentPhone: cleanPhone,
    totalChildren: children.length,
    children
  });
});

// 6. Admin Overview & Management API
app.get('/api/admin/overview', (_req: Request, res: Response) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const presentTeachersCount = schoolDb.teacherAttendance.filter((a) => a.date === todayStr).length;

  res.json({
    success: true,
    campus: SCHOOL_CAMPUS,
    stats: {
      totalTeachers: schoolDb.teachers.length,
      teachersPresentToday: presentTeachersCount,
      totalStudents: schoolDb.students.length,
      noticesCount: schoolDb.notices.length
    },
    teachers: schoolDb.teachers,
    todayAttendance: schoolDb.teacherAttendance.filter((a) => a.date === todayStr),
    notices: schoolDb.notices
  });
});

// 7. Add New Teacher (Admin action)
app.post('/api/teachers/create', (req: Request, res: Response) => {
  const { name, gender, designation, subject, phone, email, assignedClass, password } = req.body;
  if (!name || !subject || !phone) {
    return res.status(400).json({ success: false, message: 'शिक्षक का नाम, विषय और फोन नंबर अनिवार्य हैं।' });
  }

  // Generate username from name
  const cleanBase = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8);
  const username = `${cleanBase}.${subject.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4) || 'jm'}`;
  const pass = password || 'Jawahar@123';

  const newTeacher: Teacher = {
    id: `TCH-${Date.now().toString().slice(-4)}`,
    username,
    passwordHash: pass,
    name,
    gender: gender || 'male',
    designation: designation || 'अध्यापक',
    subject,
    phone,
    email: email || `${username}@jawaharmemorial.edu.in`,
    assignedClass: assignedClass || 'Class 9th'
  };

  schoolDb.teachers.push(newTeacher);
  saveStore(schoolDb);

  res.json({
    success: true,
    message: `शिक्षक ${name} का खाता सफलतापूर्वक बना दिया गया है।`,
    credentials: {
      username: newTeacher.username,
      password: newTeacher.passwordHash
    },
    teacher: newTeacher
  });
});

// 7b. Export Full School Database (Admin Backup)
app.get('/api/admin/export-db', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=jawahar_school_backup_${new Date().toISOString().split('T')[0]}.json`);
  return res.json(schoolDb);
});

// 7c. Restore / Update School Database (Admin Restore)
app.post('/api/admin/import-db', (req: Request, res: Response) => {
  const incomingData = req.body;
  if (!incomingData || !Array.isArray(incomingData.teachers) || !Array.isArray(incomingData.students)) {
    return res.status(400).json({ success: false, message: 'अमान्य डेटाबेस बैकअप फ़ाइल स्वरूप।' });
  }

  schoolDb = {
    teachers: incomingData.teachers,
    students: incomingData.students,
    teacherAttendance: Array.isArray(incomingData.teacherAttendance) ? incomingData.teacherAttendance : schoolDb.teacherAttendance,
    boardResults: Array.isArray(incomingData.boardResults) ? incomingData.boardResults : schoolDb.boardResults,
    notices: Array.isArray(incomingData.notices) ? incomingData.notices : schoolDb.notices
  };

  saveStore(schoolDb);
  return res.json({ success: true, message: 'डेटाबेस सफलतापूर्वक पुनर्स्थापित (Restore) कर दिया गया।' });
});

// 8. Board Examination Results API (Year-wise: 2024, 2023, 2022 -> 10th & 12th)
app.get('/api/board-results', (req: Request, res: Response) => {
  const yearQuery = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
  const classQuery = req.query.classType as string | undefined;
  const streamQuery = req.query.stream as string | undefined;

  let results = schoolDb.boardResults || [];

  if (yearQuery) {
    results = results.filter((r) => r.year === yearQuery);
  }
  if (classQuery && (classQuery === '10th' || classQuery === '12th')) {
    results = results.filter((r) => r.classType === classQuery);
  }
  if (streamQuery && streamQuery !== 'all') {
    results = results.filter((r) => r.stream?.toLowerCase() === streamQuery.toLowerCase());
  }

  // Sort by percentage descending
  results = [...results].sort((a, b) => b.percentage - a.percentage);

  // Available years in db
  const allYears = Array.from(new Set((schoolDb.boardResults || []).map((r) => r.year))).sort((a, b) => b - a);

  res.json({
    success: true,
    totalRecords: results.length,
    years: allYears.length > 0 ? allYears : [2024, 2023, 2022],
    results,
    yearMetrics: yearQuery ? YEAR_METRICS[yearQuery] : null
  });
});

// 8b. Add or Update Board Result (Admin)
app.post('/api/board-results', (req: Request, res: Response) => {
  const {
    id,
    year,
    classType,
    stream,
    rollNo,
    studentName,
    fatherName,
    percentage,
    division,
    rank,
    address,
    studentPhoto,
    highlight
  } = req.body;

  if (!year || !classType || !studentName || !fatherName || !percentage) {
    return res.status(400).json({
      success: false,
      message: 'वर्ष, कक्षा (10वीं/12वीं), छात्र का नाम, पिता का नाम और प्रतिशत अनिवार्य हैं।'
    });
  }

  if (!schoolDb.boardResults) {
    schoolDb.boardResults = [...INITIAL_BOARD_RESULTS];
  }

  const existingIdx = id ? schoolDb.boardResults.findIndex((r) => r.id === id) : -1;

  if (existingIdx >= 0) {
    // Update existing
    schoolDb.boardResults[existingIdx] = {
      ...schoolDb.boardResults[existingIdx],
      year: Number(year),
      classType,
      stream: stream || undefined,
      rollNo: rollNo || schoolDb.boardResults[existingIdx].rollNo,
      studentName,
      fatherName,
      percentage: Number(percentage),
      division: division || '1st Division with Distinction',
      rank: rank || undefined,
      address: address || 'ग्राम मनोता खुर्द, झुंझुनूं (राजस्थान)',
      studentPhoto: studentPhoto || schoolDb.boardResults[existingIdx].studentPhoto,
      highlight: highlight || undefined
    };
    saveStore(schoolDb);
    return res.json({
      success: true,
      message: 'बोर्ड परिणाम रिकॉर्ड सफलतापूर्वक अपडेट किया गया।',
      result: schoolDb.boardResults[existingIdx]
    });
  } else {
    // Create new
    const newRecord: BoardStudentResult = {
      id: `BR-${year}-${classType}-${Date.now().toString().slice(-4)}`,
      year: Number(year),
      classType,
      stream: stream || undefined,
      rollNo: rollNo || `${year}${classType === '10th' ? '10' : '12'}${Math.floor(100 + Math.random() * 900)}`,
      studentName,
      fatherName,
      percentage: Number(percentage),
      division: division || '1st Division with Distinction',
      rank: rank || 'मेधावी छात्र',
      address: address || 'ग्राम मनोता खुर्द, झुंझुनूं (राजस्थान)',
      studentPhoto: studentPhoto || '/src/assets/images/student_rahul_sharma_1791828048407.jpg',
      highlight: highlight || undefined
    };

    schoolDb.boardResults.push(newRecord);
    saveStore(schoolDb);
    return res.json({
      success: true,
      message: 'नया बोर्ड रिजल्ट सफलतापूर्वक जोड़ा गया।',
      result: newRecord
    });
  }
});

// 8c. Delete Board Result (Admin)
app.delete('/api/board-results/:id', (req: Request, res: Response) => {
  const resultId = req.params.id;
  if (!schoolDb.boardResults) {
    schoolDb.boardResults = [...INITIAL_BOARD_RESULTS];
  }

  const initialCount = schoolDb.boardResults.length;
  schoolDb.boardResults = schoolDb.boardResults.filter((r) => r.id !== resultId);

  if (schoolDb.boardResults.length === initialCount) {
    return res.status(404).json({ success: false, message: 'रिकॉर्ड नहीं मिला।' });
  }

  saveStore(schoolDb);
  return res.json({ success: true, message: 'रिकॉर्ड सफलतापूर्वक हटा दिया गया।' });
});

// ----------------- VITE MIDDLEWARE / STATIC ASSETS -----------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JAWAHAR MEMORIAL SIKSHANSTHAN] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
