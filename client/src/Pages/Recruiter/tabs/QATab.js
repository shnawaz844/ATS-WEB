import React from 'react';
import { HelpCircle, CheckCircle2, Sparkles } from 'lucide-react';

const QATab = ({ applicationData = {} }) => {
  const { questions, answers } = applicationData;

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

  const questionsData = parseQA(questions, answers);
  const totalQuestions = questionsData.length;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6 w-full transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Custom Questions &amp; Answers</h3>
        </div>
        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
          {totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'}
        </span>
      </div>

      {/* Questions and Answers */}
      {totalQuestions > 0 ? (
        <div className="space-y-4">
          {questionsData.map((item, index) => (
            <div key={index} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-gray-50/70 dark:bg-gray-900 transition-colors duration-300">
              {/* Question */}
              <div className="flex items-start mb-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  Q{index + 1}
                </span>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{item.question}</p>
              </div>

              {/* Answer */}
              <div className="flex items-start ml-8 pl-3 border-l-2 border-emerald-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-dashed border-gray-200 dark:border-gray-600">
          <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No extra questions required</p>
          <p className="text-xs text-gray-400 mt-1">Candidate submitted the standard application flow.</p>
        </div>
      )}
    </div>
  );
};

export default QATab;