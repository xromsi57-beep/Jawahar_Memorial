export interface Teacher {
  id: string;
  username: string;
  passwordHash: string; // school assigned password
  name: string;
  gender: 'male' | 'female';
  designation: string;
  subject: string;
  phone: string;
  email: string;
  assignedClass: string;
  avatar?: string;
}

export interface TeacherAttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. 08:15 AM
  status: 'present' | 'absent' | 'half_day' | 'leave';
  latitude: number;
  longitude: number;
  distanceFromCampusMeters: number;
  isGpsVerified: boolean;
  verificationMethod: 'school_campus_geofence' | 'admin_override';
  selfieImage?: string;
  notes?: string;
}

export interface SubjectMarks {
  subject: string;
  maxMarks: number;
  marksObtained: number;
  grade: string;
}

export interface TermResult {
  termKey: 'first_midterm' | 'second_midterm' | 'half_yearly';
  termTitle: string; // e.g. "1st Mid-term Test (प्रथम परख)"
  maxTotal: number;
  obtainedTotal: number;
  percentage: number;
  grade: string;
  rank: number;
  remarks: string;
  subjects: SubjectMarks[];
}

export interface DailyStudentAttendance {
  date: string;
  status: 'present' | 'absent' | 'leave';
}

export interface Student {
  id: string;
  rollNo: number;
  admissionNo: string;
  name: string;
  gender: 'male' | 'female';
  class: string; // e.g. "10th-A", "8th-B", "12th-Science", "6th-A"
  parentPhone: string;
  fatherName: string;
  motherName: string;
  dob: string;
  address: string;
  avatar: string;
  attendanceStats: {
    percentage: number;
    daysPresent: number;
    totalDays: number;
    recentLog: DailyStudentAttendance[];
  };
  results: {
    firstMidterm: TermResult;
    secondMidterm: TermResult;
    halfYearly: TermResult;
  };
  feesStatus: {
    totalFee: number;
    paidFee: number;
    dueFee: number;
    status: 'paid' | 'partial' | 'pending';
    lastReceiptNo: string;
  };
}

export interface CampusLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
}

export interface BoardStudentResult {
  id: string;
  year: number; // 2024, 2023, 2022
  classType: '10th' | '12th';
  stream?: 'Science' | 'Arts' | 'General';
  rollNo: string;
  studentName: string;
  fatherName: string;
  motherName?: string;
  percentage: number;
  division: string;
  rank?: string;
  address: string;
  studentPhoto: string;
  subjects?: { name: string; marks: number; max: number }[];
  highlight?: string;
}
