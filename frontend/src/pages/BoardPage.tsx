import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaEye, FaHeart, FaComment, FaPen, FaImage } from "react-icons/fa";
import type { PostListDto } from "../../../shared/types";
import { api } from "../api/axios";

const TipsPage: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<PostListDto[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await api.get<PostListDto[]>(`/post/${category}`);
      setPosts(response);
    };
    fetchPosts();
  }, [category]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
  };

  // 썸네일 이미지 유효성 검사
  const isValidThumbnail = (url: string | null | undefined) => {
    return url && url.trim() !== "" && url !== "null" && url !== "undefined";
  };

  // 카드 클릭 시 상세 페이지로 이동
  const handlePostClick = (postId: number) => {
    navigate(`/${category}/${postId}`);
  };

  // 글쓰기 버튼 클릭
  const handleWriteClick = () => {
    // tips 카테고리로 글쓰기 페이지 이동
    navigate(`/${category}/write`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      {/* 헤더 */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {category === "tips"
            ? "정보"
            : category === "free"
              ? "자유"
              : category === "question"
                ? "질문"
                : category === "review"
                  ? "리뷰"
                  : category}{" "}
          게시판
        </h1>
      </div>

      {/* 글쓰기 버튼 */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleWriteClick}
          className="group relative bg-primary-light dark:bg-primary-dark text-white dark:text-background-dark px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
        >
          <div className="flex items-center gap-2 relative z-10">
            <FaPen className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
            <span>글쓰기</span>
          </div>
        </button>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => handlePostClick(post.id)}
            className="group bg-white dark:bg-[#292929] rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-gray-300 dark:border-gray-500 hover:border-primary-light dark:hover:border-primary-dark cursor-pointer"
          >
            <div className="flex gap-4 items-center">
              {/* 썸네일 이미지 */}
              <div className="flex-shrink-0">
                {isValidThumbnail(post.thumbnailUrl) ? (
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-20 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      // 이미지 로드 실패 시 아이콘으로 대체
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-20 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="w-20 h-16 bg-background-light dark:bg-background-dark rounded-lg flex items-center justify-center">
                    <FaImage className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>

              {/* 좌측: 타이틀과 통계 */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h2>
                {/* 통계 */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <FaEye className="h-3 w-3" />
                    {post.viewCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaHeart className="h-3 w-3" />
                    {post.likeCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaComment className="h-3 w-3" />
                    {post.commentCount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 우측: 작성자와 작성일 */}
              <div className="flex-shrink-0 text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-dark cursor-pointer transition-colors">
                  {post.authorNickname}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(post.createdAt)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipsPage;
