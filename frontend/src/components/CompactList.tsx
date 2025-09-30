import React from "react";
import { Link } from "react-router-dom";
import { FaImage } from "react-icons/fa";

interface CompactListItem {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  createdAt: Date | string;
  badge?: string; // 카테고리, 게시판 등
  linkTo: string; // 클릭 시 이동할 경로
}

interface CompactListProps {
  items: CompactListItem[];
  getRelativeTime: (date: Date | string) => string;
}

const CompactList: React.FC<CompactListProps> = ({ items, getRelativeTime }) => {
  // 썸네일 이미지 유효성 검사
  const isValidThumbnail = (url: string | null | undefined) => {
    return url && url.trim() !== "" && url !== "null" && url !== "undefined";
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-600">
      {items.map((item) => (
        <Link key={item.id} to={item.linkTo} className="group block py-3 px-2 transition-colors duration-200">
          {/* 모바일 레이아웃 */}
          <div className="block sm:hidden">
            <div className="flex items-center gap-2">
              {/* 썸네일 이미지 */}
              <div className="flex-shrink-0">
                {isValidThumbnail(item.thumbnailUrl) ? (
                  <img
                    src={item.thumbnailUrl!}
                    alt={item.title}
                    className="w-10 h-10 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <svg class="w-3 h-3 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-background-light dark:bg-background-dark rounded flex items-center justify-center">
                    <FaImage className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>

              {/* 뱃지, 날짜, 제목 */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* 뱃지와 날짜 */}
                <div className="flex items-center justify-between text-xs">
                  {item.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded font-medium bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark border border-primary-light/20 dark:border-primary-dark/20">
                      {item.badge}
                    </span>
                  )}
                  <span className="text-gray-500 dark:text-gray-400">{getRelativeTime(item.createdAt)}</span>
                </div>
                {/* 제목 */}
                <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors line-clamp-1 leading-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          </div>

          {/* 데스크톱 레이아웃 */}
          <div className="hidden sm:flex items-center gap-3">
            {/* 뱃지 */}
            {item.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark border border-primary-light/20 dark:border-primary-dark/20">
                {item.badge}
              </span>
            )}
            {/* 썸네일 이미지 */}
            <div className="flex-shrink-0">
              {isValidThumbnail(item.thumbnailUrl) ? (
                <img
                  src={item.thumbnailUrl!}
                  alt={item.title}
                  className="w-10 h-8 object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-10 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <svg class="w-3 h-3 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="w-10 h-8 bg-background-light dark:bg-background-dark rounded flex items-center justify-center">
                  <FaImage className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            {/* 제목 */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors line-clamp-1 leading-tight">
                {item.title}
              </h3>
            </div>

            {/* 날짜 */}
            <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
              {getRelativeTime(item.createdAt)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CompactList;
