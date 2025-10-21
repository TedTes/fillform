/**
 * File upload button component
 */

'use client'

interface FileUploadButtonProps {
  onClick: () => void
  disabled?: boolean
}

export default function FileUploadButton({ onClick, disabled = false }: FileUploadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        group
        px-4 py-2.5
        bg-blue-600 hover:bg-blue-700 active:bg-blue-800
        text-white text-sm font-medium 
        rounded-lg 
        shadow-sm hover:shadow-md
        transition-all duration-200
        disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none
        flex items-center gap-2
      "
    >
      <svg
        className="w-4 h-4 transition-transform group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M12 4v16m8-8H4"
        />
      </svg>
      Upload Files
    </button>
  )
}