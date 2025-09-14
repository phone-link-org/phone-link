import React from "react";
import { FiMessageSquare } from "react-icons/fi";
import Modal from "./Modal";

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="내가 쓴 댓글">
    <div className="text-center py-12">
      <FiMessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">내가 쓴 댓글</h3>
      <p className="text-gray-500 dark:text-gray-400">작성한 댓글 목록이 여기에 표시됩니다.</p>
    </div>
  </Modal>
);

export default CommentsModal;
