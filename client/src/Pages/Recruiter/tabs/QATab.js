import React from 'react';

const QASection = ({ questionsData }) => {
  // Count total questions
  const totalQuestions = questionsData.length;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-md p-4 w-full transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Q&A Section</h3>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'}
        </span>
      </div>

      {/* Questions and Answers */}
      <div className="space-y-4">
        {questionsData?.map((item, index) => (
          <div key={index} className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Question */}
            <div className="flex items-start mb-2">
              <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="font-medium text-gray-800 dark:text-gray-100">{item.question}</p>
            </div>

            {/* Answer */}
            <div className="flex items-start ml-6 pl-2 border-l-2 border-gray-100 dark:border-gray-700">
              <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example usage
const App = ({ applicationData }) => {
  let questionsData = [];

  try {
    // Attempt to parse the stringified arrays
    const rawQuestions = JSON.parse(applicationData.questions?.[0] || '[]');
    const rawAnswers = JSON.parse(applicationData.answers?.[0] || '[]');

    // Combine into the expected format
    questionsData = rawQuestions.map((q, i) => ({
      question: q,
      answer: rawAnswers[i] ?? '',
    }));
  } catch (error) {
    console.error("Error parsing Q&A data:", error);
  }

  return (
    <div className="mx-auto">
      <QASection questionsData={questionsData} />
    </div>
  );
};


export default App;