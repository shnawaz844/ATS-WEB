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
  GraduationCap,
  X
} from 'lucide-react';

const DetailsTab = ({ applicationData = {} }) => {
  const [modalFile, setModalFile] = React.useState(null);
  const [modalTitle, setModalTitle] = React.useState("");

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
    _id,
    hasExperience,
    experiences: rawExperiences,
    certificationDetails: rawCertDetails,
    hasReferral,
    referralName,
    referralDesignation,
    referralDepartment,
    referralCode,
    EmployeeCode,
    qualification: appQualification,
    city: appCity,
    relocate: appRelocate,
    willingToWorkShift: appWillingToWorkShift,
    whyJoin: appWhyJoin
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
        try { qList = JSON.parse(qList); } catch (e) { }
      }
      if (typeof aList === 'string') {
        try { aList = JSON.parse(aList); } catch (e) { }
      }

      if (Array.isArray(qList) && qList.length > 0 && typeof qList[0] === 'string' && qList[0].startsWith('[')) {
        try { qList = JSON.parse(qList[0]); } catch (e) { }
      }
      if (Array.isArray(aList) && aList.length > 0 && typeof aList[0] === 'string' && aList[0].startsWith('[')) {
        try { aList = JSON.parse(aList[0]); } catch (e) { }
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

  let experiencesArr = [];
  try {
    if (typeof rawExperiences === 'string') {
      experiencesArr = JSON.parse(rawExperiences);
    } else if (Array.isArray(rawExperiences)) {
      experiencesArr = rawExperiences;
    }
  } catch (e) {
    console.error("Error parsing experiences", e);
  }

  let certDetails = null;
  try {
    if (typeof rawCertDetails === 'string') {
      const parsed = JSON.parse(rawCertDetails);
      certDetails = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed;
    } else if (typeof rawCertDetails === 'object' && rawCertDetails !== null) {
      certDetails = Array.isArray(rawCertDetails) && rawCertDetails.length > 0 ? rawCertDetails[0] : rawCertDetails;
    }
  } catch (e) {
    console.error("Error parsing certDetails", e);
  }

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

  const capitalizeWords = (str) => {
    if (!str || typeof str !== 'string') return str || "";

    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const candidateName = capitalizeWords(expMeta.Name || fullName || applicationData.candidateID?.userName || 'Applicant');
  const qualification = capitalizeWords(appQualification || expMeta.Qualification || 'Not specified');
  const candidateCity = capitalizeWords(appCity || expMeta.City || 'Not specified');
  const relocatePref = capitalizeWords(appRelocate || expMeta.Relocate || 'Not specified');
  const shiftPref = capitalizeWords(appWillingToWorkShift || expMeta['Flexible Shift'] || expMeta['Shift Willingness'] || 'Not specified');
  const whyJoin = capitalizeWords(appWhyJoin && appWhyJoin !== 'EMPTY' ? appWhyJoin : (expMeta['Why Join'] || 'Not provided'));
  const referralInfo = capitalizeWords(expMeta.Referral || 'No');
  const experiencesList = capitalizeWords(expMeta['Work Experiences'] || expSummary);

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100 font-sans">

      {/* ── HEADER STATUS BANNER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Application Overview</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{applicationData?.applicant_type}</span>
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

            {(appQualification || expMeta.Qualification) === "Professional Certification (CFA, CA, etc.)" && certDetails && (
              <div className="col-span-full mt-2 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Award size={14} /> Professional Certification Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Place of Certificate</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{capitalizeWords(certDetails.place || 'N/A')}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Subject</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{capitalizeWords(certDetails.subject || 'N/A')}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Marks / Grade</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{certDetails.marks || 'N/A'}</span>
                  </div>
                  {(certDetails.fileUrl || certDetails.fileName) && (
                    <div>
                      <span className="block text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Certificate File</span>
                      {certDetails.fileUrl ? (
                        <button
                          onClick={(e) => { e.preventDefault(); setModalFile(certDetails.fileUrl); setModalTitle(certDetails.fileName || "Certificate Document"); }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
                        >
                          <FileText size={13} /> {certDetails.fileName || 'View Document'}
                        </button>
                      ) : (
                        <span className="font-semibold text-gray-900 dark:text-white">{certDetails.fileName}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

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
                <button
                  onClick={(e) => { e.preventDefault(); setModalFile(resume); setModalTitle("Resume PDF"); }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                >
                  <FileText size={13} /> View Resume PDF
                </button>
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
            {experiencesArr && experiencesArr.length > 0 ? (
              experiencesArr.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-blue-50/70 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Experience {exp.years} years</p>
                    <span className="text-xs font-semibold px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">{exp.years} Years</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-3">
                    <div>
                      <span className="block text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Company Name</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{capitalizeWords(exp.company || 'N/A')}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Role</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{capitalizeWords(exp.role || 'N/A')}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Field</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{capitalizeWords(exp.field || 'N/A')}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Last Salary</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{exp.salary || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-600">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Submitted Experience</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white leading-relaxed">{experiencesList}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── STEP 3 & STEP 5: WORK SCHEDULE & REFERRAL ── */}
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">3</div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
              <Clock size={16} className="text-blue-600" /> Referral Details
            </h3>
          </div>

          <div className="space-y-3.5 text-sm">
            {/* <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Shift Willingness</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{shiftPref}</span>
            </div> */}

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Employee Referral</p>
              {hasReferral === true || hasReferral === "true" || referralName ? (
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-1">
                  <div>
                    <span className="block text-gray-400 dark:text-gray-500 text-[11px] uppercase font-semibold">Name</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{capitalizeWords(referralName || 'N/A')}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 dark:text-gray-500 text-[11px] uppercase font-semibold">Employee Code</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{referralCode || EmployeeCode || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 dark:text-gray-500 text-[11px] uppercase font-semibold">Designation</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{capitalizeWords(referralDesignation || 'N/A')}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 dark:text-gray-500 text-[11px] uppercase font-semibold">Department</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{capitalizeWords(referralDepartment || 'N/A')}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{referralInfo !== 'No' ? referralInfo : 'No Referral'}</p>
              )}
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

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Why Join F2 Fintech</p>
              <p className="text-xs text-gray-700 dark:text-gray-200 italic leading-relaxed">{whyJoin === null ? "N/A" : whyJoin}</p>
            </div>


            {qaPairs.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Custom Questions</p>
                {qaPairs.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Q{idx + 1}: {capitalizeWords(item.question)}</p>
                    <p className="text-xs font-semibold text-emerald-600 mt-1">Ans: {capitalizeWords(item.answer)}</p>
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
          <button
            onClick={(e) => { e.preventDefault(); setModalFile(resume); setModalTitle("Resume PDF"); }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm flex-shrink-0"
          >
            View CV Resume
          </button>
        )}
      </div>

      {/* ── PDF VIEWER MODAL ── */}
      {modalFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{modalTitle}</h3>
              <button
                onClick={() => setModalFile(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-0 overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col">
              <object data={modalFile} type="application/pdf" className="w-full flex-1 min-h-[75vh]" width="100%" height="100%">
                <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[50vh]">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Your browser does not support inline PDFs.</p>
                  <a href={modalFile} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors inline-block shadow-sm">
                    Download PDF instead
                  </a>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DetailsTab;
