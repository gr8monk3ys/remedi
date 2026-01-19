"use client";

import React, { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = memo(function Pagination({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange 
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Don't render pagination if only 1 page
  if (totalPages <= 1) return null;
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Add current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (pages[pages.length - 1] !== i - 1) {
        // Add ellipsis if there's a gap
        pages.push(-1);
      }
      pages.push(i);
    }
    
    // Add last page if not already added
    if (totalPages > 1) {
      if (pages[pages.length - 1] !== totalPages - 1) {
        // Add ellipsis if there's a gap
        pages.push(-1);
      }
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center justify-center mt-6 space-x-1">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`p-2 rounded-md ${
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      
      {/* Page Numbers */}
      {pageNumbers.map((pageNumber, index) => (
        pageNumber === -1 ? (
          // Ellipsis
          <span key={`ellipsis-${index}`} className="px-2 text-gray-500 dark:text-gray-400">
            ...
          </span>
        ) : (
          // Page Number Button
          <button
            key={`page-${pageNumber}`}
            onClick={() => onPageChange(pageNumber)}
            className={`w-8 h-8 flex items-center justify-center rounded-md ${
              currentPage === pageNumber
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-medium"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {pageNumber}
          </button>
        )
      ))}
      
      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md ${
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
});
