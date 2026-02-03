'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileImage,
  FileText,
  Link as LinkIcon,
  Mail,
  ChevronDown,
  Check,
  Loader2,
} from 'lucide-react'
import type { DetailedRemedy } from '@/lib/types'

/**
 * Props for ExportComparison component
 */
interface ExportComparisonProps {
  /** Remedies being compared */
  remedies: DetailedRemedy[]
  /** Additional CSS classes */
  className?: string
}

/**
 * Export format options
 */
type ExportFormat = 'pdf' | 'image' | 'link' | 'email'

/**
 * Export menu item configuration
 */
interface ExportOption {
  id: ExportFormat
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'pdf',
    label: 'Export as PDF',
    description: 'Download a printable PDF document',
    icon: FileText,
  },
  {
    id: 'image',
    label: 'Export as Image',
    description: 'Save as PNG image',
    icon: FileImage,
  },
  {
    id: 'link',
    label: 'Copy Link',
    description: 'Copy shareable link to clipboard',
    icon: LinkIcon,
  },
  {
    id: 'email',
    label: 'Email Comparison',
    description: 'Open in email client',
    icon: Mail,
  },
]

/**
 * Component for exporting remedy comparisons in various formats.
 *
 * Supports:
 * - PDF export (uses browser print)
 * - Image export (canvas snapshot)
 * - Shareable link
 * - Email with comparison details
 */
