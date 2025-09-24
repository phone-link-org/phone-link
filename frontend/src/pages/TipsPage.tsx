import React from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaHeart, FaComment, FaPen } from "react-icons/fa";

// 게시글 타입 정의
interface TipPost {
  id: number;
  title: string;
  category: string;
  content: string;
  author: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  thumbnail: string;
}

// 데모 데이터
const demoPosts: TipPost[] = [
  {
    id: 1,
    title: "번호이동(MNP) 완벽 가이드 - 절약하는 방법까지",
    category: "번호이동",
    content:
      "번호이동(MNP, Mobile Number Portability)이란 기존 통신사에서 사용하던 번호를 그대로 유지하면서 다른 통신사로 이동하는 서비스입니다. 이 글에서는 번호이동의 절차, 주의사항, 그리고 비용을 절약하는 방법까지 자세히 설명드립니다.",
    author: "관리자",
    createdAt: "2024-01-15",
    views: 1250,
    likes: 89,
    comments: 23,
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop",
  },
  {
    id: 2,
    title: "기기변경 vs 번호이동, 어떤 것이 더 유리할까?",
    category: "기기변경",
    content:
      "기기변경은 같은 통신사 내에서 휴대폰만 바꾸는 것을 말합니다. 번호이동과의 차이점, 각각의 장단점, 그리고 상황에 따른 선택 기준을 알아보세요.",
    author: "관리자",
    createdAt: "2024-01-14",
    views: 980,
    likes: 67,
    comments: 18,
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=200&fit=crop",
  },
  {
    id: 3,
    title: "성지(성지폰)란? 대리점보다 저렴한 이유와 주의사항",
    category: "성지",
    content:
      "성지폰은 정식 대리점이 아닌 개인 사업자나 소규모 업체에서 판매하는 휴대폰을 말합니다. 정식 대리점보다 저렴한 이유와 구매 시 주의해야 할 점들을 자세히 알아보겠습니다.",
    author: "관리자",
    createdAt: "2024-01-13",
    views: 2100,
    likes: 156,
    comments: 42,
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop",
  },
  {
    id: 4,
    title: "통신사별 요금제 비교 및 선택 가이드",
    category: "요금제",
    content:
      "SKT, KT, LG U+ 각 통신사의 주요 요금제를 비교하고, 사용 패턴에 맞는 최적의 요금제를 선택하는 방법을 알려드립니다.",
    author: "관리자",
    createdAt: "2024-01-12",
    views: 1580,
    likes: 112,
    comments: 35,
    thumbnail: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=200&fit=crop",
  },
  {
    id: 5,
    title: "휴대폰 개통 시 알아두면 좋은 할인 혜택들",
    category: "할인혜택",
    content:
      "통신사에서 제공하는 다양한 할인 혜택들을 소개합니다. 가족 할인, 직장인 할인, 학생 할인 등 다양한 혜택을 놓치지 마세요.",
    author: "관리자",
    createdAt: "2024-01-11",
    views: 890,
    likes: 74,
    comments: 19,
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop",
  },
  {
    id: 6,
    title: "중고폰 구매 시 체크해야 할 포인트",
    category: "중고폰",
    content:
      "중고폰을 구매할 때 반드시 확인해야 할 사항들을 정리했습니다. 배터리 상태, 액정 상태, 통화품질 등 중요한 체크포인트를 알아보세요.",
    author: "관리자",
    createdAt: "2024-01-10",
    views: 1450,
    likes: 98,
    comments: 28,
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=200&fit=crop",
  },
];

const TipsPage: React.FC = () => {
  const navigate = useNavigate();

  // 카드 클릭 시 상세 페이지로 이동
  const handlePostClick = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  // 글쓰기 버튼 클릭
  const handleWriteClick = () => {
    // 기본 카테고리로 이동 (번호이동)
    navigate("/post/write/1");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      {/* 헤더 */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">정보 게시판</h1>
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
        {demoPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => handlePostClick(post.id)}
            className="group bg-white dark:bg-[#292929] rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-gray-300 dark:border-gray-500 hover:border-primary-light dark:hover:border-primary-dark cursor-pointer"
          >
            <div className="flex gap-4 items-center">
              {/* 썸네일 이미지 */}
              <div className="flex-shrink-0">
                <img src={post.thumbnail} alt={post.title} className="w-20 h-16 object-cover rounded-lg" />
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
                    {post.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaHeart className="h-3 w-3" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaComment className="h-3 w-3" />
                    {post.comments}
                  </span>
                </div>
              </div>

              {/* 우측: 작성자와 작성일 */}
              <div className="flex-shrink-0 text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-dark cursor-pointer transition-colors">
                  {post.author}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{post.createdAt}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipsPage;
