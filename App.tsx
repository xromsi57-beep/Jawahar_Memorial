/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Teacher, Student, TermResult, TeacherAttendanceRecord } from './types';
import { HeaderNav } from './components/HeaderNav';
import { NoticeTicker } from './components/NoticeTicker';
import { PublicHome } from './components/PublicHome';
import { TeacherPortal } from './components/TeacherPortal';
import { ParentPortal } from './components/ParentPortal';
import { AdminPortal } from './components/AdminPortal';
import { BoardResultsView } from './components/BoardResultsView';
import { ReportCardModal } from './components/ReportCardModal';
import { AdmissionModal } from './components/AdmissionModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'teacher' | 'parent' | 'admin' | 'boardResults'>('home');
  const [boardResultNav, setBoardResultNav] = useState<{ year: number; classType: '10th' | '12th' }>({ year: 2024, classType: '10th' });
  
  // Auth sessions
  const [teacherSession, setTeacherSession] = useState<Teacher | null>(null);
  const [parentSession, setParentSession] = useState<{ phone: string; children: Student[] } | null>(null);
  
  // Modals
  const [reportModalData, setReportModalData] = useState<{ student: Student; term: TermResult } | null>(null);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);

  const handleTeacherLoginSuccess = (teacher: Teacher, _todayAttendance: TeacherAttendanceRecord | null) => {
    setTeacherSession(teacher);
    setCurrentView('teacher');
  };

  const handleParentLoginSuccess = (phone: string, children: Student[]) => {
    setParentSession({ phone, children });
    setCurrentView('parent');
  };

  const handleLogout = () => {
    setTeacherSession(null);
    setParentSession(null);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-[#263449] flex flex-col font-sans selection:bg-[#ffcc00] selection:text-[#0b2850]">
      
      {/* Notice Ticker Bar */}
      <NoticeTicker />

      {/* Main Institution Navigation Bar */}
      <HeaderNav
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmission={() => setIsAdmissionOpen(true)}
        teacherSession={teacherSession}
        parentSession={parentSession}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <PublicHome
            onOpenTeacherPortal={() => {
              setCurrentView('teacher');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenParentPortal={() => {
              setCurrentView('parent');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAdmission={() => setIsAdmissionOpen(true)}
            onOpenBoardResults={(year, classType) => {
              if (year) setBoardResultNav((prev) => ({ ...prev, year }));
              if (classType) setBoardResultNav((prev) => ({ ...prev, classType }));
              setCurrentView('boardResults');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'boardResults' && (
          <BoardResultsView
            initialYear={boardResultNav.year}
            initialClass={boardResultNav.classType}
            onBackToHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'teacher' && (
          <TeacherPortal
            teacherSession={teacherSession}
            onLoginSuccess={handleTeacherLoginSuccess}
            onLogout={() => {
              setTeacherSession(null);
              setCurrentView('home');
            }}
          />
        )}

        {currentView === 'parent' && (
          <ParentPortal
            parentSession={parentSession}
            onLoginSuccess={handleParentLoginSuccess}
            onLogout={() => {
              setParentSession(null);
              setCurrentView('home');
            }}
            onPrintReportCard={(student, term) => {
              setReportModalData({ student, term });
            }}
          />
        )}

        {currentView === 'admin' && (
          <AdminPortal
            onLogout={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Printable Report Card Modal */}
      <ReportCardModal
        student={reportModalData?.student || null}
        term={reportModalData?.term || null}
        onClose={() => setReportModalData(null)}
      />

      {/* Online Admission Inquiry Modal */}
      <AdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
      />

      {/* Institutional Footer */}
      <Footer
        onViewChange={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmission={() => setIsAdmissionOpen(true)}
      />

    </div>
  );
}
