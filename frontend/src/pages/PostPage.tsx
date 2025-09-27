import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaHeart, FaComment, FaShare, FaReply, FaUser } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import type { PostDetailDto } from "../../../shared/types";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../hooks/useTheme";
import { toast } from "sonner";

const PostPage: React.FC = () => {
  const { id: postId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentLikes, setCommentLikes] = useState<{ [key: number]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [post, setPost] = useState<PostDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const { user } = useAuthStore();
  const { theme } = useTheme();

  // 다크모드에서 content의 색상을 동적으로 처리하는 함수
  const processContentForTheme = (content: string) => {
    if (theme === "dark") {
      // 다크모드일 때 검은색 텍스트를 흰색으로 변환
      return content
        .replace(/color:\s*#000000/g, "color: #ffffff")
        .replace(/color:\s*#000/g, "color: #fff")
        .replace(/color:\s*black/g, "color: white")
        .replace(/color:\s*rgb\(0,\s*0,\s*0\)/g, "color: rgb(255, 255, 255)")
        .replace(/color:\s*rgba\(0,\s*0,\s*0,\s*[^)]+\)/g, "color: rgba(255, 255, 255, 1)");
    }
    return content;
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setIsNotFound(false);

        const response = await api.get<PostDetailDto>(`/post/detail/${postId}`);
        if (response) {
          setPost(response);
          setIsLiked(response.isLiked || false);
        } else {
          setIsNotFound(true);
          navigate("/404", { replace: true });
        }
      } catch (error) {
        console.error("게시글 조회 오류:", error);
        setIsNotFound(true);
        // 404 페이지로 리다이렉트
        navigate("/404", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) fetchPost();
  }, [postId, navigate]);

  // 좋아요 토글
  const handleLike = async () => {
    // 로그인 상태 확인
    if (!user?.id) {
      toast.error("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const response = await api.post(`/post/like/${postId}`);
      setIsLiked(response);

      // 하트 애니메이션 트리거
      if (response) {
        setIsHeartAnimating(true);
        setTimeout(() => setIsHeartAnimating(false), 600);
      }

      // 게시글 좋아요 수 업데이트
      if (post) {
        setPost({
          ...post,
          likeCount: response ? post.likeCount + 1 : post.likeCount - 1,
        });
      }
    } catch (error: any) {
      console.error("좋아요 오류:", error);

      // 에러 메시지에 따른 처리
      if (error.response?.status === 401) {
        toast.error("로그인이 필요합니다.");
        navigate("/login");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "이미 좋아요를 누른 게시글입니다.");
      } else {
        toast.error("다시 시도해주세요.");
      }
    }
  };

  // 댓글 좋아요 토글
  const handleCommentLike = (commentId: number) => {
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // 공유 버튼 클릭 핸들러
  const handleShare = async () => {
    const currentUrl = window.location.href;

    // 모바일에서 네이티브 공유 API 사용 (iOS Safari, Android Chrome)
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || "게시글",
          url: currentUrl,
        });
        return;
      } catch (error: any) {
        // 사용자가 공유를 취소한 경우는 에러가 아님
        if (error.name !== "AbortError") {
          console.error("네이티브 공유 실패:", error);
        } else {
          return; // 사용자가 취소한 경우 그냥 종료
        }
      }
    }

    // 네이티브 공유가 지원되지 않거나 실패한 경우 클립보드 복사
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success("링크가 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      // fallback: 구형 브라우저 지원
      try {
        const textArea = document.createElement("textarea");
        textArea.value = currentUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          toast.success("링크가 클립보드에 복사되었습니다!");
        } else {
          toast.error("링크 복사에 실패했습니다. 수동으로 복사해주세요.");
        }
      } catch (fallbackError) {
        console.error("Fallback 복사 실패:", fallbackError);
        toast.error("링크 복사에 실패했습니다. 수동으로 복사해주세요.");
      }
    }
  };

  // 사용자 프로필 클릭 핸들러 (추후 모달/팝업 구현 예정)
  const handleUserProfileClick = (userId: number) => {
    console.log("User profile clicked:", userId);
    // TODO: 사용자 프로필 모달/팝업 구현
  };

  // 답글 작성 토글
  const handleReplyToggle = (commentId: number) => {
    if (replyingTo === commentId) {
      setReplyingTo(null);
      setReplyText("");
    } else {
      setReplyingTo(commentId);
      setReplyText("");
    }
  };

  // 답글 작성
  const handleReplySubmit = async (commentId: number) => {
    if (!user?.id || !postId || !replyText.trim()) {
      return;
    }

    try {
      // TODO: API 호출로 답글 생성
      console.log("답글 작성:", { postId, commentId, content: replyText });
      setReplyText("");
      setReplyingTo(null);
      // 답글 작성 후 댓글 목록 새로고침
      // await fetchPost();
    } catch (error) {
      console.error("답글 작성 오류:", error);
    }
  };

  // 상대적 시간 표시 함수
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 6) return `${diffInHours}시간 전`;

    // 6시간 이후는 yyyy/mm/dd hh:mm 형태로 표시
    const year = commentDate.getFullYear();
    const month = String(commentDate.getMonth() + 1).padStart(2, "0");
    const day = String(commentDate.getDate()).padStart(2, "0");
    const hours = String(commentDate.getHours()).padStart(2, "0");
    const minutes = String(commentDate.getMinutes()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  // 댓글 추가
  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.id || !postId) {
      return;
    }

    try {
      // TODO: API 호출로 댓글 생성
      console.log("댓글 작성:", { postId, content: newComment });
      setNewComment("");
      // 댓글 작성 후 댓글 목록 새로고침
      // await fetchPost();
    } catch (error) {
      console.error("댓글 작성 오류:", error);
    }
  };

  // 게시글이 없으면 404 처리 (이미 navigate로 리다이렉트됨)
  if (!post || isNotFound) return null;

  // 로딩 중일 때 스피너 표시
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <ClipLoader size={50} className="mx-auto mb-4" color={theme === "light" ? "#4F7942" : "#9DC183"} />
            <p className="text-gray-600 dark:text-gray-400">게시글을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
      {/* 게시글 헤더 */}
      <div className="bg-white dark:bg-[#292929] rounded-lg shadow-md p-6 mb-6">
        {/* 신고하기 버튼 (모바일에서만 표시) */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <div className="flex items-center gap-3">
            <div
              className="group flex items-center gap-3 cursor-pointer"
              onClick={() => handleUserProfileClick(post.authorId)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                {post.authorProfileImageUrl ? (
                  <img
                    src={post.authorProfileImageUrl}
                    alt={post.authorNickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <span className="text-gray-600 dark:text-gray-400 group-hover:text-primary-light dark:group-hover:text-primary-dark group-hover:underline transition-colors">
                {post.authorNickname}
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-500">{getRelativeTime(post.createdAt.toString())}</span>
          </div>
          <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:underline transition-colors">
            신고하기
          </button>
        </div>

        {/* 제목과 신고하기 버튼 (데스크톱) */}
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex-1">{post.title}</h1>
          <button className="hidden md:block text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:underline transition-colors ml-4">
            신고하기
          </button>
        </div>

        {/* 작성자 정보와 통계 */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="group flex items-center gap-3 cursor-pointer"
              onClick={() => handleUserProfileClick(post.authorId)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                {post.authorProfileImageUrl ? (
                  <img
                    src={post.authorProfileImageUrl}
                    alt={post.authorNickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <span className="text-gray-600 dark:text-gray-400 group-hover:text-primary-light dark:group-hover:text-primary-dark group-hover:underline transition-colors">
                {post.authorNickname}
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-500">{getRelativeTime(post.createdAt.toString())}</span>
          </div>
          <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FaEye className="h-4 w-4" />
              {post.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <FaComment className="h-4 w-4" />
              {post.comments.length}
            </span>
          </div>
        </div>

        {/* 통계 정보 (모바일에서만 표시) */}
        <div className="flex items-center justify-end gap-6 text-gray-500 dark:text-gray-400 md:hidden">
          <span className="flex items-center gap-1">
            <FaEye className="h-4 w-4" />
            {post.viewCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <FaComment className="h-4 w-4" />
            {post.comments.length}
          </span>
        </div>
      </div>

      {/* 게시글 내용 */}
      <div className="bg-white dark:bg-[#292929] rounded-lg shadow-md p-6 mb-6 min-h-[300px] flex flex-col">
        <div
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-gray-200 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 flex-1"
          style={{
            // 다크모드에서 텍스트 색상만 인버트 (배경은 유지)
            ...(theme === "dark" && {
              filter: "invert(1) hue-rotate(180deg)",
              backgroundColor: "transparent",
            }),
          }}
          dangerouslySetInnerHTML={{ __html: processContentForTheme(post.content) }}
        />

        {/* 좋아요와 공유 버튼 */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handleLike}
            className={`px-6 py-3 border-2 rounded-lg flex items-center gap-2 transition-colors ${
              isLiked
                ? "border-red-500 dark:border-red-400 text-red-500 dark:text-red-400"
                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-500 hover:text-red-500 dark:hover:border-red-400 dark:hover:text-red-400"
            }`}
          >
            <FaHeart
              className={`h-4 w-4 transition-all duration-300 ${
                isHeartAnimating ? "animate-bounce scale-125 text-red-500 dark:text-red-400" : ""
              }`}
            />
            좋아요 {post.likeCount}
          </button>
          <button
            onClick={handleShare}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg flex items-center gap-2 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors active:border-gray-300 active:text-gray-600 dark:active:border-gray-600 dark:active:text-gray-400"
          >
            <FaShare className="h-4 w-4" />
            공유
          </button>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white dark:bg-[#292929] rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">댓글 ({post.comments.length})</h3>

        {/* 댓글 목록 */}
        <div className="space-y-4 mb-6">
          {post.comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-500 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="group flex items-center gap-2 cursor-pointer"
                    onClick={() => handleUserProfileClick(comment.author.id)}
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                      {comment.author.profileImageUrl ? (
                        <img
                          src={comment.author.profileImageUrl}
                          alt={comment.author.nickname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary-light dark:group-hover:text-primary-dark group-hover:underline transition-colors">
                      {comment.author.nickname}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getRelativeTime(comment.createdAt.toString())}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => handleReplyToggle(comment.id)}
                  className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-dark transition-colors text-sm"
                >
                  <FaReply className="h-3 w-3" />
                  답글
                </button>
                <button
                  onClick={() => handleCommentLike(comment.id)}
                  className={`flex items-center gap-1 transition-colors ${
                    commentLikes[comment.id]
                      ? "text-red-500 dark:text-red-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                  }`}
                >
                  <FaHeart className="h-3 w-3" />
                  {comment.likeCount + (commentLikes[comment.id] ? 1 : 0)}
                </button>
              </div>

              {/* 답글 작성 UI */}
              {replyingTo === comment.id && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-[#242424] rounded-lg animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <FaUser className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`${comment.author.nickname}님에게 답글 달기...`}
                        className="w-full p-3 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-[#292929] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent outline-none resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleReplySubmit(comment.id)}
                          disabled={!replyText.trim()}
                          className="bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          답글 작성
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 댓글 작성 */}
        <div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 작성해주세요..."
            className="w-full p-3 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-[#292929] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent outline-none resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="bg-primary-light dark:bg-primary-dark text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              댓글 작성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