export function ExportComparison({
  remedies,
  className = '',
}: ExportComparisonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)
  const [exportSuccess, setExportSuccess] = useState<ExportFormat | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }

  // Add/remove click listener using useEffect
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    return undefined
  }, [isOpen])

  /**
   * Generate comparison text content for export
   */
  const generateTextContent = (): string => {
    const lines: string[] = [
      'REMEDY COMPARISON',
      '=================',
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      'REMEDIES COMPARED:',
      ...remedies.map((r, i) => `${i + 1}. ${r.name} (${r.category || 'N/A'})`),
      '',
    ]

    // Add comparison details for each remedy
    remedies.forEach((remedy) => {
      lines.push(`--- ${remedy.name} ---`)
      lines.push('')
      lines.push(`Category: ${remedy.category || 'N/A'}`)
      lines.push(`Description: ${remedy.description || 'N/A'}`)
      lines.push(`Dosage: ${remedy.dosage || 'N/A'}`)
      lines.push(`Usage: ${remedy.usage || 'N/A'}`)
      lines.push(`Precautions: ${remedy.precautions || 'N/A'}`)
      lines.push(`Scientific Info: ${remedy.scientificInfo || 'N/A'}`)
      lines.push('')
    })

    lines.push('')
    lines.push('DISCLAIMER:')
    lines.push(
      'This comparison is for informational purposes only and should not be considered medical advice.'
    )
    lines.push(
      'Always consult with a qualified healthcare professional before making changes to your health regimen.'
    )
    lines.push('')
    lines.push(`Comparison URL: ${window.location.href}`)

    return lines.join('\n')
  }

  /**
   * Handle PDF export using browser print
   */
  const handlePdfExport = async () => {
    setIsExporting('pdf')

    try {
      // Add print-specific styles
      const styleSheet = document.createElement('style')
      styleSheet.id = 'print-styles'
      styleSheet.textContent = `
        @media print {
          body * {
            visibility: hidden;
          }
          #comparison-content, #comparison-content * {
            visibility: visible;
          }
          #comparison-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `
      document.head.appendChild(styleSheet)

      // Trigger print
      window.print()

      // Clean up styles after print dialog closes
      setTimeout(() => {
        const printStyles = document.getElementById('print-styles')
        if (printStyles) {
          printStyles.remove()
        }
      }, 1000)

      setExportSuccess('pdf')
    } catch (error) {
      console.error('PDF export failed:', error)
    } finally {
      setIsExporting(null)
      setTimeout(() => setExportSuccess(null), 2000)
    }
  }

  /**
   * Handle image export using html2canvas-like approach
   */
  const handleImageExport = async () => {
    setIsExporting('image')

    try {
      // Create a simple canvas-based image of the comparison data
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Canvas context not available')
      }

      // Set canvas size
      const width = 1200
      const height = 800 + remedies.length * 200
      canvas.width = width
      canvas.height = height

      // Draw background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      // Draw title
      ctx.fillStyle = '#1a1a1a'
      ctx.font = 'bold 32px Inter, system-ui, sans-serif'
      ctx.fillText('Remedy Comparison', 40, 60)

      // Draw date
      ctx.fillStyle = '#666666'
      ctx.font = '14px Inter, system-ui, sans-serif'
      ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, 40, 90)

      // Draw remedies
      let yOffset = 140
      const columnWidth = (width - 80) / remedies.length

      remedies.forEach((remedy, index) => {
        const xOffset = 40 + index * columnWidth

        // Remedy name
        ctx.fillStyle = '#1a1a1a'
        ctx.font = 'bold 18px Inter, system-ui, sans-serif'
        ctx.fillText(remedy.name, xOffset, yOffset)

        // Category
        ctx.fillStyle = '#666666'
        ctx.font = '14px Inter, system-ui, sans-serif'
        ctx.fillText(remedy.category || 'N/A', xOffset, yOffset + 25)

        // Dosage
        ctx.fillStyle = '#1a1a1a'
        ctx.font = 'bold 14px Inter, system-ui, sans-serif'
        ctx.fillText('Dosage:', xOffset, yOffset + 60)
        ctx.font = '14px Inter, system-ui, sans-serif'
        ctx.fillStyle = '#333333'
        const dosageLines = wrapText(
          ctx,
          remedy.dosage || 'N/A',
          columnWidth - 20
        )
        dosageLines.forEach((line, i) => {
          ctx.fillText(line, xOffset, yOffset + 80 + i * 18)
        })

        // Usage
        const usageStart = yOffset + 80 + dosageLines.length * 18 + 20
        ctx.fillStyle = '#1a1a1a'
        ctx.font = 'bold 14px Inter, system-ui, sans-serif'
        ctx.fillText('Usage:', xOffset, usageStart)
        ctx.font = '14px Inter, system-ui, sans-serif'
        ctx.fillStyle = '#333333'
        const usageLines = wrapText(
          ctx,
          remedy.usage || 'N/A',
          columnWidth - 20
        )
        usageLines.forEach((line, i) => {
          ctx.fillText(line, xOffset, usageStart + 20 + i * 18)
        })
      })

      // Draw disclaimer
      ctx.fillStyle = '#996600'
      ctx.font = 'italic 12px Inter, system-ui, sans-serif'
      ctx.fillText(
        'Disclaimer: This comparison is for informational purposes only. Consult a healthcare professional.',
        40,
        height - 40
      )

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `remedy-comparison-${Date.now()}.png`
          link.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/png')

      setExportSuccess('image')
    } catch (error) {
      console.error('Image export failed:', error)
    } finally {
      setIsExporting(null)
      setTimeout(() => setExportSuccess(null), 2000)
    }
  }

  /**
   * Handle link copy
   */
  const handleLinkCopy = async () => {
    setIsExporting('link')

    try {
      await navigator.clipboard.writeText(window.location.href)
      setExportSuccess('link')
    } catch (error) {
      console.error('Link copy failed:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = window.location.href
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setExportSuccess('link')
    } finally {
      setIsExporting(null)
      setTimeout(() => setExportSuccess(null), 2000)
    }
  }

  /**
   * Handle email export
   */
  const handleEmailExport = () => {
    setIsExporting('email')

    try {
      const subject = encodeURIComponent(
        `Remedy Comparison: ${remedies.map((r) => r.name).join(', ')}`
      )
      const body = encodeURIComponent(generateTextContent())
      const mailtoUrl = `mailto:?subject=${subject}&body=${body}`

      window.location.href = mailtoUrl
      setExportSuccess('email')
    } catch (error) {
      console.error('Email export failed:', error)
    } finally {
      setIsExporting(null)
      setTimeout(() => setExportSuccess(null), 2000)
    }
  }

  /**
   * Handle export based on format
   */
  const handleExport = async (format: ExportFormat) => {
    switch (format) {
      case 'pdf':
        await handlePdfExport()
        break
      case 'image':
        await handleImageExport()
        break
      case 'link':
        await handleLinkCopy()
        break
      case 'email':
        handleEmailExport()
        break
    }
    setIsOpen(false)
  }

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Export button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden"
            role="menu"
          >
            {EXPORT_OPTIONS.map((option) => {
              const Icon = option.icon
              const isLoading = isExporting === option.id
              const isSuccess = exportSuccess === option.id

              return (
                <button
                  key={option.id}
                  onClick={() => handleExport(option.id)}
                  disabled={isLoading}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  role="menuitem"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : isSuccess ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isSuccess ? 'Done!' : option.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Helper function to wrap text for canvas drawing
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.slice(0, 5) // Limit to 5 lines
}

export default ExportComparison
