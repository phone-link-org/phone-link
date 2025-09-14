import React from "react";
import { FiStar } from "react-icons/fi";
import Modal from "./Modal";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="관심 매장">
    <div className="text-center py-12">
      <FiStar className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">관심 매장</h3>
      <p className="text-gray-500 dark:text-gray-400">즐겨찾기한 매장 목록이 여기에 표시됩니다.</p>
    </div>
  </Modal>
);

export default FavoritesModal;
