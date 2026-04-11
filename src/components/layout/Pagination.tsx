'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalCount: number
  pageSize: number
  baseUrl: string
  searchParams?: Record<string, string | string[] | undefined>
}

export function Pagination({ currentPage, totalCount, pageSize, baseUrl, searchParams = {} }: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize)
  
  if (totalPages <= 1) return null

  // Helper to build URL with existing search params
  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    
    // Add existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else {
          params.append(key, value as string)
        }
      }
    })
    
    params.set('page', page.toString())
    return `${baseUrl}?${params.toString()}`
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const range = 2 // How many pages to show around current page
    
    pages.push(1)
    
    if (currentPage > range + 2) {
      pages.push('...')
    }
    
    for (let i = Math.max(2, currentPage - range); i <= Math.min(totalPages - 1, currentPage + range); i++) {
      pages.push(i)
    }
    
    if (currentPage < totalPages - (range + 1)) {
      pages.push('...')
    }
    
    if (totalPages > 1) {
      pages.push(totalPages)
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className="flex flex-col items-center gap-6 py-12">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">
            Signal_Matrix_Index :: Page {currentPage} of {totalPages}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 p-2 bg-black/40 border-2 border-white/5 studio-panel">
            {/* Previous */}
            <Link 
                href={currentPage > 1 ? buildUrl(currentPage - 1) : '#'} 
                className={`h-10 w-10 md:h-12 md:w-12 flex items-center justify-center border border-white/10 transition-all ${currentPage > 1 ? 'hover:border-studio-neon hover:text-studio-neon group' : 'opacity-20 cursor-not-allowed'}`}
            >
                <ChevronLeft size={20} className={currentPage > 1 ? "group-hover:-translate-x-1 transition-transform" : ""} />
            </Link>

            {/* Numbers */}
            <div className="flex items-center gap-1 md:gap-2">
                {pageNumbers.map((page, idx) => {
                    if (page === '...') {
                        return (
                            <div key={`ellipsis-${idx}`} className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center text-white/20">
                                <MoreHorizontal size={16} />
                            </div>
                        )
                    }

                    const isCurrent = page === currentPage
                    return (
                        <Link 
                            key={page}
                            href={buildUrl(page as number)}
                            className={`h-10 w-10 md:h-12 md:w-12 flex items-center justify-center text-[11px] md:text-sm font-black transition-all border ${isCurrent ? 'bg-studio-neon text-black border-studio-neon shadow-[0_0_20px_rgba(166,226,46,0.3)]' : 'text-white/40 border-white/5 hover:border-white/20 hover:text-white'}`}
                        >
                            {page}
                        </Link>
                    )
                })}
            </div>

            {/* Next */}
            <Link 
                href={currentPage < totalPages ? buildUrl(currentPage + 1) : '#'} 
                className={`h-10 w-10 md:h-12 md:w-12 flex items-center justify-center border border-white/10 transition-all ${currentPage < totalPages ? 'hover:border-studio-neon hover:text-studio-neon group' : 'opacity-20 cursor-not-allowed'}`}
            >
                <ChevronRight size={20} className={currentPage < totalPages ? "group-hover:translate-x-1 transition-transform" : ""} />
            </Link>
        </div>
    </nav>
  )
}
