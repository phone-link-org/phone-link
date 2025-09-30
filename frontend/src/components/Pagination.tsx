import React, { useState } from "react";
import { HiDotsHorizontal } from "react-icons/hi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, maxVisiblePages = 5 }) => {
  const [animatingPage, setAnimatingPage] = useState<number | null>(null);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    onPageChange(page);
    setAnimatingPage(page);
    // 애니메이션 후 상태 초기화
    setTimeout(() => {
      setAnimatingPage(null);
    }, 600); // animate-ping 지속 시간
  };

  // 페이지네이션 버튼 생성
  const generatePageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <div className="inline-flex items-center gap-1.5 rounded-full p-1.5 backdrop-blur-sm">
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="group flex items-center justify-center w-7 h-7 rounded-full text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-light dark:hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
        >
          <svg
            className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 첫 페이지 */}
        {currentPage > 3 && !generatePageNumbers().includes(1) && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="flex items-center justify-center min-w-[1.75rem] h-7 px-2.5 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-light dark:hover:text-primary-dark transition-all duration-200 hover:shadow-sm"
            >
              1
            </button>
            {currentPage > 4 && (
              <span className="flex items-center justify-center w-6 h-7 text-gray-400 dark:text-gray-500">
                <HiDotsHorizontal className="w-4 h-4" />
              </span>
            )}
          </>
        )}

        {/* 페이지 번호들 */}
        {generatePageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`relative flex items-center justify-center min-w-[1.75rem] h-7 px-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              currentPage === page
                ? "text-primary-light dark:text-primary-dark scale-110"
                : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-light dark:hover:text-primary-dark hover:shadow-sm hover:scale-105"
            }`}
          >
            {currentPage === page && (
              <>
                {animatingPage === page && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary-light dark:border-primary-dark animate-ping opacity-75"></div>
                )}
                <div className="absolute inset-0 rounded-full border-2 border-primary-light dark:border-primary-dark"></div>
                <div className="absolute inset-0 rounded-full bg-primary-light/10 dark:bg-primary-dark/10"></div>
              </>
            )}
            <span className="relative z-10">{page}</span>
          </button>
        ))}

        {/* 마지막 페이지 */}
        {currentPage < totalPages - 2 && !generatePageNumbers().includes(totalPages) && (
          <>
            {currentPage < totalPages - 3 && (
              <span className="flex items-center justify-center w-6 h-7 text-gray-400 dark:text-gray-500">
                <HiDotsHorizontal className="w-4 h-4" />
              </span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="flex items-center justify-center min-w-[1.75rem] h-7 px-2.5 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-light dark:hover:text-primary-dark transition-all duration-200 hover:shadow-sm"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="group flex items-center justify-center w-7 h-7 rounded-full text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-light dark:hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
        >
          <svg
            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
