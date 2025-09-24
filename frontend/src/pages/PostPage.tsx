import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaHeart, FaComment, FaShare, FaReply, FaUser } from "react-icons/fa";

// 게시글 타입 정의
interface Post {
  id: number;
  title: string;
  category: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  thumbnail: string;
  fullContent: string;
  tags: string[];
}

// 댓글 타입 정의
interface Comment {
  id: number;
  author: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
  likes: number;
}

// 데모 데이터
const demoPosts: Post[] = [
  {
    id: 1,
    title: "번호이동(MNP) 완벽 가이드 - 절약하는 방법까지",
    category: "번호이동",
    content:
      "번호이동(MNP, Mobile Number Portability)이란 기존 통신사에서 사용하던 번호를 그대로 유지하면서 다른 통신사로 이동하는 서비스입니다.",
    author: "관리자",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    createdAt: "2024-01-15",
    views: 1250,
    likes: 89,
    comments: 23,
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop",
    fullContent: `
# 번호이동(MNP) 완벽 가이드

번호이동(MNP, Mobile Number Portability)이란 기존 통신사에서 사용하던 번호를 그대로 유지하면서 다른 통신사로 이동하는 서비스입니다.

## 번호이동의 장점

1. **번호 유지**: 기존 번호를 그대로 사용할 수 있어 연락처 변경이 불필요합니다.
2. **비용 절약**: 새로운 요금제나 프로모션을 통해 통신비를 절약할 수 있습니다.
3. **서비스 선택의 자유**: 각 통신사의 장점을 활용할 수 있습니다.

## 번호이동 절차

### 1단계: 사전 준비
- 기존 통신사에서 미납금이 없는지 확인
- 신분증과 인감도장 준비
- 기존 휴대폰과 USIM 카드 준비

### 2단계: 신청
- 이동하고자 하는 통신사 대리점 방문
- 번호이동 신청서 작성
- 신분증 제시 및 본인 확인

### 3단계: 처리
- 기존 통신사에서 해지 처리 (보통 1-2일 소요)
- 새 통신사에서 개통 처리
- USIM 카드 교체

## 주의사항

- **해지 수수료**: 기존 통신사에서 해지 수수료가 발생할 수 있습니다.
- **약정 기간**: 약정이 남아있는 경우 위약금이 발생할 수 있습니다.
- **서비스 중단**: 번호이동 처리 중 일시적으로 통화가 불가능할 수 있습니다.

## 비용 절약 팁

1. **프로모션 활용**: 번호이동 시 제공되는 특별 할인 혜택을 확인하세요.
2. **요금제 비교**: 각 통신사의 요금제를 꼼꼼히 비교해보세요.
3. **가족 할인**: 가족 구성원이 같은 통신사를 사용하면 추가 할인을 받을 수 있습니다.

번호이동은 신중하게 계획하고 진행하면 통신비 절약과 더 나은 서비스를 동시에 얻을 수 있는 좋은 방법입니다.
    `,
    tags: ["번호이동", "MNP", "통신사", "비용절약", "가이드"],
  },
  {
    id: 2,
    title: "기기변경 vs 번호이동, 어떤 것이 더 유리할까?",
    category: "기기변경",
    content:
      "기기변경은 같은 통신사 내에서 휴대폰만 바꾸는 것을 말합니다. 번호이동과의 차이점, 각각의 장단점, 그리고 상황에 따른 선택 기준을 알아보세요.",
    author: "관리자",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    createdAt: "2024-01-14",
    views: 980,
    likes: 67,
    comments: 18,
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=200&fit=crop",
    fullContent: `
# 기기변경 vs 번호이동 비교

휴대폰을 바꿀 때 고민되는 두 가지 방법, 기기변경과 번호이동의 차이점과 장단점을 자세히 알아보겠습니다.

## 기기변경이란?

같은 통신사 내에서 휴대폰만 바꾸는 것을 말합니다. 번호와 요금제는 그대로 유지됩니다.

### 기기변경의 장점
- **간단한 절차**: 번호이동보다 훨씬 간단한 절차
- **즉시 처리**: 대부분 당일 처리 가능
- **안정성**: 서비스 중단 없이 기기만 교체

### 기기변경의 단점
- **제한된 선택**: 같은 통신사의 기기만 선택 가능
- **할인 혜택 제한**: 번호이동 대비 할인 혜택이 적을 수 있음

## 번호이동이란?

다른 통신사로 이동하면서 기기도 함께 바꾸는 것을 말합니다.

### 번호이동의 장점
- **다양한 선택**: 모든 통신사의 기기와 요금제 선택 가능
- **큰 할인**: 번호이동 고객 대상 특별 할인 혜택
- **최적화**: 사용 패턴에 맞는 최적의 요금제 선택

### 번호이동의 단점
- **복잡한 절차**: 기기변경보다 복잡한 절차
- **처리 시간**: 1-2일의 처리 시간 필요
- **해지 수수료**: 기존 통신사 해지 시 수수료 발생 가능

## 상황별 선택 가이드

### 기기변경을 선택해야 하는 경우
- 현재 요금제에 만족하는 경우
- 빠른 기기 교체가 필요한 경우
- 복잡한 절차를 피하고 싶은 경우

### 번호이동을 선택해야 하는 경우
- 통신비 절약이 우선인 경우
- 다른 통신사의 기기를 원하는 경우
- 더 나은 요금제를 찾고 있는 경우

## 결론

기기변경과 번호이동 모두 각각의 장단점이 있습니다. 자신의 상황과 우선순위에 따라 신중하게 선택하는 것이 중요합니다.
    `,
    tags: ["기기변경", "번호이동", "비교", "선택가이드"],
  },
];

