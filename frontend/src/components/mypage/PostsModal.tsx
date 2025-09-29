import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaImage } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { HiDotsHorizontal } from "react-icons/hi";
import Modal from "./Modal";
import { api } from "../../api/axios";
import type { MyPostDto } from "../../../../shared/post.types";

interface PostsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostsModal: React.FC<PostsModalProps> = ({ isOpen, onClose }) => {
  const [posts, setPosts] = useState<MyPostDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 7;

  // 내가 쓴 게시글 조회
  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const response = await api.get<MyPostDto[]>(`/post/my`);
        // API 응답이 배열인지 확인
        if (Array.isArray(response)) {
          setPosts(response);
          setTotalPages(Math.ceil(response.length / postsPerPage));
        } else {
          console.error("API 응답이 배열이 아닙니다:", response);
          setPosts([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("내가 쓴 게시글 조회 오류:", error);
        setPosts([]);
        setTotalPages(1);
      }
    };

    if (isOpen) {
      fetchMyPosts();
    }
  }, [isOpen]);

  // 상대적 시간 표시 함수
  const getRelativeTime = (date: Date | string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 6) return `${diffInHours}시간 전`;

    // 6시간 이후는 화면 크기에 따라 다른 형식으로 표시
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      // 모바일: MM/dd 형식
      const month = String(postDate.getMonth() + 1).padStart(2, "0");
      const day = String(postDate.getDate()).padStart(2, "0");
      return `${month}/${day}`;
    } else {
      // 데스크톱: yyyy/mm/dd hh:mm 형식
      const year = postDate.getFullYear();
      const month = String(postDate.getMonth() + 1).padStart(2, "0");
      const day = String(postDate.getDate()).padStart(2, "0");
      const hours = String(postDate.getHours()).padStart(2, "0");
      const minutes = String(postDate.getMinutes()).padStart(2, "0");
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
  };

  // 썸네일 이미지 유효성 검사
  const isValidThumbnail = (url: string | null | undefined) => {
    return url && url.trim() !== "" && url !== "null" && url !== "undefined";
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 페이지네이션 버튼 생성
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // 현재 페이지의 게시글들
  const currentPosts = Array.isArray(posts)
    ? posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="내가 쓴 글">
      <div className="max-h-[70vh] flex flex-col">
        {/* 게시글 목록 */}
        <div className="flex-1 overflow-y-auto">
          {currentPosts.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {currentPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/${post.categoryName}/${post.id}`}
                  className="group flex items-center gap-3 py-3 px-2 transition-colors duration-200"
                >
                  {/* 썸네일 이미지 */}
                  <div className="flex-shrink-0">
                    {isValidThumbnail(post.thumbnailUrl) ? (
                      <img
                        src={post.thumbnailUrl!}
                        alt={post.title}
                        className="w-8 h-6 sm:w-10 sm:h-8 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-8 h-6 sm:w-10 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                <svg class="w-3 h-3 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                </svg>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-8 h-6 sm:w-10 sm:h-8 bg-background-light dark:bg-background-dark rounded flex items-center justify-center">
                        <FaImage className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* 제목 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors line-clamp-1 leading-tight">
                      {post.title}
                    </h3>
                  </div>

                  {/* 날짜 */}
                  <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {getRelativeTime(post.createdAt)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiEdit3 className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">작성한 게시글이 없습니다</h3>
              <p className="text-gray-500 dark:text-gray-400">첫 번째 게시글을 작성해보세요!</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-1 bg-white dark:bg-[#292929] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-500 p-1 sm:p-2 max-w-full overflow-x-auto">
              {/* 이전 페이지 버튼 */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 hover:text-primary-light dark:hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 dark:disabled:hover:text-gray-400 transition-all duration-200"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* 첫 페이지 */}
              {currentPage > 3 && !generatePageNumbers().includes(1) && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 hover:text-primary-light dark:hover:text-primary-dark transition-all duration-200 font-medium text-sm sm:text-base"
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="flex items-center justify-center w-6 h-8 sm:h-10 text-gray-400 dark:text-gray-500">
                      <HiDotsHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                    </span>
                  )}
                </>
              )}

              {/* 페이지 번호들 */}
              {generatePageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                    currentPage === page
                      ? "bg-gradient-to-r from-primary-light to-primary-light/80 dark:from-primary-dark dark:to-primary-dark/80 text-white dark:text-background-dark shadow-lg scale-105"
                      : "text-gray-600 dark:text-gray-300 hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 hover:text-primary-light dark:hover:text-primary-dark hover:scale-105"
                  }`}
                >
                  {page}
                  {currentPage === page && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white dark:bg-background-dark rounded-full"></div>
                  )}
                </button>
              ))}

              {/* 마지막 페이지 */}
              {currentPage < totalPages - 2 && !generatePageNumbers().includes(totalPages) && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="flex items-center justify-center w-6 h-8 sm:h-10 text-gray-400 dark:text-gray-500">
                      <HiDotsHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                    </span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 hover:text-primary-light dark:hover:text-primary-dark transition-all duration-200 font-medium text-sm sm:text-base"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* 다음 페이지 버튼 */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 hover:text-primary-light dark:hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 dark:disabled:hover:text-gray-400 transition-all duration-200"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PostsModal;
