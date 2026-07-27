import React from 'react';

/**
 * A reusable candidate form for screening questions.
 *
 * props:
 *  - questions: array of {question, answer}
 *  - setQuestions: setter function for updating questions
 *  - addQuestion: function to add a new question
 *  - handleDeleteQuestion: function to delete a question
 */
export const CandidateForm = ({ questions, setQuestions, addQuestion, handleDeleteQuestion }) => {
    return (
        <div className="space-y-12 mt-5">
            <div className="border-t border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-5">Candidate Form</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-200">
                    Add screening questions for candidates.
                </p>
            </div>

            <div className="space-y-6">
                {questions.map((q, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-transparent rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Question {index + 1}
                            </label>
                            <button
                                type="button"
                                onClick={() => handleDeleteQuestion(index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        <input
                            type="text"
                            value={q.question}
                            onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[index].question = e.target.value;
                                setQuestions(newQuestions);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder:text-gray-400 mb-3 dark:bg-transparent"
                            placeholder="Enter your question"
                            required
                        />

                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    checked={q.answer === 'Yes'}
                                    onChange={() => {
                                        const newQuestions = [...questions];
                                        newQuestions[index].answer = 'Yes';
                                        setQuestions(newQuestions);
                                    }}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-200">Yes</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    checked={q.answer === 'No'}
                                    onChange={() => {
                                        const newQuestions = [...questions];
                                        newQuestions[index].answer = 'No';
                                        setQuestions(newQuestions);
                                    }}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-200">No</span>
                            </label>
                        </div>
                    </div>
                ))}

                {questions.length < 4 && (
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors dark-text-gray-200"
                    >
                        Add Question
                    </button>
                )}
            </div>
        </div>
    );
};

export default CandidateForm;

