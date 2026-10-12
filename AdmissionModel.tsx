import React, { useState } from 'react';
import { X, GraduationCap, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({ isOpen, onClose }) => {
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [admissionClass, setAdmissionClass] = useState('कक्षा 10वीं');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !phone.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-neutral-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Top */}
        <div className="bg-[#0b2850] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#f4b942]" />
            <div>
              <h3 className="text-base font-black">ऑनलाइन प्रवेश पूछताछ फॉर्म</h3>
              <div className="text-[11px] text-blue-200">सत्र 2026-27 (नर्सरी से 12वीं)</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-neutral-900">
              आवेदन सफलतापूर्वक प्राप्त हुआ!
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
              धन्यवाद! जवाहर मेमोरियल शिक्षण संस्थान (मनोता खुर्द) का प्रवेश विभाग शीघ्र ही आपके मोबाइल नंबर <strong>{phone}</strong> पर संपर्क करेगा।
            </p>
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-[#0b2850] text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              ठीक है
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="font-bold text-neutral-800">विद्यार्थी का पूरा नाम</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="उदा. राहुल कुमार"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0b2850]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-neutral-800">माता/पिता का नाम</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="उदा. श्री संजय कुमार"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0b2850]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-neutral-800">संपर्क मोबाइल नंबर</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="उदा. 9876543210"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#0b2850]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-neutral-800">प्रवेश हेतु इच्छित कक्षा</label>
              <select
                value={admissionClass}
                onChange={(e) => setAdmissionClass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0b2850]"
              >
                <option value="नर्सरी / LKG / UKG">नर्सरी / LKG / UKG</option>
                <option value="कक्षा 1 से 5वीं">कक्षा 1 से 5वीं (प्राथमिक)</option>
                <option value="कक्षा 6 से 8वीं">कक्षा 6 से 8वीं (उच्च प्राथमिक)</option>
                <option value="कक्षा 9वीं / 10वीं">कक्षा 9वीं / 10वीं (माध्यमिक)</option>
                <option value="कक्षा 11वीं / 12वीं (विज्ञान)">कक्षा 11वीं / 12वीं (विज्ञान वर्ग - PCM/PCB)</option>
                <option value="कक्षा 11वीं / 12वीं (कला)">कक्षा 11वीं / 12वीं (कला वर्ग - Arts)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>आवेदन जमा हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4 text-[#f4b942]" />
                    <span>प्रवेश पूछताछ सबमिट करें</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
