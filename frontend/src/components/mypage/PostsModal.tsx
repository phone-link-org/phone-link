import React from "react";
import { FiEdit3 } from "react-icons/fi";
import Modal from "./Modal";

interface PostsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostsModal: React.FC<PostsModalProps> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="내가 쓴 글">
    <div className="text-center py-12">
      <FiEdit3 className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">내가 쓴 글</h3>
      <p className="text-gray-500 dark:text-gray-400">작성한 게시글 목록이 여기에 표시됩니다.</p>
    </div>
  </Modal>
);

export default PostsModal;