// 데모 댓글 데이터
const demoComments: Comment[] = [
  {
    id: 1,
    author: "김철수",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    content: "정말 유용한 정보네요! 번호이동 고려 중이었는데 도움이 많이 됐습니다.",
    createdAt: "2025-09-23 21:30",
    likes: 0,
  },
  {
    id: 2,
    author: "이영희",
    authorAvatar: null,
    content: "해지 수수료 부분이 궁금했는데 자세히 설명해주셔서 감사합니다.",
    createdAt: "2025-09-24 10:45",
    likes: 3,
  },
  {
    id: 3,
    author: "박민수",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    content: "번호이동 절차가 생각보다 간단하네요. 다음에 시도해보겠습니다.",
    createdAt: "2025-09-24 13:13",
    likes: 2,
  },
];

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(demoComments);
  const [commentLikes, setCommentLikes] = useState<{ [key: number]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  // URL 파라미터로 받은 id로 게시글 찾기
  const post = demoPosts.find((p) => p.id === parseInt(id || "0"));

  // 게시글이 없으면 404 처리
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">게시글을 찾을 수 없습니다</h1>
          <button
            onClick={() => navigate("/tips")}
            className="bg-primary-light dark:bg-primary-dark text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 좋아요 토글
  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // 댓글 좋아요 토글
  const handleCommentLike = (commentId: number) => {
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // 사용자 프로필 클릭 핸들러 (추후 모달/팝업 구현 예정)
  const handleUserProfileClick = (userId: string) => {
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
  const handleReplySubmit = () => {
    if (replyText.trim()) {
      const reply: Comment = {
        id: comments.length + 1,
        author: "현재 사용자",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
        content: replyText,
        createdAt: new Date().toLocaleString(),
        likes: 0,
      };
      setComments([...comments, reply]);
      setReplyText("");
      setReplyingTo(null);
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

    // 6시간 이후는 원래 날짜/시간 형식으로 표시
    return dateString;
  };

  // 댓글 추가
  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        author: "현재 사용자",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
        content: newComment,
        createdAt: new Date().toLocaleString(),
        likes: 0,
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
      {/* 게시글 헤더 */}
      <div className="bg-white dark:bg-[#292929] rounded-lg shadow-md p-6 mb-6">
        {/* 신고하기 버튼 (모바일에서만 표시) */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <div className="flex items-center gap-3">
            <div
              className="group flex items-center gap-3 cursor-pointer"
              onClick={() => handleUserProfileClick(post.author)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt={post.author} className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <span className="text-gray-600 dark:text-gray-400 group-hover:text-primary-light dark:group-hover:text-primary-dark group-hover:underline transition-colors">
                {post.author}
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-500">{post.createdAt}</span>
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
              onClick={() => handleUserProfileClick(post.author)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt={post.author} className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <span className="text-gray-600 dark:text-gray-400 group-hover:text-primary-light dark:group-hover:text-primary-dark group-hover:underline transition-colors">
                {post.author}
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-500">{post.createdAt}</span>
          </div>
          <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FaEye className="h-4 w-4" />
              {post.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <FaComment className="h-4 w-4" />
              {comments.length}
            </span>
          </div>
        </div>

        {/* 통계 정보 (모바일에서만 표시) */}
        <div className="flex items-center justify-end gap-6 text-gray-500 dark:text-gray-400 md:hidden">
          <span className="flex items-center gap-1">
            <FaEye className="h-4 w-4" />
            {post.views.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <FaComment className="h-4 w-4" />
            {comments.length}
          </span>
        </div>
      </div>

      {/* 게시글 내용 */}
      <div className="bg-white dark:bg-[#292929] rounded-lg shadow-md p-6 mb-6">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div className="whitespace-pre-line text-gray-800 dark:text-gray-200 leading-relaxed">{post.fullContent}</div>
        </div>

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
            <FaHeart className="h-4 w-4" />
            좋아요 {post.likes + (isLiked ? 1 : 0)}
          </button>
          <button className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg flex items-center gap-2 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors active:border-gray-300 active:text-gray-600 dark:active:border-gray-600 dark:active:text-gray-400">
            <FaShare className="h-4 w-4" />
            공유
          </button>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white dark:bg-[#292929] rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">댓글 ({comments.length})</h3>

        {/* 댓글 목록 */}
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-500 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="group flex items-center gap-2 cursor-pointer"
                    onClick={() => handleUserProfileClick(comment.author)}
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                      {comment.authorAvatar ? (
                        <img src={comment.authorAvatar} alt={comment.author} className="w-full h-full object-cover" />
                      ) : (
                        <FaUser className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary-light dark:group-hover:text-primary-dark group-hover:underline transition-colors">
                      {comment.author}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{getRelativeTime(comment.createdAt)}</span>
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
                  {comment.likes + (commentLikes[comment.id] ? 1 : 0)}
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
                        placeholder={`${comment.author}님에게 답글 달기...`}
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
                          //onClick={() => handleReplySubmit(comment.id)}
                          onClick={() => handleReplySubmit()}
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
