'use client'

import { ChevronRight, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function NavigationBreadcrumb() {
  const pathname = usePathname()
  
  // Parse path into breadcrumb segments
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>
      
      {segments.map((segment, idx) => {
        const href = '/' + segments.slice(0, idx + 1).join('/')
        const isLast = idx === segments.length - 1
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        
        return (
          <div key={segment} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">{label}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-gray-900 transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}