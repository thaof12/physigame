import { useState } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';

const PopupQuiz = ({ question, onClose }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelectAnswer = (index) => {
    if (!showResult) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">❓ Câu Hỏi Kiểm Tra</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              {question.question}
            </h3>

            {/* Answers */}
            <div className="space-y-3">
              {question.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left font-medium ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-400'
                  } ${
                    showResult && index === question.correctAnswer
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : ''
                  } ${
                    showResult && selectedAnswer === index && !isCorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : ''
                  } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        selectedAnswer === index
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      } ${
                        showResult && index === question.correctAnswer
                          ? 'bg-green-500'
                          : ''
                      } ${
                        showResult && selectedAnswer === index && !isCorrect
                          ? 'bg-red-500'
                          : ''
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{answer}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {showResult && (
            <div
              className={`mb-8 p-6 rounded-xl flex items-start gap-4 ${
                isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h4
                  className={`font-bold mb-2 ${
                    isCorrect
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}
                >
                  {isCorrect ? '🎉 Chính xác!' : '❌ Sai rồi'}
                </h4>
                <p
                  className={`text-sm ${
                    isCorrect
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-red-800 dark:text-red-300'
                  }`}
                >
                  {question.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!showResult ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Trả lời
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
              >
                Tiếp tục bài học
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupQuiz;
