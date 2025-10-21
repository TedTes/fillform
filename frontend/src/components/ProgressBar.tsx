/**
 * Progress bar component.
 */

'use client'

interface ProgressBarProps {
  progress: number
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
              className="text-green-600 transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900">{progress}%</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Output Files</h3>
        <p className="text-sm text-gray-600">
          {progress < 30 && 'Extracting data from input files...'}
          {progress >= 30 && progress < 70 && 'Filling PDF forms...'}
          {progress >= 70 && progress < 100 && 'Finalizing documents...'}
          {progress === 100 && 'Complete!'}
        </p>
      </div>

      {/* Linear Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}