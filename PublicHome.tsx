import React from 'react';
import campusImg from '../assets/images/jawahar_school_campus_1791824984534.jpg';
import emblemImg from '../assets/images/jawahar_school_emblem_1791825002243.jpg';
import { 
  GraduationCap, 
  UserCheck, 
  Users, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Trophy,
  Clock,
  Compass,
  Calendar
} from 'lucide-react';

interface PublicHomeProps {
  onOpenTeacherPortal: () => void;
  onOpenParentPortal: () => void;
  onOpenAdmission: () => void;
  onOpenBoardResults?: (year?: number, classType?: '10th' | '12th') => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  onOpenTeacherPortal,
  onOpenParentPortal,
  onOpenAdmission,
  onOpenBoardResults
}) => {
  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0b2850] text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={campusImg}
            alt="Jawahar Memorial Campus"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b2850] via-[#0b2850]/70 to-[#0b2850]/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#ffcc00]/20 border border-[#ffcc00]/50 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold text-[#ffcc00] backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>शिक्षा, संस्कार और सफलता की ओर एक कदम</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#f4b942] drop-shadow-md">
            आपका भविष्य, हमारी जिम्मेदारी
          </h2>

          <p className="text-lg sm:text-xl text-blue-100 font-medium max-w-3xl mx-auto leading-relaxed">
            Welcome to <strong className="text-white">Jawahar Memorial Sikshansthan</strong> (मनोता खुर्द, झुंझुनूं)। हमारा उद्देश्य प्रत्येक विद्यार्थी को आधुनिक ज्ञान, अनुशासित चरित्र और उत्कृष्ट मार्गदर्शन प्रदान करना है।
          </p>

          {/* Quick Portal Access Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onOpenBoardResults && onOpenBoardResults(2024, '10th')}
              className="px-6 py-3.5 rounded-xl bg-[#f4b942] hover:bg-[#ffcc00] text-[#0b2850] font-black text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Trophy className="w-4 h-4 text-[#0b2850]" />
              <span>वर्षवार बोर्ड परिणाम (2022-2024)</span>
              <ArrowRight className="w-4 h-4 text-[#0b2850]" />
            </button>

            <button
              onClick={onOpenParentPortal}
              className="px-6 py-3.5 rounded-xl bg-[#ffcc00] hover:bg-[#e6b800] text-[#0b2850] font-black text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Users className="w-4 h-4" />
              <span>अभिभावक/छात्र लॉगिन (रिजल्ट व अटेंडेंस)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenTeacherPortal}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#f4b942]" />
              <span>शिक्षक लॉगिन (GPS जियोफेंस उपस्थिति)</span>
            </button>

            <button
              onClick={onOpenAdmission}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>प्रवेश के लिए आवेदन करें</span>
            </button>
          </div>
        </div>

        {/* Highlight Badges Strip */}
        <div className="relative z-10 bg-[#082040]/90 border-t border-white/10 backdrop-blur-md py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#f4b942] font-mono tabular-nums">23+</div>
              <div className="text-xs text-blue-200">योग्य एवं अनुभवी शिक्षक</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#f4b942] font-mono tabular-nums">100%</div>
              <div className="text-xs text-blue-200">बोर्ड परीक्षा परिणाम</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#f4b942] font-mono tabular-nums">GPS 200m</div>
              <div className="text-xs text-blue-200">सत्यापित शिक्षक उपस्थिति</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#f4b942] font-mono tabular-nums">नर्सरी से 12वीं</div>
              <div className="text-xs text-blue-200">कला एवं विज्ञान वर्ग</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT THE SCHOOL */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0b2850] uppercase tracking-wider bg-blue-50 w-fit px-3 py-1.5 rounded-md border border-blue-100">
            <BookOpen className="w-4 h-4 text-[#f4b942]" />
            <span>About Our School | हमारे विद्यालय के बारे में</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-neutral-900">
            जवाहर मेमोरियल शिक्षण संस्थान, मनोता खुर्द (झुंझुनूं)
          </h3>

          <p className="text-base text-neutral-600 leading-relaxed max-w-4xl">
            Jawahar Memorial Sikshansthan राजस्थान के ऐतिहासिक झुंझुनूं जिले के <strong>मनोता खुर्द</strong> क्षेत्र में स्थित एक प्रतिष्ठित शिक्षण संस्थान है। हमारा विद्यालय ग्रामीण एवं क्षेत्रीय प्रतिभाओं को उच्च गुणवत्ता की शिक्षा, आधुनिक कंप्यूटर लैब, समृद्ध पुस्तकालय, सुसज्जित विज्ञान प्रयोगशाला तथा शारीरिक व मानसिक विकास हेतु खेलकूद की सर्वोत्तम सुविधाएं प्रदान करता है।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-[#f4f7fc] border border-blue-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#0b2850] text-[#f4b942] flex items-center justify-center font-bold">
                🎯
              </div>
              <h4 className="font-extrabold text-neutral-900 text-base">हमारा विजन</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                विद्यार्थियों में मानवीय मूल्य, राष्ट्रभक्ति, अनुशासन और आधुनिक तकनीकी कौशल का विकास कर उन्हें भविष्य के नेतृत्व हेतु तैयार करना।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f4f7fc] border border-blue-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#0b2850] text-[#f4b942] flex items-center justify-center font-bold">
                🔬
              </div>
              <h4 className="font-extrabold text-neutral-900 text-base">प्रायोगिक एवं स्मार्ट शिक्षण</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                केवल रटने की बजाय समझ आधारित प्रायोगिक शिक्षण। विज्ञान (भौतिक, रसायन, जीव विज्ञान) की सुसज्जित प्रयोगशालाएं।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f4f7fc] border border-blue-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#0b2850] text-[#f4b942] flex items-center justify-center font-bold">
                📱
              </div>
              <h4 className="font-extrabold text-neutral-900 text-base">पारदर्शी डिजिटल पोर्टल</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                अभिभावकों के लिए मोबाइल नंबर लॉगिन, 1st व 2nd मिड-टर्म तथा अर्धवार्षिक परीक्षा परिणाम और दैनिक उपस्थिति की डिजिटल सुविधा।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SCHOOL MANAGEMENT */}
      <section id="management" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <div className="text-xs font-bold text-[#0b2850] uppercase tracking-wider">
            School Management | विद्यालय प्रबंधन
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-neutral-900">
            संस्थान का कुशल नेतृत्व एवं मार्गदर्शन
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Counselor: Mr. Sanjay Jinder */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-24 h-24 rounded-full bg-[#0b2850] text-[#f4b942] border-4 border-[#ffcc00] flex items-center justify-center text-4xl shadow-inner">
              👨‍💼
            </div>
            <div>
              <h4 className="text-xl font-black text-neutral-900">Mr. Sanjay Jinder</h4>
              <div className="text-xs font-bold text-[#0b2850] bg-[#ffcc00]/20 px-3 py-1 rounded-full w-fit mx-auto mt-1 border border-[#ffcc00]">
                Counselor / मुख्य मार्गदर्शक एवं काउंसलर
              </div>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              विद्यालय के नेतृत्व, दीर्घकालिक प्रबंधन, छात्र करियर काउंसलिंग और संस्थान के सर्वांगीण विकास में निदेशक की महत्वपूर्ण भूमिका होती है।
            </p>
          </div>

          {/* Principal: Mrs. Manjeet */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-24 h-24 rounded-full bg-[#0b2850] text-[#f4b942] border-4 border-[#ffcc00] flex items-center justify-center text-4xl shadow-inner">
              👩‍🏫
            </div>
            <div>
              <h4 className="text-xl font-black text-neutral-900">Mrs. Manjeet</h4>
              <div className="text-xs font-bold text-[#0b2850] bg-[#ffcc00]/20 px-3 py-1 rounded-full w-fit mx-auto mt-1 border border-[#ffcc00]">
                Principal / प्रधानाचार्य
              </div>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              प्रधानाचार्य विद्यालय की दैनिक शैक्षणिक गतिविधियों, शिक्षक समन्वय, अनुशासन और शिक्षण व्यवस्था का कुशल मार्गदर्शन करते हैं।
            </p>
          </div>
        </div>
      </section>

      {/* 4. OUR TEACHERS SECTION */}
      <section id="teachers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0b2850] text-white rounded-3xl p-8 sm:p-12 shadow-md space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[#ffcc00] uppercase tracking-wider">
                Our Faculty | हमारे शिक्षक
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                23 समर्पित एवं उच्च शिक्षित शिक्षक
              </h3>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">
                13 पुरुष शिक्षक एवं 10 महिला शिक्षक विद्यार्थियों के उज्ज्वल भविष्य निर्माण में निरंतर संलग्न।
              </p>
            </div>

            <button
              onClick={onOpenTeacherPortal}
              className="px-4 py-2.5 rounded-xl bg-[#ffcc00] text-[#0b2850] font-bold text-xs hover:bg-[#e6b800] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <UserCheck className="w-4 h-4" />
              <span>शिक्षक लॉगिन (GPS उपस्थिति)</span>
            </button>
          </div>

          {/* Faculty breakdown counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs">
              <div className="text-3xl font-black text-[#f4b942] font-mono">23</div>
              <div className="text-sm font-bold text-white mt-1">कुल शिक्षक (Total Faculty)</div>
              <div className="text-xs text-blue-200">अनुभवी व प्रशिक्षित</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs">
              <div className="text-3xl font-black text-blue-300 font-mono">13</div>
              <div className="text-sm font-bold text-white mt-1">पुरुष शिक्षक (Male Faculty)</div>
              <div className="text-xs text-blue-200">विषय विशेषज्ञ</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs">
              <div className="text-3xl font-black text-pink-300 font-mono">10</div>
              <div className="text-sm font-bold text-white mt-1">महिला शिक्षक (Female Faculty)</div>
              <div className="text-xs text-blue-200">सहानुभूतिपूर्ण शिक्षण</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOARD RESULTS SHOWCASE */}
      <section id="results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <div className="text-xs font-bold text-[#0b2850] uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#f4b942]" />
            <span>Board Results | वर्षवार बोर्ड परीक्षा परिणाम (2022, 2023, 2024)</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-neutral-900">
            लगातार उत्कृष्ट परीक्षा परिणाम की परंपरा
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl mx-auto">
            माध्यमिक शिक्षा बोर्ड राजस्थान (RBSE) में मनोता खुर्द (झुंझुनूं) के मेधावी छात्र-छात्राओं का शानदार प्रदर्शन। वर्षवार 10वीं व 12वीं के संपूर्ण परिणाम छात्र फोटो, पिता का नाम, प्राप्तांक प्रतिशत एवं पते सहित देखें।
          </p>

          {/* Quick Year Pill Selectors */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-neutral-500 mr-1">वर्षवार देखें:</span>
            {[2024, 2023, 2022].map((yr) => (
              <button
                key={yr}
                onClick={() => onOpenBoardResults && onOpenBoardResults(yr, '10th')}
                className="px-4 py-1.5 rounded-full text-xs font-black bg-[#0b2850] text-[#f4b942] hover:bg-[#143d75] transition-colors cursor-pointer shadow-xs flex items-center gap-1"
              >
                <Calendar className="w-3 h-3 text-[#f4b942]" />
                <span>वर्ष {yr} रिजल्ट्स</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-lg font-black text-[#0b2850] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#f4b942]" />
                <span>कक्षा 10वीं बोर्ड परिणाम</span>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                100% परिणाम
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-neutral-900">
                सर्वोच्च प्राप्तांक: <span className="text-emerald-600">97.40%</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                माध्यमिक शिक्षा बोर्ड राजस्थान में मनोता खुर्द व आस-पास के क्षेत्र में सर्वोच्च अंक प्राप्त करने वाले छात्रों की सूची में जवाहर मेमोरियल के छात्र निरंतर शीर्ष पर रहे हैं।
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onOpenBoardResults && onOpenBoardResults(2024, '10th')}
                className="w-full py-3 px-4 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Trophy className="w-3.5 h-3.5 text-[#f4b942]" />
                <span>10वीं बोर्ड रिजल्ट देखें (छात्र फोटो, पिता का नाम, % व पता)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#f4b942]" />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-lg font-black text-[#0b2850] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#f4b942]" />
                <span>कक्षा 12वीं बोर्ड परिणाम</span>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                विज्ञान एवं कला वर्ग
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-neutral-900">
                सर्वोच्च प्राप्तांक: <span className="text-blue-600">96.80%</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                भौतिक, रसायन और गणित में 99 अंक लाने वाले विद्यार्थियों के साथ कला संकाय में भी जिले की मेरिट सूची में स्थान दर्ज किया।
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onOpenBoardResults && onOpenBoardResults(2024, '12th')}
                className="w-full py-3 px-4 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Trophy className="w-3.5 h-3.5 text-[#f4b942]" />
                <span>12वीं बोर्ड रिजल्ट देखें (साइंस व आर्ट्स टॉपर सूची)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#f4b942]" />
              </button>
            </div>
          </div>
        </div>

        {/* Big Banner CTA */}
        <div className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-[#0b2850] via-[#143d75] to-[#0b2850] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-[#f4b942]/30">
          <div className="space-y-1">
            <div className="text-xs font-bold text-[#f4b942] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>वर्षवार अभिलेख (Yearly Archive: 2022, 2023, 2024)</span>
            </div>
            <h4 className="text-lg sm:text-xl font-black">
              वर्षवार 10वीं एवं 12वीं बोर्ड परीक्षा परिणाम एक्सप्लोर करें
            </h4>
            <p className="text-xs text-blue-200">
              प्रत्येक वर्ष के टॉपर छात्रों की फोटो, पिता का नाम, प्रतिशत, विषयवार अंकतालिका एवं गृह पता उपलब्ध।
            </p>
          </div>

          <button
            onClick={() => onOpenBoardResults && onOpenBoardResults(2024, '10th')}
            className="px-6 py-3 rounded-xl bg-[#f4b942] hover:bg-[#ffcc00] text-[#0b2850] font-black text-xs transition-colors shrink-0 shadow-md cursor-pointer flex items-center gap-2"
          >
            <span>बोर्ड रिजल्ट्स पोर्टल खोलें</span>
            <ArrowRight className="w-4 h-4 text-[#0b2850]" />
          </button>
        </div>
      </section>

      {/* 6. LOCATION & CONTACT */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="text-xs font-bold text-[#0b2850] uppercase tracking-wider">
              School Location | विद्यालय का स्थान व संपर्क
            </div>
            <h3 className="text-2xl font-black text-neutral-900">
              Jawahar Memorial Sikshansthan
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Manota Khurd, Jhunjhunu, Rajasthan, India
            </p>

            <div className="space-y-2 pt-2 text-xs sm:text-sm text-neutral-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#f4b942]" />
                <span>स्थान: मनोता खुर्द, जिला - झुंझुनूं (राजस्थान)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>हेल्पलाइन / प्रवेश संपर्क: +91 94140 12345, +91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>ईमेल: info@jawaharmemorial.edu.in</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#f4f7fc] border border-blue-100 text-center space-y-4">
            <h4 className="text-lg font-bold text-[#0b2850]">
              सत्र 2026-27 प्रवेश प्रारंभ
            </h4>
            <p className="text-xs text-neutral-600">
              सीमित सीटें उपलब्ध हैं। अपने बच्चे के उज्ज्वल भविष्य के लिए आज ही ऑनलाइन आवेदन करें।
            </p>
            <button
              onClick={onOpenAdmission}
              className="w-full py-3 px-6 rounded-xl bg-[#0b2850] hover:bg-[#082040] text-white font-bold text-sm transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-[#f4b942]" />
              <span>ऑनलाइन प्रवेश पूछताछ फॉर्म भरें</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
