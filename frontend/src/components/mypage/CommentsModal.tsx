import React, { useState, useEffect } from "react";
import { FiMessageSquare } from "react-icons/fi";
import Modal from "./Modal";
import Pagination from "../Pagination";
import CompactList from "../CompactList";
import { api } from "../../api/axios";
import type { MyPostDto } from "../../../../shared/post.types";

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose }) => {
  const [comments, setComments] = useState<MyPostDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const commentsPerPage = 7;

  // 내가 쓴 댓글 조회
  useEffect(() => {
    const fetchMyComments = async () => {
      try {
        const response = await api.get<MyPostDto[]>(`/post/my-comment`);
        // API 응답이 배열인지 확인
        if (Array.isArray(response)) {
          setComments(response);
          setTotalPages(Math.ceil(response.length / commentsPerPage));
        } else {
          console.error("API 응답이 배열이 아닙니다:", response);
          setComments([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("내가 쓴 댓글 조회 오류:", error);
        setComments([]);
        setTotalPages(1);
      }
    };

    if (isOpen) {
      fetchMyComments();
    }
  }, [isOpen]);

  // 상대적 시간 표시 함수
  const getRelativeTime = (date: Date | string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 6) return `${diffInHours}시간 전`;

    // 6시간 이후는 화면 크기에 따라 다른 형식으로 표시
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      // 모바일: MM/dd 형식
      const month = String(commentDate.getMonth() + 1).padStart(2, "0");
      const day = String(commentDate.getDate()).padStart(2, "0");
      return `${month}/${day}`;
    } else {
      // 데스크톱: yyyy/mm/dd hh:mm 형식
      const year = commentDate.getFullYear();
      const month = String(commentDate.getMonth() + 1).padStart(2, "0");
      const day = String(commentDate.getDate()).padStart(2, "0");
      const hours = String(commentDate.getHours()).padStart(2, "0");
      const minutes = String(commentDate.getMinutes()).padStart(2, "0");
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 현재 페이지의 댓글들
  const currentComments = Array.isArray(comments)
    ? comments.slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage)
    : [];

  // CompactList에 전달할 items 데이터 변환
  const listItems = currentComments.map((comment) => ({
    id: comment.id,
    title: comment.title,
    thumbnailUrl: comment.thumbnailUrl,
    createdAt: comment.createdAt,
    badge: comment.categoryDesc,
    linkTo: `/${comment.categoryName}/${comment.id}`,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="댓글 단 글" icon={FiMessageSquare}>
      <div className="max-h-[70vh] flex flex-col">
        {/* 댓글 목록 */}
        <div className="flex-1 overflow-y-auto">
          {currentComments.length > 0 ? (
            <CompactList items={listItems} getRelativeTime={getRelativeTime} />
          ) : (
            <div className="text-center py-12">
              <FiMessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                댓글을 작성한 게시글이 없습니다
              </h3>
              <p className="text-gray-500 dark:text-gray-400">첫 번째 댓글을 작성해보세요!</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </Modal>
  );
};

export default CommentsModal;
