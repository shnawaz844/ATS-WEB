import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Award,
  Sparkles,
  Users,
  GraduationCap
} from 'lucide-react';

const DetailsTab = ({ applicationData = {} }) => {
  const {
    applicationStatus,
    contactInfo,
    emailInfo,
    experience,
    questions,
    answers,
    resume,
    createdAt,
    fullName,
    id,
    _id
  } = applicationData;

  // Helper to parse experience string details formatted during stepper submission
  const parseExperienceDetails = (expStr) => {
    if (!expStr) return { summary: 'N/A', meta: {} };
    const meta = {};
    const parts = expStr.split(/\s*\|\s*/);
    const summary = parts[0] || 'N/A';

    parts.forEach((part) => {
      const clean = part.replace(/^Details:\s*/i, "");
      const idx = clean.indexOf(":");
      if (idx !== -1) {
        const key = clean.substring(0, idx).trim();
        const val = clean.substring(idx + 1).trim();
        meta[key] = val;
      }
    });

    return { summary, meta };
  };

  const { summary: expSummary, meta: expMeta } = parseExperienceDetails(experience);

  // Helper to parse dynamic Questions and Answers
  const parseQA = (qRaw, aRaw) => {
    try {
      let qList = qRaw;
      let aList = aRaw;

      if (typeof qList === 'string') {
        try { qList = JSON.parse(qList); } catch (e) {}
      }
      if (typeof aList === 'string') {
        try { aList = JSON.parse(aList); } catch (e) {}
      }

      if (Array.isArray(qList) && qList.length > 0 && typeof qList[0] === 'string' && qList[0].startsWith('[')) {
        try { qList = JSON.parse(qList[0]); } catch (e) {}
      }
      if (Array.isArray(aList) && aList.length > 0 && typeof aList[0] === 'string' && aList[0].startsWith('[')) {
        try { aList = JSON.parse(aList[0]); } catch (e) {}
      }

      if (!Array.isArray(qList)) qList = [];
      if (!Array.isArray(aList)) aList = [];

      return qList.map((quest, idx) => ({
        question: quest,
        answer: aList[idx] || 'N/A'
      }));
    } catch (e) {
      return [];
    }
  };

  const qaPairs = parseQA(questions, answers);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Applied' };
      case 'shortlisted':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Shortlisted' };
      case 'hired':
        return { bg: 'bg-green-100 text-green-800 border-green-300', label: 'Hired' };
      case 'rejected':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Rejected' };
      default:
        return { bg: 'bg-gray-100 text-gray-800 border-gray-200', label: status || 'Submitted' };
    }
  };

  const statusBadge = getStatusBadge(applicationStatus);

  const candidateName = expMeta.Name || fullName || applicationData.candidateID?.userName || 'Applicant';
  const qualification = expMeta.Qualification || 'Not specified';
  const candidateCity = expMeta.City || 'Not specified';
  const relocatePref = expMeta.Relocate || 'Not specified';
  const shiftPref = expMeta['Flexible Shift'] || expMeta['Shift Willingness'] || 'Not specified';
  const whyJoin = expMeta['Why Join'] || 'Not provided';
  const referralInfo = expMeta.Referral || 'No';
  const experiencesList = expMeta['Work Experiences'] || expSummary;

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100 font-sans">
      
      {/* ── HEADER STATUS BANNER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Application Overview</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-mono">ID: {_id || id || 'N/A'}</span>
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
            {candidateName}'s Application Details
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusBadge.bg}`}>
            {statusBadge.label}
          </span>
          {createdAt && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
              <Calendar size={13} /> {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── STEP 1: PERSONAL DETAILS ── */}
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
              <User size={16} className="text-blue-600" /> Step 1: Personal Details
            </h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Full Name</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{candidateName}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Email Address</span>
              <a href={`mailto:${emailInfo}`} className="font-bold text-blue-600 hover:underline">{emailInfo || 'N/A'}</a>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Contact Phone</span>
              <a href={`tel:+91${contactInfo}`} className="font-bold text-blue-600 hover:underline">+91 {contactInfo || 'N/A'}</a>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Qualification</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{qualification}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <span className="text-gray-500 dark:text-gray-400 font-medium">City / Location</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{candidateCity}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Relocate to Noida?</span>
              <span className="font-bold text-emerald-600">{relocatePref}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Resume File</span>
              {resume ? (
                <a href={resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  <FileText size={13} /> View Resume PDF
                </a>
              ) : (
                <span className="text-gray-400">Not Uploaded</span>
              )}
            </div>
          </div>
        </div>

        {/* ── STEP 2: WORK EXPERIENCE ── */}
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">2</div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
              <Briefcase size={16} className="text-blue-600" /> Step 2: Work Experience
            </h3>
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-600">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Submitted Experience</p>
              <p className="font-semibold text-sm text-gray-900 dark:text-white leading-relaxed">{experiencesList}</p>
            </div>
          </div>
        </div>

        {/* ── STEP 3 & STEP 5: WORK SCHEDULE & REFERRAL ── */}
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">3 &amp; 5</div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
              <Clock size={16} className="text-blue-600" /> Schedule &amp; Referral Details
            </h3>
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Shift Willingness</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{shiftPref}</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Employee Referral</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{referralInfo}</p>
            </div>
          </div>
        </div>

        {/* ── STEP 4: TELL US MORE & CUSTOM QUESTIONS ── */}
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">4</div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle size={16} className="text-blue-600" /> Step 4: Tell Us More
            </h3>
          </div>

          <div className="space-y-3.5 text-sm">
            {whyJoin && whyJoin !== 'Not provided' && (
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Why Join F2 Fintech</p>
                <p className="text-xs text-gray-700 dark:text-gray-200 italic leading-relaxed">"{whyJoin}"</p>
              </div>
            )}

            {qaPairs.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Custom Questions</p>
                {qaPairs.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Q{idx + 1}: {item.question}</p>
                    <p className="text-xs font-semibold text-emerald-600 mt-1">Ans: {item.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── STEP 6: REVIEW SUMMARY ── */}
      <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          <div>
            <h4 className="font-black text-emerald-900 dark:text-emerald-300 text-base">All Application Steps Submitted</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Complete application stored in Supabase applications record.</p>
          </div>
        </div>
        {resume && (
          <a href={resume} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm flex-shrink-0">
            Download CV Resume
          </a>
        )}
      </div>

    </div>
  );
};

export default DetailsTab;
