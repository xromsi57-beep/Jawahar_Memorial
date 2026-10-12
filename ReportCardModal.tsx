import React from 'react';
import { Student, TermResult } from '../types';
import emblemImg from '../assets/images/jawahar_school_emblem_1791825002243.jpg';
import { X, Printer, Award, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReportCardModalProps {
  student: Student | null;
  term: TermResult | null;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  student,
  term,
  onClose,
}) => {
  if (!student || !term) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-neutral-300 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 my-8">
        
        {/* Top Header Controls */}
        <div className="bg-[#0b2850] text-white p-4 flex items-center justify-between">
          <div className="text-xs font-bold text-[#f4b942] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Official Student Progress Report Card</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRINTABLE MARKSHEET BODY */}
        <div id="printable-report-card" className="p-6 sm:p-8 space-y-6 bg-white text-neutral-900">
          
          {/* Institutional Header with Emblem */}
          <div className="flex items-center justify-between border-b-2 border-[#0b2850] pb-4">
            <img
              src={emblemImg}
              alt="School Emblem"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full border-2 border-[#f4b942] bg-white object-cover"
            />
            <div className="text-center flex-1 px-4">
              <h2 className="text-xl sm:text-2xl font-black text-[#0b2850] tracking-tight">
                Jawahar Memorial Sikshansthan
              </h2>
              <div className="text-xs text-neutral-600 font-medium">
                मनोता खुर्द, झुंझुनूं (राजस्थान) · मान्यता प्राप्त उच्च माध्यमिक विद्यालय
              </div>
              <div className="text-xs font-bold text-[#0b2850] bg-[#ffcc00]/30 px-3 py-0.5 rounded-full w-fit mx-auto mt-1 border border-[#ffcc00]">
                {term.termTitle} · शैक्षणिक सत्र 2026-27
              </div>
            </div>
          </div>

          {/* Student Profile Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#f4f7fc] border border-blue-100 text-xs">
            <div>
              <span className="text-neutral-500 font-medium">विद्यार्थी का नाम:</span>
              <div className="font-bold text-neutral-900 text-sm mt-0.5">{student.name}</div>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">कक्षा एवं वर्ग:</span>
              <div className="font-bold text-neutral-900 text-sm mt-0.5">{student.class}</div>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">रोल नंबर / SR No:</span>
              <div className="font-mono font-bold text-neutral-900 text-sm mt-0.5">{student.rollNo}</div>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">पिता का नाम:</span>
              <div className="font-bold text-neutral-900 text-sm mt-0.5">{student.fatherName}</div>
            </div>
          </div>

          {/* Subject Marks Table */}
          <table className="w-full text-left text-xs sm:text-sm border border-neutral-300">
            <thead className="bg-[#0b2850] text-white font-bold">
              <tr>
                <th className="py-2.5 px-3 border-r border-white/20">क्र. सं.</th>
                <th className="py-2.5 px-3 border-r border-white/20">विषय (Subject)</th>
                <th className="py-2.5 px-3 text-center border-r border-white/20">पूर्णांक (Max)</th>
                <th className="py-2.5 px-3 text-center border-r border-white/20">प्राप्तांक (Obtained)</th>
                <th className="py-2.5 px-3 text-center">ग्रेड</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {term.subjects.map((sub, idx) => (
                <tr key={idx} className="hover:bg-neutral-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-neutral-500 border-r border-neutral-200">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-neutral-900 border-r border-neutral-200">{sub.subject}</td>
                  <td className="py-2.5 px-3 text-center font-mono border-r border-neutral-200">{sub.maxMarks}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-black text-neutral-900 border-r border-neutral-200">{sub.marksObtained}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{sub.grade}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-100 font-black border-t-2 border-neutral-300">
              <tr>
                <td colSpan={2} className="py-2.5 px-3 text-neutral-900 border-r border-neutral-300">कुल योग (Grand Total)</td>
                <td className="py-2.5 px-3 text-center font-mono border-r border-neutral-300">{term.maxTotal}</td>
                <td className="py-2.5 px-3 text-center font-mono text-[#0b2850] text-base border-r border-neutral-300">{term.obtainedTotal}</td>
                <td className="py-2.5 px-3 text-center font-mono text-emerald-700">{term.percentage}% ({term.grade})</td>
              </tr>
            </tfoot>
          </table>

          {/* Performance Summary & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#f4f7fc] border border-blue-100 text-xs">
            <div>
              <span className="text-neutral-500">कक्षा में स्थान (Rank):</span>
              <div className="text-base font-black text-[#0b2850] mt-0.5">#{term.rank}</div>
            </div>
            <div>
              <span className="text-neutral-500">कुल उपस्थिति (Attendance):</span>
              <div className="text-base font-black text-emerald-700 mt-0.5">{student.attendanceStats.percentage}%</div>
            </div>
            <div>
              <span className="text-neutral-500">अंतिम स्थिति (Result Status):</span>
              <div className="text-base font-black text-emerald-700 mt-0.5">उत्तीर्ण (PASS)</div>
            </div>
          </div>

          <div className="text-xs text-neutral-700">
            <strong>शिक्षक टिप्पणी: </strong>
            <span className="italic">{term.remarks}</span>
          </div>

          {/* Official Signatures Row */}
          <div className="pt-8 grid grid-cols-3 text-center text-xs text-neutral-600 border-t border-neutral-200">
            <div>
              <div className="h-10"></div>
              <div className="border-t border-neutral-400 pt-1 font-bold">कक्षाध्यापक हस्ताक्षर</div>
            </div>
            <div>
              <div className="h-10 flex items-center justify-center text-[10px] text-emerald-700 font-bold">
                ✓ डिजिटल प्रमाणित
              </div>
              <div className="border-t border-neutral-400 pt-1 font-bold">परीक्षा प्रभारी</div>
            </div>
            <div>
              <div className="h-10"></div>
              <div className="border-t border-neutral-400 pt-1 font-bold">प्रधानाचार्य मुहर एवं हस्ताक्षर</div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-700 font-semibold text-xs cursor-pointer hover:bg-neutral-100"
          >
            बंद करें
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#f4b942]" />
            <span>अंकतालिका प्रिंट / सेव करें</span>
          </button>
        </div>

      </div>
    </div>
  );
};
