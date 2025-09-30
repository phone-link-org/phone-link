import React from "react";
import { FiHeart } from "react-icons/fi";
import Modal from "./Modal";

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LikesModal: React.FC<LikesModalProps> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="좋아요" icon={FiHeart}>
    <div className="text-center py-12">
      <FiHeart className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">좋아요</h3>
      <p className="text-gray-500 dark:text-gray-400">좋아요한 상품 판매 정보가 여기에 표시됩니다.</p>
    </div>
  </Modal>
);

export default LikesModal;
