import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaEye, FaHeart, FaComment, FaPen, FaFire, FaTrophy, FaImage } from "react-icons/fa";
import type { PostListDto } from "../../../shared/types";
import { api } from "../api/axios";

const TipsPage: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<PostListDto[]>([]);
  const [popularPosts, setPopularPosts] = useState<PostListDto[]>([]);
  const [isWideScreen, setIsWideScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 일반 게시글과 인기 게시글을 병렬로 조회
        const [postsResponse, popularPostsResponse] = await Promise.all([
          api.get<PostListDto[]>(`/post/${category}`),
          api.get<PostListDto[]>(`/post/popular/${category}`),
        ]);

        // 일반 게시글 설정
        if (postsResponse) {
          setPosts(postsResponse);
        }

        // 인기 게시글 설정
        if (popularPostsResponse) {
          setPopularPosts(popularPostsResponse);
        }
      } catch (error) {
        console.error("게시글 조회 오류:", error);
        // 오류 발생 시 빈 배열로 설정
        setPosts([]);
        setPopularPosts([]);
      }
    };

    fetchData();
  }, [category]);

  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsWideScreen(window.innerWidth >= 850);
    };

    // 초기 체크
    checkScreenSize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", checkScreenSize);

    // 클린업
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  // 간단한 날짜 포맷팅 함수 (월/일만)
  const formatSimpleDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${month}/${day}`;
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
      <div className="flex items-center justify-between mb-4">
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

        {/* 글쓰기 버튼 */}
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

      {/* 인기 게시글 섹션 */}
      {popularPosts.length > 0 && (
        <div className="my-4">
          <div className="bg-white dark:bg-[#292929] rounded-lg shadow-md p-6 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-4">
              <FaFire className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">인기 게시글</h2>
            </div>

            <div
              className={`grid gap-3 ${isWideScreen ? "grid-cols-2" : "grid-cols-1"}`}
              style={isWideScreen ? { gridAutoFlow: "column", gridTemplateRows: "repeat(3, 1fr)" } : {}}
            >
              {popularPosts.map((post, index) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                  className="group bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-500 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-[#292929] hover:border-orange-300 dark:hover:border-orange-600 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    {/* 순위 */}
                    <div className="flex-shrink-0">
                      {index === 0 && (
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">
                          <FaTrophy className="w-3 h-3" />
                        </div>
                      )}
                      {index > 0 && (
                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    {/* 제목 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1 leading-tight">
                        {post.title}
                      </h3>
                    </div>

                    {/* 통계 */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaHeart className="h-3 w-3 text-red-500" />
                        {post.likeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye className="h-3 w-3" />
                        {post.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaComment className="h-3 w-3" />
                        {post.commentCount}
                      </span>
                    </div>

                    {/* 날짜 */}
                    <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-500 font-medium">
                      {formatSimpleDate(post.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 게시글 목록 */}
      <div className="bg-white dark:bg-[#292929] rounded-lg shadow-md border border-gray-300 dark:border-gray-500 overflow-hidden">
        <div>
          {posts.map((post, index) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post.id)}
              className={`group p-4 hover:bg-gradient-to-r hover:from-primary-light/10 hover:to-primary-light/5 dark:hover:from-primary-dark/10 dark:hover:to-primary-dark/5 cursor-pointer transition-all duration-300 hover:shadow-sm hover:border-l-4 hover:border-l-primary-light dark:hover:border-l-primary-dark ${
                index > 0 ? "border-t border-gray-200 dark:border-gray-600" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* 썸네일 이미지 */}
                <div className="flex-shrink-0">
                  {isValidThumbnail(post.thumbnailUrl) ? (
                    <img
                      src={post.thumbnailUrl}
                      alt={post.title}
                      className="w-16 h-12 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // 이미지 로드 실패 시 아이콘으로 대체
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors duration-300">
                              <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-16 h-12 bg-background-light dark:bg-background-dark rounded-lg flex items-center justify-center  transition-colors duration-300">
                      <FaImage className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>

                {/* 제목과 작성자 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    {/* 댓글 개수 */}
                    <div className="flex-shrink-0 px-2 py-1 ml-2 border border-gray-300 dark:border-gray-500 rounded text-xs text-gray-600 dark:text-gray-400 group-hover:border-primary-light dark:group-hover:border-primary-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                      {post.commentCount}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {post.authorNickname}
                  </div>
                </div>

                {/* 통계 */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                    <FaEye className="h-3 w-3" />
                    {post.viewCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 group-hover:text-red-500 transition-colors">
                    <FaHeart className="h-3 w-3" />
                    {post.likeCount.toLocaleString()}
                  </span>
                </div>

                {/* 날짜 */}
                <div className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TipsPage;
